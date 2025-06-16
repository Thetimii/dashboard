import { loadStripe } from '@stripe/stripe-js'
import { createClient } from './supabase'

export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Payment utility functions
export const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/cNi00j7ZW5xa9Ln0MG1oI00'
export const PAYMENT_AMOUNT = 99 // CHF

export async function createPaymentRecord(userId: string, amount: number = PAYMENT_AMOUNT, userEmail?: string) {
  const supabase = createClient()
  
  console.log('Creating payment record for user:', { userId, userEmail, amount })
  
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      amount: amount,
      status: 'pending'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating payment record:', error)
    throw error
  }
  
  console.log('Payment record created:', data)
  return data
}

export async function getPaymentStatus(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching payment status:', error)
    throw error
  }
  
  return data
}

export async function updatePaymentStatus(paymentId: string, status: 'completed' | 'failed', stripePaymentId?: string) {
  const supabase = createClient()
  
  const updateData: any = { status }
  if (stripePaymentId) {
    updateData.stripe_payment_id = stripePaymentId
  }
  
  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', paymentId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
  
  return data
}

export function redirectToStripePayment(paymentId?: string, userEmail?: string) {
  // Add payment ID and email as query parameters for tracking
  let url = STRIPE_PAYMENT_URL
  
  const params = new URLSearchParams()
  
  if (paymentId) {
    params.append('client_reference_id', paymentId)
  }
  
  if (userEmail) {
    // Pre-fill and lock the email in Stripe checkout
    params.append('prefilled_email', userEmail)
  }
  
  if (params.toString()) {
    url += '?' + params.toString()
  }
  
  window.location.href = url
}

export async function getCustomerDetails(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('payments')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer details:', error)
    throw error
  }
  
  return data
}

export async function createCustomerPortalSession(stripeCustomerId: string) {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: stripeCustomerId,
        return_url: `${window.location.origin}/dashboard?tab=billing`
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const { url } = await response.json()
    window.location.href = url
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    throw error
  }
}
