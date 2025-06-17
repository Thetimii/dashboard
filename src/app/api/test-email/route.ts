import { NextRequest, NextResponse } from 'next/server'
import { sendKickoffNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('Test email endpoint called')
    
    // Test data
    const testData = {
      businessName: 'Test Business',
      businessDescription: 'This is a test business for email verification',
      websiteStyle: 'modern',
      desiredPages: ['Startseite', 'Über uns', 'Kontakt'],
      colorPreferences: 'ocean-blue',
      specialRequests: 'This is a test email to verify admin notifications',
      userEmail: 'test@example.com',
      userName: 'Test User',
    }

    console.log('Sending test email with data:', testData)

    const result = await sendKickoffNotificationEmail(testData)

    console.log('Test email sent successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result: result,
      adminEmail: process.env.ADMIN_EMAIL || 'sagertim02@gmail.com',
      hasResendKey: !!process.env.RESEND_API_KEY,
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email', 
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
    message: 'Email test endpoint',
    adminEmail: process.env.ADMIN_EMAIL || 'sagertim02@gmail.com',
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyFirst4: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 4) + '...' : 'Not set',
  })
}
