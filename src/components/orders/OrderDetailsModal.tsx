import React from 'react'
import { X, Package, MapPin, Calendar, CreditCard, User, Phone, Mail } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { formatDistanceToNow, format } from 'date-fns'

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

interface OrderDetailsModalProps {
  order: Order
  userRole: 'farmer' | 'buyer'
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (orderId: string, status: string) => void
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  userRole,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  if (!isOpen) return null

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Status
              </h3>
              <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                <p className="font-mono text-gray-900 dark:text-white">
                  {order.id.slice(0, 8)}...
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                <p className={`font-medium ${
                  order.payment_status === 'completed' 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </p>
              </div>
            </div>
          </Card>

          {/* Product Details */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Product Details
            </h3>
            <div className="flex items-start space-x-4">
              {order.products.image_url ? (
                <img
                  src={order.products.image_url}
                  alt={order.products.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {order.products.name}
                </h4>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Price per unit:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${order.products.price.toFixed(2)} / {order.products.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.quantity} {order.products.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {userRole === 'buyer' ? 'Farmer Information' : 'Buyer Information'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {userRole === 'buyer' 
                    ? order.products.profiles.full_name
                    : order.profiles.full_name
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {userRole === 'buyer' 
                    ? order.products.profiles.email
                    : order.profiles.email
                  }
                </span>
              </div>
            </div>
          </Card>

          {/* Delivery Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delivery Information
            </h3>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
              <p className="text-gray-900 dark:text-white">
                {order.delivery_address}
              </p>
            </div>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Notes
              </h3>
              <p className="text-gray-900 dark:text-white">
                {order.notes}
              </p>
            </Card>
          )}

          {/* Order Timeline */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Order Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Ordered:</span>
                <span className="text-gray-900 dark:text-white">
                  {format(new Date(order.created_at), 'PPp')}
                </span>
              </div>
              {order.updated_at !== order.created_at && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Last updated:</span>
                  <span className="text-gray-900 dark:text-white">
                    {format(new Date(order.updated_at), 'PPp')}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Summary */}
          <Card className="p-4 bg-gray-50 dark:bg-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {order.quantity} {order.products.unit} × ${order.products.price.toFixed(2)}
                </span>
                <span className="text-gray-900 dark:text-white">
                  ${order.total_price.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ${order.total_price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            <div className="flex space-x-2">
              {userRole === 'farmer' && order.status === 'pending' && (
                <>
                  <Button
                    onClick={() => {
                      onStatusUpdate(order.id, 'confirmed')
                      onClose()
                    }}
                  >
                    Confirm Order
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      onStatusUpdate(order.id, 'cancelled')
                      onClose()
                    }}
                  >
                    Cancel Order
                  </Button>
                </>
              )}

              {userRole === 'farmer' && order.status === 'confirmed' && (
                <Button
                  onClick={() => {
                    onStatusUpdate(order.id, 'shipped')
                    onClose()
                  }}
                >
                  Mark as Shipped
                </Button>
              )}

              {userRole === 'buyer' && order.status === 'shipped' && (
                <Button
                  onClick={() => {
                    onStatusUpdate(order.id, 'delivered')
                    onClose()
                  }}
                >
                  Confirm Delivery
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}