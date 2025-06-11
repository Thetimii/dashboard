import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Mock Supabase client for development when env vars are not set
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Call the callback with a null session to prevent hanging
      setTimeout(() => callback('SIGNED_OUT', null), 0)
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      }
    },
    signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock client - please configure Supabase' } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock client - please configure Supabase' } }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Mock client - please configure Supabase' } })
      })
    }),
    insert: (values: any) => Promise.resolve({ data: null, error: { message: 'Mock client - please configure Supabase' } }),
    update: (values: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: { message: 'Mock client - please configure Supabase' } })
    }),
  }),
})

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if environment variables are properly set
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_') || supabaseAnonKey.includes('your_')) {
    console.warn('⚠️  Supabase environment variables not configured. Using mock client.')
    console.warn('Please update your .env.local file with your Supabase credentials.')
    return createMockClient() as any
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (error) {
    console.error('❌ Invalid Supabase URL format:', supabaseUrl)
    return createMockClient() as any
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
