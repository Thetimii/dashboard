# Payment Integration Documentation

## Overview

The payment system is now integrated with Stripe and Supabase. When users approve a demo design, they are redirected to Stripe for payment (99 CHF), and the payment status is tracked in Supabase.

## Setup Required

### 1. Stripe Configuration

You need to set up the following environment variables:

```bash
# In your .env.local file
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook endpoint secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
```

### 2. Stripe Webhook Setup

1. Go to your Stripe Dashboard → Webhooks
2. Create a new webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select these events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
4. Copy the webhook secret to your environment variables

### 3. Supabase Payments Table

The payments table should have these columns:

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `stripe_payment_id` (text, nullable)
- `amount` (numeric)
- `status` ('pending' | 'completed' | 'failed')
- `created_at` (timestamp)

## Payment Flow

### 1. User Journey

1. User reviews demo options in dashboard
2. User clicks "Approve & Pay (99 CHF)" button
3. System creates payment record in Supabase with status 'pending'
4. User is redirected to Stripe Checkout
5. After payment, Stripe webhook updates payment status to 'completed'
6. User can return to dashboard to see payment confirmation

### 2. Technical Flow

```
Dashboard → approveDemo() → createPaymentRecord() → redirectToStripePayment()
     ↓
Stripe Checkout → Payment Success → Webhook → updatePaymentStatus()
     ↓
Dashboard shows "Approved & Paid" status
```

## Key Functions

### Payment Utilities (`/src/lib/stripe.ts`)

- `createPaymentRecord(userId, amount)` - Creates payment record in Supabase
- `getPaymentStatus(userId)` - Fetches latest payment status
- `updatePaymentStatus(paymentId, status, stripePaymentId)` - Updates payment after webhook
- `redirectToStripePayment(paymentId)` - Redirects to Stripe with tracking

### Dashboard Integration (`/src/app/dashboard/page.tsx`)

- `fetchPaymentStatus()` - Loads payment status on page load
- `approveDemo()` - Handles demo approval and payment flow
- Payment status displayed in UI with color-coded indicators

### Webhook Handler (`/src/app/api/webhooks/stripe/route.ts`)

- Validates Stripe webhook signatures
- Handles successful payments, failures, and expirations
- Updates Supabase payment records automatically

## Testing

### 1. Local Development

1. Use Stripe test keys
2. Use Stripe CLI for webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Test with Stripe test card numbers

### 2. Production

1. Set up production webhook endpoint in Stripe
2. Use production Stripe keys
3. Test with real payment flow

## Security Features

- Webhook signature verification
- Payment amount validation (99 CHF)
- User authentication required
- Duplicate payment prevention
- Proper error handling and logging

## Payment Statuses

- **pending**: Payment record created, awaiting Stripe completion
- **completed**: Payment successfully processed by Stripe
- **failed**: Payment failed or expired

## Error Handling

The system handles:

- Network failures during payment creation
- Stripe checkout failures
- Webhook delivery failures
- Duplicate payment attempts
- User session issues

## Next Steps

1. Set up Stripe webhook in production
2. Configure environment variables in Vercel
3. Test payment flow end-to-end
4. Add email notifications for payment confirmations
5. Implement refund handling if needed
