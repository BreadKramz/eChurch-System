// Dashboard JavaScript - Our Mother of Perpetual Help Redemptorist Church

// Global variables
let currentUser = null;
let currentSection = 'dashboard';

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard DOM loaded, initializing...');
    initializeDashboard();
});

// Initialize dashboard
async function initializeDashboard() {
    try {
        // Wait a bit for auth to initialize
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if user is authenticated
        if (!churchAuth.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = '/src/pages/auth/login.html';
            return;
        }

        // Get current user
        currentUser = churchAuth.getCurrentUser();
        if (!currentUser) {
            console.log('No current user, redirecting to login');
            window.location.href = '/src/pages/auth/login.html';
            return;
        }

        console.log('Dashboard initializing for user:', currentUser.email);

        // Load user profile data (don't block initialization)
        await loadUserProfile();

        // Initialize navigation
        initializeNavigation();

        // Initialize logout functionality
        initializeLogout();

        // Load dashboard data
        loadDashboardData();

    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showDashboardMessage('Failed to load dashboard. Please try again.', 'error');
    }
}

// Load user profile data
async function loadUserProfile() {
    try {
        console.log('Loading user profile...');
        const profile = await churchAuth.getUserProfile();
        console.log('Profile loaded:', profile);

        if (profile) {
            // Update sidebar user info - show full name instead of email
            const fullName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            const roleRaw = (profile.user_role || 'parishioner');
            const roleText = roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1);
            document.getElementById('user-name').textContent = roleText;
            document.getElementById('user-email').textContent = fullName; // Show full name instead of email
            // Header mini profile
            const headerRoleEl = document.getElementById('header-user-role');
            const headerNameEl = document.getElementById('header-user-fullname');
            const headerAvatarEl = document.getElementById('header-user-avatar');
            if (headerRoleEl) headerRoleEl.textContent = roleText;
            if (headerNameEl) headerNameEl.textContent = fullName || 'User';
            if (headerAvatarEl) headerAvatarEl.textContent = (profile.first_name || fullName || 'U').charAt(0).toUpperCase();

            // Update welcome message - show first name
            document.getElementById('welcome-name').textContent = profile.first_name;

            // Update profile section
            document.getElementById('profile-first-name').textContent = profile.first_name || 'Not provided';
            document.getElementById('profile-last-name').textContent = profile.last_name || 'Not provided';
            document.getElementById('profile-email').textContent = currentUser.email;
            document.getElementById('profile-phone').textContent = profile.phone || 'Not provided';

            // Update user avatar (first letter of first name)
            const avatarElement = document.getElementById('user-avatar');
            if (avatarElement && profile.first_name) {
                avatarElement.textContent = profile.first_name.charAt(0).toUpperCase();
            }
        } else {
            console.log('No profile found, checking user metadata...');
            // Try to get name from user metadata as fallback
            const userMeta = currentUser?.user_metadata || {};
            const metaFullName = userMeta.full_name || `${userMeta.first_name || ''} ${userMeta.last_name || ''}`.trim();
            const displayName = metaFullName.trim() || 'User';
            const firstName = userMeta.first_name || 'User';

            // Update sidebar user info
            document.getElementById('user-name').textContent = 'Parishioner';
            document.getElementById('user-email').textContent = displayName;
            // Header mini profile (fallback)
            const headerRoleEl2 = document.getElementById('header-user-role');
            const headerNameEl2 = document.getElementById('header-user-fullname');
            const headerAvatarEl2 = document.getElementById('header-user-avatar');
            if (headerRoleEl2) headerRoleEl2.textContent = 'Parishioner';
            if (headerNameEl2) headerNameEl2.textContent = displayName || 'User';
            if (headerAvatarEl2) headerAvatarEl2.textContent = (firstName || displayName || 'U').charAt(0).toUpperCase();

            // Update welcome message
            document.getElementById('welcome-name').textContent = firstName;

            // Update profile section with available data
            document.getElementById('profile-first-name').textContent = userMeta.first_name || 'Not provided';
            document.getElementById('profile-last-name').textContent = userMeta.last_name || 'Not provided';
            document.getElementById('profile-email').textContent = currentUser.email;
            document.getElementById('profile-phone').textContent = userMeta.phone || 'Not provided';

            // Update user avatar
            const avatarElement = document.getElementById('user-avatar');
            if (avatarElement && userMeta.first_name) {
                avatarElement.textContent = userMeta.first_name.charAt(0).toUpperCase();
            }
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Final fallback to basic user info
        document.getElementById('user-name').textContent = 'Parishioner';
        document.getElementById('user-email').textContent = 'User';
        document.getElementById('welcome-name').textContent = 'User';
    }
}

