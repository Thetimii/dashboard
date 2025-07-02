-- Add phone_number column to user_profiles table
-- Run this in your Supabase SQL Editor

-- Add phone_number column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS phone_number text NULL;

-- Update the existing user profile creation trigger to include phone number
-- Note: Using SECURITY DEFINER here is necessary and safe for user creation triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, phone_number)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'phone_number'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create or update RLS policy for user_profiles
DROP POLICY IF EXISTS "Users can view and edit their own profile" ON public.user_profiles;
CREATE POLICY "Users can view and edit their own profile" ON public.user_profiles
    FOR ALL USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant permissions
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
REVOKE ALL ON public.user_profiles FROM anon;
