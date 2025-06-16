import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      await handleSuccessfulPayment(session)
      break
    case 'checkout.session.expired':
      const expiredSession = event.data.object as Stripe.Checkout.Session
      await handleFailedPayment(expiredSession, 'expired')
      break
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      await handleFailedPaymentIntent(failedPayment)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const supabase = createClient()
  
  try {
    // Get the payment ID from client_reference_id if provided
    const paymentId = session.client_reference_id
    const stripePaymentId = session.payment_intent as string
    const stripeCustomerId = session.customer as string

    if (paymentId) {
      // Update existing payment record with customer ID
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          stripe_payment_id: stripePaymentId,
          stripe_customer_id: stripeCustomerId
        })
        .eq('id', paymentId)

      if (error) {
        console.error('Error updating payment status:', error)
      } else {
        console.log(`Payment ${paymentId} marked as completed with customer ${stripeCustomerId}`)
      }
    } else {
      console.warn('No client_reference_id found in session')
    }
  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

async function handleFailedPayment(session: Stripe.Checkout.Session, reason: string) {
  const supabase = createClient()
  
  try {
    const paymentId = session.client_reference_id

    if (paymentId) {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'failed'
        })
        .eq('id', paymentId)

      if (error) {
        console.error('Error updating failed payment status:', error)
      } else {
        console.log(`Payment ${paymentId} marked as failed (${reason})`)
      }
    }
  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}

async function handleFailedPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createClient()
  
  try {
    // Try to find the payment by stripe_payment_id
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'failed'
      })
      .eq('stripe_payment_id', paymentIntent.id)

    if (error) {
      console.error('Error updating failed payment intent status:', error)
    } else {
      console.log(`Payment with intent ${paymentIntent.id} marked as failed`)
    }
  } catch (error) {
    console.error('Error handling failed payment intent:', error)
  }
}