// Initialize navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const section = this.getAttribute('data-section');
            if (section) {
                switchSection(section);
            }

            // Close sidebar on mobile after navigation
            if (window.innerWidth < 1024) {
                closeSidebar();
            }
        });
    });

    // Initialize profile editing functionality
    initializeProfileEditing();
}

// Initialize profile editing functionality
function initializeProfileEditing() {
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelProfileBtn = document.getElementById('cancel-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const profileViewMode = document.getElementById('profile-view-mode');
    const profileEditForm = document.getElementById('profile-edit-form');

    const changePasswordBtn = document.getElementById('change-password-btn');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    const savePasswordBtn = document.getElementById('save-password-btn');
    const passwordChangeForm = document.getElementById('password-change-form');

    // Profile editing
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            console.log('Edit profile button clicked');
            // Hide view mode, show edit form
            profileViewMode.classList.add('hidden');
            profileEditForm.classList.remove('hidden');

            // Populate form with current values
            const firstName = document.getElementById('profile-first-name').textContent;
            const lastName = document.getElementById('profile-last-name').textContent;
            const phone = document.getElementById('profile-phone').textContent;

            console.log('Current values:', { firstName, lastName, phone });

            document.getElementById('edit-first-name').value = firstName !== 'Not provided' ? firstName : '';
            document.getElementById('edit-last-name').value = lastName !== 'Not provided' ? lastName : '';
            document.getElementById('edit-phone').value = phone !== 'Not provided' ? phone : '';
        });
    }

    if (cancelProfileBtn) {
        cancelProfileBtn.addEventListener('click', function() {
            // Hide edit form, show view mode
            profileEditForm.classList.add('hidden');
            profileViewMode.classList.remove('hidden');
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            const formData = new FormData(profileEditForm);
            const firstName = formData.get('firstName').trim();
            const lastName = formData.get('lastName').trim();
            const phone = formData.get('phone').trim();

            // Validation
            if (!firstName || !lastName) {
                showDashboardMessage('First name and last name are required.', 'error');
                return;
            }

            if (!isValidName(firstName) || !isValidName(lastName)) {
                showDashboardMessage('Please enter valid names (letters and spaces only).', 'error');
                return;
            }

            if (phone && !isValidPhone(phone)) {
                showDashboardMessage('Please enter a valid phone number.', 'error');
                return;
            }

            // Disable save button
            saveProfileBtn.disabled = true;
            saveProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i> Saving...';

            try {
                console.log('Attempting to update profile with:', {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`.trim(),
                    phone: phone || null,
                    updated_at: new Date().toISOString()
                });

                const updates = {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`.trim(),
                    phone: phone || null,
                    updated_at: new Date().toISOString()
                };

                const result = await churchAuth.updateUserProfile(updates);
                console.log('Profile update result:', result);

                if (result.success) {
                    // Update display values
                    document.getElementById('profile-first-name').textContent = firstName;
                    document.getElementById('profile-last-name').textContent = lastName;
                    document.getElementById('profile-phone').textContent = phone || 'Not provided';

                    // Update sidebar and welcome message
                    const fullName = `${firstName} ${lastName}`.trim();
                    document.getElementById('user-name').textContent = 'Parishioner';
                    document.getElementById('user-email').textContent = fullName;
                    document.getElementById('welcome-name').textContent = firstName;
                    // Update header mini profile after save
                    const headerRoleEl3 = document.getElementById('header-user-role');
                    const headerNameEl3 = document.getElementById('header-user-fullname');
                    const headerAvatarEl3 = document.getElementById('header-user-avatar');
                    if (headerRoleEl3) headerRoleEl3.textContent = 'Parishioner';
                    if (headerNameEl3) headerNameEl3.textContent = fullName || 'User';
                    if (headerAvatarEl3) headerAvatarEl3.textContent = (firstName || 'U').charAt(0).toUpperCase();

                    // Update avatar
                    const avatarElement = document.getElementById('user-avatar');
                    if (avatarElement) {
                        avatarElement.textContent = firstName.charAt(0).toUpperCase();
                    }

                    // Hide edit form, show view mode
                    profileEditForm.classList.add('hidden');
                    profileViewMode.classList.remove('hidden');

                    showDashboardMessage('Profile updated successfully!', 'success');
                } else {
                    console.error('Profile update failed:', result.error);
                    showDashboardMessage(result.error || 'Failed to update profile.', 'error');
                }
            } catch (error) {
                console.error('Profile update error:', error);
                showDashboardMessage('Failed to update profile. Please try again.', 'error');
            } finally {
                saveProfileBtn.disabled = false;
                saveProfileBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save Changes';
            }
        });
    }

    // Password change functionality
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            passwordChangeForm.classList.remove('hidden');
            changePasswordBtn.classList.add('hidden');
        });
    }

    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', function() {
            passwordChangeForm.classList.add('hidden');
            changePasswordBtn.classList.remove('hidden');
            passwordChangeForm.reset();
            resetPasswordStrength();
        });
    }

    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            const formData = new FormData(passwordChangeForm);
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmNewPassword');

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                showDashboardMessage('All password fields are required.', 'error');
                return;
            }

            const { strength } = checkPasswordStrength(newPassword);
            if (strength < 3) {
                showDashboardMessage('New password is too weak. Please choose a stronger password.', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showDashboardMessage('New passwords do not match.', 'error');
                return;
            }

            // Disable save button
            savePasswordBtn.disabled = true;
            savePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i> Updating...';

            try {
                // First verify current password by attempting sign in
                const currentUser = churchAuth.getCurrentUser();
                if (!currentUser) {
                    showDashboardMessage('Session expired. Please login again.', 'error');
                    return;
                }

                // Try to sign in with current password to verify it
                const verifyResult = await churchAuth.signIn(currentUser.email, currentPassword, false);
                if (!verifyResult.success) {
                    showDashboardMessage('Current password is incorrect.', 'error');
                    return;
                }

                // Update password
                const result = await churchAuth.updatePassword(newPassword);

                if (result.success) {
                    passwordChangeForm.classList.add('hidden');
                    changePasswordBtn.classList.remove('hidden');
                    passwordChangeForm.reset();
                    resetPasswordStrength();
                    showDashboardMessage('Password updated successfully!', 'success');
                } else {
                    showDashboardMessage(result.error || 'Failed to update password.', 'error');
                }
            } catch (error) {
                console.error('Password update error:', error);
                showDashboardMessage('Failed to update password. Please try again.', 'error');
            } finally {
                savePasswordBtn.disabled = false;
                savePasswordBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Update Password';
            }
        });
    }

    // Password visibility toggles
    const passwordToggles = [
        { button: 'toggle-current-password', input: 'current-password' },
        { button: 'toggle-new-password', input: 'new-password' },
        { button: 'toggle-confirm-password', input: 'confirm-new-password' }
    ];

    passwordToggles.forEach(({ button, input }) => {
        const toggleBtn = document.getElementById(button);
        const inputField = document.getElementById(input);

        if (toggleBtn && inputField) {
            toggleBtn.addEventListener('click', function() {
                const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
                inputField.setAttribute('type', type);
                this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        }
    });

    // Password strength indicator for new password
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }

    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirm-new-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = newPasswordInput.value;
            const confirmPassword = this.value;
            const feedback = document.getElementById('confirm-password-feedback');

            if (confirmPassword && password !== confirmPassword) {
                feedback.textContent = 'Passwords do not match';
                feedback.classList.remove('hidden');
                this.classList.add('border-red-500');
                this.classList.remove('border-gray-300');
            } else {
                feedback.classList.add('hidden');
                this.classList.remove('border-red-500');
                this.classList.add('border-gray-300');
            }
        });
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength++;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) strength++;
    else feedback.push('Lowercase letter');

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('Uppercase letter');

    if (/[0-9]/.test(password)) strength++;
    else feedback.push('Number');

    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('Special character');

    return { strength, feedback };
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthBars = ['strength-1', 'strength-2', 'strength-3', 'strength-4'];
    const feedbackElement = document.getElementById('password-feedback');

    if (!password) {
        strengthBars.forEach(id => {
            document.getElementById(id).className = 'h-0.5 w-1/4 bg-gray-200 rounded';
        });
        if (feedbackElement) feedbackElement.textContent = 'Use uppercase, lowercase, number & symbol';
        return;
    }

    const { strength, feedback } = checkPasswordStrength(password);

    strengthBars.forEach((id, index) => {
        const element = document.getElementById(id);
        if (index < strength) {
            if (strength <= 2) element.className = 'h-0.5 w-1/4 bg-red-400 rounded';
            else if (strength <= 3) element.className = 'h-0.5 w-1/4 bg-yellow-400 rounded';
            else if (strength <= 4) element.className = 'h-0.5 w-1/4 bg-blue-400 rounded';
            else element.className = 'h-0.5 w-1/4 bg-green-400 rounded';
        } else {
            element.className = 'h-0.5 w-1/4 bg-gray-200 rounded';
        }
    });

    if (feedbackElement) {
        if (strength >= 4) {
            feedbackElement.textContent = 'Strong password!';
            feedbackElement.className = 'text-xs text-green-600';
        } else if (strength >= 3) {
            feedbackElement.textContent = 'Good password. ' + feedback.join(', ') + ' would make it stronger.';
            feedbackElement.className = 'text-xs text-blue-600';
        } else if (strength >= 2) {
            feedbackElement.textContent = 'Weak password. Add: ' + feedback.join(', ');
            feedbackElement.className = 'text-xs text-yellow-600';
        } else {
            feedbackElement.textContent = 'Very weak password. Add: ' + feedback.join(', ');
            feedbackElement.className = 'text-xs text-red-600';
        }
    }
}

