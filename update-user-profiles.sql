-- This script updates the user_profiles table and automates profile creation.
-- Run this in your Supabase SQL Editor.

-- =============================================================================
-- 1. CREATE USER ROLE ENUM (IF NOT EXISTS)
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE public.user_role_enum AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- 2. ADD ROLE COLUMN TO USER_PROFILES (IF NOT EXISTS)
-- =============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN role public.user_role_enum NOT NULL DEFAULT 'user';
        RAISE NOTICE 'Column "role" added to "user_profiles".';
    ELSE
        RAISE NOTICE 'Column "role" already exists in "user_profiles".';
    END IF;
END $$;

-- =============================================================================
-- 3. CREATE FUNCTION TO HANDLE NEW USER SIGNUP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 4. CREATE TRIGGER TO AUTOMATE PROFILE CREATION
-- =============================================================================
-- We drop the trigger first to ensure the script can be run multiple times without errors.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================
-- Your database is now configured to:
-- ✅ Safely add the 'role' column to your existing user_profiles table.
-- ✅ Automatically create a profile for every new user who signs up.
-- ✅ Default all new users to the 'user' role.
