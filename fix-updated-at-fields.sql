-- Fix updated_at fields and triggers for demo_links and project_status tables

-- Check and fix demo_links table structure
ALTER TABLE public.demo_links 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Check and fix project_status table structure  
ALTER TABLE public.project_status 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_demo_links_updated_at ON public.demo_links;
DROP TRIGGER IF EXISTS update_project_status_updated_at ON public.project_status;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_demo_links_updated_at
    BEFORE UPDATE ON public.demo_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_status_updated_at
    BEFORE UPDATE ON public.project_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure tables have proper structure
-- demo_links table
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_links' AND column_name = 'created_at') THEN
        ALTER TABLE public.demo_links ADD COLUMN created_at timestamp with time zone DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_links' AND column_name = 'updated_at') THEN
        ALTER TABLE public.demo_links ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- project_status table
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_status' AND column_name = 'created_at') THEN
        ALTER TABLE public.project_status ADD COLUMN created_at timestamp with time zone DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_status' AND column_name = 'updated_at') THEN
        ALTER TABLE public.project_status ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Update existing records to have proper timestamps if they're missing
UPDATE public.demo_links 
SET created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now())
WHERE created_at IS NULL OR updated_at IS NULL;

UPDATE public.project_status 
SET created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now())
WHERE created_at IS NULL OR updated_at IS NULL;