// Reset password strength indicator
function resetPasswordStrength() {
    const strengthBars = ['strength-1', 'strength-2', 'strength-3', 'strength-4'];
    strengthBars.forEach(id => {
        document.getElementById(id).className = 'h-0.5 w-1/4 bg-gray-200 rounded';
    });
    const feedbackElement = document.getElementById('password-feedback');
    if (feedbackElement) {
        feedbackElement.textContent = 'Use uppercase, lowercase, number & symbol';
        feedbackElement.className = 'text-xs text-gray-500';
    }
}

// Validation functions
function isValidName(name) {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone) || phone === '';
}

// Switch between sections
function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => {
        section.classList.add('hidden');
    });

    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Add active class to selected nav link
    const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }

    currentSection = sectionName;

    // Update page title
    updatePageTitle(sectionName);
}

// Update page title based on section
function updatePageTitle(section) {
    const titles = {
        dashboard: 'Dashboard - Our Mother of Perpetual Help Church',
        profile: 'My Profile - Our Mother of Perpetual Help Church',
        services: 'Services - Our Mother of Perpetual Help Church',
        announcements: 'Announcements - Our Mother of Perpetual Help Church',
        events: 'Events - Our Mother of Perpetual Help Church',
        settings: 'Settings - Our Mother of Perpetual Help Church'
    };

    document.title = titles[section] || 'Dashboard - Our Mother of Perpetual Help Church';
}

