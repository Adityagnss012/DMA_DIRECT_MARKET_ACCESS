import React, { useState, useEffect } from 'react'
import { Search, Filter, ShoppingCart, Package, Star, Bell, User, MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useLanguageStore } from '../../store/languageStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { OrderModal } from '../orders/OrderModal'
import { OrdersList } from '../orders/OrdersList'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { ProfileSection } from '../profile/ProfileSection'
import { ChatModal } from '../communication/ChatModal'
import { MessagesList } from '../messages/MessagesList'
import toast from 'react-hot-toast'

type Product = {
  id: string
  farmer_id: string
  name: string
  description: string | null
  price: number
  quantity: number
  unit: string
  category: string
  image_url: string | null
  status: 'active' | 'sold' | 'inactive'
  created_at: string
  farmer: {
    full_name: string
    email: string
    avatar_url?: string
  }
}

export const BuyerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'browse' | 'orders' | 'messages' | 'profile'>('browse')
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [chatUser, setChatUser] = useState<any>(null)
  const [chatProduct, setChatProduct] = useState<any>(null)
  const { user, profile } = useAuth()
  const { t } = useLanguageStore()

  useEffect(() => {
    fetchProducts()
    fetchUnreadNotifications()
    fetchUnreadMessages()
    
    // Set up real-time subscriptions
    if (user) {
      const notificationsSubscription = supabase
        .channel('notifications_changes')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchUnreadNotifications()
          }
        )
        .subscribe()

      const messagesSubscription = supabase
        .channel('messages_changes')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          }, 
          () => {
            fetchUnreadMessages()
          }
        )
        .subscribe()

      return () => {
        notificationsSubscription.unsubscribe()
        messagesSubscription.unsubscribe()
      }
    }
  }, [user])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, priceRange, products])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_farmer_id_fkey (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Error fetching products')
        console.error(error)
      } else {
        const productsWithFarmer = data?.map(product => ({
          ...product,
          farmer: product.profiles
        })) || []
        setProducts(productsWithFarmer)
      }
    } catch (error) {
      toast.error('Error fetching products')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadNotifications = async () => {
    if (!user) return

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error
      setUnreadNotifications(count || 0)
    } catch (error) {
      console.error('Error fetching notification count:', error)
    }
  }

  const fetchUnreadMessages = async () => {
    if (!user) return

    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false)

      if (error) throw error
      setUnreadMessages(count || 0)
    } catch (error) {
      console.error('Error fetching message count:', error)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max))
    }

    setFilteredProducts(filtered)
  }

  const handleOrderComplete = () => {
    fetchProducts() // Refresh products to update quantities
    setSelectedProduct(null)
  }

  const handleChatWithFarmer = (product: Product) => {
    setChatUser({
      id: product.farmer_id,
      full_name: product.farmer.full_name,
      email: product.farmer.email,
      avatar_url: product.farmer.avatar_url,
      role: 'farmer'
    })
    setChatProduct({
      id: product.id,
      name: product.name,
      image_url: product.image_url
    })
    setShowChat(true)
  }

  const categories = ['all', 'vegetables', 'fruits', 'grains', 'herbs', 'dairy', 'other']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {profile?.full_name || 'Buyer'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover fresh produce from local farmers
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
                onClick={() => setActiveTab('browse')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'browse'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Browse Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                My Orders
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

        {activeTab === 'browse' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available Products</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Featured Products</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.min(products.length, 12)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length - 1}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="h-5 w-5" />}
                  />
                </div>

                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Min $"
                    type="number"
                    step="0.01"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  />
                  <Input
                    placeholder="Max $"
                    type="number"
                    step="0.01"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} hover className="overflow-hidden">
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
                      <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        {product.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      by {product.farmer?.full_name || 'Unknown Farmer'}
                    </p>

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
                        className="flex-1"
                        onClick={() => setSelectedProduct(product)}
                        disabled={product.quantity === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.quantity === 0 ? 'Out of Stock' : 'Order Now'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChatWithFarmer(product)}
                        className="px-3"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <Card className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {products.length === 0 ? 'No products available' : 'No products match your filters'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {products.length === 0 
                    ? 'Check back later for fresh produce from local farmers.'
                    : 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  }
                </p>
              </Card>
            )}
          </>
        ) : activeTab === 'orders' ? (
          <OrdersList userRole="buyer" />
        ) : activeTab === 'messages' ? (
          <MessagesList onRefreshUnread={fetchUnreadMessages} />
        ) : (
          <ProfileSection />
        )}

        {/* Order Modal */}
        {selectedProduct && (
          <OrderModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onOrderComplete={handleOrderComplete}
          />
        )}

        {/* Chat Modal */}
        {showChat && chatUser && (
          <ChatModal
            isOpen={showChat}
            onClose={() => {
              setShowChat(false)
              setChatUser(null)
              setChatProduct(null)
            }}
            otherUser={chatUser}
            productContext={chatProduct}
          />
        )}

        {/* Notification Center */}
        <NotificationCenter
          isOpen={showNotifications}
          onClose={() => {
            setShowNotifications(false)
            fetchUnreadNotifications()
          }}
        />
      </div>
    </div>
  )
}