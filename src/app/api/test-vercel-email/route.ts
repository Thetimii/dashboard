// Test endpoint for vercel-email functionality
export const runtime = 'edge';

import Email from 'vercel-email';

export async function GET() {
  return new Response(JSON.stringify({
    status: 'OK',
    message: 'Vercel Email API is running',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST() {
  try {
    // Test direct email sending
    const adminEmail = process.env.ADMIN_EMAIL || 'sagertim02@gmail.com';
    
    await Email.send({
      to: adminEmail,
      from: 'noreply@yourdomain.com',
      subject: '🧪 Test Email - Vercel Email Integration',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify the vercel-email integration is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
      text: `Test Email - This is a test email to verify the vercel-email integration is working correctly. Sent at: ${new Date().toISOString()}`,
    });
    
    return new Response(JSON.stringify({
      status: 'OK',
      message: 'Test email sent successfully',
      adminEmail: adminEmail
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'ERROR',
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
