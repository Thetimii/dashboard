import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, text } = body

    // Get admin email from environment variable, fallback to hardcoded
    const adminEmail = process.env.ADMIN_EMAIL || 'sagertim02@gmail.com'

    console.log('Sending email to admin:', adminEmail)
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
      to: [adminEmail], // Always send to admin email
      subject: subject || 'New Customer Kickoff Completed',
      html: html || '<p>A new customer has completed their kickoff form.</p>',
      text: text || 'A new customer has completed their kickoff form.',
    })

    console.log('Email sent successfully:', emailData)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: emailData.data?.id,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
