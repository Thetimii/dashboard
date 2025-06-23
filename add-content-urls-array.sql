-- Add array field for multiple content file URLs to kickoff_forms table
-- This maintains backward compatibility with the existing content_upload_url field

ALTER TABLE public.kickoff_forms 
ADD COLUMN IF NOT EXISTS content_upload_urls text[];

-- Add comment to explain the fields
COMMENT ON COLUMN public.kickoff_forms.content_upload_url IS 'Single content file URL (for backward compatibility)';
COMMENT ON COLUMN public.kickoff_forms.content_upload_urls IS 'Array of all content file URLs (supports multiple files)';

-- Update RLS policies if needed (they should inherit from existing table policies)
