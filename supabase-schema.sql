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


-- ===== ADMIN PRIVILEGE HELPERS (append) =====
-- Allow admin users (profiles.user_role='admin') to manage all profiles via RLS-safe helper
create or replace function public.is_admin(p_uid uuid)
returns boolean
language sql
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
      from public.profiles
     where id = p_uid
       and user_role = 'admin'
  );
$$;

-- Ensure DELETE privilege exists (RLS still restricts who can delete)
grant delete on table public.profiles to authenticated;

-- Admin policies: let admins select/update/delete ANY profile row
create policy "profiles_admin_select_all"
on public.profiles
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy "profiles_admin_update_all"
on public.profiles
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (true);

create policy "profiles_admin_delete_all"
on public.profiles
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- =====================================================
-- EVENTS & ANNOUNCEMENTS TABLES
-- =====================================================

-- Events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamptz not null,
  event_time text,
  location text,
  category text default 'general',
  priority text default 'normal',
  status text default 'upcoming',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Announcements table
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  priority text default 'normal',
  status text default 'active',
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.events enable row level security;
alter table public.announcements enable row level security;

-- Grants for events
grant select on table public.events to authenticated;
grant select on table public.events to anon;
grant insert, update, delete on table public.events to authenticated;
grant all on table public.events to service_role;

-- Grants for announcements
grant select on table public.announcements to authenticated;
grant select on table public.announcements to anon;
grant insert, update, delete on table public.announcements to authenticated;
grant all on table public.announcements to service_role;

-- RLS Policies for events (public read, admin write)
create policy "events_select_all"
on public.events
for select
to authenticated, anon
using (true);

create policy "events_admin_all"
on public.events
for all
to authenticated
using (public.is_admin(auth.uid()));

-- RLS Policies for announcements (public read, admin write)
create policy "announcements_select_all"
on public.announcements
for select
to authenticated, anon
using (true);

create policy "announcements_admin_all"
on public.announcements
for all
to authenticated
using (public.is_admin(auth.uid()));

-- Indexes
create index if not exists events_date_idx on public.events(event_date);
create index if not exists events_status_idx on public.events(status);
create index if not exists events_category_idx on public.events(category);
create index if not exists announcements_status_idx on public.announcements(status);
create index if not exists announcements_expires_idx on public.announcements(expires_at);

-- Triggers for updated_at
create trigger update_events_updated_at
before update on public.events
for each row execute function public.update_updated_at_column();

create trigger update_announcements_updated_at
before update on public.announcements
for each row execute function public.update_updated_at_column();

-- =====================================================
-- INDIVIDUAL CERTIFICATE REQUEST TABLES
-- =====================================================

-- Mass Offering Requests
create table if not exists public.mass_offering_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  soul_name text,
  petitions text,
  thanksgiving text,
  mass_date_time timestamptz,
  mass_in_charge text,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Funeral Certificate Requests
create table if not exists public.funeral_certificate_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deceased_name text,
  deceased_age integer,
  deceased_gender text check (deceased_gender in ('male', 'female')),
  civil_status text check (civil_status in ('single', 'married', 'widowed', 'divorced')),
  spouse_name text,
  children_count integer default 0,
  deceased_address text,
  occupation text,
  church_involvement text,
  cause_of_death text,
  death_date date,
  informant_name text,
  informant_contact text,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Mass Card Requests
create table if not exists public.mass_card_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deceased_name text,
  requester_name text,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sick Call Certificate Requests
create table if not exists public.sick_call_certificate_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_name text,
  patient_age integer,
  patient_sex text check (patient_sex in ('male', 'female')),
  patient_civil_status text check (patient_civil_status in ('single', 'married', 'widowed', 'divorced')),
  patient_status text,
  hospital_room text,
  patient_address text,
  needs text[], -- Array of selected needs
  contact_person_name text,
  contact_number text,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Marriage Certificate Requests
create table if not exists public.marriage_certificate_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Confirmation/Baptism Certificate Requests
create table if not exists public.confirmation_baptism_certificate_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_name text,
  person_dob date,
  place_of_birth text,
  father_name text,
  mother_name text,
  godfather_name text,
  godmother_name text,
  baptism_date date,
  confirmation_date date,
  confirmation_sponsor text,
  confirmation_name text,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- INDIVIDUAL SERVICE REQUEST TABLES
