#!/bin/bash

# Test the manual email duplicate prevention
# This script will try to send the same email twice and verify the second is blocked

USER_ID="c9e857ca-c99b-4f15-b5de-a0fffb4e5f16"
EMAIL_TYPE="demo_ready"
ADMIN_ID="28e36a09-3cda-4024-a49d-d5fd2c877a6a"
API_URL="http://localhost:3004/api/admin/send-manual-email"

echo "🧪 Testing manual email duplicate prevention..."
echo "User ID: $USER_ID"
echo "Email Type: $EMAIL_TYPE"
echo "Admin ID: $ADMIN_ID"
echo "API URL: $API_URL"
echo ""

# First request - should succeed (if values changed since last test)
echo "📧 Sending first email request..."
RESPONSE1=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "emailType": "'$EMAIL_TYPE'",
    "sentBy": "'$ADMIN_ID'"
  }' \
  "$API_URL")

echo "First response:"
echo "$RESPONSE1" | jq '.' 2>/dev/null || echo "$RESPONSE1"
echo ""

# Wait 1 second to ensure different timestamps
sleep 1

# Second request - should be blocked as duplicate
echo "📧 Sending second (duplicate) email request..."
RESPONSE2=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "emailType": "'$EMAIL_TYPE'",
    "sentBy": "'$ADMIN_ID'"
  }' \
  "$API_URL")

echo "Second response:"
echo "$RESPONSE2" | jq '.' 2>/dev/null || echo "$RESPONSE2"
echo ""

# Check if second request was blocked
if echo "$RESPONSE2" | grep -q '"duplicate":true\|Values have not changed\|already sent'; then
    echo "✅ SUCCESS: Duplicate email was properly blocked!"
else
    echo "❌ FAILURE: Duplicate email was NOT blocked - this is the bug!"
fi
