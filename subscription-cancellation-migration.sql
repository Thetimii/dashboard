-- Add subscription cancellation tracking to payments table
-- Run this in your Supabase SQL editor

-- Add new columns for subscription tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cancellation_scheduled_at timestamptz;

-- Update the status enum to include cancellation states
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'scheduled_for_cancellation'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_stripe_subscription_id ON payments(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status_cancelled ON payments(status) WHERE status IN ('cancelled', 'scheduled_for_cancellation');

-- Add a comment to the table
COMMENT ON COLUMN payments.stripe_subscription_id IS 'Stripe subscription ID for recurring payments';
COMMENT ON COLUMN payments.cancelled_at IS 'Timestamp when the subscription was cancelled';
COMMENT ON COLUMN payments.cancellation_scheduled_at IS 'Timestamp when the subscription is scheduled to be cancelled';
