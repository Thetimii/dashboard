export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'OK', 
    message: 'Email API is running',
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
    console.log('Email API called - starting');
    
    const body = await req.json();
    console.log('Request body received');
    
    const { subject, text, html, customerData } = body;

    // Get admin email from environment variable, fallback to hardcoded
    const adminEmail = process.env.ADMIN_EMAIL || 'sagertim02@gmail.com';
    
    console.log('Admin email:', adminEmail);

    // Use MailChannels API directly since vercel-email might have issues
    const emailData = {
      personalizations: [
        {
          to: [{ email: adminEmail }],
        },
      ],
      from: {
        email: 'noreply@customerflows.com',
        name: 'Customer Flows'
      },
      subject: subject || 'New Customer Kickoff Completed',
      content: [
        {
          type: 'text/plain',
          value: text || 'A new customer has completed their kickoff form.',
        },
        {
          type: 'text/html',
          value: html || '<p>A new customer has completed their kickoff form.</p>',
        },
      ],
    };

    console.log('Sending email via MailChannels...');

    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    console.log('MailChannels response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MailChannels error:', errorText);
      throw new Error(`MailChannels API error: ${response.status} - ${errorText}`);
    }

    const result = await response.text();
    console.log('Email sent successfully:', result);

    return new Response(JSON.stringify({ 
      status: 'OK', 
      message: 'Email sent successfully',
      mailChannelsResponse: result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(JSON.stringify({ 
      status: 'ERROR', 
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
