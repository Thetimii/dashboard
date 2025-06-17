// API route for sending kickoff completion email notifications
import { NextRequest, NextResponse } from 'next/server'
import { sendKickoffNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData } = body

    console.log('Sending kickoff notification email...')

    if (!customerData) {
      return NextResponse.json(
        { error: 'Customer data is required' },
        { status: 400 }
      )
    }

    // Send kickoff notification email
    const result = await sendKickoffNotificationEmail(customerData)

    console.log('Kickoff notification email sent successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Kickoff notification email sent successfully',
      result
    })
  } catch (error) {
    console.error('Error sending kickoff notification email:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send kickoff notification email', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
