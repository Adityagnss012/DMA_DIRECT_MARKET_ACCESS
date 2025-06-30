import React, { useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { X, MapPin, Package, User, ArrowRight, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { stripePromise } from '../../lib/stripe'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { PaymentForm } from '../payments/PaymentForm'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  quantity: number
  unit: string
  category: string
  image_url: string | null
  farmer: {
    full_name: string
    email: string
  }
}

interface OrderModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onOrderComplete: () => void
}

type Step = 'details' | 'payment' | 'confirmation'

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  isOpen,
  onClose,
  onOrderComplete
}) => {
  const { user, profile } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('details')
  const [orderData, setOrderData] = useState({
    quantity: 1,
    deliveryAddress: profile?.address || '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  if (!isOpen) return null

  const totalPrice = orderData.quantity * product.price

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    if (orderData.quantity > product.quantity) {
      toast.error(`Only ${product.quantity} ${product.unit} available`)
      return
    }

    setLoading(true)

    try {
      // Create order in database with pending status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          product_id: product.id,
          quantity: orderData.quantity,
          total_price: totalPrice,
          delivery_address: orderData.deliveryAddress,
          notes: orderData.notes || null,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      setOrderId(order.id)
      setCurrentStep('payment')
      toast.success('Order details saved! Please complete payment.')
    } catch (error) {
      console.error('Order creation error:', error)
      toast.error('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!orderId) return

    try {
      // Update order with payment information
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'completed',
          stripe_payment_intent_id: paymentIntentId
        })
        .eq('id', orderId)

      if (updateError) throw updateError

      setCurrentStep('confirmation')
      toast.success('Payment successful! Your order has been placed.')
    } catch (error) {
      console.error('Payment update error:', error)
      toast.error('Payment processed but order update failed. Please contact support.')
    }
  }

  const handlePaymentError = (error: string) => {
    toast.error(error)
  }

  const handleComplete = () => {
    onOrderComplete()
    onClose()
    setCurrentStep('details')
    setOrderId(null)
    setOrderData({
      quantity: 1,
      deliveryAddress: profile?.address || '',
      notes: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOrderData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }))
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <div className={`flex items-center ${currentStep === 'details' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 'details' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <span className="ml-2 font-medium">Order Details</span>
      </div>
      
      <ArrowRight className="h-4 w-4 text-gray-400" />
      
      <div className={`flex items-center ${currentStep === 'payment' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 'payment' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
        <span className="ml-2 font-medium">Payment</span>
      </div>
      
      <ArrowRight className="h-4 w-4 text-gray-400" />
      
      <div className={`flex items-center ${currentStep === 'confirmation' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 'confirmation' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          3
        </div>
        <span className="ml-2 font-medium">Confirmation</span>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentStep === 'details' && 'Order Details'}
            {currentStep === 'payment' && 'Secure Payment'}
            {currentStep === 'confirmation' && 'Order Confirmed'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {renderStepIndicator()}

          {/* Product Summary - Always visible */}
          <Card className="p-4 mb-6">
            <div className="flex items-start space-x-4">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <User className="h-4 w-4" />
                  <span>by {product.farmer.full_name}</span>
                </div>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ${product.price.toFixed(2)} per {product.unit}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available: {product.quantity} {product.unit}
                </p>
              </div>
            </div>
          </Card>

          {/* Step Content */}
          {currentStep === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity ({product.unit})
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={product.quantity}
                  value={orderData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <Input
                label="Delivery Address"
                name="deliveryAddress"
                value={orderData.deliveryAddress}
                onChange={handleChange}
                required
                placeholder="Enter your delivery address"
                icon={<MapPin className="h-5 w-5" />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={orderData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Any special instructions or notes..."
                />
              </div>

              <Card className="p-4 bg-gray-50 dark:bg-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Order Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {orderData.quantity} {product.unit} × ${product.price.toFixed(2)}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1"
                >
                  Continue to Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 'payment' && stripePromise && (
            <div className="space-y-6">
              <Elements stripe={stripePromise}>
                <PaymentForm
                  amount={totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  loading={loading}
                  setLoading={setLoading}
                />
              </Elements>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('details')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Details
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && !stripePromise && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Payment Configuration Required
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Stripe is not properly configured. For demo purposes, we'll simulate a successful payment.
                </p>
                <Button
                  onClick={() => handlePaymentSuccess(`demo_${Date.now()}`)}
                  className="w-full"
                  size="lg"
                >
                  Simulate Payment Success
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'confirmation' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Order Placed Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your order has been confirmed and the farmer has been notified.
                  You'll receive updates as your order progresses.
                </p>
              </div>

              <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                  What happens next?
                </h4>
                <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                  <li>• The farmer will review and confirm your order</li>
                  <li>• You'll be notified when your order is ready for pickup/delivery</li>
                  <li>• Payment is held securely until you confirm receipt</li>
                </ul>
              </Card>

              <Button
                onClick={handleComplete}
                className="w-full"
                size="lg"
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}