import { NextRequest, NextResponse } from 'next/server'
import { sendDemoReadyEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('Test demo ready email endpoint called')
    
    // Test data for demo ready notification
    const testData = {
      userEmail: 'test.customer@example.com',
      userName: 'Test Customer',
      businessName: 'Amazing Test Business',
      option1Url: 'https://demo1.example.com',
      option2Url: 'https://demo2.example.com',
      option3Url: 'https://demo3.example.com',
    }

    console.log('Sending test demo ready email with data:', testData)

    const result = await sendDemoReadyEmail(testData)

    console.log('Test demo ready email sent successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Test demo ready email sent successfully',
      result: result,
      testData: testData,
      hasResendKey: !!process.env.RESEND_API_KEY,
    })
  } catch (error) {
    console.error('Test demo ready email error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test demo ready email', 
        details: error instanceof Error ? error.message : 'Unknown error',
        hasResendKey: !!process.env.RESEND_API_KEY,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Demo ready email test endpoint',
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyFirst4: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 4) + '...' : 'Not set',
  })
}
