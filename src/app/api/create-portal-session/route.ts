import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { customer_id, return_url } = await request.json()

    if (!customer_id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: return_url || `${request.nextUrl.origin}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
