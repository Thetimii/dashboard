export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'OK', 
    message: 'Resend Email API is running',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.RESEND_API_KEY
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
    
    console.log('Admin email:', adminEmail);
    console.log('Resend API key configured:', !!resendApiKey);

    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable is not set');
      return new Response(JSON.stringify({ 
        status: 'ERROR', 
        message: 'RESEND_API_KEY environment variable is not set. Please add it to your Vercel environment variables.',
        setup_instructions: 'Go to Vercel Dashboard → Project Settings → Environment Variables and add RESEND_API_KEY'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    console.log('Sending email via Resend...');

    // Use direct fetch to Resend API instead of the SDK for better edge compatibility
    const emailData = {
      from: 'Customer Flows <onboarding@resend.dev>',
      to: [adminEmail],
      subject: subject || 'New Customer Kickoff Completed',
      html: html || '<p>A new customer has completed their kickoff form.</p>',
      text: text || 'A new customer has completed their kickoff form.',
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    console.log('Resend API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via Resend:', result);

    return new Response(JSON.stringify({ 
      status: 'OK', 
      message: 'Email sent successfully via Resend',
      emailId: result.id,
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
