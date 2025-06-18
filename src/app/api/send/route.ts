import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email API route called')
    const body = await request.json()
    const { to, subject, html, text } = body

    console.log('📧 Email request body:', {
      to: to,
      subject: subject,
      hasHtml: !!html,
      hasText: !!text
    })

    // Determine recipient - if 'to' is provided, use it (for customer emails)
    // Otherwise, use admin email (for admin notifications)
    const recipientEmail = to || process.env.ADMIN_EMAIL || 'sagertim02@gmail.com'

    console.log('📧 Final recipient email:', recipientEmail)
    console.log('📧 Email subject:', subject)
    console.log('📧 Environment check:', {
      hasResendApiKey: !!process.env.RESEND_API_KEY,
      adminEmail: process.env.ADMIN_EMAIL
    })

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY environment variable is not set')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
    )
    }

    console.log('📧 Attempting to send email via Resend...')

    // Send email using Resend
    const emailData = await resend.emails.send({
      from: 'Customer Flows <info@customerflows.ch>',
      to: [recipientEmail],
      subject: subject || 'Notification from Customer Flows',
      html: html || '<p>You have a new notification.</p>',
      text: text || 'You have a new notification.',
    })

    console.log('✅ Email sent successfully:', {
      emailId: emailData.data?.id,
      sentTo: recipientEmail,
      error: emailData.error
    })

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: emailData.data?.id,
      sentTo: recipientEmail,
    })
  } catch (error) {
    console.error('❌ Error sending email:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
