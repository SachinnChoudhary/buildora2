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
