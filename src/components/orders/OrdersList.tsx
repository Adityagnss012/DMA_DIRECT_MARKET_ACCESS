import React, { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, Truck, XCircle, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { OrderDetailsModal } from './OrderDetailsModal'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

type Order = {
  id: string
  quantity: number
  total_price: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  delivery_address: string
  notes: string | null
  created_at: string
  updated_at: string
  products: {
    id: string
    name: string
    price: number
    unit: string
    image_url: string | null
    profiles: {
      full_name: string
      email: string
    }
  }
  profiles: {
    full_name: string
    email: string
  }
}

interface OrdersListProps {
  userRole: 'farmer' | 'buyer'
}

export const OrdersList: React.FC<OrdersListProps> = ({ userRole }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchOrders()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, userRole])

  const fetchOrders = async () => {
    if (!user) return

    try {
      if (userRole === 'buyer') {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            products (
              id,
              name,
              price,
              unit,
              image_url,
              profiles!products_farmer_id_fkey (
                full_name,
                email
              )
            ),
            profiles!orders_buyer_id_fkey (
              full_name,
              email
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data || [])
      } else {
        // For farmers, first get their product IDs
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id')
          .eq('farmer_id', user.id)

        if (productsError) throw productsError

        // If farmer has no products, set empty orders
        if (!products || products.length === 0) {
          setOrders([])
          return
        }

        // Extract product IDs into an array
        const productIds = products.map(product => product.id)

        // Now get orders for these products
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            products (
              id,
              name,
              price,
              unit,
              image_url,
              profiles!products_farmer_id_fkey (
                full_name,
                email
              )
            ),
            profiles!orders_buyer_id_fkey (
              full_name,
              email
            )
          `)
          .in('product_id', productIds)
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error
      toast.success('Order status updated successfully')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {userRole === 'buyer' ? 'My Orders' : 'Incoming Orders'}
        </h2>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {userRole === 'buyer' 
              ? "You haven't placed any orders yet. Browse products to get started!"
              : "No orders have been placed for your products yet."
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {order.products.image_url ? (
                    <img
                      src={order.products.image_url}
                      alt={order.products.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {order.products.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {userRole === 'buyer' 
                            ? `by ${order.products.profiles.full_name}`
                            : `ordered by ${order.profiles.full_name}`
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.quantity} {order.products.unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <p className="font-medium text-emerald-600 dark:text-emerald-400">
                          ${order.total_price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                        <p className={`font-medium ${
                          order.payment_status === 'completed' 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Ordered:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(order)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>

                {userRole === 'farmer' && order.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    >
                      Confirm Order
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {userRole === 'farmer' && order.status === 'confirmed' && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                  >
                    Mark as Shipped
                  </Button>
                )}

                {userRole === 'buyer' && order.status === 'shipped' && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                  >
                    Confirm Delivery
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          userRole={userRole}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={updateOrderStatus}
        />
      )}
    </div>
  )
}