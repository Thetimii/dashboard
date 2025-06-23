-- Setup followup storage bucket
-- Run this in Supabase SQL Editor

-- Create the followup bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('followup', 'followup', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the followup bucket
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all followup uploads" ON storage.objects;

-- Create policies for followup bucket
CREATE POLICY "Users can upload to their own folder in followup bucket" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'followup' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own uploads in followup bucket" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'followup' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own uploads in followup bucket" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'followup' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can view all followup uploads" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'followup' AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
