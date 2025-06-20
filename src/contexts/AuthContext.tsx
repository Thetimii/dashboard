'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session, PostgrestError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { clearAuthRecovery, clearPaymentContext } from '@/lib/auth-recovery'

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
  const [loading, setLoading] = useState(true) // Start with loading true
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    console.log('AuthContext: Subscribing to auth state changes...')
    setLoading(true)

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log(`AuthContext: Auth event - ${event}`)
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          // If we have a user, fetch their profile immediately.
          console.log('AuthContext: User found, fetching profile...')
          try {
            const { data, error } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', currentUser.id)
              .single() // Using single() again, ensure RLS is correct

            if (error && error.code !== 'PGRST116') {
              // PGRST116 means no rows found, which is a valid case.
              console.error('AuthContext: Error fetching user profile:', error)
              setIsAdmin(false)
            } else {
              const role = data?.role
              console.log(`AuthContext: User role is '${role}'`)
              setIsAdmin(role === 'admin')
            }
          } catch (e) {
            console.error('AuthContext: Exception fetching profile:', e)
            setIsAdmin(false)
          }
        } else {
          // No user, so not an admin.
          setIsAdmin(false)
        }

        // Loading is false once we have processed the auth event.
        setLoading(false)
        console.log('AuthContext: Loading complete.')

        if (event === 'SIGNED_OUT') {
          clearPaymentContext()
          clearAuthRecovery()
        }
      }
    )

    return () => {
      console.log('AuthContext: Unsubscribing from auth state changes.')
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
    await supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
