// Test utility to manually mark payment as completed for testing
// Run this in browser console or as a standalone script

async function markPaymentAsCompleted(userId) {
  try {
    const response = await fetch('/api/debug-payment-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        action: 'mark_completed'
      })
    });

    const result = await response.json();
    console.log('Payment status updated:', result);
    
    // Refresh the page to see changes
    window.location.reload();
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
}

// Usage: markPaymentAsCompleted('your-user-id-here')
console.log('Use markPaymentAsCompleted("user-id") to test payment completion');
