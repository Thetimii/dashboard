'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  userProfile: any
  loading: boolean
  signUp: (email: string, password: string, fullName: string, phoneNumber: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    // Simple auth - just get the session and stay logged in
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && isMounted) {
          setUser(session.user)
          setUserProfile({ 
            id: session.user.id, 
            role: 'user',
            full_name: session.user.user_metadata?.full_name || null,
            phone_number: session.user.user_metadata?.phone_number || null
          })
        }
      } catch (error) {
        console.error('Session error:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes - but be more resilient to external redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth change:', event)
        
        // Don't clear state on INITIAL_SESSION - just update if we have a session
        if (event === 'INITIAL_SESSION') {
          if (session?.user && isMounted) {
            setUser(session.user)
            setUserProfile({ 
              id: session.user.id, 
              role: 'user',
              full_name: session.user.user_metadata?.full_name || null,
              phone_number: session.user.user_metadata?.phone_number || null
            })
          }
          if (isMounted) setLoading(false)
          return
        }

        // Handle other auth events normally
        if (isMounted) {
          if (session?.user) {
            setUser(session.user)
            setUserProfile({ 
              id: session.user.id, 
              role: 'user',
              full_name: session.user.user_metadata?.full_name || null,
              phone_number: session.user.user_metadata?.phone_number || null
            })
          } else if (event === 'SIGNED_OUT') {
            // Only clear user state on explicit sign out
            setUser(null)
            setUserProfile(null)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: fullName,
          phone_number: phoneNumber 
        },
      },
    })
    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const isAdmin = () => {
    return userProfile?.role === 'admin' || false
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
