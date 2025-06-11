# Vercel Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Thetimii/dashboard)

## Manual Deployment Steps

### 1. Prerequisites

- Vercel account (https://vercel.com)
- Supabase project (https://supabase.com)
- Stripe account (https://stripe.com)

### 2. Deploy to Vercel

1. **Import Your Project**:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import from GitHub: `https://github.com/Thetimii/dashboard`

2. **Configure Build Settings** (these should be auto-detected):
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

### 3. Environment Variables

Add these environment variables in Vercel:

#### Supabase Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### Stripe Variables

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### App Configuration

```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### 4. Getting Your Environment Variables

#### Supabase:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

#### Stripe:

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Developers → API keys
3. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`
4. For webhook secret:
   - Go to Developers → Webhooks
   - Create endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

### 5. Domain Configuration

After deployment:

1. Note your Vercel domain (e.g., `your-app.vercel.app`)
2. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
3. Add this domain to:
   - **Supabase**: Authentication → URL Configuration → Site URL
   - **Stripe**: Webhook endpoints (if using webhooks)

### 6. Database Setup

Make sure your Supabase database has the required tables. Run the SQL commands from `database-setup.sql` in your Supabase SQL editor.

### 7. Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## Troubleshooting

### Build Errors

- Check that all environment variables are set
- Ensure Node.js version compatibility (18.x recommended)
- Review build logs in Vercel dashboard

### Runtime Errors

- Check browser console for client-side errors
- Review function logs in Vercel dashboard
- Verify environment variables are correctly set

### Database Connection Issues

- Verify Supabase URL and keys
- Check RLS policies in Supabase
- Ensure database tables exist

## Performance Optimization

The app is already optimized for Vercel with:

- ✅ Static generation where possible
- ✅ Image optimization disabled for compatibility
- ✅ Edge-ready API routes
- ✅ Automatic code splitting

## Support

For deployment issues:

- Check Vercel documentation: https://vercel.com/docs
- Supabase documentation: https://supabase.com/docs
- Stripe documentation: https://stripe.com/docs