-- =====================================================

-- Confirmation/Baptism Service Requests
create table if not exists public.confirmation_baptism_service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Funeral Service Requests
create table if not exists public.funeral_service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Communion Service Requests
create table if not exists public.communion_service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Marriage Service Requests
create table if not exists public.marriage_service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Convocation Service Requests
create table if not exists public.convocation_service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Other Service Requests
create table if not exists public.other_service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  additional_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- ENABLE RLS AND POLICIES FOR ALL TABLES
-- =====================================================

-- Certificate tables RLS
alter table public.mass_offering_requests enable row level security;
alter table public.funeral_certificate_requests enable row level security;
alter table public.mass_card_requests enable row level security;
alter table public.sick_call_certificate_requests enable row level security;
alter table public.marriage_certificate_requests enable row level security;
alter table public.confirmation_baptism_certificate_requests enable row level security;

-- Service tables RLS
alter table public.confirmation_baptism_service_requests enable row level security;
alter table public.funeral_service_requests enable row level security;
alter table public.communion_service_requests enable row level security;
alter table public.marriage_service_requests enable row level security;
alter table public.convocation_service_requests enable row level security;
alter table public.other_service_requests enable row level security;

-- Grants for all tables
grant select, insert, update on table public.mass_offering_requests to authenticated;
grant select, insert, update on table public.funeral_certificate_requests to authenticated;
grant select, insert, update on table public.mass_card_requests to authenticated;
grant select, insert, update on table public.sick_call_certificate_requests to authenticated;
grant select, insert, update on table public.marriage_certificate_requests to authenticated;
grant select, insert, update on table public.confirmation_baptism_certificate_requests to authenticated;

grant select, insert, update on table public.confirmation_baptism_service_requests to authenticated;
grant select, insert, update on table public.funeral_service_requests to authenticated;
grant select, insert, update on table public.communion_service_requests to authenticated;
grant select, insert, update on table public.marriage_service_requests to authenticated;
grant select, insert, update on table public.convocation_service_requests to authenticated;
grant select, insert, update on table public.other_service_requests to authenticated;

grant all on table public.mass_offering_requests to service_role;
grant all on table public.funeral_certificate_requests to service_role;
grant all on table public.mass_card_requests to service_role;
grant all on table public.sick_call_certificate_requests to service_role;
grant all on table public.marriage_certificate_requests to service_role;
grant all on table public.confirmation_baptism_certificate_requests to service_role;

grant all on table public.confirmation_baptism_service_requests to service_role;
grant all on table public.funeral_service_requests to service_role;
grant all on table public.communion_service_requests to service_role;
grant all on table public.marriage_service_requests to service_role;
grant all on table public.convocation_service_requests to service_role;
grant all on table public.other_service_requests to service_role;

-- RLS Policies for all certificate tables
create policy "mass_offering_requests_select_own" on public.mass_offering_requests for select to authenticated using (auth.uid() = user_id);
create policy "mass_offering_requests_insert_own" on public.mass_offering_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "mass_offering_requests_admin_all" on public.mass_offering_requests for all to authenticated using (public.is_admin(auth.uid()));

create policy "funeral_certificate_requests_select_own" on public.funeral_certificate_requests for select to authenticated using (auth.uid() = user_id);
create policy "funeral_certificate_requests_insert_own" on public.funeral_certificate_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "funeral_certificate_requests_admin_all" on public.funeral_certificate_requests for all to authenticated using (public.is_admin(auth.uid()));

create policy "mass_card_requests_select_own" on public.mass_card_requests for select to authenticated using (auth.uid() = user_id);
create policy "mass_card_requests_insert_own" on public.mass_card_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "mass_card_requests_admin_all" on public.mass_card_requests for all to authenticated using (public.is_admin(auth.uid()));

