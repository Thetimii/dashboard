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
    // Get the payment ID from client_reference_id if provided
    const paymentId = session.client_reference_id
    const stripePaymentId = session.payment_intent as string
    const stripeCustomerId = session.customer as string

    console.log('📊 Payment details:', {
      paymentId,
      stripePaymentId,
      stripeCustomerId,
      amount: session.amount_total,
      currency: session.currency
    })

    if (paymentId) {
      console.log('🔍 Updating payment record:', paymentId)
      
      // Update existing payment record with customer ID
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
        console.error('❌ Error updating payment status:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
      } else {
        console.log('✅ Payment updated successfully:', data)
        console.log(`💰 Payment ${paymentId} marked as completed with customer ${stripeCustomerId}`)
      }
    } else {
      console.warn('⚠️ No client_reference_id found in session - cannot update payment record')
      console.log('🔍 Available session data:', JSON.stringify({
        id: session.id,
        metadata: session.metadata,
        client_reference_id: session.client_reference_id
      }, null, 2))
    }
  } catch (error) {
    console.error('❌ Error handling successful payment:', error)
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
