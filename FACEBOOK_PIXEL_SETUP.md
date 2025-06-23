# Facebook Pixel Integration Setup

This guide will help you set up Facebook Pixel tracking for your Next.js dashboard application.

## Prerequisites

1. A Facebook Business Manager account
2. A Facebook Pixel created in your Business Manager
3. A Facebook App with Marketing API access

## Step 1: Create Facebook App and Get Credentials

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the "Marketing API" product to your app
4. Get your App ID and App Secret

## Step 2: Generate Access Token

You need a long-lived access token with `ads_management` permissions:

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Add permissions: `ads_management`, `business_management`
4. Generate token
5. Use the [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/) to extend the token to long-lived

## Step 3: Find Your Pixel ID

1. Go to [Facebook Events Manager](https://www.facebook.com/events_manager/)
2. Select your pixel
3. Copy the Pixel ID from the URL or the overview page

## Step 4: Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Facebook Pixel Configuration
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id_here
FACEBOOK_PIXEL_ACCESS_TOKEN=your_long_lived_access_token_here
NEXT_PUBLIC_FACEBOOK_API_VERSION=v21.0
```

## Step 5: Test Your Integration

1. Use Facebook's [Test Events](https://www.facebook.com/events_manager/test_events) tool
2. Add a test event code to your requests:

```typescript
// For testing, add testEventCode to any tracking call
trackQuestionnaireCompletion({
  userEmail: "test@example.com",
  testEventCode: "TEST12345", // Get this from Facebook Events Manager
});
```

## Events Being Tracked

The application automatically tracks these events:

### CompleteRegistration

- **When**: User completes the follow-up questionnaire
- **Data**: User email, completion time, form data summary

### ViewContent

- **When**: User views questionnaire pages or navigates between steps
- **Data**: Step number, navigation direction, user info

### Contact

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
