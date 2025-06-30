import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, User, Phone, ArrowLeft, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useLanguageStore } from '../../store/languageStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import toast from 'react-hot-toast'

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'farmer' as 'farmer' | 'buyer',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const { t } = useLanguageStore()
  const navigate = useNavigate()

  // Set role from URL params
  React.useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'farmer' || roleParam === 'buyer') {
      setFormData(prev => ({ ...prev, role: roleParam }))
    }
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Starting signup process...')
      
      // Sign up the user with metadata that will be used by useAuth hook for profile creation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            role: formData.role,
            phone: formData.phone,
            address: formData.address
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        
        // Handle specific error for existing users
        if (authError.message === 'User already registered') {
          toast.error('This email is already registered. Please try logging in instead.')
        } else {
          toast.error(authError.message)
        }
        return
      }

      console.log('Auth signup successful:', authData)

      if (authData.user) {
        if (authData.session) {
          // User is immediately available (email confirmation disabled)
          // Let the useAuth hook handle profile creation/management
          toast.success('Account created successfully!')
          navigate('/dashboard')
        } else {
          // Email confirmation required
          toast.success('Please check your email to confirm your account!')
          navigate('/login')
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.signup.title')}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join our community of farmers and buyers
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            <Input
              label={t('auth.fullName')}
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              icon={<User className="h-5 w-5" />}
            />

            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
              icon={<Mail className="h-5 w-5" />}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a strong password"
              icon={<Lock className="h-5 w-5" />}
            />

            <Input
              label={t('auth.phone')}
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              icon={<Phone className="h-5 w-5" />}
            />

            <Input
              label="Address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.role')}
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white transition-colors duration-200"
              >
                <option value="farmer">{t('auth.role.farmer')}</option>
                <option value="buyer">{t('auth.role.buyer')}</option>
              </select>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}