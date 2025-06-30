import React, { useState } from 'react'
import { 
  Users, 
  UserPlus, 
  Package, 
  ShoppingCart, 
  MessageCircle, 
  CreditCard, 
  Truck, 
  CheckCircle,
  Camera,
  Search,
  Bell,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export const HowToUsePage: React.FC = () => {
  const [activeUserType, setActiveUserType] = useState<'farmer' | 'buyer'>('farmer')
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  const farmerSteps = [
    {
      id: 1,
      title: "Create Your Farmer Account",
      description: "Sign up and set up your farmer profile to start selling your produce",
      icon: UserPlus,
      color: "bg-green-500",
      details: [
        "Click 'Join as Farmer' on the homepage",
        "Fill in your personal details (name, email, phone)",
        "Choose 'Farmer' as your account type",
        "Add your farm address and contact information",
        "Verify your email address",
        "Complete your profile with farm details"
      ],
      tips: [
        "Use a clear profile photo to build trust",
        "Add detailed farm information",
        "Include your farming experience and specialties"
      ]
    },
    {
      id: 2,
      title: "Add Your Products",
      description: "List your fresh produce with photos, prices, and descriptions",
      icon: Package,
      color: "bg-emerald-500",
      details: [
        "Go to your dashboard and click 'Add New Product'",
        "Enter product name (e.g., 'Organic Tomatoes')",
        "Select the appropriate category (vegetables, fruits, etc.)",
        "Set your price per unit (kg, lb, boxes)",
        "Add available quantity",
        "Take a photo using your camera or upload an image",
        "Write a detailed description of your product",
        "Click 'Add Product' to publish"
      ],
      tips: [
        "Take high-quality photos in good lighting",
        "Write detailed descriptions mentioning organic/pesticide-free",
        "Set competitive but fair prices",
        "Update quantities regularly"
      ]
    },
    {
      id: 3,
      title: "Manage Orders",
      description: "Receive and process orders from buyers efficiently",
      icon: ShoppingCart,
      color: "bg-blue-500",
      details: [
        "Receive instant notifications when buyers place orders",
        "Review order details in your dashboard",
        "Confirm or decline orders within 24 hours",
        "Prepare products for delivery/pickup",
        "Update order status (confirmed → shipped → delivered)",
        "Communicate with buyers about delivery details"
      ],
      tips: [
        "Respond to orders quickly to build reputation",
        "Keep buyers informed about order progress",
        "Maintain product quality for repeat customers"
      ]
    },
    {
      id: 4,
      title: "Communicate with Buyers",
      description: "Chat directly with customers about products and orders",
      icon: MessageCircle,
      color: "bg-purple-500",
      details: [
        "Access messages from your dashboard",
        "Answer buyer questions about products",
        "Send text messages or voice recordings",
        "Share additional product photos if requested",
        "Coordinate delivery times and locations",
        "Build relationships with regular customers"
      ],
      tips: [
        "Be responsive and professional",
        "Use voice messages for clearer communication",
        "Share farming practices and product origins"
      ]
    },
    {
      id: 5,
      title: "Get Paid Securely",
      description: "Receive payments safely through our escrow system",
      icon: CreditCard,
      color: "bg-yellow-500",
      details: [
        "Buyers pay upfront when placing orders",
        "Money is held securely in escrow",
        "Funds are released when order is delivered",
        "Receive payments directly to your account",
        "Track all transactions in your dashboard",
        "Get paid within 2-3 business days"
      ],
      tips: [
        "Ensure timely delivery to receive payments quickly",
        "Maintain good communication for smooth transactions",
        "Keep delivery receipts for your records"
      ]
    }
  ]

  const buyerSteps = [
    {
      id: 1,
      title: "Create Your Buyer Account",
      description: "Sign up to start buying fresh produce directly from farmers",
      icon: UserPlus,
      color: "bg-blue-500",
      details: [
        "Click 'Join as Buyer' on the homepage",
        "Enter your personal information",
        "Choose 'Buyer' as your account type",
        "Add your delivery address",
        "Verify your email address",
        "Complete your profile setup"
      ],
      tips: [
        "Add accurate delivery address for smooth deliveries",
        "Complete your profile to build trust with farmers",
        "Add phone number for delivery coordination"
      ]
    },
    {
      id: 2,
      title: "Browse Fresh Products",
      description: "Discover fresh produce from local farmers in your area",
      icon: Search,
      color: "bg-green-500",
      details: [
        "Browse products on the main dashboard",
        "Use search to find specific items",
        "Filter by category (vegetables, fruits, etc.)",
        "Filter by price range",
        "View product photos and descriptions",
        "Check farmer profiles and ratings",
        "See available quantities and prices"
      ],
      tips: [
        "Check product freshness dates",
        "Read farmer descriptions carefully",
        "Look for organic or pesticide-free options",
        "Compare prices from different farmers"
      ]
    },
    {
      id: 3,
      title: "Place Your Order",
      description: "Order products with secure payment and delivery options",
      icon: ShoppingCart,
      color: "bg-emerald-500",
      details: [
        "Click 'Order Now' on desired products",
        "Select quantity needed",
        "Confirm delivery address",
        "Add special instructions or notes",
        "Review order summary and total price",
        "Complete secure payment with credit/debit card",
        "Receive order confirmation"
      ],
      tips: [
        "Double-check quantities before ordering",
        "Provide clear delivery instructions",
        "Order in advance for better availability"
      ]
    },
    {
      id: 4,
      title: "Chat with Farmers",
      description: "Communicate directly with farmers about products and orders",
      icon: MessageCircle,
      color: "bg-purple-500",
      details: [
        "Click the chat icon on product cards",
        "Ask questions about farming practices",
        "Inquire about product freshness",
        "Coordinate delivery times",
        "Send text or voice messages",
        "Share feedback and reviews"
      ],
      tips: [
        "Ask about organic certification",
        "Inquire about harvest dates",
        "Be respectful and professional",
        "Provide feedback to help farmers improve"
      ]
    },
    {
      id: 5,
      title: "Track & Receive Orders",
      description: "Monitor your order status and receive fresh produce",
      icon: Truck,
      color: "bg-orange-500",
      details: [
        "Track order status in real-time",
        "Receive notifications for status updates",
        "Coordinate with farmer for delivery",
        "Inspect products upon delivery",
        "Confirm delivery in the app",
        "Rate and review your experience"
      ],
      tips: [
        "Be available during delivery window",
        "Inspect products before accepting",
        "Leave honest reviews for other buyers",
        "Report any issues immediately"
      ]
    }
  ]

  const features = [
    {
      icon: Camera,
      title: "Camera Integration",
      description: "Farmers can take photos directly with their device camera for instant product listings"
    },
    {
      icon: MessageCircle,
      title: "Voice Messages",
      description: "Send voice recordings for clearer communication between farmers and buyers"
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      description: "Get instant updates about orders, messages, and important activities"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Escrow-based payment system protects both farmers and buyers"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Works perfectly on phones, tablets, and computers"
    },
    {
      icon: Globe,
      title: "Multi-language",
      description: "Available in multiple languages including English, Hindi, Telugu, Tamil, and more"
    }
  ]

  const currentSteps = activeUserType === 'farmer' ? farmerSteps : buyerSteps

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How to Use Direct Market Access
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              A simple, step-by-step guide to help you get started. Whether you're a farmer looking to sell 
              your produce or a buyer seeking fresh products, we'll walk you through everything you need to know.
            </p>
            
            {/* User Type Selector */}
            <div className="flex justify-center mb-8">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveUserType('farmer')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeUserType === 'farmer'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  🌱 I'm a Farmer
                </button>
                <button
                  onClick={() => setActiveUserType('buyer')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeUserType === 'buyer'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  🛒 I'm a Buyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {activeUserType === 'farmer' ? '🌱 Farmer Guide' : '🛒 Buyer Guide'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {activeUserType === 'farmer' 
                ? 'Learn how to sell your fresh produce and connect with buyers in your area'
                : 'Discover how to find and buy fresh produce directly from local farmers'
              }
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {currentSteps.map((step, index) => (
              <Card key={step.id} className="overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start space-x-6">
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                        <step.icon className="h-8 w-8" />
                      </div>
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-bold">
                          {step.id}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                        <button
                          onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {expandedStep === step.id ? (
                            <ChevronUp className="h-6 w-6" />
                          ) : (
                            <ChevronDown className="h-6 w-6" />
                          )}
                        </button>
                      </div>
                      
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                        {step.description}
                      </p>

                      {/* Expanded Details */}
                      {expandedStep === step.id && (
                        <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                          {/* Detailed Steps */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              📋 Detailed Steps:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {step.details.map((detail, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                                      {idx + 1}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    {detail}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tips */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              💡 Pro Tips:
                            </h4>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                              <ul className="space-y-2">
                                {step.tips.map((tip, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-yellow-800 dark:text-yellow-200 text-sm">
                                      {tip}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Action Button */}
                      <div className="mt-6">
                        <Button 
                          className="inline-flex items-center"
                          onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                        >
                          {expandedStep === step.id ? 'Hide Details' : 'View Details'}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Line */}
                {index < currentSteps.length - 1 && (
                  <div className="flex justify-center">
                    <div className="w-1 h-8 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              🚀 Key Features That Make It Easy
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our platform is designed with simplicity in mind. Here are the features that make 
              buying and selling agricultural products effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl mb-6 shadow-lg">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              ❓ Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Common questions and answers to help you get started quickly.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Is it free to join as a farmer or buyer?",
                answer: "Yes! Creating an account is completely free for both farmers and buyers. We only charge a small transaction fee when sales are completed."
              },
              {
                question: "How do payments work?",
                answer: "We use a secure escrow system. Buyers pay when placing orders, money is held safely, and released to farmers when delivery is confirmed."
              },
              {
                question: "Can I use this on my mobile phone?",
                answer: "Absolutely! Our platform works perfectly on smartphones, tablets, and computers. You can take photos, chat, and manage orders from anywhere."
              },
              {
                question: "How do I know if a farmer or buyer is trustworthy?",
                answer: "We have a rating and review system. You can see ratings, read reviews, and view profile information before making transactions."
              },
              {
                question: "What if there's a problem with my order?",
                answer: "Our support team is here to help! You can contact us through the platform, and we'll resolve any issues quickly and fairly."
              },
              {
                question: "Can I sell/buy in different languages?",
                answer: "Yes! Our platform supports multiple languages including English, Hindi, Telugu, Tamil, Spanish, and French."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started? 🚀
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and buyers who are already benefiting from direct market access.
            It's free, easy, and takes less than 2 minutes to get started!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              🌱 Join as Farmer
            </Button>
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              🛒 Join as Buyer
            </Button>
          </div>
          
          <div className="mt-8 text-emerald-100">
            <p className="text-sm">
              ✅ Free to join • ✅ Secure payments • ✅ 24/7 support • ✅ Mobile friendly
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}