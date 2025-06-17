# Resend Email Setup (No DNS Required!)

This document explains how to set up email notifications using **Resend** - a modern email service that doesn't require DNS configuration on your domain.

## 🚀 Why Resend?

- ✅ **No DNS Configuration Required** - Works immediately
- ✅ **Free Tier Available** - 3,000 emails/month, 100 emails/day
- ✅ **Built for Developers** - Perfect for Next.js applications
- ✅ **Reliable Delivery** - High deliverability rates
- ✅ **Easy Setup** - Just need an API key

## 🛠️ Setup Instructions

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Go to **API Keys** in your dashboard
4. Create a new API key (give it a name like "Customer Flows")
5. Copy the API key (starts with `re_`)

### 2. Add Environment Variables to Vercel

Go to your Vercel Dashboard → Project Settings → Environment Variables and add:

```bash
RESEND_API_KEY=re_your_api_key_here
ADMIN_EMAIL=sagertim02@gmail.com
```

**Important:** Add these to ALL environments (Production, Preview, Development)

### 3. Deploy

The system is already configured! Just push to GitHub and Vercel will auto-deploy.

## ✅ Testing the Setup

### Test API Health

```bash
curl https://app.customerflows.ch/api/send-email-resend
# Should return: {"status":"OK","hasApiKey":true}
```

### Test Email Sending

```bash
curl -X POST https://app.customerflows.ch/api/test-email
# Should send a test email to sagertim02@gmail.com
```

### Test Full Flow

1. Complete the kickoff form on your website
2. Check sagertim02@gmail.com for notification email

## 📧 Email Features

When a customer completes the kickoff form, you'll receive an email with:

- ✅ Customer information (name, email)
- ✅ Business details (name, description)
- ✅ Website preferences (style, colors)
- ✅ Desired pages list
- ✅ Links to uploaded files (logo, content)
- ✅ Special requests
- ✅ Professional HTML formatting
- ✅ Timestamp of submission

## 🔧 How It Works

1. Customer completes 8-step kickoff form
2. Data saves to Supabase database
3. `sendKickoffNotificationEmail()` function called
4. Email sent via Resend API (`/api/send-email-resend`)
5. You receive notification at `sagertim02@gmail.com`
6. Customer redirected to dashboard

## 📋 Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify `RESEND_API_KEY` is set in Vercel
3. Check Vercel Functions logs for errors
4. Test API health endpoint first

### API Key Issues

- Make sure the API key starts with `re_`
- Verify it's added to ALL Vercel environments
- Check the key has permission to send emails

### Vercel Environment Variables

- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Make sure variables are added to Production, Preview, AND Development
- Redeploy after adding environment variables

## 🎯 Next Steps

After setup:

1. ✅ Add `RESEND_API_KEY` to Vercel environment variables
2. ✅ Add `ADMIN_EMAIL=sagertim02@gmail.com` to Vercel
3. ✅ Deploy (automatic via GitHub push)
4. ✅ Test with a kickoff form submission
5. ✅ Check email delivery

## 💰 Resend Pricing

- **Free Tier**: 3,000 emails/month, 100 emails/day
- **Pro Tier**: $20/month for 50,000 emails/month
- **Perfect for startup usage** - free tier should be sufficient initially

No credit card required for free tier!

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Next.js Guide](https://resend.com/docs/send-with-nextjs)
- [API Reference](https://resend.com/docs/api-reference)

### 2. Add Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```bash
ADMIN_EMAIL=sagertim02@gmail.com
RESEND_API_KEY=re_your_api_key_here
```

### 3. Deploy to Vercel

The code automatically uses the new Resend service:

- Uses endpoint: `/api/send-email-resend`
- Sends from: `Customer Flows <onboarding@resend.dev>`
- No DNS setup needed!

## 🧪 Testing

### Test API Health

```bash
curl https://your-app.vercel.app/api/send-email-resend
# Should return: {"status":"OK","message":"Resend Email API is running"}
```

### Test Email Sending

```bash
curl -X POST https://your-app.vercel.app/api/test-email
# Should send test email to sagertim02@gmail.com
```

### Test via Kickoff Form

Complete the kickoff form - email should be sent automatically.

## 📧 Email Features

### What's Included in Notifications:

- ✅ Customer name and email
- ✅ Business name and description
- ✅ Website style preferences
- ✅ Color theme selection
- ✅ List of desired pages
- ✅ Links to uploaded files (logo, content)
- ✅ Special requests/notes
- ✅ Professional HTML formatting
- ✅ Timestamp of submission

### Email Template:

- **From**: Customer Flows <onboarding@resend.dev>
- **To**: sagertim02@gmail.com (or ADMIN_EMAIL)
- **Subject**: 🚀 New Customer Kickoff: [Business Name]
- **Content**: Beautiful HTML template with all customer data

## 📊 Resend Free Limits

- **3,000 emails/month**
- **100 emails/day**
- **1 verified domain** (optional)
- Perfect for customer notifications!

## 🔧 How It Works

1. **Customer completes kickoff** → 8-step form submitted
2. **Data saves to database** → Supabase stores all form data
3. **Email API called** → `/api/send-email-resend` endpoint
4. **Resend delivers email** → Professional notification sent
5. **You get notified** → Email arrives at sagertim02@gmail.com

## 🆚 Comparison: MailChannels vs Resend

| Feature       | MailChannels         | Resend          |
| ------------- | -------------------- | --------------- |
| DNS Setup     | Required SPF record  | None required   |
| Domain        | Need your own domain | Uses resend.dev |
| Setup Time    | 15+ minutes          | 2 minutes       |
| Free Emails   | Unlimited            | 3,000/month     |
| Reliability   | High                 | Very High       |
| Documentation | Basic                | Excellent       |

## 🔐 Security

- ✅ API key stored securely in Vercel environment
- ✅ Edge runtime for fast email delivery
- ✅ No sensitive data exposed
- ✅ Proper error handling and logging

## 🎯 Next Steps

1. **Get Resend API key** from resend.com
2. **Add environment variables** in Vercel
3. **Deploy** (automatic via GitHub)
4. **Test** with `/api/test-email`
5. **Complete kickoff form** to test full flow

Email notifications will work immediately - no DNS configuration needed! 🎉
