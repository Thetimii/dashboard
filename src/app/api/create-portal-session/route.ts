import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Create portal session request received')
    
    // Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is missing')
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { customer_id, return_url } = body

    console.log('📊 Portal session request data:', {
      customer_id,
      return_url,
      origin: request.nextUrl.origin
    })

    if (!customer_id) {
      console.error('❌ Customer ID is required')
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Validate customer exists in Stripe
    try {
      const customer = await stripe.customers.retrieve(customer_id)
      if (customer.deleted) {
        console.error('❌ Customer is deleted:', customer_id)
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      console.log('✅ Customer validated:', customer.id)
    } catch (customerError) {
      console.error('❌ Error retrieving customer:', customerError)
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      )
    }

    // Create the portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: return_url || `${request.nextUrl.origin}/dashboard?tab=billing`,
    })

    console.log('✅ Portal session created successfully:', {
      sessionId: portalSession.id,
      url: portalSession.url,
      customer: portalSession.customer
    })

    return NextResponse.json({ 
      url: portalSession.url,
      session_id: portalSession.id
    })

  } catch (error: any) {
    console.error('❌ Error creating portal session:', error)
    
    // Provide more specific error messages
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
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
