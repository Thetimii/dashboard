// Auth recovery utilities for handling session persistence across redirects
import { createClient } from './supabase'

export interface AuthRecoveryData {
  user_id: string
  email: string
  timestamp: number
}

export interface PaymentContext {
  paymentId?: string
  userEmail?: string
  timestamp: number
  returnUrl: string
}

/**
 * Store authentication recovery data for payment flows
 */
export const storeAuthRecovery = async (userId: string, email: string): Promise<void> => {
  if (typeof window === 'undefined') return

  const recoveryData: AuthRecoveryData = {
    user_id: userId,
    email,
    timestamp: Date.now()
  }

  try {
    localStorage.setItem('auth_recovery_data', JSON.stringify(recoveryData))
    console.log('Auth recovery data stored for:', email)
  } catch (error) {
    console.warn('Failed to store auth recovery data:', error)
  }
}

/**
 * Retrieve and validate authentication recovery data
 */
export const getAuthRecovery = (): AuthRecoveryData | null => {
  if (typeof window === 'undefined') return null

  try {
    const data = localStorage.getItem('auth_recovery_data')
    if (!data) return null

    const recoveryData: AuthRecoveryData = JSON.parse(data)
    const timeDiff = Date.now() - recoveryData.timestamp

    // Recovery data is valid for 30 minutes
    if (timeDiff > 30 * 60 * 1000) {
      localStorage.removeItem('auth_recovery_data')
      return null
    }

    return recoveryData
  } catch (error) {
    console.warn('Failed to parse auth recovery data:', error)
    localStorage.removeItem('auth_recovery_data')
    return null
  }
}

/**
 * Clear authentication recovery data
 */
export const clearAuthRecovery = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_recovery_data')
}

/**
 * Store payment context for tracking across redirects
 */
export const storePaymentContext = (context: Omit<PaymentContext, 'timestamp'>): void => {
  if (typeof window === 'undefined') return

  const fullContext: PaymentContext = {
    ...context,
    timestamp: Date.now()
  }

  try {
    sessionStorage.setItem('stripe_payment_context', JSON.stringify(fullContext))
    localStorage.setItem('stripe_payment_context', JSON.stringify(fullContext))
    console.log('Payment context stored:', fullContext)
  } catch (error) {
    console.warn('Failed to store payment context:', error)
  }
}

/**
 * Retrieve and validate payment context
 */
export const getPaymentContext = (): PaymentContext | null => {
  if (typeof window === 'undefined') return null

  try {
    // Try sessionStorage first, then localStorage
    let data = sessionStorage.getItem('stripe_payment_context')
    if (!data) {
      data = localStorage.getItem('stripe_payment_context')
    }

    if (!data) return null

    const context: PaymentContext = JSON.parse(data)
    const timeDiff = Date.now() - context.timestamp

    // Context is valid for 10 minutes
    if (timeDiff > 10 * 60 * 1000) {
      clearPaymentContext()
      return null
    }

    return context
  } catch (error) {
    console.warn('Failed to parse payment context:', error)
    clearPaymentContext()
    return null
  }
}

/**
 * Clear payment context from both storage locations
 */
export const clearPaymentContext = (): void => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('stripe_payment_context')
  localStorage.removeItem('stripe_payment_context')
}

/**
 * Attempt to recover user session after payment redirect
 */
export const attemptSessionRecovery = async (): Promise<boolean> => {
  const supabase = createClient()

  try {
    // First, try to get the current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (session && !error) {
      console.log('Session already valid, no recovery needed')
      return true
    }

    // Try to refresh the session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshData.session && !refreshError) {
      console.log('Session successfully refreshed')
      return true
    }

    // Check if we have recovery data
    const recoveryData = getAuthRecovery()
    if (recoveryData) {
      console.log('Found auth recovery data, attempting to validate user:', recoveryData.email)
      
      // Try to get the session one more time
      const { data: { session: retrySession } } = await supabase.auth.getSession()
      
      if (retrySession && retrySession.user.id === recoveryData.user_id) {
        console.log('Session recovery successful')
        clearAuthRecovery()
        return true
      }
    }

    console.log('Session recovery failed')
    return false
  } catch (error) {
    console.error('Error during session recovery:', error)
    return false
  }
}

/**
 * Validate that the current user session is valid and not expired
 */
export const validateSession = async (): Promise<boolean> => {
  const supabase = createClient()

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return false
    }

    // Check if token is close to expiring (within 5 minutes)
    const expiresAt = session.expires_at
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt - now
      
      if (timeUntilExpiry < 300) { // Less than 5 minutes
        console.log('Session expires soon, attempting refresh')
        const { data: refreshData } = await supabase.auth.refreshSession()
        return !!refreshData.session
      }
    }

    return true
  } catch (error) {
    console.error('Error validating session:', error)
    return false
  }
}
