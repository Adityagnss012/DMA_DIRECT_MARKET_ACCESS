import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, User, Phone, ArrowLeft, Lock, CreditCard, Building, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useLanguageStore } from '../../store/languageStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import toast from 'react-hot-toast'

type Step = 'personal' | 'banking' | 'verification'

export const SignupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('personal')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'farmer' as 'farmer' | 'buyer',
    address: '',
    // Banking information for farmers
    bankAccountNumber: '',
    bankName: '',
    accountHolderName: '',
    ifscCode: '',
    bankBranch: ''
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

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    // If buyer, skip banking step
    if (formData.role === 'buyer') {
      handleSignup()
    } else {
      // If farmer, go to banking step
      setCurrentStep('banking')
    }
  }

  const handleBankingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation for banking information
    if (!formData.bankAccountNumber || !formData.bankName || !formData.accountHolderName || !formData.ifscCode) {
      toast.error('Please fill in all banking details')
      return
    }

    if (formData.bankAccountNumber.length < 9 || formData.bankAccountNumber.length > 18) {
      toast.error('Please enter a valid bank account number')
      return
    }

    if (formData.ifscCode.length !== 11) {
      toast.error('IFSC code must be 11 characters long')
      return
    }

    handleSignup()
  }

  const handleSignup = async () => {
    setLoading(true)

    try {
      console.log('Starting signup process...')
      
      // Prepare metadata
      const metadata = {
        full_name: formData.fullName,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      }

      // Add banking information for farmers
      if (formData.role === 'farmer') {
        Object.assign(metadata, {
          bank_account_number: formData.bankAccountNumber,
          bank_name: formData.bankName,
          account_holder_name: formData.accountHolderName,
          ifsc_code: formData.ifscCode,
          bank_branch: formData.bankBranch
        })
      }
      
      // Sign up the user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: metadata
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        
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
          toast.success('Account created successfully!')
          navigate('/dashboard')
        } else {
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <div className={`flex items-center ${currentStep === 'personal' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 'personal' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <span className="ml-2 font-medium hidden sm:block">Personal Info</span>
      </div>
      
      {formData.role === 'farmer' && (
        <>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          
          <div className={`flex items-center ${currentStep === 'banking' ? 'text-emerald-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'banking' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium hidden sm:block">Banking Details</span>
          </div>
        </>
      )}
    </div>
  )

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
            {formData.role === 'farmer' 
              ? 'Join our community of farmers and start selling your produce'
              : 'Join our community and start buying fresh produce'
            }
          </p>
        </div>

        <Card className="p-8">
          {renderStepIndicator()}

          {/* Personal Information Step */}
          {currentStep === 'personal' && (
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
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
                placeholder="Create a strong password (min 6 characters)"
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
                className="w-full"
                size="lg"
              >
                {formData.role === 'farmer' ? 'Continue to Banking Details' : 'Create Account'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}

          {/* Banking Information Step (Farmers Only) */}
          {currentStep === 'banking' && formData.role === 'farmer' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full mb-4">
                  <CreditCard className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Banking Information
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  We need your banking details to transfer payments when buyers purchase your products.
                  Your information is encrypted and secure.
                </p>
              </div>

              <form onSubmit={handleBankingSubmit} className="space-y-6">
                <Input
                  label="Account Holder Name *"
                  name="accountHolderName"
                  type="text"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  required
                  placeholder="Enter name as per bank account"
                  icon={<User className="h-5 w-5" />}
                />

                <Input
                  label="Bank Account Number *"
                  name="bankAccountNumber"
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter your bank account number"
                  icon={<CreditCard className="h-5 w-5" />}
                />

                <Input
                  label="Bank Name *"
                  name="bankName"
                  type="text"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., State Bank of India"
                  icon={<Building className="h-5 w-5" />}
                />

                <Input
                  label="IFSC Code *"
                  name="ifscCode"
                  type="text"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  required
                  placeholder="e.g., SBIN0001234"
                  maxLength={11}
                />

                <Input
                  label="Bank Branch"
                  name="bankBranch"
                  type="text"
                  value={formData.bankBranch}
                  onChange={handleChange}
                  placeholder="Enter branch name (optional)"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Lock className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Your Banking Information is Secure
                      </h4>
                      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• All banking details are encrypted and stored securely</li>
                        <li>• We use bank-grade security protocols</li>
                        <li>• Your information is only used for payment transfers</li>
                        <li>• You can update these details anytime from your profile</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep('personal')}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1"
                  >
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            </div>
          )}

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