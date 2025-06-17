// app/api/send/route.ts

export const runtime = 'edge'; // Ensures it runs in the Vercel Edge Environment

import Email from 'vercel-email';

export async function POST(req: Request) {
  try {
    const { to, subject, html, text } = await req.json();

    // Get admin email from environment, fallback to default
    const adminEmail = process.env.ADMIN_EMAIL || 'sagertim02@gmail.com';

    await Email.send({
      to: to || adminEmail,
      from: 'info@customerflows.ch', // must be a domain you own and have DNS configured for
      subject: subject || 'New Customer Kickoff Completed',
      html: html || '<strong>Default HTML content</strong>',
      text: text || 'Default plain text content',
    });

    return new Response(JSON.stringify({ status: 'OK', message: 'Email sent' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ 
      status: 'ERROR', 
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
