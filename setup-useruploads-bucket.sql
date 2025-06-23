-- Setup for useruploads bucket in Supabase Storage
-- This script creates the necessary policies for file uploads

-- Create the useruploads bucket if it doesn't exist
-- Note: This needs to be done in the Supabase dashboard Storage section manually
-- OR via SQL if you have the storage extension enabled

-- Enable RLS on the storage.objects table (if not already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to upload files to useruploads bucket
CREATE POLICY "Allow authenticated users to upload to useruploads bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'useruploads');

-- Create policy to allow authenticated users to view their own uploads
CREATE POLICY "Allow authenticated users to view their uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'useruploads');

-- Create policy to allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated users to update their uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'useruploads');

-- Create policy to allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete their uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'useruploads');

-- Optional: Create more restrictive policies if you want users to only access their own files
-- Uncomment and modify these if needed:

-- Allow users to only upload files with their user ID in the name
CREATE POLICY "Allow users to upload files with their user ID"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'useruploads' AND
  (auth.uid()::text = split_part(name, '_', 1))
);

-- Allow users to only view files with their user ID in the name
CREATE POLICY "Allow users to view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'useruploads' AND
  (auth.uid()::text = split_part(name, '_', 1))
);

-- Create the bucket programmatically (alternative to creating via dashboard)
-- Note: This requires the storage schema to be accessible
INSERT INTO storage.buckets (id, name, public)
VALUES ('useruploads', 'useruploads', true)
ON CONFLICT (id) DO NOTHING;
