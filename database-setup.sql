-- Users table (Supabase Auth handles authentication)
-- Extend with user metadata if needed

create table user_profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  created_at timestamp default now()
);

-- Kickoff form responses
create table kickoff_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  business_name text,
  business_description text,
  website_style text,
  desired_pages text[],
  color_preferences text,
  logo_url text,
  content_upload_url text,
  special_requests text,
  completed boolean default false,
  created_at timestamp default now()
);

-- Project status
create table project_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  status text check (status in ('not_touched', 'in_progress', 'complete')),
  updated_at timestamp default now()
);

-- Demo links
create table demo_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  option_1_url text,
  option_2_url text,
  option_3_url text,
  approved_option text,
  approved_at timestamp
);

-- Payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  stripe_payment_id text,
  stripe_customer_id text,
  amount numeric,
  status text check (status in ('pending', 'completed', 'failed')),
  created_at timestamp default now()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table user_profiles enable row level security;
alter table kickoff_forms enable row level security;
alter table project_status enable row level security;
alter table demo_links enable row level security;
alter table payments enable row level security;

-- User profiles policies
create policy "Users can view own profile" on user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on user_profiles for insert with check (auth.uid() = id);

-- Kickoff forms policies
create policy "Users can view own kickoff form" on kickoff_forms for select using (auth.uid() = user_id);
create policy "Users can insert own kickoff form" on kickoff_forms for insert with check (auth.uid() = user_id);
create policy "Users can update own kickoff form" on kickoff_forms for update using (auth.uid() = user_id);

-- Project status policies
create policy "Users can view own project status" on project_status for select using (auth.uid() = user_id);
create policy "Users can insert own project status" on project_status for insert with check (auth.uid() = user_id);

-- Demo links policies
create policy "Users can view own demo links" on demo_links for select using (auth.uid() = user_id);
create policy "Users can update own demo links" on demo_links for update using (auth.uid() = user_id);

-- Payments policies
create policy "Users can view own payments" on payments for select using (auth.uid() = user_id);
create policy "Users can insert own payments" on payments for insert with check (auth.uid() = user_id);
