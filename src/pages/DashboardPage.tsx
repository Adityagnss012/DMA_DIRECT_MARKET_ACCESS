import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { FarmerDashboard } from '../components/dashboard/FarmerDashboard'
import { BuyerDashboard } from '../components/dashboard/BuyerDashboard'
import { Navigate } from 'react-router-dom'

export const DashboardPage: React.FC = () => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Setting up your profile...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're creating your profile. This should only take a moment.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors w-full"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => {
                localStorage.clear()
                window.location.href = '/login'
              }} 
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors w-full"
            >
              Sign In Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {profile.role === 'farmer' ? <FarmerDashboard /> : <BuyerDashboard />}
    </div>
  )
}