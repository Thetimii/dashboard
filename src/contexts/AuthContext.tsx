'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { attemptSessionRecovery, clearAuthRecovery, clearPaymentContext } from '@/lib/auth-recovery'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const updateUserState = async (session: Session | null) => {
      if (!isMounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()

          if (error) {
            console.error('Error fetching user profile:', error)
            if (isMounted) setIsAdmin(false)
          } else if (isMounted) {
            setIsAdmin(data?.role === 'admin')
          }
        } catch (error) {
          console.error('Profile fetch failed:', error)
          if (isMounted) setIsAdmin(false)
        }
      } else {
        if (isMounted) setIsAdmin(false)
      }
      if (isMounted) setLoading(false)
    }

    // Enhanced session recovery for payment flow
    const getInitialSession = async () => {
      try {
        // First, try to recover session from storage if available
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting initial session:', error)
          // Try to refresh the session in case it's just expired
          const { data: refreshData } = await supabase.auth.refreshSession()
          if (refreshData.session) {
            console.log('Successfully refreshed session')
            await updateUserState(refreshData.session)
          } else {
            // Attempt comprehensive session recovery
            const recovered = await attemptSessionRecovery()
            if (recovered) {
              const { data: { session: recoveredSession } } = await supabase.auth.getSession()
              await updateUserState(recoveredSession)
            } else {
              if (isMounted) setLoading(false)
            }
          }
        } else {
          await updateUserState(session)
        }
      } catch (error) {
        console.error('Critical error getting session:', error)
        const recovered = await attemptSessionRecovery()
        if (!recovered && isMounted) {
          setUser(null)
          setIsAdmin(false)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        // Handle different auth events appropriately
        if (event === 'SIGNED_OUT') {
          // Clear any payment context when user signs out
          clearPaymentContext()
          clearAuthRecovery()
        }
        
        await updateUserState(session)
      },
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
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

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, signUp, signIn, signOut }}
    >
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
