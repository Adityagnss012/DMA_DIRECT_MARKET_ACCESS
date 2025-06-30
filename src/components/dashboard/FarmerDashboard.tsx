import React, { useState, useEffect, useRef } from 'react'
import { Plus, Package, TrendingUp, DollarSign, Eye, Edit, Trash2, Bell, User, MessageCircle, Camera, Upload, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useLanguageStore } from '../../store/languageStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { OrdersList } from '../orders/OrdersList'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { ProfileSection } from '../profile/ProfileSection'
import { MessagesList } from '../messages/MessagesList'
import toast from 'react-hot-toast'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  quantity: number
  unit: string
  category: string
  image_url: string | null
  status: 'active' | 'sold' | 'inactive'
  created_at: string
}

export const FarmerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'messages' | 'profile'>('products')
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [imageInputMethod, setImageInputMethod] = useState<'url' | 'camera' | 'upload'>('url')
  const { user, profile } = useAuth()
  const { t } = useLanguageStore()
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  // Prevent multiple simultaneous fetches
  const fetchingProductsRef = useRef(false)
  const fetchingNotificationsRef = useRef(false)
  const fetchingMessagesRef = useRef(false)
  const mountedRef = useRef(true)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    category: 'vegetables',
    image_url: ''
  })

  useEffect(() => {
    mountedRef.current = true
    
    if (user && !fetchingProductsRef.current) {
      fetchProducts()
    }
    
    if (user && !fetchingNotificationsRef.current) {
      fetchUnreadNotifications()
    }

    if (user && !fetchingMessagesRef.current) {
      fetchUnreadMessages()
    }
    
    // Set up real-time subscriptions
    if (user) {
      const notificationsSubscription = supabase
        .channel('farmer_notifications_changes')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            if (mountedRef.current && !fetchingNotificationsRef.current) {
              fetchUnreadNotifications()
            }
          }
        )
        .subscribe()

      const messagesSubscription = supabase
        .channel('farmer_messages_changes')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          }, 
          () => {
            if (mountedRef.current && !fetchingMessagesRef.current) {
              fetchUnreadMessages()
            }
          }
        )
        .subscribe()

      return () => {
        mountedRef.current = false
        notificationsSubscription.unsubscribe()
        messagesSubscription.unsubscribe()
      }
    }

    return () => {
      mountedRef.current = false
    }
  }, []) // Empty dependency array - only run once

  const fetchProducts = async () => {
    if (!user || fetchingProductsRef.current) return

    fetchingProductsRef.current = true
    console.log('Fetching products for farmer:', user.id)

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        if (mountedRef.current) {
          toast.error('Error loading products. Please check your connection.')
          setProducts([]) // Set empty array on error
        }
      } else {
        console.log('Products fetched successfully:', data?.length || 0)
        if (mountedRef.current) {
          setProducts(data || [])
        }
      }
    } catch (error) {
      console.error('Network error fetching products:', error)
      if (mountedRef.current) {
        toast.error('Network error. Please check your internet connection.')
        setProducts([]) // Set empty array on error
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
      fetchingProductsRef.current = false
    }
  }

  const fetchUnreadNotifications = async () => {
    if (!user || fetchingNotificationsRef.current) return

    fetchingNotificationsRef.current = true

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error fetching notification count:', error)
      } else if (mountedRef.current) {
        setUnreadNotifications(count || 0)
      }
    } catch (error) {
      console.error('Network error fetching notifications:', error)
    } finally {
      fetchingNotificationsRef.current = false
    }
  }

  const fetchUnreadMessages = async () => {
    if (!user || fetchingMessagesRef.current) return

    fetchingMessagesRef.current = true

    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error fetching message count:', error)
      } else if (mountedRef.current) {
        setUnreadMessages(count || 0)
      }
    } catch (error) {
      console.error('Network error fetching messages:', error)
    } finally {
      fetchingMessagesRef.current = false
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setShowCamera(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error('Camera access denied. Please enable camera permissions in your browser settings.')
        } else if (error.name === 'NotFoundError') {
          toast.error('No camera found. Please connect a camera to take photos.')
        } else if (error.name === 'NotReadableError') {
          toast.error('Camera is already in use by another application.')
        } else {
          toast.error('Failed to access camera. Please check your browser permissions.')
        }
      } else {
        toast.error('Failed to start camera. Please check camera permissions.')
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageDataUrl)
        setFormData(prev => ({ ...prev, image_url: imageDataUrl }))
        stopCamera()
        toast.success('Photo captured successfully!')
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string
        setCapturedImage(imageDataUrl)
        setFormData(prev => ({ ...prev, image_url: imageDataUrl }))
        toast.success('Image uploaded successfully!')
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setCapturedImage(null)
    setFormData(prev => ({ ...prev, image_url: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.name || !formData.price || !formData.quantity || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    const price = parseFloat(formData.price)
    const quantity = parseInt(formData.quantity)

    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    if (isNaN(quantity) || quantity < 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price,
      quantity,
      unit: formData.unit,
      category: formData.category,
      image_url: formData.image_url.trim() || null,
      farmer_id: user.id
    }

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
        toast.success('Product updated successfully!')
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
        toast.success('Product added successfully!')
      }

      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        unit: 'kg',
        category: 'vegetables',
        image_url: ''
      })
      setCapturedImage(null)
      setImageInputMethod('url')
      setShowAddForm(false)
      setEditingProduct(null)
      
      // Refresh products after successful operation
      if (!fetchingProductsRef.current) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Error saving product. Please try again.')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      unit: product.unit,
      category: product.category,
      image_url: product.image_url || ''
    })
    if (product.image_url) {
      setCapturedImage(product.image_url)
      setImageInputMethod(product.image_url.startsWith('data:') ? 'camera' : 'url')
    }
    setShowAddForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      toast.success('Product deleted successfully!')
      
      // Refresh products after successful deletion
      if (!fetchingProductsRef.current) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Error deleting product. Please try again.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const activeProducts = products.filter(p => p.status === 'active')
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {profile?.full_name || 'Farmer'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your products and track your sales
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <Bell className="h-6 w-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Package className="h-4 w-4 mr-1 inline" />
                My Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-1 inline" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === 'messages'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <MessageCircle className="h-4 w-4 mr-1 inline" />
                Messages
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <User className="h-4 w-4 mr-1 inline" />
                Profile
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'products' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Products</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeProducts.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Potential Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Add Product Button */}
            <div className="mb-6">
              <Button
                onClick={() => {
                  setShowAddForm(true)
                  setEditingProduct(null)
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    quantity: '',
                    unit: 'kg',
                    category: 'vegetables',
                    image_url: ''
                  })
                  setCapturedImage(null)
                  setImageInputMethod('url')
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </div>

            {/* Add/Edit Product Form */}
            {showAddForm && (
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Product Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Organic Tomatoes"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="grains">Grains</option>
                      <option value="herbs">Herbs</option>
                      <option value="dairy">Dairy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <Input
                    label="Price per Unit ($) *"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        label="Quantity *"
                        name="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        placeholder="100"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Unit
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                        <option value="units">units</option>
                        <option value="boxes">boxes</option>
                      </select>
                    </div>
                  </div>

                  {/* Image Input Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Product Image
                    </label>
                    
                    {/* Image Input Method Selector */}
                    <div className="flex space-x-2 mb-4">
                      <Button
                        type="button"
                        variant={imageInputMethod === 'url' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setImageInputMethod('url')}
                      >
                        URL
                      </Button>
                      <Button
                        type="button"
                        variant={imageInputMethod === 'camera' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setImageInputMethod('camera')}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Camera
                      </Button>
                      <Button
                        type="button"
                        variant={imageInputMethod === 'upload' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setImageInputMethod('upload')}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                    </div>

                    {/* Image Input Based on Method */}
                    {imageInputMethod === 'url' && (
                      <Input
                        name="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    )}

                    {imageInputMethod === 'camera' && (
                      <div className="space-y-4">
                        {!showCamera && !capturedImage && (
                          <Button
                            type="button"
                            onClick={startCamera}
                            className="w-full"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Open Camera
                          </Button>
                        )}

                        {showCamera && (
                          <div className="relative">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600"
                            />
                            <div className="flex justify-center space-x-2 mt-4">
                              <Button
                                type="button"
                                onClick={capturePhoto}
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Capture Photo
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={stopCamera}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    )}

                    {imageInputMethod === 'upload' && (
                      <div className="space-y-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                          variant="outline"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image File
                        </Button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                        </p>
                      </div>
                    )}

                    {/* Image Preview */}
                    {capturedImage && (
                      <div className="mt-4">
                        <div className="relative inline-block">
                          <img
                            src={capturedImage}
                            alt="Product preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Image captured successfully
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                      placeholder="Describe your product..."
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-4">
                    <Button type="submit">
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingProduct(null)
                        setCapturedImage(null)
                        setImageInputMethod('url')
                        stopCamera()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  
                  <div className={`w-full h-48 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900 flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                    <Package className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    
                    {product.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          per {product.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {product.quantity} {product.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <Card className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No products yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started by adding your first product to the marketplace.
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </Card>
            )}
          </>
        ) : activeTab === 'orders' ? (
          <OrdersList userRole="farmer" />
        ) : activeTab === 'messages' ? (
          <MessagesList onRefreshUnread={() => {
            if (!fetchingMessagesRef.current) {
              fetchUnreadMessages()
            }
          }} />
        ) : (
          <ProfileSection />
        )}

        {/* Notification Center */}
        <NotificationCenter
          isOpen={showNotifications}
          onClose={() => {
            setShowNotifications(false)
            if (!fetchingNotificationsRef.current) {
              fetchUnreadNotifications()
            }
          }}
        />
      </div>
    </div>
  )
}