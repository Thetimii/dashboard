export const runtime = 'edge';

import { sendKickoffNotificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    // Test data for email verification
    const testCustomerData = {
      businessName: 'Test Business',
      businessDescription: 'This is a test business for email verification',
      websiteStyle: 'modern',
      desiredPages: ['Startseite', 'Über uns', 'Kontakt'],
      colorPreferences: 'ocean-blue',
      specialRequests: 'This is a test email to verify the email sending functionality',
      userEmail: 'test@example.com',
      userName: 'Test User',
    };

    await sendKickoffNotificationEmail(testCustomerData);

    return new Response(JSON.stringify({
      status: 'OK',
      message: 'Test email sent successfully',
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
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
