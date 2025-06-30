import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, DollarSign, Truck, Shield, Star, CheckCircle } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export const HomePage: React.FC = () => {
  const { t } = useLanguageStore()

  const features = [
    {
      icon: Users,
      title: t('features.direct.title'),
      description: t('features.direct.description')
    },
    {
      icon: DollarSign,
      title: t('features.fair.title'),
      description: t('features.fair.description')
    },
    {
      icon: Truck,
      title: t('features.fresh.title'),
      description: t('features.fresh.description')
    },
    {
      icon: Shield,
      title: t('features.secure.title'),
      description: t('features.secure.description')
    }
  ]

  const testimonials = [
    {
      name: "Maria Rodriguez",
      role: "Organic Farmer",
      content: "Direct Market Access has transformed my business. I now sell directly to restaurants and get fair prices for my organic vegetables.",
      rating: 5
    },
    {
      name: "James Wilson",
      role: "Restaurant Owner",
      content: "The platform connects me with local farmers, ensuring fresh ingredients for my restaurant while supporting the community.",
      rating: 5
    },
    {
      name: "Sarah Chen",
      role: "Grocery Store Buyer",
      content: "I love how easy it is to find quality produce directly from farmers. The payment system is secure and reliable.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {t('home.hero.title')}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {t('home.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup?role=farmer">
                <Button size="lg" className="w-full sm:w-auto">
                  {t('home.hero.cta.farmer')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signup?role=buyer">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  {t('home.hero.cta.buyer')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {t('mission.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('mission.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {t('features.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-xl text-emerald-100">Active Farmers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">1,200+</div>
              <div className="text-xl text-emerald-100">Registered Buyers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">$2.5M+</div>
              <div className="text-xl text-emerald-100">Total Transactions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              What Our Users Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and buyers who are already benefiting from direct market access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup?role=farmer">
              <Button size="lg" className="w-full sm:w-auto">
                {t('home.hero.cta.farmer')}
              </Button>
            </Link>
            <Link to="/signup?role=buyer">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                {t('home.hero.cta.buyer')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}