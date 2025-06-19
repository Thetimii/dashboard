// Debug script for admin email buttons
// Run this in your browser console on the admin project page

async function debugAdminEmails() {
  console.log('🔍 Debugging Admin Email System...');
  
  // First, let's get the current page URL to extract project ID
  const currentUrl = window.location.href;
  console.log('Current URL:', currentUrl);
  
  // Try to extract user ID from the page (look for data attributes or project data)
  const projectIdMatch = currentUrl.match(/\/admin\/projects\/([^\/]+)/);
  if (!projectIdMatch) {
    console.error('❌ Could not extract project ID from URL');
    return;
  }
  
  const projectId = projectIdMatch[1];
  console.log('📋 Project ID:', projectId);
  
  // Test both email endpoints
  await testEmailEndpoint('/api/admin/send-demo-email', projectId);
  await testEmailEndpoint('/api/admin/send-launch-email', projectId);
}

async function testEmailEndpoint(endpoint, userId) {
  console.log(`\n📧 Testing ${endpoint} with userId: ${userId}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth header if you have one
        // 'Authorization': 'Bearer your-token-here'
      },
      body: JSON.stringify({ userId })
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data);
    } else {
      const errorData = await response.json();
      console.log('❌ Error:', errorData);
      
      // Common error explanations
      if (response.status === 404) {
        console.log('💡 This usually means the user/project data is not found in the database');
      } else if (response.status === 400) {
        console.log('💡 This usually means not all required data is ready (e.g., demo URLs not filled)');
      } else if (response.status === 500) {
        console.log('💡 This is a server error - check the server logs for details');
      }
    }
    
  } catch (error) {
    console.error('🚨 Network Error:', error);
  }
}

// Helper function to find actual user IDs from the page
function findUserIdOnPage() {
  console.log('🔍 Looking for user ID on the page...');
  
  // Look for user ID in various places
  const possibleSelectors = [
    '[data-user-id]',
    '[data-project-user-id]',
    '.user-id',
    '.project-user-id'
  ];
  
  for (const selector of possibleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const userId = element.getAttribute('data-user-id') || 
                    element.getAttribute('data-project-user-id') || 
                    element.textContent;
      console.log(`Found user ID: ${userId} (from ${selector})`);
      return userId;
    }
  }
  
  console.log('❌ Could not find user ID on page');
  return null;
}

// Auto-run the debug script
debugAdminEmails();

// Also provide helper functions
window.debugAdminEmails = debugAdminEmails;
window.testEmailEndpoint = testEmailEndpoint;
window.findUserIdOnPage = findUserIdOnPage;

console.log('📝 Debug functions available:');
console.log('- debugAdminEmails() - Run full debug');
console.log('- testEmailEndpoint(endpoint, userId) - Test specific endpoint');
console.log('- findUserIdOnPage() - Look for user ID on current page');
