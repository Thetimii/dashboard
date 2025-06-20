import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Create checkout session request received')
    
    // Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is missing')
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      paymentId, 
      userEmail, 
      promoCodeData, 
      successUrl, 
      cancelUrl 
    } = body

    console.log('📊 Checkout session request data:', {
      paymentId,
      userEmail,
      promoCodeData,
      successUrl,
      cancelUrl
    })

    // Determine the amount
    const amount = promoCodeData ? promoCodeData.originalAmount - promoCodeData.discountAmount : 9900 // 99 CHF in cents

    // Create Stripe Checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: 'Website Development Package',
              description: 'Professional website development with custom design and optimization',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl + '&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      client_reference_id: paymentId,
      customer_email: userEmail,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['CH', 'DE', 'AT', 'IT', 'FR', 'LI'], // DACH region + surrounding
      },
    }

    // Add automatic tax calculation if available
    if (process.env.STRIPE_TAX_ENABLED === 'true') {
      sessionParams.automatic_tax = { enabled: true }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log('✅ Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url,
      clientReferenceId: session.client_reference_id
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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
