export const runtime = 'edge';

import { Resend } from 'resend';

export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'OK', 
    message: 'Resend Email API is running',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(req: Request) {
  try {
    console.log('Resend Email API called - starting');
    
    const body = await req.json();
    console.log('Request body received');
    
    const { subject, text, html, customerData } = body;

    // Get admin email from environment variable, fallback to hardcoded
    const adminEmail = process.env.ADMIN_EMAIL || 'sagertim02@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    console.log('Admin email:', adminEmail);
    console.log('Resend API key configured:', !!resendApiKey);

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    console.log('Sending email via Resend...');

    const result = await resend.emails.send({
      from: 'Customer Flows <onboarding@resend.dev>', // Uses Resend's domain - no DNS needed!
      to: [adminEmail],
      subject: subject || 'New Customer Kickoff Completed',
      html: html || '<p>A new customer has completed their kickoff form.</p>',
      text: text || 'A new customer has completed their kickoff form.',
    });

    console.log('Email sent successfully:', result);

    return new Response(JSON.stringify({ 
      status: 'OK', 
      message: 'Email sent successfully via Resend',
      emailId: result.data?.id,
      result: result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Resend email sending error:', error);
    return new Response(JSON.stringify({ 
      status: 'ERROR', 
      message: 'Failed to send email via Resend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
