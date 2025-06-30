import React from 'react'
import { Users, Target, Heart, Zap } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import { Card } from '../components/ui/Card'

export const AboutPage: React.FC = () => {
  const { t } = useLanguageStore()

  const values = [
    {
      icon: Heart,
      title: "Community First",
      description: "We believe in building strong relationships between farmers and buyers, fostering a sense of community and mutual support."
    },
    {
      icon: Target,
      title: "Fair Trade",
      description: "Our platform ensures fair pricing for farmers while providing competitive rates for buyers, creating a win-win situation."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We leverage cutting-edge technology to streamline the agricultural supply chain and make farming more profitable."
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "We make fresh, quality produce accessible to everyone while supporting local farmers and sustainable agriculture."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('nav.about')} Direct Market Access
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We're on a mission to revolutionize agriculture by connecting farmers directly with buyers, 
              eliminating unnecessary middlemen and creating a more sustainable food system.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('mission.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {t('mission.description')}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Our platform leverages modern technology to create transparency, trust, and efficiency 
                in agricultural trade, benefiting both farmers and buyers while promoting sustainable 
                farming practices.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Fresh vegetables"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              These core values guide everything we do and shape our commitment to the agricultural community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} hover className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg mb-4">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Meet Our Founder
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Passionate about connecting farmers with technology to create a more sustainable 
              and efficient agricultural marketplace.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Card hover className="p-8 text-center max-w-md">
              <img 
                src="/profile-pic (2).png" 
                alt="Aditya Gadey"
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-emerald-100 dark:border-emerald-800 shadow-lg"
              />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Aditya Gadey
              </h3>
              <p className="text-emerald-600 dark:text-emerald-400 mb-4 font-semibold">
                CEO & Founder
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Visionary entrepreneur with a passion for agricultural technology and sustainable farming. 
                Dedicated to empowering farmers through direct market access and innovative solutions 
                that bridge the gap between traditional agriculture and modern commerce.
              </p>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>📧 adityagnss@gmail.com</span>
                </div>
                <div className="flex justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <span>📱 +91 7287094511</span>
                </div>
                <div className="flex justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <span>📍 Andhra Pradesh, India</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Our Impact
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-xl text-emerald-100">Farmers Empowered</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">1,200+</div>
              <div className="text-xl text-emerald-100">Buyers Connected</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">$2.5M+</div>
              <div className="text-xl text-emerald-100">Farmer Revenue Generated</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-xl text-emerald-100">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}