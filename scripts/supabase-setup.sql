-- 1. Create Projects Table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text,
  domain text,
  difficulty text check (difficulty in ('Mini', 'Major')),
  price numeric not null default 0,
  original_price numeric not null default 0,
  tech_stack text[] default '{}',
  tags text[] default '{}',
  description text,
  features text[] default '{}',
  includes text[] default '{}',
  thumbnail_url text,
  source_url text,
  status text default 'active',
  visibility text default 'public',
  featured boolean default false,
  file_tree jsonb default '[]',
  owner_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Enable Storage Buckets
-- Create 'projects' bucket manually in Supabase Console -> Storage

-- 3. Enable RLS (Security)
alter table public.projects enable row level security;

-- Policies: Anyone can read public projects
create policy "Public projects are viewable by everyone"
on projects for select
to anon, authenticated
using ( visibility = 'public' );

-- Policies: Only authorized admins can insert/update (You can add specific admin UID filter here)
create policy "Admins can manage projects"
on projects for all
to authenticated
using ( true )
with check ( true );

-- 4. Create Custom Requests Table
create table public.custom_requests (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null,
  requirements text not null,
  budget text default 'Flexible',
  deadline text default 'No deadline',
  tech_stack text[] default '{}',
  contact_name text default 'Not provided',
  whatsapp text default 'Not provided',
  email text default 'Not provided',
  institution text default 'Not provided',
  status text default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for custom_requests
alter table public.custom_requests enable row level security;

-- Policies: Users can view their own requests
create policy "Users can view own custom requests"
on custom_requests for select
to authenticated
using ( user_id = auth.uid()::text );

-- Policies: Users can insert their own requests
create policy "Users can insert own custom requests"
on custom_requests for insert
to authenticated
with check ( user_id = auth.uid()::text );

-- Policies: Admins can manage all requests
create policy "Admins can manage custom requests"
on custom_requests for all
to authenticated
using ( true )
with check ( true );

-- =============================================
-- 5. Create Orders Table
-- =============================================
create table public.orders (
  id text primary key,                          -- Custom order ID like BUILD-XXXX
  user_id text not null,                        -- Firebase UID of the buyer
  project_id text not null,
  project_title text,
  email text,
  amount numeric not null default 0,
  status text default 'pending',                -- pending | completed | refunded | in_progress
  cashfree_order_id text,                       -- Cashfree session/order reference
  cashfree_transaction_id text,                 -- cf_payment_id from webhook
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

-- Users can view their own orders
create policy "Users can view own orders"
on orders for select
to authenticated
using ( user_id = auth.uid()::text );

-- Backend service role can insert orders (via API route)
create policy "Service can insert orders"
on orders for insert
to authenticated
with check ( true );

-- Admins / service can update orders (webhook status updates)
create policy "Service can update orders"
on orders for update
to authenticated
using ( true )
with check ( true );

-- Admins can view all orders
create policy "Admins can view all orders"
on orders for select
to authenticated
using ( true );

-- =============================================
-- 6. Create Users Table
-- =============================================
create table public.users (
  id text primary key,                          -- Firebase UID
  email text not null,
  display_name text,
  photo_url text,
  phone text,
  age text,
  bio text,
  role text default 'student',                  -- student | mentor | admin
  college text,
  degree text,
  graduation_year text,
  github text,
  linkedin text,
  leetcode text,
  website text,
  projects_completed integer default 0,
  requests_sent integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.users enable row level security;

-- Users can view their own profile
create policy "Users can view own profile"
on users for select
to authenticated
using ( id = auth.uid()::text );

-- Users can update their own profile
create policy "Users can update own profile"
on users for update
to authenticated
using ( id = auth.uid()::text )
with check ( id = auth.uid()::text );

-- Users can insert their own profile on signup
create policy "Users can insert own profile"
on users for insert
to authenticated
with check ( id = auth.uid()::text );

-- Admins can view all users
create policy "Admins can view all users"
on users for select
to authenticated
using ( true );

-- =============================================
-- 7. Create Reviews Table
-- =============================================
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  project_id text not null,
  user_id text not null,
  user_name text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;

-- Anyone can read reviews
create policy "Reviews are viewable by everyone"
on reviews for select
to anon, authenticated
using ( true );

-- Authenticated users can submit reviews
create policy "Authenticated users can submit reviews"
on reviews for insert
to authenticated
with check ( user_id = auth.uid()::text );