create policy "sick_call_certificate_requests_select_own" on public.sick_call_certificate_requests for select to authenticated using (auth.uid() = user_id);
create policy "sick_call_certificate_requests_insert_own" on public.sick_call_certificate_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "sick_call_certificate_requests_admin_all" on public.sick_call_certificate_requests for all to authenticated using (public.is_admin(auth.uid()));

create policy "marriage_certificate_requests_select_own" on public.marriage_certificate_requests for select to authenticated using (auth.uid() = user_id);
create policy "marriage_certificate_requests_insert_own" on public.marriage_certificate_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "marriage_certificate_requests_admin_all" on public.marriage_certificate_requests for all to authenticated using (public.is_admin(auth.uid()));

create policy "confirmation_baptism_certificate_requests_select_own" on public.confirmation_baptism_certificate_requests for select to authenticated using (auth.uid() = user_id);
create policy "confirmation_baptism_certificate_requests_insert_own" on public.confirmation_baptism_certificate_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "confirmation_baptism_certificate_requests_admin_all" on public.confirmation_baptism_certificate_requests for all to authenticated using (public.is_admin(auth.uid()));

-- RLS Policies for all service tables
create policy "confirmation_baptism_service_requests_select_own" on public.confirmation_baptism_service_requests for select to authenticated using (auth.uid() = user_id);
create policy "confirmation_baptism_service_requests_insert_own" on public.confirmation_baptism_service_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "confirmation_baptism_service_requests_admin_all" on public.confirmation_baptism_service_requests for all to authenticated using (public.is_admin(auth.uid()));

create policy "funeral_service_requests_select_own" on public.funeral_service_requests for select to authenticated using (auth.uid() = user_id);
create policy "funeral_service_requests_insert_own" on public.funeral_service_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "funeral_service_requests_admin_all" on public.funeral_service_requests for all to authenticated using (public.is_admin(auth.uid()));

create policy "communion_service_requests_select_own" on public.communion_service_requests for select to authenticated using (auth.uid() = user_id);
create policy "communion_service_requests_insert_own" on public.communion_service_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "communion_service_requests_admin_all" on public.communion_service_requests for all to authenticated using (public.is_admin(auth.uid()));

create policy "marriage_service_requests_select_own" on public.marriage_service_requests for select to authenticated using (auth.uid() = user_id);
create policy "marriage_service_requests_insert_own" on public.marriage_service_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "marriage_service_requests_admin_all" on public.marriage_service_requests for all to authenticated using (public.is_admin(auth.uid()));

create policy "convocation_service_requests_select_own" on public.convocation_service_requests for select to authenticated using (auth.uid() = user_id);
create policy "convocation_service_requests_insert_own" on public.convocation_service_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "convocation_service_requests_admin_all" on public.convocation_service_requests for all to authenticated using (public.is_admin(auth.uid()));

create policy "other_service_requests_select_own" on public.other_service_requests for select to authenticated using (auth.uid() = user_id);
create policy "other_service_requests_insert_own" on public.other_service_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "other_service_requests_admin_all" on public.other_service_requests for all to authenticated using (public.is_admin(auth.uid()));

-- Indexes for all tables
create index if not exists mass_offering_requests_user_idx on public.mass_offering_requests(user_id);
create index if not exists mass_offering_requests_status_idx on public.mass_offering_requests(status);
create index if not exists mass_offering_requests_submitted_idx on public.mass_offering_requests(submitted_at);

create index if not exists funeral_certificate_requests_user_idx on public.funeral_certificate_requests(user_id);
create index if not exists funeral_certificate_requests_status_idx on public.funeral_certificate_requests(status);
create index if not exists funeral_certificate_requests_submitted_idx on public.funeral_certificate_requests(submitted_at);

create index if not exists mass_card_requests_user_idx on public.mass_card_requests(user_id);
create index if not exists mass_card_requests_status_idx on public.mass_card_requests(status);
create index if not exists mass_card_requests_submitted_idx on public.mass_card_requests(submitted_at);

create index if not exists sick_call_certificate_requests_user_idx on public.sick_call_certificate_requests(user_id);
create index if not exists sick_call_certificate_requests_status_idx on public.sick_call_certificate_requests(status);
create index if not exists sick_call_certificate_requests_submitted_idx on public.sick_call_certificate_requests(submitted_at);

