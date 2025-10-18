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

-- Service requests table for user service requests
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON public.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_type ON public.service_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_service_requests_processed_by ON public.service_requests(processed_by);

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

-- Insert a default admin user (you can change the password later)
-- Note: This uses plain text password for simplicity - in production, use proper hashing
-- INSERT INTO public.users (first_name, last_name, email, phone, password_hash, role)
-- VALUES ('Admin', 'User', 'admin@church.com', '+1234567890', 'admin123', 'admin')
-- ON CONFLICT (email) DO NOTHING;