import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Use service role for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  console.log('🔔 Webhook received')
  
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
    console.log('✅ Webhook signature verified', { type: event.type, id: event.id })
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed:`, err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  console.log('📋 Processing event:', event.type)

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      console.log('💳 Processing checkout.session.completed:', {
        sessionId: session.id,
        clientReferenceId: session.client_reference_id,
        customer: session.customer,
        paymentIntent: session.payment_intent,
        paymentStatus: session.payment_status
      })
      await handleSuccessfulPayment(session)
      break
    case 'checkout.session.expired':
      const expiredSession = event.data.object as Stripe.Checkout.Session
      console.log('⏰ Processing checkout.session.expired:', expiredSession.id)
      await handleFailedPayment(expiredSession, 'expired')
      break
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      console.log('❌ Processing payment_intent.payment_failed:', failedPayment.id)
      await handleFailedPaymentIntent(failedPayment)
      break
    default:
      console.log(`ℹ️ Unhandled event type ${event.type}`)
  }

  console.log('✅ Webhook processed successfully')
  return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  console.log('🏦 handleSuccessfulPayment called')
  
  try {
    const paymentId = session.client_reference_id
    const stripePaymentId = session.payment_intent as string
    const stripeCustomerId = session.customer as string
    const customerEmail = session.customer_details?.email

    console.log('📊 Payment details:', {
      paymentId,
      stripePaymentId,
      stripeCustomerId,
      customerEmail,
      amount: session.amount_total,
      currency: session.currency
    })

    let paymentUpdateResult = null

    // Strategy 1: Try to update by payment ID first (most reliable)
    if (paymentId) {
      console.log('🔍 Updating payment record by payment ID:', paymentId)
      
      const { data, error } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'completed',
          stripe_payment_id: stripePaymentId,
          stripe_customer_id: stripeCustomerId
        })
        .eq('id', paymentId)
        .select()

      if (error) {
        console.error('❌ Error updating payment by ID:', error)
      } else if (data && data.length > 0) {
        console.log('✅ Payment updated by ID successfully:', data)
        paymentUpdateResult = data[0]
      }
    }

    // Strategy 2: If payment ID didn't work, try to find by email and pending status
    if (!paymentUpdateResult && customerEmail) {
      console.log('🔍 Attempting to find pending payment by email:', customerEmail)
      
      // Get all users with this email (should be unique)
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (authError) {
        console.error('❌ Error fetching auth users:', authError)
      } else {
        const matchingUser = authUsers.users.find(user => user.email === customerEmail)
        
        if (matchingUser) {
          console.log('👤 Found matching user:', matchingUser.id)
          
          // Find the most recent pending payment for this user
          const { data: pendingPayment, error: paymentError } = await supabaseAdmin
            .from('payments')
            .select('*')
            .eq('user_id', matchingUser.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (paymentError) {
            console.error('❌ Error finding pending payment:', paymentError)
          } else if (pendingPayment) {
            console.log('💳 Found pending payment:', pendingPayment.id)
            
            const { data: updateData, error: updateError } = await supabaseAdmin
              .from('payments')
              .update({
                status: 'completed',
                stripe_payment_id: stripePaymentId,
                stripe_customer_id: stripeCustomerId
              })
              .eq('id', pendingPayment.id)
              .select()

            if (updateError) {
              console.error('❌ Error updating payment by email match:', updateError)
            } else {
              console.log('✅ Payment updated by email match successfully:', updateData)
              paymentUpdateResult = updateData[0]
            }
          } else {
            console.warn('⚠️ No pending payment found for user:', matchingUser.id)
          }
        } else {
          console.warn('⚠️ No user found with email:', customerEmail)
        }
      }
    }

    if (paymentUpdateResult) {
      console.log(`💰 Payment ${paymentUpdateResult.id} successfully marked as completed with customer ${stripeCustomerId}`)
    } else {
      console.warn('❌ Could not find or update any payment record')
      console.log('🔍 Session debug info:', JSON.stringify({
        id: session.id,
        customer_email: customerEmail,
        client_reference_id: paymentId,
        customer: stripeCustomerId,
        payment_intent: stripePaymentId
      }, null, 2))
    }
  } catch (error) {
    console.error('❌ Error handling successful payment:', error)
    console.error('Error stack:', error)
  }
}

async function handleFailedPayment(session: Stripe.Checkout.Session, reason: string) {
  console.log('❌ handleFailedPayment called:', reason)
  
  try {
    const paymentId = session.client_reference_id

    console.log('📊 Failed payment details:', {
      paymentId,
      sessionId: session.id,
      reason
    })

    if (paymentId) {
      const { data, error } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'failed'
        })
        .eq('id', paymentId)
        .select()

      if (error) {
        console.error('❌ Error updating failed payment status:', error)
      } else {
        console.log('✅ Failed payment updated:', data)
        console.log(`💸 Payment ${paymentId} marked as failed (${reason})`)
      }
    } else {
      console.warn('⚠️ No client_reference_id found for failed payment')
    }
  } catch (error) {
    console.error('❌ Error handling failed payment:', error)
  }
}

async function handleFailedPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ handleFailedPaymentIntent called')
  
  try {
    console.log('📊 Failed payment intent details:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      lastPaymentError: paymentIntent.last_payment_error
    })

    // Try to find the payment by stripe_payment_id
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'failed'
      })
      .eq('stripe_payment_id', paymentIntent.id)
      .select()

    if (error) {
      console.error('❌ Error updating failed payment intent status:', error)
    } else {
      console.log('✅ Failed payment intent updated:', data)
      console.log(`💸 Payment with intent ${paymentIntent.id} marked as failed`)
    }
  } catch (error) {
    console.error('❌ Error handling failed payment intent:', error)
  }
}
