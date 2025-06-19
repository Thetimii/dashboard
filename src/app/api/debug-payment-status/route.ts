import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Debug API endpoint to help with testing payment flows
export async function POST(req: NextRequest) {
  try {
    const { userId, action } = await req.json()

    // Use service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'mark_completed') {
      // Find or create a payment record and mark it as completed
      const { data: existingPayment, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching payment:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
      }

      if (existingPayment) {
        // Update existing payment
        const { data, error } = await supabase
          .from('payments')
          .update({ 
            status: 'completed',
            stripe_payment_id: 'test_payment_' + Date.now(),
            stripe_customer_id: 'test_customer_' + Date.now()
          })
          .eq('id', existingPayment.id)
          .select()

        if (error) {
          console.error('Error updating payment:', error)
          return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Payment marked as completed',
          payment: data[0]
        })
      } else {
        // Create new payment record
        const { data, error } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            amount: 99,
            status: 'completed',
            stripe_payment_id: 'test_payment_' + Date.now(),
            stripe_customer_id: 'test_customer_' + Date.now()
          })
          .select()

        if (error) {
          console.error('Error creating payment:', error)
          return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Payment record created and marked as completed',
          payment: data[0]
        })
      }
    }

    if (action === 'check_status') {
      // Check current payment and questionnaire status
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const { data: questionnaire } = await supabase
        .from('followup_questionnaires')
        .select('*')
        .eq('user_id', userId)
        .single()

      return NextResponse.json({
        success: true,
        payment: payment || null,
        questionnaire: questionnaire || null
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Debug payment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { data: questionnaire } = await supabase
      .from('followup_questionnaires')
      .select('*')
      .eq('user_id', userId)
      .single()

    return NextResponse.json({
      success: true,
      payment: payment || null,
      questionnaire: questionnaire || null
    })

  } catch (error) {
    console.error('Debug payment GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
