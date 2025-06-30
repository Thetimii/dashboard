-- Add phone_number column to user_profiles table
-- Run this in your Supabase SQL Editor

-- Add phone_number column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS phone_number text NULL;

-- Update the existing user profile creation trigger to include phone number
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
