-- Fix for client_assignments table 406 error
-- This script addresses RLS policy issues that may cause 406 errors

-- Check if client_assignments table exists and has proper policies
CREATE TABLE IF NOT EXISTS public.client_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(client_id) -- Each client can only be assigned to one admin
);

-- Enable RLS
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to fix 406 errors
DROP POLICY IF EXISTS "Admins can manage client assignments" ON public.client_assignments;
DROP POLICY IF EXISTS "Service role can access assignments" ON public.client_assignments;
DROP POLICY IF EXISTS "Users can view their own assignment" ON public.client_assignments;

-- Create proper policies
CREATE POLICY "Admins can manage client assignments" ON public.client_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can access assignments" ON public.client_assignments 
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own assignment" ON public.client_assignments
  FOR SELECT USING (
    auth.uid() = admin_id OR auth.uid() = client_id
  );

-- Grant permissions
GRANT ALL ON public.client_assignments TO authenticated, service_role;

SELECT 'Client assignments table fixed!' as status;
