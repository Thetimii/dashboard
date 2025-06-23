import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/user-profile'

export async function requireAdmin() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin')
  }
  
  const profile = await getUserProfile(user.id)
  
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }
  
  return { user, profile }
}
