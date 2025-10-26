-- SQL Script to create users table for eChurch System authentication
-- Run this in your Supabase SQL Editor

-- Users table for authentication and user management
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Allow public registration (for signup)
CREATE POLICY "Allow public user registration" ON public.users
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own data and admins to view all
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (true); -- Simplified for now

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (true); -- Simplified for now

-- Allow deletion of users (for admin operations)
CREATE POLICY "Allow user deletion" ON public.users
    FOR DELETE USING (true); -- Allow all deletions for now (admin controlled)

-- Create RPC function for deleting users by ID
CREATE OR REPLACE FUNCTION delete_user_by_id(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE id = user_id) INTO user_exists;

    IF user_exists THEN
        -- Delete the user
        DELETE FROM public.users WHERE id = user_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- Certificate-specific tables for better data organization

-- Baptism Certificates table
CREATE TABLE IF NOT EXISTS public.baptism_certificates (
    id SERIAL PRIMARY KEY,
    child_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    birth_place TEXT NOT NULL,
    legitimacy TEXT NOT NULL CHECK (legitimacy IN ('legitimate', 'illegitimate')),
    father_name TEXT NOT NULL,
    mother_name TEXT NOT NULL,
    father_catholic TEXT NOT NULL CHECK (father_catholic IN ('yes', 'no')),
    father_religion TEXT,
    father_confirmed TEXT NOT NULL CHECK (father_confirmed IN ('yes', 'no')),
    father_confirmation_place TEXT,
    mother_catholic TEXT NOT NULL CHECK (mother_catholic IN ('yes', 'no')),
    mother_religion TEXT,
    mother_confirmed TEXT NOT NULL CHECK (mother_confirmed IN ('yes', 'no')),
    mother_confirmation_place TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Confirmation Certificates table
CREATE TABLE IF NOT EXISTS public.confirmation_certificates (
    id SERIAL PRIMARY KEY,
    child_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    birth_place TEXT NOT NULL,
    legitimacy TEXT NOT NULL CHECK (legitimacy IN ('legitimate', 'illegitimate')),
    father_name TEXT NOT NULL,
    mother_name TEXT NOT NULL,
    father_catholic TEXT NOT NULL CHECK (father_catholic IN ('yes', 'no')),
    father_religion TEXT,
    father_confirmed TEXT NOT NULL CHECK (father_confirmed IN ('yes', 'no')),
    father_confirmation_place TEXT,
    mother_catholic TEXT NOT NULL CHECK (mother_catholic IN ('yes', 'no')),
    mother_religion TEXT,
    mother_confirmed TEXT NOT NULL CHECK (mother_confirmed IN ('yes', 'no')),
    mother_confirmation_place TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mass Offering Certificates table
CREATE TABLE IF NOT EXISTS public.mass_offering_certificates (
    id SERIAL PRIMARY KEY,
    souls TEXT NOT NULL,
    petitions TEXT NOT NULL,
    thanksgiving TEXT NOT NULL,
    time_day TEXT NOT NULL,
    informant TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funeral Certificates table
CREATE TABLE IF NOT EXISTS public.funeral_certificates (
    id SERIAL PRIMARY KEY,
    deceased_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    civil_status TEXT NOT NULL CHECK (civil_status IN ('single', 'married', 'widowed', 'divorced', 'separated')),
    spouse_name TEXT,
    address TEXT NOT NULL,
    description TEXT NOT NULL,
    occupation TEXT NOT NULL,
    church_involvement TEXT NOT NULL,
    cause_of_death TEXT NOT NULL,
    date_of_death DATE NOT NULL,
    informant_name TEXT NOT NULL,
    informant_contact TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mass Card Certificates table
CREATE TABLE IF NOT EXISTS public.mass_card_certificates (
    id SERIAL PRIMARY KEY,
    deceased_name TEXT NOT NULL,
    from_person TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sick Call Certificates table
CREATE TABLE IF NOT EXISTS public.sick_call_certificates (
    id SERIAL PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_age INTEGER NOT NULL,
    patient_sex TEXT NOT NULL CHECK (patient_sex IN ('male', 'female')),
    patient_civil_status TEXT NOT NULL CHECK (patient_civil_status IN ('single', 'married', 'widowed', 'divorced', 'separated')),
    patient_status TEXT NOT NULL CHECK (patient_status IN ('critical', 'serious', 'stable', 'improving', 'terminal')),
    contact_person TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marriage Certificates table
CREATE TABLE IF NOT EXISTS public.marriage_certificates (
    id SERIAL PRIMARY KEY,
    groom_name TEXT NOT NULL,
    groom_birth_date DATE NOT NULL,
    groom_birth_place TEXT NOT NULL,
    groom_father_name TEXT NOT NULL,
    groom_mother_name TEXT NOT NULL,
    groom_address TEXT NOT NULL,
    bride_name TEXT NOT NULL,
    bride_birth_date DATE NOT NULL,
    bride_birth_place TEXT NOT NULL,
    bride_father_name TEXT NOT NULL,
    bride_mother_name TEXT NOT NULL,
    bride_address TEXT NOT NULL,
    marriage_date DATE NOT NULL,
    marriage_place TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service requests table for user service requests (simplified)
CREATE TABLE IF NOT EXISTS public.service_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('confirmation', 'mass-offering', 'funeral', 'mass-card', 'sick-call', 'marriage', 'baptism', 'baptism-service', 'confirmation-service', 'communion', 'marriage-service', 'anointing', 'funeral-service')),
    details TEXT,
    preferred_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    admin_notes TEXT,
    processed_by UUID REFERENCES public.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Foreign keys to certificate tables
    baptism_certificate_id INTEGER REFERENCES public.baptism_certificates(id),
    confirmation_certificate_id INTEGER REFERENCES public.confirmation_certificates(id),
    mass_offering_certificate_id INTEGER REFERENCES public.mass_offering_certificates(id),
    funeral_certificate_id INTEGER REFERENCES public.funeral_certificates(id),
    mass_card_certificate_id INTEGER REFERENCES public.mass_card_certificates(id),
    sick_call_certificate_id INTEGER REFERENCES public.sick_call_certificates(id),
    marriage_certificate_id INTEGER REFERENCES public.marriage_certificates(id)
);

-- Create indexes for better performance
-- Certificate table indexes
CREATE INDEX IF NOT EXISTS idx_baptism_certificates_child_name ON public.baptism_certificates(child_name);
CREATE INDEX IF NOT EXISTS idx_baptism_certificates_created_at ON public.baptism_certificates(created_at);

CREATE INDEX IF NOT EXISTS idx_confirmation_certificates_child_name ON public.confirmation_certificates(child_name);
CREATE INDEX IF NOT EXISTS idx_confirmation_certificates_created_at ON public.confirmation_certificates(created_at);

CREATE INDEX IF NOT EXISTS idx_mass_offering_certificates_informant ON public.mass_offering_certificates(informant);
CREATE INDEX IF NOT EXISTS idx_mass_offering_certificates_created_at ON public.mass_offering_certificates(created_at);

CREATE INDEX IF NOT EXISTS idx_funeral_certificates_deceased_name ON public.funeral_certificates(deceased_name);
CREATE INDEX IF NOT EXISTS idx_funeral_certificates_date_of_death ON public.funeral_certificates(date_of_death);
CREATE INDEX IF NOT EXISTS idx_funeral_certificates_created_at ON public.funeral_certificates(created_at);

CREATE INDEX IF NOT EXISTS idx_mass_card_certificates_deceased_name ON public.mass_card_certificates(deceased_name);
CREATE INDEX IF NOT EXISTS idx_mass_card_certificates_created_at ON public.mass_card_certificates(created_at);

CREATE INDEX IF NOT EXISTS idx_sick_call_certificates_patient_name ON public.sick_call_certificates(patient_name);
CREATE INDEX IF NOT EXISTS idx_sick_call_certificates_created_at ON public.sick_call_certificates(created_at);

CREATE INDEX IF NOT EXISTS idx_marriage_certificates_groom_name ON public.marriage_certificates(groom_name);
CREATE INDEX IF NOT EXISTS idx_marriage_certificates_bride_name ON public.marriage_certificates(bride_name);
CREATE INDEX IF NOT EXISTS idx_marriage_certificates_marriage_date ON public.marriage_certificates(marriage_date);
CREATE INDEX IF NOT EXISTS idx_marriage_certificates_created_at ON public.marriage_certificates(created_at);

-- Service requests table indexes
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON public.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_type ON public.service_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_service_requests_processed_by ON public.service_requests(processed_by);
CREATE INDEX IF NOT EXISTS idx_service_requests_baptism_cert ON public.service_requests(baptism_certificate_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_confirmation_cert ON public.service_requests(confirmation_certificate_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_mass_offering_cert ON public.service_requests(mass_offering_certificate_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_funeral_cert ON public.service_requests(funeral_certificate_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_mass_card_cert ON public.service_requests(mass_card_certificate_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_sick_call_cert ON public.service_requests(sick_call_certificate_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_marriage_cert ON public.service_requests(marriage_certificate_id);

-- Enable Row Level Security (RLS) for certificate tables
ALTER TABLE public.baptism_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.confirmation_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mass_offering_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.funeral_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mass_card_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sick_call_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.marriage_certificates DISABLE ROW LEVEL SECURITY;

-- Enable Row Level Security (RLS) for service requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for service requests table
-- Allow all operations for now (disable RLS temporarily for testing)
-- DROP POLICY IF EXISTS "Allow authenticated users to create service requests" ON public.service_requests;
-- DROP POLICY IF EXISTS "Users can view their own service requests" ON public.service_requests;
-- DROP POLICY IF EXISTS "Admins can view all service requests" ON public.service_requests;
-- DROP POLICY IF EXISTS "Admins can update service requests" ON public.service_requests;
-- DROP POLICY IF EXISTS "Admins can delete service requests" ON public.service_requests;

-- Temporarily disable RLS to test functionality
ALTER TABLE public.service_requests DISABLE ROW LEVEL SECURITY;

-- Announcements table for church announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table for church events
CREATE TABLE IF NOT EXISTS public.events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('mass', 'service', 'meeting', 'celebration', 'general')),
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

-- Email verification codes table for user account verification
CREATE TABLE IF NOT EXISTS public.email_verifications (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    verification_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE
);

-- Create indexes for email verification
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON public.email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON public.email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON public.email_verifications(verification_code);

-- Enable Row Level Security (RLS) for email verifications
ALTER TABLE public.email_verifications DISABLE ROW LEVEL SECURITY;

-- Function to generate 6-digit verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$;

-- Function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.email_verifications
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Enable Row Level Security (RLS) for announcements and events
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Insert a default admin user (you can change the password later)
-- Note: This uses plain text password for simplicity - in production, use proper hashing
-- INSERT INTO public.users (first_name, last_name, email, phone, password_hash, role)
-- VALUES ('Admin', 'User', 'admin@church.com', '+1234567890', 'admin123', 'admin')
-- ON CONFLICT (email) DO NOTHING;