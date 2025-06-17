// Stripe webhook handler - Fixed 405 error issue - Updated 16 Jun 2025
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { sendPaymentCompletionEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  // Use service role for server-side operations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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
      await handleSuccessfulPayment(session, supabaseAdmin)
      break
    case 'checkout.session.expired':
      const expiredSession = event.data.object as Stripe.Checkout.Session
      console.log('⏰ Processing checkout.session.expired:', expiredSession.id)
      await handleFailedPayment(expiredSession, 'expired', supabaseAdmin)
      break
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('❌ Processing payment_intent.payment_failed:', failedPaymentIntent.id)
      await handleFailedPaymentIntent(failedPaymentIntent, supabaseAdmin)
      break
    default:
      console.log(`🤷‍♂️ Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    },
  })
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session, supabaseAdmin: any) {
  console.log('✅ handleSuccessfulPayment called')
  
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
        const matchingUser = authUsers.users.find((user: any) => user.email === customerEmail)
        
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
    }    if (paymentUpdateResult) {
      console.log(`💰 Payment ${paymentUpdateResult.id} successfully marked as completed with customer ${stripeCustomerId}`)
      
      // Send admin email notification about the completed payment
      try {
        // Fetch additional customer and business data for the email
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(paymentUpdateResult.user_id)
        
        let businessData = null
        if (!userError && userData?.user) {
          // Fetch kickoff form data for business information
          const { data: kickoffData, error: kickoffError } = await supabaseAdmin
            .from('kickoff_forms')
            .select('business_name')
            .eq('user_id', userData.user.id)
            .single()
          
          if (!kickoffError && kickoffData) {
            businessData = kickoffData
          }
        }

        // Fetch demo approval data
        let approvedOption = null
        let approvedAt = null
        const { data: demoData, error: demoError } = await supabaseAdmin
          .from('demo_links')
          .select('approved_option, approved_at')
          .eq('user_id', paymentUpdateResult.user_id)
          .single()
        
        if (!demoError && demoData) {
          approvedOption = demoData.approved_option
          approvedAt = demoData.approved_at
        }        // Send payment completion email
        await sendPaymentCompletionEmail({
          userEmail: customerEmail || userData?.user?.email,
          userName: userData?.user?.user_metadata?.full_name || userData?.user?.email,
          businessName: businessData?.business_name,
          approvedOption: approvedOption,
          paymentAmount: session.amount_total ? session.amount_total / 100 : 99, // Convert from cents
          stripePaymentId: stripePaymentId,
          stripeCustomerId: stripeCustomerId,
          approvedAt: approvedAt,
        })
        
        console.log('📧 Payment completion email sent successfully')
      } catch (emailError) {
        console.error('❌ Failed to send payment completion email:', emailError)
        // Don't fail the webhook if email fails
      }
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

async function handleFailedPayment(session: Stripe.Checkout.Session, reason: string, supabaseAdmin: any) {
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

async function handleFailedPaymentIntent(paymentIntent: Stripe.PaymentIntent, supabaseAdmin: any) {
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
