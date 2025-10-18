// User Dashboard JavaScript - Our Mother of Perpetual Help Redemptorist Church

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('current_user');

    if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = '../auth/login.html';
        return;
    }

    const user = JSON.parse(currentUser);

    // Display user name
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        const firstName = user.first_name || user.firstName || 'User';
        const lastName = user.last_name || user.lastName || '';
        userNameElement.textContent = `${firstName} ${lastName}`.trim();
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    }

    // Add entrance animation
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(30px)';
        setTimeout(() => {
            mainContent.style.transition = 'all 0.8s ease-out';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 200);
    }
});

// Show logout confirmation modal
function showLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Close logout confirmation modal
function closeLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Confirm logout
function confirmLogout() {
    localStorage.removeItem('current_user');
    localStorage.removeItem('remember_user');
    window.location.href = '../auth/login.html';
}

// Profile dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const profileDropdownBtn = document.getElementById('profile-dropdown-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const dropdownIcon = document.getElementById('dropdown-icon');

    if (profileDropdownBtn && profileDropdown) {
        profileDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
            dropdownIcon.classList.toggle('rotate-180');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileDropdownBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('hidden');
                dropdownIcon.classList.remove('rotate-180');
            }
        });
    }
});

// Generate profile content with edit functionality
async function generateProfileContent() {
    console.log('generateProfileContent called');
    try {
        // Get current user from localStorage to get ID
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        console.log('Current user from localStorage:', currentUser);

        if (!currentUser.id) {
            console.error('No user ID found in localStorage');
            // Fallback to localStorage data
            const firstName = currentUser.first_name || currentUser.firstName || '';
            const lastName = currentUser.last_name || currentUser.lastName || '';
            const email = currentUser.email || '';
            const phone = currentUser.phone || '';
            const passwordHash = currentUser.password_hash || '';

            return generateProfileHTML(firstName, lastName, email, phone, passwordHash);
        }

        console.log('Fetching fresh data from Supabase for user ID:', currentUser.id);
        // Fetch fresh data from Supabase
        const { data: userData, error } = await supabaseClient
            .from(TABLES.USERS)
            .select('*')
            .eq('id', currentUser.id)
            .single();

        console.log('Supabase response:', { data: userData, error });

        if (error) {
            console.error('Error fetching user data:', error);
            // Fallback to localStorage data
            const firstName = currentUser.first_name || currentUser.firstName || '';
            const lastName = currentUser.last_name || currentUser.lastName || '';
            const email = currentUser.email || '';
            const phone = currentUser.phone || '';
            const passwordHash = currentUser.password_hash || '';

            return generateProfileHTML(firstName, lastName, email, phone, passwordHash);
        }

        // Use fresh data from database
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        const email = userData.email || '';
        const phone = userData.phone || '';
        const passwordHash = userData.password_hash || '';

        console.log('Using database data:', { firstName, lastName, email, phone });
        return generateProfileHTML(firstName, lastName, email, phone, passwordHash);

    } catch (error) {
        console.error('Error generating profile content:', error);
        // Fallback to localStorage
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        const firstName = currentUser.first_name || currentUser.firstName || '';
        const lastName = currentUser.last_name || currentUser.lastName || '';
        const email = currentUser.email || '';
        const phone = currentUser.phone || '';
        const passwordHash = currentUser.password_hash || '';

        return generateProfileHTML(firstName, lastName, email, phone, passwordHash);
    }
}

