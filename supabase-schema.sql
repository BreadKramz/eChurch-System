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

-- =====================================================
-- ADMIN ACCESS CODE (server-generated 6-digit) INFRA
-- =====================================================

-- Ensure UUID generator is available (Supabase typically has pgcrypto)
create extension if not exists pgcrypto;

-- Table to store admin access codes
create table if not exists public.admin_access_codes (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists admin_codes_user_idx on public.admin_access_codes(admin_user_id);
create index if not exists admin_codes_code_idx on public.admin_access_codes(code);
create index if not exists admin_codes_expiry_idx on public.admin_access_codes(expires_at);

-- Function: generate a new 6-digit admin code for the authenticated admin
create or replace function public.generate_admin_code()
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid;
  v_role text;
  v_code text;
  v_expires_at timestamptz;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Only allow admins to generate an admin code
  select user_role into v_role from public.profiles where id = v_uid;
  if coalesce(v_role, 'parishioner') <> 'admin' then
    raise exception 'Not authorized';
  end if;

  -- Generate 6-digit code via server
  v_code := lpad((floor(random()*1000000))::int::text, 6, '0');
  v_expires_at := now() + interval '10 minutes';

  -- Invalidate any previous unused codes for this admin
  update public.admin_access_codes
  set used = true
  where admin_user_id = v_uid
    and used = false;

  -- Store the new code
  insert into public.admin_access_codes (admin_user_id, code, expires_at, used)
  values (v_uid, v_code, v_expires_at, false);

  return v_code;
end;
$$;

-- Function: verify a code for the authenticated admin; consumes the latest valid match
create or replace function public.verify_admin_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid;
  v_consumed boolean;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Consume most recent valid code
  update public.admin_access_codes
     set used = true
   where id in (
     select id
       from public.admin_access_codes
      where admin_user_id = v_uid
        and used = false
        and expires_at > now()
        and code = p_code
      order by created_at desc
      limit 1
   )
  returning true into v_consumed;

  return coalesce(v_consumed, false);
end;
$$;

-- Grant execute on RPCs to authenticated users (RLS still enforced where applicable)
grant execute on function public.generate_admin_code() to authenticated;
grant execute on function public.verify_admin_code(text) to authenticated;
