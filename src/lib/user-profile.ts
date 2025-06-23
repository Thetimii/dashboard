import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  full_name: string | null
  role: 'user' | 'admin'
  created_at: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    // Use a simple API check instead of direct database query
    const response = await fetch('/api/admin?action=admins')
    return response.ok
  } catch (error) {
    return false
  }
}

export async function createUserProfile(user: User, role: 'user' | 'admin' = 'user'): Promise<void> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        role
      })

    if (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in createUserProfile:', error)
    throw error
  }
}
