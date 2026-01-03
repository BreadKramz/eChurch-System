// Supabase Configuration and Authentication
// Our Mother of Perpetual Help Redemptorist Church

const SUPABASE_URL = 'https://vvfcflgtjxvbznxywdjf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZmNmbGd0anh2YnpueHl3ZGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzA5MDIsImV4cCI6MjA3NzMwNjkwMn0._0-6QG_SgZodlpaLMQ_BUoBzYRdyrWOMiann4JGayGA';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication Functions
class ChurchAuth {
    constructor() {
        this.supabase = supabaseClient;
        this.currentUser = null;
        this.init();
    }

    // Initialize authentication state
    async init() {
        try {
            // Get initial session
            const { data: { session }, error } = await this.supabase.auth.getSession();

            if (error) {
                console.error('Error getting session:', error);
                return;
            }

            if (session) {
                this.currentUser = session.user;
                // Only handle auth state change if not on auth pages to prevent loops
                if (!window.location.pathname.includes('/auth/')) {
                    this.handleAuthStateChange('SIGNED_IN', session);
                }
            }

            // Listen for auth state changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event, session);
                // Prevent loops by not handling SIGNED_IN events on auth pages
                if (!(event === 'SIGNED_IN' && window.location.pathname.includes('/auth/'))) {
                    this.handleAuthStateChange(event, session);
                }
            });

        } catch (error) {
            console.error('Error initializing auth:', error);
        }
    }

    // Handle authentication state changes
    handleAuthStateChange(event, session) {
        switch (event) {
            case 'SIGNED_IN':
                this.currentUser = session?.user || null;
                if (this.currentUser) {
                    // Store user info in localStorage for persistence
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', this.currentUser.email);
                    localStorage.setItem('userId', this.currentUser.id);

                    // Only redirect to dashboard if currently on auth pages AND not already on dashboard
                    // AND user successfully authenticated (not just checking existing session)
                    if (event === 'SIGNED_IN' && window.location.pathname.includes('/auth/') && !window.location.pathname.includes('/dashboard/')) {
                        window.location.href = '/src/pages/dashboard/index.html';
                    }
                }
                break;

            case 'SIGNED_OUT':
                this.currentUser = null;
                // Clear stored user data
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userId');
                localStorage.removeItem('rememberMe');

                // Always redirect to login page when signed out (for Vercel production)
                console.log('User signed out, redirecting to login page');
                window.location.href = '/src/pages/auth/login.html';
                break;

            case 'TOKEN_REFRESHED':
                console.log('Token refreshed successfully');
                break;
        }
    }

    // Sign up with email and password
    async signUp(email, password, userData = {}) {
        try {
            // First check if user already exists in our profiles table
            const { data: existingProfile, error: checkError } = await this.supabase
                .from('profiles')
                .select('id, email')
                .eq('email', email.toLowerCase())
                .single();

            if (existingProfile && !checkError) {
                showPopupMessage('An account with this email already exists. Please try logging in instead.', 'error');
                return {
                    success: false,
                    error: 'An account with this email already exists. Please try logging in instead.'
                };
            }

            // Create account in Supabase Auth with redirect to login page
            // Use Vercel deployment URL for email confirmation
            const currentOrigin = "https://ompchurch.vercel.app";
            const redirectUrl = `${currentOrigin}https://ompchurch.vercel.app/src/pages/auth/login`;

            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: redirectUrl,
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        phone: userData.phone,
                        full_name: `${userData.firstName} ${userData.lastName}`.trim()
                    }
                }
            });

            if (error) throw error;

            // Create profile record in our database
            if (data.user) {
                const { error: profileError } = await this.supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        full_name: `${userData.firstName} ${userData.lastName}`.trim(),
                        email: email.toLowerCase(),
                        phone: userData.phone,
                        membership_status: 'active',
                        user_role: 'parishioner'
                    });

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    // Don't fail registration if profile creation fails
                    // The trigger will try to create it again
                }
            }

            return {
                success: true,
                user: data.user,
                session: data.session,
                message: 'Account created successfully! Please check your email and click the confirmation link to verify your account.'
            };

        } catch (error) {
            console.error('Sign up error:', error);

            // Handle specific Supabase errors
            if (error.message.includes('User already registered')) {
                showPopupMessage('An account with this email already exists. Please try logging in instead.', 'error');
                return {
                    success: false,
                    error: 'An account with this email already exists. Please try logging in instead.'
                };
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    // Sign in with email and password
    async signIn(email, password, rememberMe = false) {
        try {
            // First attempt to sign in with Supabase Auth to get the user
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Check if user email is confirmed
            if (!data.user.email_confirmed_at) {
                showPopupMessage('Please verify your email address before logging in. Check your inbox for the verification link.', 'error');
                return {
                    success: false,
                    error: 'Please verify your email address before logging in.'
                };
            }

            // Now check if user exists in our profiles table
            const { data: profileData, error: profileError } = await this.supabase
                .from('profiles')
                .select('id, membership_status, first_name, last_name, email')
                .eq('id', data.user.id)
                .single();

            // If profile doesn't exist, create it from auth metadata
            if (profileError || !profileData) {
                console.log('Profile not found, creating from auth metadata...');

                const userMetadata = data.user.user_metadata || {};
                // Check if this is a known admin email
                const isAdminEmail = email.toLowerCase() === 'admin@ompchurchdumaguete.com';
                const userRole = isAdminEmail ? 'admin' : 'parishioner';

                console.log('Creating profile with role:', userRole, 'for email:', email);

                const { error: createError } = await this.supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        first_name: userMetadata.first_name || (isAdminEmail ? 'Admin' : ''),
                        last_name: userMetadata.last_name || (isAdminEmail ? 'Administrator' : ''),
                        full_name: userMetadata.full_name || (isAdminEmail ? 'Admin Administrator' : `${userMetadata.first_name || ''} ${userMetadata.last_name || ''}`.trim()),
                        email: email.toLowerCase(),
                        phone: userMetadata.phone || '',
                        membership_status: 'active',
                        user_role: userRole
                    });

                if (createError) {
                    console.error('Error creating profile during login:', createError);
                    // Don't fail login if profile creation fails
                } else {
                    console.log('Profile created successfully with role:', userRole);
                }
            } else {
                // Check if account is active
                if (profileData.membership_status !== 'active') {
                    showPopupMessage('Account is not active. Please contact the parish office.', 'error');
                    return {
                        success: false,
                        error: 'Account is not active. Please contact the parish office.'
                    };
                }
            }

            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            return {
                success: true,
                user: data.user,
                session: data.session,
                message: 'Login successful!'
            };

        } catch (error) {
            console.error('Sign in error:', error);

            // Provide more specific error messages
            if (error.message.includes('Invalid login credentials')) {
                showPopupMessage('Invalid email or password. Please check your credentials.', 'error');
                return {
                    success: false,
                    error: 'Invalid email or password. Please check your credentials.'
                };
            } else if (error.message.includes('Email not confirmed')) {
                showPopupMessage('Please verify your email address before logging in. Check your inbox for the verification link.', 'error');
                return {
                    success: false,
                    error: 'Please verify your email address before logging in.'
                };
            }

            showPopupMessage(error.message || 'Login failed. Please try again.', 'error');
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Sign out
    async signOut() {
        try {
            // Clear local storage first
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            localStorage.removeItem('rememberMe');

            // Sign out from Supabase
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            return {
                success: true,
                message: 'Signed out successfully'
            };

        } catch (error) {
            console.error('Sign out error:', error);
            // Even if Supabase signout fails, clear local data
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            localStorage.removeItem('rememberMe');

            return {
                success: false,
                error: error.message
            };
        }
    }

        // Reset password (robust across local/Vercel; avoids leaking whether email exists)
        async resetPassword(email) {
            try {
                const origin = window.location.origin || '';
                let options = undefined;
    
                // Only set redirectTo when we are on an http(s) origin (required by Supabase)
                if (origin.startsWith('http://') || origin.startsWith('https://')) {
                    options = { redirectTo: `${origin}/src/pages/auth/reset-password.html` };
                }
    
                console.log('Sending password reset to:', email, 'with options:', options);
    
                // First attempt (with redirect when available)
                let resp = await this.supabase.auth.resetPasswordForEmail(email, options);
    
                // If redirectTo is rejected (e.g., not whitelisted), retry without redirectTo
                if (resp?.error && options) {
                    const msg = (resp.error.message || '').toLowerCase();
                    if (msg.includes('redirect') || msg.includes('url')) {
                        console.warn('Reset password redirect error, retrying without redirectTo...');
                        resp = await this.supabase.auth.resetPasswordForEmail(email);
                    }
                }
    
                if (resp?.error) throw resp.error;
    
                // Always return generic message to avoid user enumeration
                return {
                    success: true,
                    message: 'If an account exists for this email, a password reset link has been sent.'
                };
    
            } catch (error) {
                console.error('Reset password error:', error);
                // Return generic success-style message to avoid user enumeration, even on error
                return {
                    success: true,
                    message: 'If an account exists for this email, a password reset link has been sent.'
                };
            }
        }

    // Update password
    async updatePassword(newPassword) {
        try {
            const { data, error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            return {
                success: true,
                user: data.user,
                message: 'Password updated successfully!'
            };

        } catch (error) {
            console.error('Update password error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get user profile data
    async getUserProfile() {
        if (!this.currentUser) return null;

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    // Update user profile
    async updateUserProfile(updates) {
        if (!this.currentUser) return { success: false, error: 'Not authenticated' };

        try {
            console.log('Updating profile for user:', this.currentUser.id);
            console.log('Updates:', updates);

            // First, check if profile exists
            const { data: existingProfile, error: checkError } = await this.supabase
                .from('profiles')
                .select('id')
                .eq('id', this.currentUser.id)
                .single();

            console.log('Existing profile check:', { existingProfile, checkError });

            let result;
            if (existingProfile) {
                // Update existing profile
                console.log('Updating existing profile');
                const { data, error } = await this.supabase
                    .from('profiles')
                    .update({
                        ...updates,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', this.currentUser.id);

                if (error) throw error;
                result = { data, error };
                console.log('Update result:', result);
            } else {
                // Insert new profile
                console.log('Inserting new profile');
                const { data, error } = await this.supabase
                    .from('profiles')
                    .insert({
                        id: this.currentUser.id,
                        ...updates,
                        updated_at: new Date().toISOString()
                    });

                if (error) throw error;
                result = { data, error };
                console.log('Insert result:', result);
            }

            return {
                success: true,
                data: result.data,
                message: 'Profile updated successfully!'
            };

        } catch (error) {
            console.error('Update profile error:', error);
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Create global auth instance
const churchAuth = new ChurchAuth();

// Export for use in other scripts
window.churchAuth = churchAuth;
window.supabaseClient = supabaseClient;