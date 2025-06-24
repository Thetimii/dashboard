# Facebook Pixel Integration Setup

This guide will help you set up Facebook Pixel tracking for your Next.js dashboard application. The integration includes both frontend pixel code and server-side Conversions API for comprehensive tracking.

## ✅ Integration Status

The Meta Pixel has been successfully integrated into your application with:

- **Frontend Pixel**: Installed in your layout with Pixel ID `3672960629671381`
- **Server-side API**: Configured for privacy-compliant event tracking
- **Dual Tracking**: Events sent via both frontend and server for better reliability
- **Event Deduplication**: Automatic handling to prevent double counting

## Prerequisites

1. A Facebook Business Manager account ✅
2. A Facebook Pixel created in your Business Manager ✅ (ID: 3672960629671381)
3. A Facebook App with Marketing API access
4. Long-lived access token for server-side events

## Step 1: Verify Frontend Pixel Installation

The Meta Pixel frontend code is already installed in your application. You can verify it's working by:

1. Open your website in a browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Look for requests to `facebook.net/fbevents.js`
5. Check console for "Facebook Pixel Event Sent" messages

## Step 2: Configure Server-side Access Token

You need a long-lived access token for the Conversions API:

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Add permissions: `ads_management`, `business_management`
4. Generate token
5. Use the [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/) to extend the token to long-lived

## Step 3: Update Environment Variables

Update your `.env.local` file with your server-side access token:

```bash
# Facebook Pixel Configuration (already configured)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=3672960629671381
FACEBOOK_PIXEL_ACCESS_TOKEN=your_long_lived_access_token_here
NEXT_PUBLIC_FACEBOOK_API_VERSION=v21.0
```

⚠️ **Important**: Replace `your_long_lived_access_token_here` with your actual access token.

## Step 4: Test Your Integration

1. **Frontend Pixel Test**: Use Facebook's [Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. **Server Events Test**: Use Facebook's [Test Events](https://www.facebook.com/events_manager/test_events) tool
3. Add a test event code to your requests for testing:

```typescript
// For testing, add testEventCode to any tracking call
trackQuestionnaireCompletion({
  userEmail: "test@example.com",
  testEventCode: "TEST12345", // Get this from Facebook Events Manager
});
```

## Dual Tracking System

Your application now uses both frontend and server-side tracking:

### Frontend Pixel (Immediate)

- **Faster tracking** - Events fire immediately
- **Better user matching** - Uses browser cookies and session data
- **Real-time attribution** - Immediate conversion tracking

### Server-side API (Reliable)

- **Privacy compliant** - PII data is hashed
- **Ad blocker resistant** - Bypasses browser restrictions
- **Better data quality** - Server-controlled event parameters

## Events Being Tracked

The application automatically tracks these events with both frontend and server-side implementation:

### CompleteRegistration (Frontend + Server)

- **When**: User completes the follow-up questionnaire
- **Frontend Data**: Immediate conversion tracking
- **Server Data**: Hashed user email, completion time, form data summary

### ViewContent (Frontend + Server)

- **When**: User views questionnaire pages or navigates between steps
- **Frontend Data**: Page view tracking with cookies
- **Server Data**: Step number, navigation direction, user info

### Contact (Frontend + Server)

- **When**: User interacts with form fields, uploads files, or encounters validation errors
- **Frontend Data**: Real-time interaction tracking
- **Server Data**: Interaction type, field names, error details

### PageView (Frontend Only)

- **When**: Any page loads (automatic)
- **Data**: Standard page view tracking with referrer data

- **When**: User interacts with form fields, uploads files, or encounters validation errors
- **Data**: Interaction type, field names, error details

## Privacy and Compliance

- All personally identifiable information (emails, phone numbers) is automatically hashed using SHA-256
- IP addresses and user agents are collected for better event matching
- Users in Switzerland (CH) are set as the default country
- Ensure you have proper privacy policies and consent mechanisms in place

## Monitoring and Debugging

1. Check browser console for tracking confirmations
2. Use Facebook Events Manager to verify events are received
3. Set up test events during development
4. Monitor server logs for API errors

## Common Issues

### Events Not Appearing

- Verify your Pixel ID and Access Token
- Check that environment variables are loaded correctly
- Ensure your Facebook App has Marketing API permissions
- Verify the access token hasn't expired

### API Errors

- Check the server console for detailed error messages
- Verify API version compatibility
- Ensure proper permissions on your access token

### Event Deduplication

- Events are automatically assigned unique IDs
- If you're also using Facebook Pixel frontend code, ensure event IDs match for proper deduplication

## Testing Checklist

- [ ] Environment variables configured
- [ ] Test event code working in Facebook Events Manager
- [ ] CompleteRegistration fires on questionnaire submission
- [ ] ViewContent fires on page navigation
- [ ] Contact events fire on form interactions
- [ ] No console errors in browser or server logs
- [ ] Events appear in Facebook Events Manager within 5-10 minutes

## Security Notes

- The `FACEBOOK_PIXEL_ACCESS_TOKEN` is server-side only and should never be exposed to the client
- The `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` is safe to expose as it's meant to be public
- Always use HTTPS in production
- Consider implementing rate limiting on the API endpoint if needed
