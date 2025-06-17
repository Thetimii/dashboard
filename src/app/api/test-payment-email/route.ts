import { NextRequest, NextResponse } from 'next/server'
import { sendPaymentCompletionEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('Test payment completion email endpoint called')
    
    // Test data for payment completion
    const testData = {
      userEmail: 'test.customer@example.com',
      userName: 'Test Customer',
      businessName: 'Amazing Test Business',
      approvedOption: '2',
      paymentAmount: 99,
      stripePaymentId: 'pi_test_payment_123456',
      stripeCustomerId: 'cus_test_customer_123456',
      approvedAt: new Date().toISOString(),
    }

    console.log('Sending test payment completion email with data:', testData)

    const result = await sendPaymentCompletionEmail(testData)

    console.log('Test payment completion email sent successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Test payment completion email sent successfully',
      result: result,
      testData: testData,
      adminEmail: process.env.ADMIN_EMAIL || 'sagertim02@gmail.com',
      hasResendKey: !!process.env.RESEND_API_KEY,
    })
  } catch (error) {
    console.error('Test payment completion email error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test payment completion email', 
        details: error instanceof Error ? error.message : 'Unknown error',
        adminEmail: process.env.ADMIN_EMAIL || 'sagertim02@gmail.com',
        hasResendKey: !!process.env.RESEND_API_KEY,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Payment completion email test endpoint',
    adminEmail: process.env.ADMIN_EMAIL || 'sagertim02@gmail.com',
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyFirst4: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 4) + '...' : 'Not set',
  })
}
