import React, { useState, useEffect, useRef } from 'react'
import { X, Send, Mic, MicOff, Play, Pause, Download, MessageCircle, Phone, Video, MoreVertical } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import toast from 'react-hot-toast'

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  message_type: 'text' | 'voice' | 'image'
  content: string
  voice_url?: string
  read: boolean
  created_at: string
  sender: {
    full_name: string
    avatar_url?: string
  }
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  otherUser: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
    role: 'farmer' | 'buyer'
  }
  productContext?: {
    id: string
    name: string
    image_url?: string
  }
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  otherUser,
  productContext
}) => {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Add console log to track when modal is rendered
  console.log('🎯 ChatModal rendered - isOpen:', isOpen, 'otherUser:', otherUser?.full_name)

  useEffect(() => {
    if (isOpen && user && otherUser) {
      console.log('🚀 Chat modal opened for user:', otherUser.full_name)
      fetchMessages()
      
      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel(`chat_${user.id}_${otherUser.id}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${user.id}))`
          }, 
          (payload) => {
            console.log('New message received:', payload.new)
            fetchMessages() // Refetch to get complete message with sender info
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [isOpen, user, otherUser?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isRecording && recordingTime > 0) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording, recordingTime])

  const fetchMessages = async () => {
    if (!user || !otherUser) return

    try {
      console.log('Fetching messages between:', user.id, 'and', otherUser.id)
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        throw error
      }

      console.log('Messages fetched:', data?.length || 0)

      const messagesWithSender = data?.map(message => ({
        ...message,
        sender: message.profiles
      })) || []

      setMessages(messagesWithSender)
      
      // Mark messages as read
      await markMessagesAsRead()
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    }
  }

  const markMessagesAsRead = async () => {
    if (!user || !otherUser) return

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUser.id)
        .eq('read', false)

      if (error) throw error
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendTextMessage = async () => {
    if (!newMessage.trim() || !user || !otherUser) return

    setLoading(true)

    try {
      const messageData = {
        sender_id: user.id,
        receiver_id: otherUser.id,
        message_type: 'text' as const,
        content: newMessage.trim(),
        product_id: productContext?.id || null
      }

      console.log('Sending message:', messageData)

      const { error } = await supabase
        .from('messages')
        .insert([messageData])

      if (error) throw error

      setNewMessage('')
      console.log('Message sent successfully')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await uploadVoiceMessage(audioBlob)
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      
      // Enhanced error handling for microphone permissions
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error('Microphone access denied. Please enable microphone permissions in your browser settings.')
        } else if (error.name === 'NotFoundError') {
          toast.error('No microphone found. Please connect a microphone to record voice messages.')
        } else if (error.name === 'NotReadableError') {
          toast.error('Microphone is already in use by another application.')
        } else if (error.name === 'OverconstrainedError') {
          toast.error('Microphone constraints could not be satisfied.')
        } else if (error.name === 'SecurityError') {
          toast.error('Microphone access blocked due to security restrictions.')
        } else {
          toast.error('Failed to access microphone. Please check your browser permissions.')
        }
      } else {
        toast.error('Failed to start recording. Please check microphone permissions.')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingTime(0)
    }
  }

  const uploadVoiceMessage = async (audioBlob: Blob) => {
    if (!user || !otherUser) return

    setLoading(true)

    try {
      // Create a data URL for the audio
      const reader = new FileReader()
      reader.onloadend = async () => {
        const audioDataUrl = reader.result as string

        const messageData = {
          sender_id: user.id,
          receiver_id: otherUser.id,
          message_type: 'voice' as const,
          content: 'Voice message',
          voice_url: audioDataUrl,
          product_id: productContext?.id || null
        }

        const { error } = await supabase
          .from('messages')
          .insert([messageData])

        if (error) throw error

        toast.success('Voice message sent!')
      }
      reader.readAsDataURL(audioBlob)
    } catch (error) {
      console.error('Error uploading voice message:', error)
      toast.error('Failed to send voice message')
    } finally {
      setLoading(false)
    }
  }

  const playAudio = (audioUrl: string, messageId: string) => {
    if (playingAudio === messageId) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setPlayingAudio(null)
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.onended = () => {
        setPlayingAudio(null)
      }
      
      audio.play()
      setPlayingAudio(messageId)
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`
    } else {
      return format(date, 'MMM dd, HH:mm')
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    
    messages.forEach(message => {
      const date = new Date(message.created_at)
      let dateKey: string
      
      if (isToday(date)) {
        dateKey = 'Today'
      } else if (isYesterday(date)) {
        dateKey = 'Yesterday'
      } else {
        dateKey = format(date, 'MMMM dd, yyyy')
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })
    
    return groups
  }

  // Don't render if not open or missing required props
  if (!isOpen || !otherUser) {
    console.log('🚫 ChatModal not rendering - isOpen:', isOpen, 'otherUser:', !!otherUser)
    return null
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20">
          <div className="flex items-center space-x-3">
            {otherUser.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200 dark:border-emerald-700"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center border-2 border-emerald-200 dark:border-emerald-700">
                <span className="text-white font-medium text-lg">
                  {otherUser.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {otherUser.full_name}
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  otherUser.role === 'farmer' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  {otherUser.role === 'farmer' ? '🌱 Farmer' : '🛒 Buyer'}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Online</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
              <MoreVertical className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Product Context */}
        {productContext && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center space-x-3">
              {productContext.image_url ? (
                <img
                  src={productContext.image_url}
                  alt={productContext.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-emerald-200 dark:bg-emerald-700 rounded flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              )}
              <span className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
                💬 Discussing: {productContext.name}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
          }}
        >
          {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
            <div key={dateKey}>
              {/* Date separator */}
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  {dateKey}
                </span>
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map((message, index) => {
                const isOwnMessage = message.sender_id === user?.id
                const showAvatar = !isOwnMessage && (index === 0 || dateMessages[index - 1]?.sender_id !== message.sender_id)
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar for other user's messages */}
                      {!isOwnMessage && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {showAvatar ? (
                            otherUser.avatar_url ? (
                              <img
                                src={otherUser.avatar_url}
                                alt={otherUser.full_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {otherUser.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="w-8 h-8"></div>
                          )}
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      <div className={`rounded-2xl p-3 shadow-sm ${
                        isOwnMessage
                          ? 'bg-emerald-500 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-600'
                      }`}>
                        {message.message_type === 'text' ? (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        ) : message.message_type === 'voice' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => playAudio(message.voice_url!, message.id)}
                              className={`p-2 rounded-full transition-colors ${
                                isOwnMessage
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                              }`}
                            >
                              {playingAudio === message.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium">Voice message</span>
                                <div className="flex space-x-1">
                                  {[...Array(20)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-1 bg-current rounded-full ${
                                        playingAudio === message.id ? 'animate-pulse' : ''
                                      }`}
                                      style={{ height: `${Math.random() * 20 + 8}px` }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = message.voice_url!
                                link.download = `voice_message_${message.id}.wav`
                                link.click()
                              }}
                              className="p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          </div>
                        ) : null}
                        
                        {/* Message time and status */}
                        <div className={`flex items-center justify-between mt-1 space-x-2 ${
                          isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <span className={`text-xs ${
                            isOwnMessage
                              ? 'text-emerald-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatMessageTime(message.created_at)}
                          </span>
                          
                          {/* Read status for own messages */}
                          {isOwnMessage && (
                            <div className="flex items-center">
                              {message.read ? (
                                <span className="text-emerald-100 text-xs">✓✓</span>
                              ) : (
                                <span className="text-emerald-200 text-xs">✓</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-3 rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 dark:text-red-400 font-medium">
                Recording: {formatRecordingTime(recordingTime)}
              </span>
              <Button
                onClick={stopRecording}
                size="sm"
                variant="danger"
              >
                Stop & Send
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendTextMessage()
                  }
                }}
                disabled={loading || isRecording}
                className="rounded-full border-gray-300 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}
              disabled={loading}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            
            <Button
              onClick={sendTextMessage}
              disabled={!newMessage.trim() || loading || isRecording}
              size="sm"
              className="rounded-full px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}