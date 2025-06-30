import React, { useState } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export const ProfileSection: React.FC = () => {
  const { user, profile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    avatar_url: profile?.avatar_url || ''
  })

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      avatar_url: profile?.avatar_url || ''
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      avatar_url: profile?.avatar_url || ''
    })
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          avatar_url: formData.avatar_url.trim() || null
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
      setIsEditing(false)
      
      // Refresh the page to update the profile data
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 dark:border-emerald-800"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center border-4 border-emerald-100 dark:border-emerald-800">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {profile.full_name || 'User'}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  profile.role === 'farmer' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {profile.role === 'farmer' ? '🌱 Farmer' : '🛒 Buyer'}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} loading={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Personal Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  icon={<User className="h-5 w-5" />}
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {profile.full_name || 'Not provided'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{profile.email}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">(Cannot be changed)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  icon={<Phone className="h-5 w-5" />}
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {profile.phone || 'Not provided'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter your address"
                />
              ) : (
                <div className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-900 dark:text-white">
                    {profile.address || 'Not provided'}
                  </span>
                </div>
              )}
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Avatar URL (Optional)
                </label>
                <Input
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Account Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Account Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Type
              </label>
              <div className={`p-3 rounded-lg ${
                profile.role === 'farmer' 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}>
                <span className={`font-medium ${
                  profile.role === 'farmer' 
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-blue-800 dark:text-blue-200'
                }`}>
                  {profile.role === 'farmer' ? '🌱 Farmer Account' : '🛒 Buyer Account'}
                </span>
                <p className={`text-sm mt-1 ${
                  profile.role === 'farmer' 
                    ? 'text-green-600 dark:text-green-300'
                    : 'text-blue-600 dark:text-blue-300'
                }`}>
                  {profile.role === 'farmer' 
                    ? 'You can list and sell your agricultural products'
                    : 'You can browse and purchase products from farmers'
                  }
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Member Since
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">
                  {format(new Date(profile.created_at), 'PPPP')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Updated
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">
                  {format(new Date(profile.updated_at), 'PPpp')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User ID
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white font-mono text-sm">
                  {profile.id}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Account Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Download Your Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Export all your account data and activity history.
            </p>
            <Button variant="outline" size="sm">
              Request Data Export
            </Button>
          </div>

          <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-medium text-red-900 dark:text-red-200 mb-2">
              Delete Account
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}