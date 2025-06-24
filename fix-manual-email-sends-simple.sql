-- Simple fix for manual_email_sends table
-- This version drops and recreates the table to avoid constraint conflicts

-- Drop the table and recreate it properly
DROP TABLE IF EXISTS public.manual_email_sends CASCADE;

-- Create the table with all constraints in one go
CREATE TABLE public.manual_email_sends (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_type text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  sent_by uuid NOT NULL,
  trigger_values jsonb NOT NULL,
  email_subject text NOT NULL,
  email_recipient text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error_message text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Primary key
  CONSTRAINT manual_email_sends_pkey PRIMARY KEY (id),
  
  -- Foreign keys
  CONSTRAINT manual_email_sends_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT manual_email_sends_sent_by_fkey 
    FOREIGN KEY (sent_by) REFERENCES auth.users (id),
  
  -- Check constraints
  CONSTRAINT manual_email_sends_email_type_check 
    CHECK (email_type = ANY (ARRAY['demo_ready'::text, 'website_launch'::text])),
  CONSTRAINT manual_email_sends_status_check 
    CHECK (status = ANY (ARRAY['sent'::text, 'failed'::text, 'pending'::text]))
);

-- Create indexes
CREATE INDEX idx_manual_email_sends_user_id ON public.manual_email_sends (user_id);
CREATE INDEX idx_manual_email_sends_type ON public.manual_email_sends (email_type);
CREATE INDEX idx_manual_email_sends_sent_at ON public.manual_email_sends (sent_at);
CREATE INDEX idx_manual_email_sends_user_type ON public.manual_email_sends (user_id, email_type);

-- Enable RLS
ALTER TABLE public.manual_email_sends ENABLE ROW LEVEL SECURITY;

-- Policy for admin access only
CREATE POLICY "Admin can manage email sends" ON public.manual_email_sends
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp (create if doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_manual_email_sends_updated_at 
  BEFORE UPDATE ON public.manual_email_sends 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.manual_email_sends TO authenticated;
GRANT ALL ON public.manual_email_sends TO service_role;

-- Test the table by selecting its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'manual_email_sends' 
AND table_schema = 'public'
ORDER BY ordinal_position;
