import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { promo_code, amount } = await request.json()

    if (!promo_code || !amount) {
      return NextResponse.json(
        { error: 'Promo code and amount are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Call the validation function
    const { data, error } = await supabase
      .rpc('validate_promo_code', {
        code_input: promo_code,
        original_amount_input: amount
      })

    if (error) {
      console.error('Error validating promo code:', error)
      return NextResponse.json(
        { error: 'Failed to validate promo code' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No validation result returned' },
        { status: 500 }
      )
    }

    const result = data[0]

    if (!result.is_valid) {
      return NextResponse.json(
        { 
          valid: false, 
          error: result.error_message 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      promo_id: result.promo_id,
      original_amount: amount,
      discount_amount: result.discount_amount,
      final_amount: result.final_amount,
      savings: result.discount_amount
    })

  } catch (error) {
    console.error('Promo code validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to validate promo codes' },
    { status: 405 }
  )
}
