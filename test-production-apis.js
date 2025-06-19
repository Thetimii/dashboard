// Test script to check production API endpoints
console.log('🔍 Testing Production API Endpoints...');

const baseUrl = 'https://app.customerflows.ch';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  console.log(`\n📡 Testing ${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { error: error.message };
  }
}

async function runTests() {
  // Test the demo-test endpoint first
  await testEndpoint('/api/admin/demo-test');
  
  // Test the actual endpoints that are failing
  await testEndpoint('/api/admin/send-demo-email?userId=test-user-id');
  await testEndpoint('/api/admin/send-launch-email?userId=test-user-id');
  
  // Test POST endpoints
  await testEndpoint('/api/admin/send-demo-email', 'POST', { userId: 'test-user-id' });
  await testEndpoint('/api/admin/send-launch-email', 'POST', { userId: 'test-user-id' });
  
  // Test the endpoint you said worked
  await testEndpoint('/api/admin/demo-email?userId=test-user-id');
}

// For Node.js usage
if (typeof require !== 'undefined') {
  // Add fetch polyfill for Node.js if needed
  global.fetch = global.fetch || require('node-fetch');
}

runTests();
