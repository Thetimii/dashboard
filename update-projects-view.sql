-- Update the projects view to include payment info and filter only clients
-- Run this in your Supabase SQL Editor

DROP VIEW IF EXISTS public.projects_view;

CREATE OR REPLACE VIEW public.projects_view AS
SELECT
    kf.id,
    kf.user_id,
    kf.business_name,
    kf.business_description,
    kf.website_style,
    kf.desired_pages,
    kf.color_preferences,
    kf.logo_url,
    kf.content_upload_url,
    kf.special_requests,
    kf.completed as kickoff_completed,
    kf.created_at,
    up.full_name,
    up.role,
    au.email,
    ps.status AS project_status,
    ps.final_url,
    ps.updated_at as status_updated_at,
    dl.option_1_url,
    dl.option_2_url,
    dl.option_3_url,
    dl.approved_option,
    dl.approved_at,
    p.status as payment_status,
    p.amount as payment_amount,
    p.stripe_customer_id,
    p.subscription_status,
    p.cancel_at_period_end,
    p.canceled_at,
    ca.admin_id AS assigned_admin_id,
    admin_up.full_name AS assigned_admin_name
FROM
    public.kickoff_forms kf
LEFT JOIN
    public.user_profiles up ON kf.user_id = up.id
LEFT JOIN
    auth.users au ON kf.user_id = au.id
LEFT JOIN
    public.project_status ps ON kf.user_id = ps.user_id
LEFT JOIN
    public.demo_links dl ON kf.user_id = dl.user_id
LEFT JOIN
    public.payments p ON kf.user_id = p.user_id
LEFT JOIN
    public.client_assignments ca ON kf.user_id = ca.client_id
LEFT JOIN
    public.user_profiles admin_up ON ca.admin_id = admin_up.id
WHERE
    up.role = 'user';  -- Only show clients, not admins

GRANT SELECT ON public.projects_view TO authenticated;
GRANT SELECT ON public.projects_view TO service_role;
