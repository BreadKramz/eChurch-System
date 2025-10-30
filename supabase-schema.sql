-- =====================================================
-- SECURE, IDEMPOTENT PROFILES SCHEMA (Run in Supabase SQL Editor)
-- =====================================================

-- 0) Clean up cross-object dependencies safely (no references to non-existent relations)

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.update_updated_at_column();

-- 1) Table (recreate from scratch; comment DROP if you have prod data)
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name  text,
  full_name  text,
  email      text,
  phone      text,
  membership_status text default 'active',
  user_role  text default 'parishioner',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Enable RLS (do not disable in prod)
alter table public.profiles enable row level security;

-- 3) Grants (PostgREST honors RLS; keep surface minimal)
-- Ensure roles have USAGE on schema to avoid "permission denied for schema public"
grant usage on schema public to authenticated;
grant usage on schema public to anon;

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

-- 4) Policies: users can only access their own row
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- 5) Triggers & functions

-- Keep updated_at fresh
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Auto-create a profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into public.profiles (id, first_name, last_name, full_name, email, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    coalesce(
      new.raw_user_meta_data->>'full_name',
      trim(both ' ' from concat(new.raw_user_meta_data->>'first_name',' ',new.raw_user_meta_data->>'last_name'))
    ),
    new.email,
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- 6) Indexes
create index if not exists profiles_user_role_idx on public.profiles(user_role);
create index if not exists profiles_membership_status_idx on public.profiles(membership_status);
create index if not exists profiles_email_ci_idx on public.profiles(lower(email));

-- 7) Verification
-- select 'Profiles schema applied successfully' as status;