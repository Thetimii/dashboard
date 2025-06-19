-- Specific fix for 406 errors on payments table
-- This addresses the missing UPDATE policy that's causing webhook failures
-- AND fixes Supabase Realtime subscription issues

-- First, check current policies on payments table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'payments';

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payment status" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can access all payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can update payment status" ON public.payments;

-- Create comprehensive policies that cover ALL operations including Realtime
CREATE POLICY "Users can SELECT their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can INSERT their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can UPDATE their own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role needs ALL access for webhooks and admin operations
CREATE POLICY "Service role has full access" ON public.payments 
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Admins need full access
CREATE POLICY "Admins have full access" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- CRITICAL: Enable Realtime for payments table
ALTER TABLE public.payments REPLICA IDENTITY FULL;

-- Grant explicit permissions for all operations
GRANT ALL ON public.payments TO authenticated, service_role;
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

-- Also fix followup_questionnaires for completeness
DROP POLICY IF EXISTS "Users can manage their own questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Admins can access all questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Service role can access all questionnaires" ON public.followup_questionnaires;

CREATE POLICY "Users can SELECT their own questionnaires" ON public.followup_questionnaires
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can INSERT their own questionnaires" ON public.followup_questionnaires
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can UPDATE their own questionnaires" ON public.followup_questionnaires
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to questionnaires" ON public.followup_questionnaires 
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins have full access to questionnaires" ON public.followup_questionnaires
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Enable Realtime for questionnaires too
ALTER TABLE public.followup_questionnaires REPLICA IDENTITY FULL;
GRANT ALL ON public.followup_questionnaires TO authenticated, service_role;

-- Check if the policies were created successfully
SELECT 'Payments and questionnaires RLS policies fixed for Realtime' as result;

-- Verify all policies exist
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename IN ('payments', 'followup_questionnaires')
ORDER BY tablename, cmd;
