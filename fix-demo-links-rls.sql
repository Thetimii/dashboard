-- Fix demo_links table RLS policies
-- This should resolve the 406 errors when fetching demo links

-- Enable RLS on demo_links table
ALTER TABLE demo_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own demo links" ON demo_links;
DROP POLICY IF EXISTS "Users can insert their own demo links" ON demo_links;
DROP POLICY IF EXISTS "Users can update their own demo links" ON demo_links;
DROP POLICY IF EXISTS "Admins can view all demo links" ON demo_links;
DROP POLICY IF EXISTS "Admins can update all demo links" ON demo_links;
DROP POLICY IF EXISTS "Service role can manage demo links" ON demo_links;

-- Create policies for users
CREATE POLICY "Users can view their own demo links" ON demo_links
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own demo links" ON demo_links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own demo links" ON demo_links
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for admins
CREATE POLICY "Admins can view all demo links" ON demo_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all demo links" ON demo_links
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policy for service role (for API operations)
CREATE POLICY "Service role can manage demo links" ON demo_links
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Also fix project_status table if it has similar issues
ALTER TABLE project_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own project status" ON project_status;
DROP POLICY IF EXISTS "Users can insert their own project status" ON project_status;
DROP POLICY IF EXISTS "Users can update their own project status" ON project_status;
DROP POLICY IF EXISTS "Admins can view all project status" ON project_status;
DROP POLICY IF EXISTS "Admins can update all project status" ON project_status;
DROP POLICY IF EXISTS "Service role can manage project status" ON project_status;

-- Create policies for project_status
CREATE POLICY "Users can view their own project status" ON project_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project status" ON project_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project status" ON project_status
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all project status" ON project_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all project status" ON project_status
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Service role can manage project status" ON project_status
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role'
    );
