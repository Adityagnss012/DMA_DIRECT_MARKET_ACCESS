import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Leaf, Sun, Moon, Monitor, Globe, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useThemeStore } from '../../store/themeStore'
import { useLanguageStore } from '../../store/languageStore'
import { Button } from '../ui/Button'
import toast from 'react-hot-toast'

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme } = useThemeStore()
  const { language, setLanguage, t } = useLanguageStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      setUserDropdownOpen(false)
      setIsOpen(false)
      
      toast.loading('Signing out...', { id: 'logout' })
      
      await signOut()
      
      toast.success('Signed out successfully!', { id: 'logout' })
      
      // Navigate to home after a brief delay
      setTimeout(() => {
        navigate('/')
      }, 500)
      
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error signing out. Please try again.', { id: 'logout' })
    }
  }

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor
  }

  const ThemeIcon = themeIcons[theme]

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]

  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg group-hover:shadow-lg transition-all duration-200">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {t('home.hero.title')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              {t('nav.about')}
            </Link>
            <Link 
              to="/how-to-use" 
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              How to Use
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              {t('nav.contact')}
            </Link>

            {/* Theme Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
              >
                <ThemeIcon className="h-5 w-5" />
              </button>
              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  {(['light', 'dark', 'system'] as const).map((themeOption) => {
                    const Icon = themeIcons[themeOption]
                    return (
                      <button
                        key={themeOption}
                        onClick={() => {
                          setTheme(themeOption)
                          setThemeDropdownOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{themeOption}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 flex items-center space-x-1"
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">{currentLanguage?.flag}</span>
              </button>
              {languageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 max-h-64 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any)
                        setLanguageDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${
                        language === lang.code 
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="truncate">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden lg:block">
                    {profile?.full_name || user.email}
                  </span>
                </button>
                
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 py-4 space-y-4">
            <Link 
              to="/" 
              className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/about" 
              className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.about')}
            </Link>
            <Link 
              to="/how-to-use" 
              className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              How to Use
            </Link>
            <Link 
              to="/contact" 
              className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.contact')}
            </Link>

            {/* Mobile Language Selector */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</p>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as any)
                      setIsOpen(false)
                    }}
                    className={`p-2 text-left text-sm rounded-lg flex items-center space-x-2 ${
                      language === lang.code 
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate text-xs">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {user ? (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span>{profile?.full_name || user.email}</span>
                </div>
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('nav.dashboard')}
                  </Button>
                </Link>
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="w-full" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full">
                    {t('nav.login')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}