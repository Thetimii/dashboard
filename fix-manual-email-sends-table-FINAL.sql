-- Fix manual_email_sends table - Final version without IF NOT EXISTS for constraints
-- This version properly handles constraint creation in PostgreSQL

-- First, let's make sure the table exists with all required columns
CREATE TABLE IF NOT EXISTS public.manual_email_sends (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_type text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  sent_by uuid NOT NULL, -- Admin user who sent the email
  trigger_values jsonb NOT NULL, -- Store current state when email sent
  email_subject text NOT NULL,
  email_recipient text NOT NULL, -- Store actual email address used
  status text NOT NULL DEFAULT 'sent', -- sent, failed, pending
  error_message text NULL, -- Store any error details
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add primary key if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'manual_email_sends_pkey' 
    AND table_name = 'manual_email_sends'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.manual_email_sends ADD CONSTRAINT manual_email_sends_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Foreign key to auth.users for sent_by
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'manual_email_sends_sent_by_fkey' 
    AND table_name = 'manual_email_sends'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.manual_email_sends 
    ADD CONSTRAINT manual_email_sends_sent_by_fkey 
    FOREIGN KEY (sent_by) REFERENCES auth.users (id);
  END IF;

  -- Foreign key to auth.users for user_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'manual_email_sends_user_id_fkey' 
    AND table_name = 'manual_email_sends'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.manual_email_sends 
    ADD CONSTRAINT manual_email_sends_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add check constraints if they don't exist
DO $$
BEGIN
  -- Email type check constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'manual_email_sends_email_type_check' 
    AND table_name = 'manual_email_sends'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.manual_email_sends 
    ADD CONSTRAINT manual_email_sends_email_type_check 
    CHECK (email_type = ANY (ARRAY['demo_ready'::text, 'website_launch'::text]));
  END IF;

  -- Status check constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'manual_email_sends_status_check' 
    AND table_name = 'manual_email_sends'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.manual_email_sends 
    ADD CONSTRAINT manual_email_sends_status_check 
    CHECK (status = ANY (ARRAY['sent'::text, 'failed'::text, 'pending'::text]));
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_user_id ON public.manual_email_sends USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_type ON public.manual_email_sends USING btree (email_type);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_sent_at ON public.manual_email_sends USING btree (sent_at);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_user_type ON public.manual_email_sends USING btree (user_id, email_type);

-- Enable RLS
ALTER TABLE public.manual_email_sends ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Admin can manage email sends" ON public.manual_email_sends;

-- Policy for admin access only
CREATE POLICY "Admin can manage email sends" ON public.manual_email_sends
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_manual_email_sends_updated_at ON public.manual_email_sends;
CREATE TRIGGER update_manual_email_sends_updated_at 
  BEFORE UPDATE ON public.manual_email_sends 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.manual_email_sends TO authenticated;
GRANT ALL ON public.manual_email_sends TO service_role;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'manual_email_sends' 
AND table_schema = 'public'
ORDER BY ordinal_position;
