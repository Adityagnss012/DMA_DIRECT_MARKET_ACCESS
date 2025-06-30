import React, { useState, useEffect } from 'react'
import { MessageCircle, Search, User, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { ChatModal } from '../communication/ChatModal'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

type Conversation = {
  otherUser: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
    role: 'farmer' | 'buyer'
  }
  lastMessage: {
    id: string
    content: string
    message_type: 'text' | 'voice' | 'image'
    created_at: string
    read: boolean
    sender_id: string
  }
  unreadCount: number
  productContext?: {
    id: string
    name: string
    image_url?: string
  }
}

interface MessagesListProps {
  onRefreshUnread?: () => void
}

export const MessagesList: React.FC<MessagesListProps> = ({ onRefreshUnread }) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const { user, profile } = useAuth()

  useEffect(() => {
    if (user) {
      fetchConversations()
      
      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel('messages_list_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages'
          }, 
          () => {
            fetchConversations()
            if (onRefreshUnread) {
              onRefreshUnread()
            }
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user, onRefreshUnread])

  const fetchConversations = async () => {
    if (!user) return

    try {
      console.log('Fetching conversations for user:', user.id)
      
      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            full_name,
            email,
            avatar_url,
            role
          ),
          receiver:profiles!messages_receiver_id_fkey (
            id,
            full_name,
            email,
            avatar_url,
            role
          ),
          products (
            id,
            name,
            image_url
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching messages:', error)
        throw error
      }

      console.log('Raw messages fetched:', messages?.length || 0)

      // Group messages by conversation (other user)
      const conversationMap = new Map<string, Conversation>()

      messages?.forEach((message) => {
        const otherUser = message.sender_id === user.id ? message.receiver : message.sender
        const conversationKey = otherUser.id

        console.log('Processing message from/to:', otherUser.full_name, 'Content:', message.content)

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            otherUser,
            lastMessage: message,
            unreadCount: 0,
            productContext: message.products ? {
              id: message.products.id,
              name: message.products.name,
              image_url: message.products.image_url
            } : undefined
          })
        }

        // Count unread messages (messages sent to current user that are unread)
        if (message.receiver_id === user.id && !message.read) {
          const conversation = conversationMap.get(conversationKey)!
          conversation.unreadCount++
        }
      })

      const conversationsList = Array.from(conversationMap.values())
      console.log('Processed conversations:', conversationsList.length)
      setConversations(conversationsList)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conversation =>
    conversation.otherUser.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.otherUser.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleConversationClick = (conversation: Conversation) => {
    console.log('🚀 OPENING CHAT - Conversation clicked:', conversation.otherUser.full_name)
    
    // Create clean user object with all required properties
    const userToSet = {
      id: conversation.otherUser.id,
      full_name: conversation.otherUser.full_name,
      email: conversation.otherUser.email,
      avatar_url: conversation.otherUser.avatar_url || undefined,
      role: conversation.otherUser.role
    }
    
    const productToSet = conversation.productContext ? {
      id: conversation.productContext.id,
      name: conversation.productContext.name,
      image_url: conversation.productContext.image_url
    } : undefined
    
    console.log('🚀 Setting user:', userToSet)
    console.log('🚀 Setting product:', productToSet)
    
    // Set states in the correct order
    setSelectedUser(userToSet)
    setSelectedProduct(productToSet)
    
    // Force a small delay to ensure state is set before showing modal
    setTimeout(() => {
      console.log('🚀 Opening chat modal...')
      setShowChat(true)
    }, 50)
  }

  const handleCloseChat = () => {
    console.log('🚀 CLOSING CHAT')
    setShowChat(false)
    setSelectedUser(null)
    setSelectedProduct(null)
    
    // Refresh conversations to update read status
    setTimeout(() => {
      fetchConversations()
      if (onRefreshUnread) {
        onRefreshUnread()
      }
    }, 500)
  }

  // Add console logs to track modal state
  console.log('🔍 Modal State - showChat:', showChat, 'selectedUser:', selectedUser?.full_name || 'none')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Messages
        </h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-5 w-5" />}
        />
      </Card>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {conversations.length === 0 ? 'No conversations yet' : 'No conversations match your search'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {conversations.length === 0 
              ? "Start a conversation by messaging a farmer or buyer from their product page."
              : "Try adjusting your search terms to find the conversation you're looking for."
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.otherUser.id}
              className="cursor-pointer"
              onClick={() => handleConversationClick(conversation)}
            >
              <Card 
                className={`p-4 border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                  conversation.unreadCount > 0 
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conversation.otherUser.avatar_url ? (
                      <img
                        src={conversation.otherUser.avatar_url}
                        alt={conversation.otherUser.full_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                        <span className="text-white font-medium text-lg">
                          {conversation.otherUser.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-base font-semibold truncate ${
                          conversation.unreadCount > 0 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {conversation.otherUser.full_name}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                          conversation.otherUser.role === 'farmer' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {conversation.otherUser.role === 'farmer' ? '🌱' : '🛒'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Context */}
                    {conversation.productContext && (
                      <div className="flex items-center space-x-2 mb-2">
                        {conversation.productContext.image_url ? (
                          <img
                            src={conversation.productContext.image_url}
                            alt={conversation.productContext.name}
                            className="w-5 h-5 rounded object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-emerald-200 dark:bg-emerald-700 rounded flex items-center justify-center">
                            <MessageCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        )}
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                          About: {conversation.productContext.name}
                        </span>
                      </div>
                    )}

                    {/* Last Message */}
                    <div className="flex items-center space-x-2">
                      {conversation.lastMessage.sender_id === user.id && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">You:</span>
                      )}
                      <p className={`text-sm truncate flex-1 ${
                        conversation.unreadCount > 0 && conversation.lastMessage.sender_id !== user.id
                          ? 'font-semibold text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {conversation.lastMessage.message_type === 'voice' 
                          ? '🎵 Voice message'
                          : conversation.lastMessage.message_type === 'image'
                          ? '📷 Image'
                          : conversation.lastMessage.content
                        }
                      </p>
                      
                      {/* Message status indicators */}
                      {conversation.lastMessage.sender_id === user.id && (
                        <div className="flex items-center flex-shrink-0">
                          {conversation.lastMessage.read ? (
                            <span className="text-blue-500 text-xs">✓✓</span>
                          ) : (
                            <span className="text-gray-400 text-xs">✓</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal - ALWAYS render when showChat is true and selectedUser exists */}
      {showChat && selectedUser && (
        <ChatModal
          isOpen={true}
          onClose={handleCloseChat}
          otherUser={selectedUser}
          productContext={selectedProduct}
        />
      )}
    </div>
  )
}