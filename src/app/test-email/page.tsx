// Simple test page to verify vercel-email in the browser
export default function TestEmailPage() {
  const testEmail = async () => {
    try {
      console.log('🧪 Testing email from browser...');
      
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'sagertim02@gmail.com',
          subject: '🧪 Browser Test - Vercel Email',
          html: '<h1>Browser Test</h1><p>Testing vercel-email from browser environment</p>',
          text: 'Browser Test - Testing vercel-email from browser environment',
        }),
      });

      const result = await response.json();
      console.log('📧 Email result:', result);
      alert(`Email result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('❌ Email error:', error);
      alert(`Email error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">🧪 Vercel Email Test</h1>
        <p className="mb-4">Test the vercel-email integration with your DNS setup.</p>
        <button
          onClick={testEmail}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Send Test Email
        </button>
      </div>
    </div>
  );
}
