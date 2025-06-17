export const runtime = 'edge';

import { sendKickoffNotificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    console.log('Test email endpoint called');
    
    // Test data for email verification
    const testCustomerData = {
      businessName: 'Test Business (Resend)',
      businessDescription: 'This is a test business for Resend email verification',
      websiteStyle: 'modern',
      desiredPages: ['Startseite', 'Über uns', 'Kontakt'],
      colorPreferences: 'ocean-blue',
      specialRequests: 'This is a test email to verify Resend email functionality - no DNS required!',
      userEmail: 'sagertim02@gmail.com',
      userName: 'Test User',
    };

    console.log('Calling sendKickoffNotificationEmail with test data...');
    const result = await sendKickoffNotificationEmail(testCustomerData);

    return new Response(JSON.stringify({
      status: 'OK',
      message: 'Test email sent successfully via Resend',
      result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Test email error:', error);
    return new Response(JSON.stringify({
      status: 'ERROR',
      message: 'Failed to send test email via Resend',
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
