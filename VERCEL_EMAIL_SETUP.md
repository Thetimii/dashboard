# Vercel Email Setup Instructions

## ✅ Implementation Status

The vercel-email integration has been successfully implemented with the following components:

### 📁 Files Created/Modified

1. **`/src/app/api/send/route.ts`** - Edge runtime API endpoint for sending emails
2. **`/src/lib/email.ts`** - Updated with `sendKickoffNotificationEmailViaVercel()` function
3. **`/src/app/kickoff/page.tsx`** - Updated to use new email function
4. **`/src/app/api/test-vercel-email/route.ts`** - Test endpoint for email functionality
5. **`.env.local`** - Contains `ADMIN_EMAIL=sagertim02@gmail.com`

### 🛠️ Current Setup

✅ **Package Installed**: `vercel-email@0.0.6` is already installed  
✅ **API Route Created**: Edge runtime endpoint at `/api/send`  
✅ **Email Function**: New function integrated with kickoff form  
✅ **Environment Variable**: `ADMIN_EMAIL` is configured  
✅ **Test Endpoint**: Available at `/api/test-vercel-email`

## 🌐 DNS Configuration Required

⚠️ **Important**: For vercel-email to work in production, you need to configure DNS records for your domain.

### Step 1: Add SPF Record

Go to your DNS settings and add this TXT record:

```
Type: TXT
Name: @
Value: v=spf1 a mx include:relay.mailchannels.net ~all
```

### Step 2: Update From Address

In `/src/app/api/send/route.ts`, change:

```typescript
from: "noreply@yourdomain.com";
```

to your actual domain:

```typescript
from: "noreply@customerflows.ch"; // Replace with your domain
```

## 🧪 Testing

### Local Testing

```bash
# Test API health
curl http://localhost:3001/api/test-vercel-email

# Test email sending (will fail without DNS setup)
curl -X POST http://localhost:3001/api/test-vercel-email
```

### Production Testing

After DNS configuration and deployment:

1. Complete a kickoff form on your website
2. Check `sagertim02@gmail.com` for the notification email

## 🔄 How It Works

1. **Customer completes kickoff form**
2. **Data is saved to Supabase database**
3. **`sendKickoffNotificationEmailViaVercel()` is called**
4. **Function calls `/api/send` endpoint**
5. **Edge function uses vercel-email to send via MailChannels**
6. **Email delivered to `ADMIN_EMAIL`**

## 📧 Email Content

The email includes:

- Customer information (name, email)
- Business details (name, description, style)
- Website preferences (colors, pages)
- File upload links (logo, content)
- Special requests
- Professional HTML formatting

## 🚀 Deployment Notes

When deploying to Vercel:

1. Ensure `ADMIN_EMAIL` environment variable is set in Vercel dashboard
2. Configure DNS SPF record for your domain
3. Update the `from` address in the API route
4. Test the complete flow after deployment

## 🔧 Troubleshooting

### Email Not Sending

- Check DNS SPF record is configured
- Verify `from` address uses your domain
- Check Vercel function logs for errors

### 401 Unauthorized Error

- Usually means DNS SPF record is missing
- Ensure you're using your own domain in the `from` field

### API Errors

- Check environment variables are set
- Verify the API endpoint is accessible
- Review server logs for detailed error messages

## 📈 Next Steps

1. **Configure DNS** - Add the SPF record for your domain
2. **Update Domain** - Change the `from` address to your domain
3. **Deploy to Vercel** - Test in production environment
4. **Test Complete Flow** - Submit a kickoff form to verify emails are sent

The implementation is ready and will work once the DNS configuration is complete!