create index if not exists marriage_certificate_requests_user_idx on public.marriage_certificate_requests(user_id);
create index if not exists marriage_certificate_requests_status_idx on public.marriage_certificate_requests(status);
create index if not exists marriage_certificate_requests_submitted_idx on public.marriage_certificate_requests(submitted_at);

create index if not exists confirmation_baptism_certificate_requests_user_idx on public.confirmation_baptism_certificate_requests(user_id);
create index if not exists confirmation_baptism_certificate_requests_status_idx on public.confirmation_baptism_certificate_requests(status);
create index if not exists confirmation_baptism_certificate_requests_submitted_idx on public.confirmation_baptism_certificate_requests(submitted_at);

create index if not exists confirmation_baptism_service_requests_user_idx on public.confirmation_baptism_service_requests(user_id);
create index if not exists confirmation_baptism_service_requests_status_idx on public.confirmation_baptism_service_requests(status);
create index if not exists confirmation_baptism_service_requests_submitted_idx on public.confirmation_baptism_service_requests(submitted_at);

create index if not exists funeral_service_requests_user_idx on public.funeral_service_requests(user_id);
create index if not exists funeral_service_requests_status_idx on public.funeral_service_requests(status);
create index if not exists funeral_service_requests_submitted_idx on public.funeral_service_requests(submitted_at);

create index if not exists communion_service_requests_user_idx on public.communion_service_requests(user_id);
create index if not exists communion_service_requests_status_idx on public.communion_service_requests(status);
create index if not exists communion_service_requests_submitted_idx on public.communion_service_requests(submitted_at);

create index if not exists marriage_service_requests_user_idx on public.marriage_service_requests(user_id);
create index if not exists marriage_service_requests_status_idx on public.marriage_service_requests(status);
create index if not exists marriage_service_requests_submitted_idx on public.marriage_service_requests(submitted_at);

create index if not exists convocation_service_requests_user_idx on public.convocation_service_requests(user_id);
create index if not exists convocation_service_requests_status_idx on public.convocation_service_requests(status);
create index if not exists convocation_service_requests_submitted_idx on public.convocation_service_requests(submitted_at);

create index if not exists other_service_requests_user_idx on public.other_service_requests(user_id);
create index if not exists other_service_requests_status_idx on public.other_service_requests(status);
create index if not exists other_service_requests_submitted_idx on public.other_service_requests(submitted_at);

-- Triggers for updated_at on all tables
create trigger update_mass_offering_requests_updated_at before update on public.mass_offering_requests for each row execute function public.update_updated_at_column();
create trigger update_funeral_certificate_requests_updated_at before update on public.funeral_certificate_requests for each row execute function public.update_updated_at_column();
create trigger update_mass_card_requests_updated_at before update on public.mass_card_requests for each row execute function public.update_updated_at_column();
create trigger update_sick_call_certificate_requests_updated_at before update on public.sick_call_certificate_requests for each row execute function public.update_updated_at_column();
create trigger update_marriage_certificate_requests_updated_at before update on public.marriage_certificate_requests for each row execute function public.update_updated_at_column();
create trigger update_confirmation_baptism_certificate_requests_updated_at before update on public.confirmation_baptism_certificate_requests for each row execute function public.update_updated_at_column();

create trigger update_confirmation_baptism_service_requests_updated_at before update on public.confirmation_baptism_service_requests for each row execute function public.update_updated_at_column();
create trigger update_funeral_service_requests_updated_at before update on public.funeral_service_requests for each row execute function public.update_updated_at_column();
create trigger update_communion_service_requests_updated_at before update on public.communion_service_requests for each row execute function public.update_updated_at_column();
create trigger update_marriage_service_requests_updated_at before update on public.marriage_service_requests for each row execute function public.update_updated_at_column();
create trigger update_convocation_service_requests_updated_at before update on public.convocation_service_requests for each row execute function public.update_updated_at_column();
create trigger update_other_service_requests_updated_at before update on public.other_service_requests for each row execute function public.update_updated_at_column();
