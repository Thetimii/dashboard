import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Create checkout session request received')
    
    const body = await request.json()
    const { payment_id, user_email, success_url, cancel_url } = body

    console.log('📊 Checkout session request data:', {
      payment_id,
      user_email,
      success_url,
      cancel_url
    })

    if (!payment_id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    if (!user_email) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    // Default URLs if not provided
    const defaultSuccessUrl = `${request.nextUrl.origin}/followupquestions`
    const defaultCancelUrl = `${request.nextUrl.origin}/dashboard`

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user_email,
      client_reference_id: payment_id,
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: 'Website Development Project',
              description: 'Custom website development with 3 demo options',
            },
            unit_amount: 9900, // 99 CHF in cents
          },
          quantity: 1,
        },
      ],
      success_url: success_url || defaultSuccessUrl,
      cancel_url: cancel_url || defaultCancelUrl,
      automatic_tax: {
        enabled: false,
      },
    })

    console.log('✅ Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url,
      client_reference_id: session.client_reference_id
    })

    return NextResponse.json({ 
      url: session.url,
      session_id: session.id
    })

  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error)
    
    // Provide more specific error messages
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
