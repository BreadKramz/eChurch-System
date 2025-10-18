// Supabase Configuration - Our Mother of Perpetual Help Redemptorist Church
// This file contains Supabase client configuration and database operations

// Supabase configuration
const SUPABASE_URL = 'https://exkwcymcebamfpucebvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a3djeW1jZWJhbWZwdWNlYnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODUxNzEsImV4cCI6MjA3NjM2MTE3MX0.nkve3DhGGXlIxzKRnebTOjjGGQ2Ck5_GopmJJjdj4pQ';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table names
const TABLES = {
    USERS: 'users'
};

// User Management Functions
const SupabaseUsers = {
    // Create a new user
    async createUser(userData) {
        try {
            const { data, error } = await supabaseClient
                .from(TABLES.USERS)
                .insert([{
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    email: userData.email.toLowerCase(),
                    phone: userData.phone,
                    password_hash: await this.hashPassword(userData.password),
                    role: userData.role || 'user',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    },

    // Authenticate user
    async authenticateUser(email, password) {
        try {
            const { data, error } = await supabaseClient
                .from(TABLES.USERS)
                .select('*')
                .eq('email', email.toLowerCase())
                .single();

            if (error) throw error;

            if (data && await this.verifyPassword(password, data.password_hash)) {
                // Update last login
                await supabaseClient
                    .from(TABLES.USERS)
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', data.id);

                return { success: true, user: data };
            }

            return { success: false, error: 'Invalid credentials' };
        } catch (error) {
            console.error('Error authenticating user:', error);
            return { success: false, error: error.message };
        }
    },

    // Get all users
    async getAllUsers() {
        try {
            const { data, error } = await supabaseClient
                .from(TABLES.USERS)
                .select('id, first_name, last_name, email, phone, role, created_at, last_login')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data: data };
        } catch (error) {
            console.error('Error fetching users:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete user by email
    async deleteUserByEmail(email) {
        try {
            console.log('Attempting to delete user:', email);

            // First check if user exists and get their ID
            const { data: existingUser, error: checkError } = await supabaseClient
                .from(TABLES.USERS)
                .select('id, email')
                .eq('email', email.toLowerCase())
                .single();

            console.log('User check result:', { existingUser, checkError });

            if (checkError) {
                if (checkError.code === 'PGRST116') {
                    console.log('User not found in database');
                    return { success: false, error: 'User not found' };
                }
                throw checkError;
            }

            // Try direct delete first (simpler)
            const { error: directError } = await supabaseClient
                .from(TABLES.USERS)
                .delete()
                .eq('id', existingUser.id);

            console.log('Direct delete result:', { directError });

            if (directError) {
                console.error('Direct delete failed:', directError);
                return { success: false, error: directError.message };
            }

            console.log('Direct delete succeeded');
            return { success: true, deletedCount: 1 };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete all users (except admin)
    async deleteAllUsers() {
        try {
            // Delete all non-admin users and get count
            const { data, error } = await supabaseClient
                .from(TABLES.USERS)
                .delete()
                .neq('role', 'admin')
                .select();

            if (error) throw error;

            return { success: true, deletedCount: data ? data.length : 0 };
        } catch (error) {
            console.error('Error deleting all users:', error);
            return { success: false, deletedCount: 0, error: error.message };
        }
    },

    // Password hashing utilities
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async verifyPassword(password, hash) {
        const hashedPassword = await this.hashPassword(password);
        return hashedPassword === hash;
    }
};


// Console usage examples (for development/admin use):
/*
// In browser console, you can run:
// SupabaseUsers.getAllUsers() - Get all users
*/