// API route for sending demo approval email notifications
import { NextRequest, NextResponse } from 'next/server'
import { sendDemoApprovalEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customerName, 
      customerEmail, 
      businessName, 
      approvedOption, 
      demoUrl, 
      approvedAt 
    } = body

    console.log('Sending demo approval notification email...')

    if (!approvedOption) {
      return NextResponse.json(
        { error: 'Approved option is required' },
        { status: 400 }
      )
    }

    // Send demo approval email
    const result = await sendDemoApprovalEmail({
      customerName,
      customerEmail,
      businessName,
      approvedOption,
      demoUrl,
      approvedAt
    })

    console.log('Demo approval email sent successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Demo approval email sent successfully',
      result
    })
  } catch (error) {
    console.error('Error sending demo approval email:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send demo approval email', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
