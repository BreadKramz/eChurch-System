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

// Email Verification Functions
const EmailVerification = {
    // Send verification code to email
    async sendVerificationCode(email) {
        try {
            // Generate verification code using database function
            const { data: codeData, error: codeError } = await supabaseClient
                .rpc('generate_verification_code');

            if (codeError) throw codeError;

            const verificationCode = codeData;
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

            // Store verification code in database
            const { data, error } = await supabaseClient
                .from('email_verifications')
                .upsert({
                    email: email.toLowerCase(),
                    verification_code: verificationCode,
                    expires_at: expiresAt.toISOString(),
                    attempts: 0,
                    is_verified: false
                }, {
                    onConflict: 'email'
                })
                .select();

            if (error) throw error;

            // Here you would integrate with an email service like SendGrid, Mailgun, etc.
            // For now, we'll log the code (in production, send via email)
            console.log(`Verification code for ${email}: ${verificationCode}`);

            // TODO: Integrate with email service
            // Example with a hypothetical email service:
            /*
            const emailResponse = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    subject: 'Email Verification - Our Mother of Perpetual Help Church',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Welcome to Our Mother of Perpetual Help Church</h2>
                            <p>Your verification code is:</p>
                            <div style="font-size: 24px; font-weight: bold; color: #8B4513; text-align: center; padding: 20px; border: 2px solid #8B4513; border-radius: 8px; margin: 20px 0;">
                                ${verificationCode}
                            </div>
                            <p>This code will expire in 10 minutes.</p>
                            <p>If you didn't request this verification, please ignore this email.</p>
                        </div>
                    `
                })
            });
            */

            return { success: true, code: verificationCode };
        } catch (error) {
            console.error('Error sending verification code:', error);
            return { success: false, error: error.message };
        }
    },

    // Verify the code entered by user
    async verifyCode(email, code) {
        try {
            const { data, error } = await supabaseClient
                .from('email_verifications')
                .select('*')
                .eq('email', email.toLowerCase())
                .eq('verification_code', code)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return { success: false, error: 'Invalid verification code' };
                }
                throw error;
            }

            // Check if code is expired
            if (new Date(data.expires_at) < new Date()) {
                return { success: false, error: 'Verification code has expired' };
            }

            // Check attempts (max 3 attempts)
            if (data.attempts >= 3) {
                return { success: false, error: 'Too many failed attempts. Please request a new code.' };
            }

            // Mark as verified
            const { error: updateError } = await supabaseClient
                .from('email_verifications')
                .update({
                    is_verified: true,
                    attempts: data.attempts + 1
                })
                .eq('id', data.id);

            if (updateError) throw updateError;

            return { success: true };
        } catch (error) {
            console.error('Error verifying code:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if email is already verified
    async isEmailVerified(email) {
        try {
            const { data, error } = await supabaseClient
                .from('email_verifications')
                .select('is_verified')
                .eq('email', email.toLowerCase())
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return false; // No verification record found
                }
                throw error;
            }

            return data.is_verified || false;
        } catch (error) {
            console.error('Error checking email verification:', error);
            return false;
        }
    }
};


// Console usage examples (for development/admin use):
/*
// In browser console, you can run:
// SupabaseUsers.getAllUsers() - Get all users
// EmailVerification.sendVerificationCode('user@example.com') - Send verification code
// EmailVerification.verifyCode('user@example.com', '123456') - Verify code
*/