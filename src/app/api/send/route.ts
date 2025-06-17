import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, text } = body

    // Determine recipient - if 'to' is provided, use it (for customer emails)
    // Otherwise, use admin email (for admin notifications)
    const recipientEmail = to || process.env.ADMIN_EMAIL || 'sagertim02@gmail.com'

    console.log('Sending email to:', recipientEmail)
    console.log('Email subject:', subject)

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Send email using Resend
    const emailData = await resend.emails.send({
      from: 'Customer Flows <info@customerflows.ch>',
      to: [recipientEmail],
      subject: subject || 'Notification from Customer Flows',
      html: html || '<p>You have a new notification.</p>',
      text: text || 'You have a new notification.',
    })

    console.log('Email sent successfully:', emailData)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: emailData.data?.id,
      sentTo: recipientEmail,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
