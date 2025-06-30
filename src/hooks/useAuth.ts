import { useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const [loading, setLoading] = useState(true)
  const { user, profile, setUser, setProfile, clearAuth } = useAuthStore()
  const initializingRef = useRef(false)
  const fetchingProfileRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const initializeAuth = async () => {
      if (initializingRef.current) {
        console.log('Auth already initializing, skipping...')
        return
      }

      initializingRef.current = true
      console.log('Initializing auth...')

      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Initial session:', session?.user?.email || 'No session')
        
        if (!mountedRef.current) return

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mountedRef.current) {
          setLoading(false)
        }
      } finally {
        initializingRef.current = false
      }
    }

    // Only initialize if we don't have a user yet
    if (!user && !initializingRef.current) {
      initializeAuth()
    } else if (user && !profile && !fetchingProfileRef.current) {
      // If we have a user but no profile, fetch it
      fetchProfile(user.id)
    } else if (user && profile) {
      // We have both user and profile, stop loading
      setLoading(false)
    }

    // Listen for auth changes - only set up once
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user')
        
        if (!mountedRef.current) return

        // Prevent multiple rapid auth changes
        if (initializingRef.current) {
          console.log('Already processing auth change, skipping...')
          return
        }

        initializingRef.current = true

        try {
          if (session?.user) {
            setUser(session.user)
            if (!profile || profile.id !== session.user.id) {
              await fetchProfile(session.user.id)
            } else {
              setLoading(false)
            }
          } else {
            clearAuth()
            setLoading(false)
          }
        } finally {
          initializingRef.current = false
        }
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array - only run once

  const fetchProfile = async (userId: string) => {
    if (fetchingProfileRef.current || !mountedRef.current) {
      console.log('Profile fetch already in progress or component unmounted, skipping...')
      return
    }

    fetchingProfileRef.current = true
    console.log('Fetching profile for user:', userId)

    try {
      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching profile:', fetchError)
        if (mountedRef.current) {
          await createProfileFromAuth(userId)
        }
        return
      }

      if (existingProfile && mountedRef.current) {
        console.log('Profile found:', existingProfile.full_name, existingProfile.role)
        setProfile(existingProfile)
        setLoading(false)
      } else if (mountedRef.current) {
        console.log('No profile found, creating from auth metadata...')
        await createProfileFromAuth(userId)
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      if (mountedRef.current) {
        setLoading(false)
      }
    } finally {
      fetchingProfileRef.current = false
    }
  }

  const createProfileFromAuth = async (userId: string) => {
    if (!mountedRef.current) return

    try {
      console.log('Creating profile for user:', userId)
      
      // Get user metadata from auth
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser || !mountedRef.current) {
        console.error('No auth user found')
        setLoading(false)
        return
      }

      let profileData = {
        id: userId,
        email: authUser.email || '',
        full_name: '',
        role: 'buyer' as const,
        phone: '',
        address: ''
      }

      // Try to get data from user metadata first
      if (authUser.user_metadata && Object.keys(authUser.user_metadata).length > 0) {
        console.log('Using user metadata:', authUser.user_metadata)
        profileData = {
          ...profileData,
          full_name: authUser.user_metadata.full_name || authUser.user_metadata.name || authUser.email?.split('@')[0] || 'User',
          role: authUser.user_metadata.role || 'buyer',
          phone: authUser.user_metadata.phone || '',
          address: authUser.user_metadata.address || ''
        }
      } else {
        // Fallback to basic data
        profileData.full_name = authUser.email?.split('@')[0] || 'User'
      }

      console.log('Creating profile with data:', profileData)

      // Try to create profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        
        // Check if profile already exists (race condition)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
          
        if (existingProfile && mountedRef.current) {
          console.log('Found existing profile after creation error:', existingProfile)
          setProfile(existingProfile)
        } else if (mountedRef.current) {
          console.log('Creating fallback profile in memory')
          // Create fallback profile object
          const fallbackProfile = {
            ...profileData,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setProfile(fallbackProfile)
        }
      } else if (mountedRef.current) {
        console.log('Profile created successfully:', newProfile)
        setProfile(newProfile)
      }
      
      if (mountedRef.current) {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error creating profile from auth:', error)
      
      if (mountedRef.current) {
        // Final fallback - create basic profile in memory
        const { data: { user: authUser } } = await supabase.auth.getUser()
        const fallbackProfile = {
          id: userId,
          email: authUser?.email || '',
          full_name: authUser?.email?.split('@')[0] || 'User',
          role: 'buyer' as const,
          phone: '',
          address: '',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        console.log('Using final fallback profile:', fallbackProfile)
        setProfile(fallbackProfile)
        setLoading(false)
      }
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out user...')
      
      // Try to sign out from Supabase first, but don't fail if session is already invalid
      try {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.warn('Supabase sign out warning (continuing anyway):', error.message)
        } else {
          console.log('Successfully signed out from Supabase')
        }
      } catch (supabaseError) {
        // Log the error but continue with local cleanup
        console.warn('Supabase sign out failed (continuing with local cleanup):', supabaseError)
      }
      
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      // Always clear local state regardless of Supabase response
      console.log('Clearing local auth state...')
      clearAuth()
      setLoading(false)
    }
  }

  return {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user,
    isFarmer: profile?.role === 'farmer',
    isBuyer: profile?.role === 'buyer'
  }
}