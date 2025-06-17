-- Complete Database Setup with Missing Fields
-- Run this in your Supabase SQL Editor

-- First, ensure all tables exist with the correct structure

-- Update project_status table to include new fields
ALTER TABLE project_status 
ADD COLUMN IF NOT EXISTS website_is_live boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS final_url text;

-- Ensure payments table exists with all required fields
CREATE TABLE IF NOT EXISTS payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  stripe_payment_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  amount numeric,
  status text check (status in ('pending', 'completed', 'failed', 'cancelled', 'scheduled_for_cancellation')),
  cancelled_at timestamptz,
  cancellation_scheduled_at timestamptz,
  created_at timestamp default now()
);

-- Ensure demo_links table exists
CREATE TABLE IF NOT EXISTS demo_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  option_1_url text,
  option_2_url text,
  option_3_url text,
  approved_option text,
  approved_at timestamp
);

-- Enable RLS on all tables
ALTER TABLE project_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_links ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for project_status
DROP POLICY IF EXISTS "Users can view own project status" ON project_status;
DROP POLICY IF EXISTS "Users can insert own project status" ON project_status;
DROP POLICY IF EXISTS "Users can update own project status" ON project_status;

CREATE POLICY "Users can view own project status" ON project_status 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project status" ON project_status 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project status" ON project_status 
  FOR UPDATE USING (auth.uid() = user_id);

-- Update RLS policies for payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;

CREATE POLICY "Users can view own payments" ON payments 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON payments 
  FOR UPDATE USING (auth.uid() = user_id);

-- Update RLS policies for demo_links
DROP POLICY IF EXISTS "Users can view own demo links" ON demo_links;
DROP POLICY IF EXISTS "Users can insert own demo links" ON demo_links;
DROP POLICY IF EXISTS "Users can update own demo links" ON demo_links;

CREATE POLICY "Users can view own demo links" ON demo_links 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own demo links" ON demo_links 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own demo links" ON demo_links 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_status_user_id ON project_status(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_links_user_id ON demo_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_customer_id ON payments(stripe_customer_id);

-- Insert default project status for existing users if they don't have one
INSERT INTO project_status (user_id, status, updated_at)
SELECT id, 'not_touched', now()
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM project_status WHERE user_id IS NOT NULL);