// Initialize logout functionality
function initializeLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            // Use custom modal popup instead of browser alert
            confirmLogout();

            async function confirmLogout() {
                // Remove any existing popup
                const existingPopup = document.getElementById('logout-popup');
                if (existingPopup) {
                    existingPopup.remove();
                }

                // Create popup overlay
                const overlay = document.createElement('div');
                overlay.id = 'logout-popup';
                overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                overlay.innerHTML = `
                    <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <div class="flex items-center mb-4">
                            <div class="flex-shrink-0 mr-3">
                                <i class="fas fa-sign-out-alt text-red-500 text-2xl"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-800">Confirm Logout</h3>
                            </div>
                        </div>
                        <p class="text-gray-700 mb-6">Are you sure you want to logout?</p>
                        <div class="flex gap-2">
                            <button onclick="closeLogoutPopup()" class="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                                Cancel
                            </button>
                            <button onclick="proceedLogout()" class="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                `;

                document.body.appendChild(overlay);

                // Define functions in global scope for onclick handlers
                window.closeLogoutPopup = function() {
                    const popup = document.getElementById('logout-popup');
                    if (popup) {
                        popup.remove();
                    }
                };

                window.proceedLogout = async function() {
                    closeLogoutPopup();
                    try {
                        console.log('Starting logout process...');

                        // Clear local storage immediately
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('rememberMe');

                        console.log('Local storage cleared, signing out from Supabase...');

                        // Sign out from Supabase
                        const { error } = await supabaseClient.auth.signOut();
                        if (error) {
                            console.error('Supabase signout error:', error);
                        }

                        console.log('Supabase signout completed, forcing redirect to login...');

                        // Force immediate redirect to login page
                        window.location.replace('/src/pages/auth/login.html');

                    } catch (error) {
                        console.error('Logout error:', error);
                        // Even if there's an error, redirect to login
                        window.location.replace('/src/pages/auth/login.html');
                    }
                };
            }
        });
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // This would load actual data from Supabase in a full implementation
        // For now, we'll just show placeholder data

        // You could load:
        // - Recent service requests
        // - Upcoming events
        // - Prayer request count
        // - Ministry memberships
        // etc.

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Show dashboard message
function showDashboardMessage(message, type = 'info') {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'success' ? 'bg-green-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Sidebar toggle functions for mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar.classList.contains('-translate-x-full')) {
        openSidebar();
    } else {
        closeSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// Handle window resize for sidebar
window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) {
        closeSidebar();
    }
});

// Handle browser back/forward navigation
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.section) {
        switchSection(event.state.section);
    }
});

// Export functions for global access
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;