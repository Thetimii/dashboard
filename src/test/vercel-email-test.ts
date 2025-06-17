import { sendKickoffNotificationEmailViaVercel } from '../lib/email';

// Manual test function for vercel-email integration
async function testVercelEmailIntegration() {
  try {
    console.log('🧪 Testing vercel-email integration...');
    
    const testData = {
      businessName: 'Test Business (Vercel Email)',
      businessDescription: 'This is a test business for vercel-email verification',
      websiteStyle: 'modern',
      desiredPages: ['Startseite', 'Über uns', 'Kontakt'],
      colorPreferences: 'ocean-blue',
      specialRequests: 'This is a test email to verify vercel-email functionality with DNS configuration.',
      userEmail: 'test@example.com',
      userName: 'Test User',
    };

    const result = await sendKickoffNotificationEmailViaVercel(testData);
    console.log('✅ Test completed successfully:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).testVercelEmail = testVercelEmailIntegration;
}

export { testVercelEmailIntegration };
