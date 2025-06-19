// Simple debug script to test the API endpoints
// Run this in your browser console on the admin page

async function testEmailAPI() {
  console.log('Testing email API endpoints...');
  
  // Get a test user ID from the current page
  const userId = 'test-user-id'; // Replace with actual user ID if available
  
  console.log('Testing demo email endpoint...');
  
  try {
    const response = await fetch('/api/admin/send-demo-email', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('API Error:', data);
    } else {
      console.log('API Success:', data);
    }
    
  } catch (error) {
    console.error('Network Error:', error);
  }
}

// Run the test
testEmailAPI();