// Helper function to generate profile HTML
function generateProfileHTML(firstName, lastName, email, phone, passwordHash) {
    // Store password hash for password verification
    if (typeof window !== 'undefined') {
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        currentUser.password_hash = passwordHash;
        localStorage.setItem('current_user', JSON.stringify(currentUser));
    }

    return `
        <div class="max-w-4xl mx-auto">
            <!-- Compact Profile Header -->
            <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
                <div class="flex flex-col sm:flex-row items-center gap-4">
                    <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        ${firstName.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div class="text-center sm:text-left">
                        <h1 class="text-2xl font-display font-bold text-secondary mb-1">${firstName} ${lastName}</h1>
                        <p class="text-gray-600 text-sm mb-1">${email}</p>
                        <p class="text-gray-500 text-xs">Parish Member • Our Mother of Perpetual Help Church</p>
                    </div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <!-- Edit Profile Section -->
                <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <i class="fas fa-user-edit text-primary text-sm"></i>
                        </div>
                        <h2 class="text-lg font-display font-bold text-secondary">Edit Profile</h2>
                    </div>

                    <form id="profile-form" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    id="profile-first-name"
                                    value="${firstName}"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-900"
                                    required
                                    placeholder="First name"
                                >
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    id="profile-last-name"
                                    value="${lastName}"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-900"
                                    required
                                    placeholder="Last name"
                                >
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                            <input
                                type="email"
                                id="profile-email"
                                value="${email}"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-900"
                                required
                                placeholder="your.email@example.com"
                            >
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                id="profile-phone"
                                value="${phone}"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-900"
                                placeholder="(035) 123-4567"
                            >
                        </div>

                        <button
                            type="submit"
                            id="update-profile-btn"
                            class="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-primary/90 transition-all duration-300 shadow hover:shadow-md transform hover:-translate-y-0.5"
                        >
                            <i class="fas fa-save mr-2"></i>Save Changes
                        </button>
                    </form>
                </div>

                <!-- Change Password Section -->
                <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-shield-alt text-green-600 text-sm"></i>
                        </div>
                        <h2 class="text-lg font-display font-bold text-secondary">Change Password</h2>
                    </div>

                    <form id="password-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">Current Password *</label>
                            <div class="relative">
                                <input
                                    type="password"
                                    id="current-password"
                                    class="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                    required
                                    placeholder="Current password"
                                >
                                <button
                                    type="button"
                                    id="toggle-current-password"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors text-xs"
                                    title="Toggle password visibility"
                                >
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">New Password *</label>
                            <div class="relative">
                                <input
                                    type="password"
                                    id="new-password"
                                    class="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                    required
                                    placeholder="New password"
                                    minlength="6"
                                >
                                <button
                                    type="button"
                                    id="toggle-new-password"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors text-xs"
                                    title="Toggle password visibility"
                                >
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">Confirm Password *</label>
                            <div class="relative">
                                <input
                                    type="password"
                                    id="confirm-new-password"
                                    class="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                    required
                                    placeholder="Confirm password"
                                >
                                <button
                                    type="button"
                                    id="toggle-confirm-password"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors text-xs"
                                    title="Toggle password visibility"
                                >
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            id="change-password-btn"
                            class="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-green-600/90 transition-all duration-300 shadow hover:shadow-md transform hover:-translate-y-0.5"
                        >
                            <i class="fas fa-key mr-2"></i>Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
}
// Sidebar navigation with content switching
document.addEventListener('DOMContentLoaded', async function() {
    const sidebarLinks = document.querySelectorAll('#sidebar nav a, #profile-dropdown a');
    const contentArea = document.getElementById('content-area');

    // Generate profile content dynamically
    const profileContent = await generateProfileContent();

    // Content for each section
    const sectionContent = {
        'dashboard': {
            icon: 'fas fa-tachometer-alt',
            title: 'Dashboard',
            description: 'Welcome to your dashboard! Use the sidebar to navigate between different sections.'
        },
        'profile': {
            icon: 'fas fa-user',
            title: 'My Profile',
            content: profileContent
        },
        'services': {
            icon: 'fas fa-certificate',
            title: 'Services',
            description: 'View and manage your sacramental services, certificates, and church records.'
        },
        'events': {
            icon: 'fas fa-calendar-alt',
            title: 'Events',
            description: 'Browse upcoming church events, register for activities, and view your participation history.'
        },
        'prayers': {
            icon: 'fas fa-pray',
            title: 'Prayer Requests',
            description: 'Submit prayer intentions, view community prayers, and track your spiritual requests.'
        }
    };

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('bg-primary/10', 'text-primary'));
            sidebarLinks.forEach(l => l.classList.add('text-gray-700'));

            // Add active class to clicked link
            this.classList.remove('text-gray-700');
            this.classList.add('bg-primary/10', 'text-primary');

            // Get section name and update content
            const section = this.getAttribute('href').substring(1);
            const content = sectionContent[section];

            if (content && contentArea) {
                if (content.content) {
                    // Custom content (like profile page)
                    contentArea.innerHTML = content.content;
                } else {
                    // Default content structure
                    contentArea.innerHTML = `
                        <div class="text-center py-16">
                            <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i class="${content.icon} text-primary text-4xl"></i>
                            </div>
                            <h2 class="text-3xl font-display font-bold text-secondary mb-4">${content.title}</h2>
                            <p class="text-gray-600 text-lg max-w-2xl mx-auto">
                                ${content.description}
                            </p>
                        </div>
                    `;
                }
            }

            // Close sidebar on mobile after clicking a link (like admin panel)
            const sidebar = document.getElementById('sidebar');
            if (sidebar && window.innerWidth < 768) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    });

    // Set default active state (Dashboard)
    const dashboardLink = document.querySelector('#sidebar nav a[href="#dashboard"]');
    if (dashboardLink) {
        dashboardLink.click();
    }

    // Handle profile form submission - Use event delegation since form is dynamically generated
    document.addEventListener('submit', async function(e) {
        if (e.target && e.target.id === 'profile-form') {
            console.log('Profile form submitted via event delegation');
            e.preventDefault();
            e.preventDefault();
            console.log('Profile form submitted');

            const updateBtn = document.getElementById('update-profile-btn');
            const originalText = updateBtn.innerHTML;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';
            updateBtn.disabled = true;

            const updatedData = {
                first_name: document.getElementById('profile-first-name').value.trim(),
                last_name: document.getElementById('profile-last-name').value.trim(),
                email: document.getElementById('profile-email').value.trim().toLowerCase(),
                phone: document.getElementById('profile-phone').value.trim(),
                updated_at: new Date().toISOString()
            };

            console.log('Updated data:', updatedData);

            // Basic validation
            if (!updatedData.first_name || !updatedData.last_name || !updatedData.email) {
                showErrorMessage('Validation Error', 'First name, last name, and email are required.');
                updateBtn.innerHTML = originalText;
                updateBtn.disabled = false;
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updatedData.email)) {
                showErrorMessage('Validation Error', 'Please enter a valid email address.');
                updateBtn.innerHTML = originalText;
                updateBtn.disabled = false;
                return;
            }

            try {
                const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
                console.log('Current user from localStorage:', currentUser);

                if (!currentUser.id) {
                    console.error('No user ID found in localStorage');
                    showErrorMessage('Authentication Error', 'User session expired. Please log in again.');
                    updateBtn.innerHTML = originalText;
                    updateBtn.disabled = false;
                    return;
                }

                // Check if email is already taken by another user
                if (updatedData.email !== currentUser.email) {
                    console.log('Checking for duplicate email...');
                    const { data: existingUser } = await supabaseClient
                        .from(TABLES.USERS)
                        .select('id')
                        .eq('email', updatedData.email)
                        .neq('id', currentUser.id)
                        .single();

                    if (existingUser) {
                        showErrorMessage('Email Taken', 'This email address is already registered by another user.');
                        updateBtn.innerHTML = originalText;
                        updateBtn.disabled = false;
                        return;
                    }
                }

                console.log('Updating user in database...');
                console.log('Update data:', updatedData);
                console.log('User ID:', currentUser.id);

                // Update user in database
                const { data, error } = await supabaseClient
                    .from(TABLES.USERS)
                    .update(updatedData)
                    .eq('id', currentUser.id)
                    .select();

                console.log('Database update response:', { data, error });

                if (error) {
                    console.error('Database error:', error);
                    throw error;
                }

                console.log('Database update successful, returned data:', data);

                console.log('Update successful, updating localStorage...');
                // Update local storage with the returned data from database
                const updatedUser = { ...currentUser, ...data[0] };
                console.log('Updated user object:', updatedUser);
                localStorage.setItem('current_user', JSON.stringify(updatedUser));

                // Update display name in header
                const userNameElement = document.getElementById('user-name');
                if (userNameElement) {
                    userNameElement.textContent = `${updatedData.first_name} ${updatedData.last_name}`.trim();
                }

                // Update profile header - find by more specific selector
                const profileHeaderName = document.querySelector('h1.text-3xl.font-display.font-bold.text-secondary');
                if (profileHeaderName) {
                    profileHeaderName.textContent = `${updatedData.first_name} ${updatedData.last_name}`;
                }

                const profileHeaderEmail = document.querySelector('p.text-gray-600.text-lg.mb-1');
                if (profileHeaderEmail) {
                    profileHeaderEmail.textContent = updatedData.email;
                }

                // Update the form fields with the returned database data to reflect changes
                if (data && data[0]) {
                    document.getElementById('profile-first-name').value = data[0].first_name || '';
                    document.getElementById('profile-last-name').value = data[0].last_name || '';
                    document.getElementById('profile-email').value = data[0].email || '';
                    document.getElementById('profile-phone').value = data[0].phone || '';
                }

                // Show success message
                showSuccessMessage('Profile Updated', 'Your profile information has been successfully updated.');
                updateBtn.innerHTML = originalText;
                updateBtn.disabled = false;

            } catch (error) {
                console.error('Error updating profile:', error);
                showErrorMessage('Update Failed', 'Failed to update profile. Please try again.');
                updateBtn.innerHTML = originalText;
                updateBtn.disabled = false;
            }
        }
    });

    // Handle password change form submission - Use event delegation
    document.addEventListener('submit', async function(e) {
        if (e.target && e.target.id === 'password-form') {
            console.log('Password form submitted via event delegation');
            e.preventDefault();

            const changeBtn = document.getElementById('change-password-btn');
            const originalText = changeBtn.innerHTML;
            changeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Changing...';
            changeBtn.disabled = true;

            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-new-password').value;

            console.log('Password form values:', { currentPassword: '***', newPassword: '***', confirmPassword: '***' });

            // Validate passwords
            if (newPassword !== confirmPassword) {
                showErrorMessage('Validation Error', 'New passwords do not match.');
                changeBtn.innerHTML = originalText;
                changeBtn.disabled = false;
                return;
            }

            if (newPassword.length < 6) {
                showErrorMessage('Validation Error', 'New password must be at least 6 characters long.');
                changeBtn.innerHTML = originalText;
                changeBtn.disabled = false;
                return;
            }

            try {
                const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
                console.log('Current user for password change:', currentUser);

                // First verify current password by checking against stored hash
                const isCurrentPasswordValid = await SupabaseUsers.verifyPassword(currentPassword, currentUser.password_hash || '');
                console.log('Password verification result:', isCurrentPasswordValid);
                if (!isCurrentPasswordValid) {
                    showErrorMessage('Authentication Failed', 'Current password is incorrect.');
                    changeBtn.innerHTML = originalText;
                    changeBtn.disabled = false;
                    return;
                }

                console.log('Password verified, hashing new password...');
                // Hash new password and update in database
                const hashedPassword = await SupabaseUsers.hashPassword(newPassword);
                console.log('New password hashed, updating database...');
                const { error } = await supabaseClient
                    .from(TABLES.USERS)
                    .update({
                        password_hash: hashedPassword,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentUser.id);

                if (error) {
                    console.error('Database update error:', error);
                    throw error;
                }

                console.log('Database updated successfully');
                // Update localStorage with new password hash
                currentUser.password_hash = hashedPassword;
                localStorage.setItem('current_user', JSON.stringify(currentUser));

                // Clear form
                e.target.reset();

                // Reset password visibility toggles after a short delay to ensure form reset is complete
                setTimeout(() => {
                    const toggleButtons = [
                        { buttonId: 'toggle-current-password', inputId: 'current-password' },
                        { buttonId: 'toggle-new-password', inputId: 'new-password' },
                        { buttonId: 'toggle-confirm-password', inputId: 'confirm-new-password' }
                    ];
                    toggleButtons.forEach(({ buttonId, inputId }) => {
                        const button = document.getElementById(buttonId);
                        const input = document.getElementById(inputId);
                        if (button && input) {
                            input.setAttribute('type', 'password');
                            button.querySelector('i').className = 'fas fa-eye';
                        }
                    });
                }, 50);

                // Show success message
                showSuccessMessage('Password Changed', 'Your password has been successfully updated.');
                changeBtn.innerHTML = originalText;
                changeBtn.disabled = false;

            } catch (error) {
                console.error('Error changing password:', error);
                showErrorMessage('Update Failed', 'Failed to change password. Please try again.');
                changeBtn.innerHTML = originalText;
                changeBtn.disabled = false;
            }
        }
    });

    // Add password toggle functionality with event delegation
    document.addEventListener('click', function(e) {
        const toggleButtons = [
            { buttonId: 'toggle-current-password', inputId: 'current-password' },
            { buttonId: 'toggle-new-password', inputId: 'new-password' },
            { buttonId: 'toggle-confirm-password', inputId: 'confirm-new-password' }
        ];

        toggleButtons.forEach(({ buttonId, inputId }) => {
            if (e.target && (e.target.id === buttonId || e.target.closest(`#${buttonId}`) || e.target.querySelector(`#${buttonId}`))) {
                e.preventDefault();
                const input = document.getElementById(inputId);
                if (input) {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    // Find the icon element - check multiple possible locations
                    let icon = null;
                    if (e.target.id === buttonId) {
                        icon = e.target.querySelector('i');
                    } else if (e.target.closest(`#${buttonId}`)) {
                        icon = e.target.closest(`#${buttonId}`).querySelector('i');
                    } else if (e.target.querySelector(`#${buttonId}`)) {
                        icon = e.target.querySelector(`#${buttonId}`).querySelector('i');
                    }
                    if (icon) {
                        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                    }
                }
            }
        });
    });

    // Reset profile form function
    window.resetProfileForm = function() {
        // Get fresh data from database instead of localStorage
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        if (currentUser.id) {
            supabaseClient
                .from(TABLES.USERS)
                .select('*')
                .eq('id', currentUser.id)
                .single()
                .then(({ data, error }) => {
                    if (!error && data) {
                        document.getElementById('profile-first-name').value = data.first_name || '';
                        document.getElementById('profile-last-name').value = data.last_name || '';
                        document.getElementById('profile-email').value = data.email || '';
                        document.getElementById('profile-phone').value = data.phone || '';
                    }
                })
                .catch(error => {
                    console.error('Error resetting profile form:', error);
                    // Fallback to localStorage
                    document.getElementById('profile-first-name').value = currentUser.first_name || '';
                    document.getElementById('profile-last-name').value = currentUser.last_name || '';
                    document.getElementById('profile-email').value = currentUser.email || '';
                    document.getElementById('profile-phone').value = currentUser.phone || '';
                });
        }
    };

    // Reset password form function
    window.resetPasswordForm = function() {
        document.getElementById('password-form').reset();
        // Reset password visibility toggles
        const toggleButtons = ['toggle-current-password', 'toggle-new-password', 'toggle-confirm-password'];
        toggleButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.querySelector('i').className = 'fas fa-eye';
            }
        });
    };
});

// Success message display function
function showSuccessMessage(title, message) {
    const modal = document.createElement('div');
    modal.id = 'success-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check text-green-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">${title}</h3>
            <p class="text-gray-600 mb-6">${message}</p>
            <button
                onclick="closeSuccessModal()"
                class="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-all duration-300"
            >
                OK
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Error message display function
function showErrorMessage(title, message) {
    const modal = document.createElement('div');
    modal.id = 'error-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">${title}</h3>
            <p class="text-gray-600 mb-6">${message}</p>
            <button
                onclick="closeErrorModal()"
                class="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-300"
            >
                OK
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Close success modal
function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.remove();
}

// Close error modal
function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    if (modal) modal.remove();
}