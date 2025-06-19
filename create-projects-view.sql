-- This script creates a view to simplify fetching project data.
-- Run this in your Supabase SQL Editor.

CREATE OR REPLACE VIEW public.projects_view AS
SELECT
    kf.id,
    kf.user_id,
    kf.business_name,
    kf.created_at,
    up.full_name,
    ps.status AS project_status
FROM
    public.kickoff_forms kf
LEFT JOIN
    public.user_profiles up ON kf.user_id = up.id
LEFT JOIN
    public.project_status ps ON kf.user_id = ps.user_id;

GRANT SELECT ON public.projects_view TO authenticated;
GRANT SELECT ON public.projects_view TO service_role;
