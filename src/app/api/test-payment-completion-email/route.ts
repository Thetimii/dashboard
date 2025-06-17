// Test API endpoint for payment completion email
import { NextRequest, NextResponse } from 'next/server'
import { sendPaymentCompletionEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    console.log('Testing payment completion email...')
    
    const testData = {
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      businessName: 'Smith Enterprises',
      approvedOption: '1',
      amount: 9900, // $99.00 in cents
      currency: 'usd',
      paymentId: 'test-payment-123',
      completedAt: new Date().toISOString()
    }

    const result = await sendPaymentCompletionEmail(testData)
    
    return NextResponse.json({
      success: true,
      message: 'Payment completion email sent successfully',
      result
    })
  } catch (error) {
    console.error('Test payment completion email failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
