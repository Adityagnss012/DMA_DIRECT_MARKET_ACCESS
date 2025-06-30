import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, Shield } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface PaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
  loading,
  setLoading
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [cardError, setCardError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe is not properly initialized')
      return
    }

    setLoading(true)
    setCardError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      onError('Card element not found')
      setLoading(false)
      return
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (paymentMethodError) {
        setCardError(paymentMethodError.message || 'Payment method creation failed')
        onError(paymentMethodError.message || 'Payment method creation failed')
        setLoading(false)
        return
      }

      // For demo purposes, we'll simulate a successful payment
      // In production, you would call your backend to create a payment intent
      setTimeout(() => {
        const mockPaymentIntentId = `pi_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        onSuccess(mockPaymentIntentId)
        setLoading(false)
      }, 2000)

    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed'
      onError(errorMessage)
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
              Secure Escrow Payment
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Your payment is held securely until delivery is confirmed
            </p>
          </div>
        </div>
      </Card>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <CreditCard className="inline h-4 w-4 mr-2" />
          Payment Information
        </label>
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
          <CardElement options={cardElementOptions} />
        </div>
        {cardError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{cardError}</p>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span className="text-gray-900 dark:text-white">Total Amount:</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            ${amount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Lock className="h-4 w-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      <Button
        type="submit"
        disabled={!stripe || loading}
        loading={loading}
        className="w-full"
        size="lg"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {loading ? 'Processing Payment...' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  )
}