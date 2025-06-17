# Email Notification Setup

This document explains how to set up email notifications for when customers complete their kickoff forms.

## 📧 Overview

The email system uses Vercel Edge Functions with the `vercel-email` package to send free transactional emails via MailChannels. When a customer completes their kickoff form, an automated email is sent to the admin with all the customer details.

## 🚀 Features

- **Free Email Delivery**: Uses MailChannels via Vercel Edge Functions (no cost)
- **Beautiful HTML Templates**: Professional-looking email with customer data
- **Automatic Notifications**: Triggered when kickoff form is completed
- **File Attachments**: Includes links to uploaded logos and content files
- **Error Handling**: Graceful fallback if email fails (doesn't break the form submission)

## 🛠️ Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
ADMIN_EMAIL=sagertim02@gmail.com
```

This is also included in `.env.example` for reference.

### 2. DNS Configuration (Required for Production)

For the emails to be delivered properly, you need to configure DNS records for your domain:

#### SPF Record (Required)

Add this TXT record to your domain's DNS:

```
Name: @
Value: v=spf1 a mx include:relay.mailchannels.net ~all
```

#### DKIM Record (Optional but Recommended)

Follow MailChannels documentation to add DKIM records for better deliverability.

### 3. Domain Configuration

In `/src/app/api/send-email/route.ts`, update the `from` email address to use your actual domain:

```typescript
from: 'noreply@yourdomain.com', // Replace with your domain
```

## 📁 File Structure

```
src/
├── app/api/send-email/
│   └── route.ts                 # Edge function for sending emails
├── lib/
│   └── email.ts                 # Email templates and utility functions
└── app/kickoff/
    └── page.tsx                 # Updated to send notifications
```

## 🎨 Email Template

The email includes:

- **Customer Information**: Name and email
- **Business Details**: Name, description, style preferences
- **Color Preferences**: Selected color scheme
- **Desired Pages**: List of requested pages
- **File Uploads**: Links to logo and content files
- **Special Requests**: Any additional requirements

## 🔧 How It Works

1. **Customer Completes Kickoff**: User fills out all 8 steps of the kickoff form
2. **Data Saved**: Form data is saved to Supabase database
3. **Email Triggered**: `sendKickoffNotificationEmail()` function is called
4. **Email Sent**: Vercel Edge Function sends formatted email to admin
5. **Graceful Handling**: If email fails, form submission still succeeds

## 🧪 Testing

### Local Testing

```bash
npm run dev
# Complete a kickoff form to test email sending
```

### Production Testing

After deploying to Vercel with proper DNS configuration, complete a kickoff form to receive the email notification.

## 📋 Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify DNS SPF record is configured
3. Check Vercel function logs for errors
4. Ensure `ADMIN_EMAIL` environment variable is set

### Domain Issues

- Make sure you're using a custom domain (not vercel.app)
- Configure SPF and DKIM records properly
- Use a proper "from" email address with your domain

### Local Development

- Emails work in local development but may have delivery issues
- For testing, check the browser console for API responses
- Deploy to Vercel for full email functionality

## 🔐 Security Notes

- Admin email is configured via environment variable
- Edge functions run securely with Vercel's infrastructure
- No sensitive data is exposed in email templates
- File uploads are handled via secure Supabase storage URLs

## 📈 Future Enhancements

Possible improvements:

- Multiple admin email recipients
- Different email templates based on business type
- Email confirmation to customers
- Integration with other notification services (Slack, Discord, etc.)
