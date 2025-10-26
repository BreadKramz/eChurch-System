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
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth < 768) {
                const sidebar = document.getElementById('sidebar');
                const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                if (sidebar && mobileMenuBtn) {
                    // Check if click is outside both sidebar and button
                    const isClickOutside = !sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target);
                    if (isClickOutside) {
                        sidebar.classList.add('-translate-x-full');
                        sidebar.classList.remove('open');
                    }
                }
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

    // Load dashboard stats and content when the page loads
    if (window.location.hash === '#dashboard' || window.location.hash === '') {
        setTimeout(() => {
            loadDashboardStats();
            // Set default dashboard content
            const contentArea = document.getElementById('content-area');
            if (contentArea && !contentArea.innerHTML.trim()) {
                showSection('dashboard');
            }
        }, 100);
    } else if (window.location.hash === '#my-requests') {
        setTimeout(() => loadMyRequests(), 100);
    } else if (window.location.hash === '#announcements') {
        setTimeout(() => loadAnnouncements(), 100);
    } else if (window.location.hash === '#events') {
        setTimeout(() => loadEvents(), 100);
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
            content: `
                <div class="max-w-4xl mx-auto">
                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mx-auto mb-2">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="text-lg font-bold text-green-900" id="user-events-count">0</div>
                            <div class="text-green-700 font-medium text-xs">Upcoming Events</div>
                        </div>
                        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                            <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm mx-auto mb-2">
                                <i class="fas fa-bullhorn"></i>
                            </div>
                            <div class="text-lg font-bold text-purple-900" id="user-announcements-count">0</div>
                            <div class="text-purple-700 font-medium text-xs">Announcements</div>
                        </div>
                        <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                            <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm mx-auto mb-2">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="text-lg font-bold text-orange-900" id="user-pending-count">0</div>
                            <div class="text-orange-700 font-medium text-xs">Pending Requests</div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="grid md:grid-cols-2 gap-6 mb-8">
                        <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <i class="fas fa-certificate text-primary text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg font-display font-bold text-secondary">Request Services</h3>
                                    <p class="text-gray-600 text-sm">Submit requests for certificates, sacraments, and church services</p>
                                </div>
                            </div>
                            <button class="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow hover:shadow-md transform hover:-translate-y-0.5" id="request-services-btn">
                                <i class="fas fa-plus mr-2"></i>Request Services
                            </button>
                        </div>

                        <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <i class="fas fa-list text-green-600 text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg font-display font-bold text-secondary">My Requests</h3>
                                    <p class="text-gray-600 text-sm">Track the status of all your submitted service requests</p>
                                </div>
                            </div>
                            <button class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-all duration-300 shadow hover:shadow-md transform hover:-translate-y-0.5" id="view-my-requests-btn">
                                <i class="fas fa-eye mr-2"></i>View My Requests
                            </button>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <i class="fas fa-history text-primary text-sm"></i>
                            </div>
                            <h3 class="text-lg font-display font-bold text-secondary">Recent Activity</h3>
                        </div>

                        <div id="recent-activity" class="space-y-3">
                            <div class="text-center text-gray-500 py-6">
                                <i class="fas fa-spinner fa-spin text-2xl mb-3 text-primary"></i>
                                <p>Loading recent activity...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        'profile': {
            icon: 'fas fa-user',
            title: 'My Profile',
            content: profileContent
        },
        'services': {
            icon: 'fas fa-certificate',
            title: 'Services',
            content: `
                <div class="max-w-4xl mx-auto">
                    <div class="text-center mb-4">
                        <h2 class="text-3xl font-display font-bold text-secondary mb-4">Church Services</h2>
                        <div class="flex justify-center gap-4">
                            <button onclick="showCertificateSection()" class="flex-1 max-w-xs text-center bg-white rounded-lg p-3 shadow border border-gray-100 hover:bg-gray-50 transition-all duration-200">
                                <h3 class="text-base font-display font-bold text-secondary">Certificate Request</h3>
                            </button>

                            <button onclick="showServiceSection()" class="flex-1 max-w-xs text-center bg-white rounded-lg p-3 shadow border border-gray-100 hover:bg-gray-50 transition-all duration-200">
                                <h3 class="text-base font-display font-bold text-secondary">Sacramental Service</h3>
                            </button>
                        </div>
                    </div>

                    <!-- Certificate Request Form (Hidden by default) -->
                    <div id="certificate-form" class="hidden bg-white rounded-xl p-6 shadow-lg border border-gray-100 mt-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-display font-bold text-secondary">Certificate Request Form</h3>
                            <button onclick="hideCertificateSection()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Certificate Type *</label>
                                <select id="certificate-type" onchange="toggleCertificateFields()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                    <option value="">Select Certificate Type</option>
                                    <option value="confirmation">Confirmation Certificate</option>
                                    <option value="mass-offering">Mass Offering Certificate</option>
                                    <option value="funeral">Funeral Certificate</option>
                                    <option value="mass-card">Mass Card Certificate</option>
                                    <option value="sick-call">Sick Call Certificate</option>
                                    <option value="marriage">Marriage Certificate</option>
                                    <option value="baptism">Baptism Certificate</option>
                                </select>
                            </div>

                            <!-- Baptism Certificate Specific Fields -->
                            <div id="baptism-fields" class="hidden space-y-4 border-t border-gray-200 pt-4">
                                <h4 class="text-lg font-semibold text-gray-800 mb-3">Baptism Certificate Information</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of Child *</label>
                                        <input type="text" id="baptism-child-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Full name of the child">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Date of Birth *</label>
                                        <input type="date" id="baptism-birth-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Place of Birth *</label>
                                        <input type="text" id="baptism-birth-place" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="City, Province, Country">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Legitimate or Illegitimate *</label>
                                        <select id="baptism-legitimacy" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select</option>
                                            <option value="legitimate">Legitimate</option>
                                            <option value="illegitimate">Illegitimate</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Father's Name *</label>
                                        <input type="text" id="baptism-father-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Full name of father">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Mother's Name *</label>
                                        <input type="text" id="baptism-mother-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Full name of mother">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Father (Are you Catholic?) *</label>
                                        <select id="baptism-father-catholic" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Father's Religion *</label>
                                        <input type="text" id="baptism-father-religion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="If not Catholic, specify religion">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Father (Are you confirmed?) *</label>
                                        <select id="baptism-father-confirmed" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Where? *</label>
                                        <input type="text" id="baptism-father-confirmation-place" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Place of confirmation">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Mother (Are you Catholic?) *</label>
                                        <select id="baptism-mother-catholic" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Mother's Religion *</label>
                                        <input type="text" id="baptism-mother-religion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="If not Catholic, specify religion">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Mother (Are you confirmed?) *</label>
                                        <select id="baptism-mother-confirmed" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Where? *</label>
                                        <input type="text" id="baptism-mother-confirmation-place" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Place of confirmation">
                                    </div>
                                </div>
                            </div>

                            <!-- Confirmation Certificate Specific Fields -->
                            <div id="confirmation-fields" class="hidden space-y-4 border-t border-gray-200 pt-4">
                                <h4 class="text-lg font-semibold text-gray-800 mb-3">Confirmation Certificate Information</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of Child *</label>
                                        <input type="text" id="confirmation-child-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Full name of the child">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Date of Birth *</label>
                                        <input type="date" id="confirmation-birth-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Place of Birth *</label>
                                        <input type="text" id="confirmation-birth-place" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="City, Province, Country">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Legitimate or Illegitimate *</label>
                                        <select id="confirmation-legitimacy" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select</option>
                                            <option value="legitimate">Legitimate</option>
                                            <option value="illegitimate">Illegitimate</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Father's Name *</label>
                                        <input type="text" id="confirmation-father-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Full name of father">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Mother's Name *</label>
                                        <input type="text" id="confirmation-mother-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Full name of mother">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Father (Are you Catholic?) *</label>
                                        <select id="confirmation-father-catholic" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Father's Religion *</label>
                                        <input type="text" id="confirmation-father-religion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="If not Catholic, specify religion">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Father (Are you confirmed?) *</label>
                                        <select id="confirmation-father-confirmed" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Where? *</label>
                                        <input type="text" id="confirmation-father-confirmation-place" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Place of confirmation">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Mother (Are you Catholic?) *</label>
                                        <select id="confirmation-mother-catholic" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Mother's Religion *</label>
                                        <input type="text" id="confirmation-mother-religion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="If not Catholic, specify religion">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Mother (Are you confirmed?) *</label>
                                        <select id="confirmation-mother-confirmed" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Where? *</label>
                                        <input type="text" id="confirmation-mother-confirmation-place" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Place of confirmation">
                                    </div>
                                </div>
                            </div>

                            <!-- Mass Offering Certificate Specific Fields -->
                            <div id="mass-offering-fields" class="hidden space-y-4 border-t border-gray-200 pt-4">
                                <h4 class="text-lg font-semibold text-gray-800 mb-3">Mass Offering Information</h4>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Names of Souls *</label>
                                    <textarea id="mass-offering-souls" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Names of the souls for whom the mass is being offered (one per line)"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Petitions *</label>
                                    <textarea id="mass-offering-petitions" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Specific petitions or intentions for the mass"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Thanksgiving *</label>
                                    <textarea id="mass-offering-thanksgiving" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Thanksgiving intentions or gratitude to express"></textarea>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Time and Day *</label>
                                        <input type="text" id="mass-offering-time-day" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Preferred time and day (e.g., Sunday 9:00 AM)">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of the Informant *</label>
                                        <input type="text" id="mass-offering-informant" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Name of person requesting the mass offering">
                                    </div>
                                </div>
                            </div>

                            <!-- Funeral Certificate Specific Fields -->
                            <div id="funeral-fields" class="hidden space-y-4 border-t border-gray-200 pt-4">
                                <h4 class="text-lg font-semibold text-gray-800 mb-3">Funeral Certificate Information</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of the Deceased *</label>
                                        <input type="text" id="funeral-deceased-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Full name of the deceased">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
                                        <input type="number" id="funeral-age" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Age at time of death">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
                                        <select id="funeral-gender" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Civil Status *</label>
                                        <select id="funeral-civil-status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select Civil Status</option>
                                            <option value="single">Single</option>
                                            <option value="married">Married</option>
                                            <option value="widowed">Widowed</option>
                                            <option value="divorced">Divorced</option>
                                            <option value="separated">Separated</option>
                                        </select>
                                    </div>
                                </div>
                                <div id="spouse-field" class="hidden">
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">If married, name of spouse *</label>
                                    <input type="text" id="funeral-spouse-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Name of spouse">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Address of deceased *</label>
                                    <input type="text" id="funeral-address" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Complete address">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Describe him/her as a person *</label>
                                    <textarea id="funeral-description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Brief description of the person's character, values, and life"></textarea>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Work/Occupation *</label>
                                        <input type="text" id="funeral-occupation" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Profession or occupation">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Church Involvement *</label>
                                        <input type="text" id="funeral-church-involvement" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Ministries, roles, or involvement">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Cause of Death *</label>
                                        <input type="text" id="funeral-cause-of-death" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Cause of death">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Date of Death *</label>
                                        <input type="date" id="funeral-date-of-death" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of Informant *</label>
                                        <input type="text" id="funeral-informant-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Name of person providing information">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Contact Number of Informant *</label>
                                        <input type="tel" id="funeral-informant-contact" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="(035) 123-4567">
                                    </div>
                                </div>
                            </div>

                            <!-- Mass Card Certificate Specific Fields -->
                            <div id="mass-card-fields" class="hidden space-y-4 border-t border-gray-200 pt-4">
                                <h4 class="text-lg font-semibold text-gray-800 mb-3">Mass Card Information</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of the Deceased *</label>
                                        <input type="text" id="mass-card-deceased-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Full name of the deceased">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">From *</label>
                                        <input type="text" id="mass-card-from" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Name of person/family requesting">
                                    </div>
                                </div>
                            </div>

                            <!-- Sick Call Certificate Specific Fields -->
                            <div id="sick-call-fields" class="hidden space-y-4 border-t border-gray-200 pt-4">
                                <h4 class="text-lg font-semibold text-gray-800 mb-3">Patient Information</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                                        <input type="text" id="sick-call-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Full name of patient">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
                                        <input type="number" id="sick-call-age" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Age in years">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Sex *</label>
                                        <select id="sick-call-sex" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select Sex</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Civil Status *</label>
                                        <select id="sick-call-civil-status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                            <option value="">Select Civil Status</option>
                                            <option value="single">Single</option>
                                            <option value="married">Married</option>
                                            <option value="widowed">Widowed</option>
                                            <option value="divorced">Divorced</option>
                                            <option value="separated">Separated</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Status of the Patient *</label>
                                    <select id="sick-call-status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                        <option value="">Select Patient Status</option>
                                        <option value="critical">Critical</option>
                                        <option value="serious">Serious</option>
                                        <option value="stable">Stable</option>
                                        <option value="improving">Improving</option>
                                        <option value="terminal">Terminal</option>
                                    </select>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of Contact Person *</label>
                                        <input type="text" id="sick-call-contact-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Emergency contact name">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">Contact Number *</label>
                                        <input type="tel" id="sick-call-contact-number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="(035) 123-4567">
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Additional Details</label>
                                <textarea id="certificate-details" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Please provide any additional information..."></textarea>
                            </div>
                            <button onclick="requestCertificate()" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300">
                                <i class="fas fa-paper-plane mr-2"></i>Submit Certificate Request
                            </button>
                        </div>
                    </div>

                    <!-- Service Request Form (Hidden by default) -->
                    <div id="service-form" class="hidden bg-white rounded-xl p-6 shadow-lg border border-gray-100 mt-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-display font-bold text-secondary">Service Request Form</h3>
                            <button onclick="hideServiceSection()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Sacramental Service *</label>
                                <select id="service-type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200">
                                    <option value="">Select Sacramental Service</option>
                                    <option value="baptism-service">Baptism Service</option>
                                    <option value="confirmation-service">Confirmation Service</option>
                                    <option value="communion">First Holy Communion</option>
                                    <option value="marriage-service">Marriage / Matrimony Service</option>
                                    <option value="anointing">Anointing of the Sick</option>
                                    <option value="funeral-service">Funeral Rites / Burial Masses</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                                <input type="date" id="service-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Additional Details</label>
                                <textarea id="service-details" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Please provide any additional information..."></textarea>
                            </div>
                            <button onclick="requestService()" class="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-all duration-300">
                                <i class="fas fa-paper-plane mr-2"></i>Submit Service Request
                            </button>
                        </div>
                    </div>


                </div>
            `
        },
        'announcements': {
            icon: 'fas fa-bullhorn',
            title: 'Announcements',
            content: `
                <div class="max-w-6xl mx-auto">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-display font-bold text-secondary mb-6">Church Announcements</h2>

                        <!-- Announcements Grid -->
                        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="announcements-container">
                            <!-- Announcements will be loaded here -->
                            <div class="col-span-full text-center text-gray-500 py-12">
                                <i class="fas fa-spinner fa-spin text-4xl mb-4 text-primary"></i>
                                <p class="text-lg">Loading announcements...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        'my-requests': {
            icon: 'fas fa-list',
            title: 'My Requests',
            content: `
                <div class="max-w-4xl mx-auto">
                    <div class="text-center mb-4">
                        <h2 class="text-3xl font-display font-bold text-secondary mb-4">My Service Requests</h2>
                        <div class="flex gap-2 justify-center">
                            <button
                                id="user-filter-all"
                                class="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition-all duration-300"
                            >
                                All
                            </button>
                            <button
                                id="user-filter-certificates"
                                class="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-all duration-300"
                            >
                                Certificates
                            </button>
                            <button
                                id="user-filter-services"
                                class="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition-all duration-300"
                            >
                                Services
                            </button>
                        </div>
                    </div>

                    <div id="my-requests-list" class="space-y-4">
                        <!-- User's requests will be loaded here -->
                        <div class="text-center text-gray-500 py-8">
                            <i class="fas fa-spinner fa-spin text-3xl mb-3 text-primary"></i>
                            <p>Loading your requests...</p>
                        </div>
                    </div>
                </div>
            `
        },
        'events': {
            icon: 'fas fa-calendar-alt',
            title: 'Events',
            content: `
                <div class="max-w-6xl mx-auto">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-display font-bold text-secondary mb-6">Church Events</h2>

                        <!-- Events Grid -->
                        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="events-container">
                            <!-- Events will be loaded here -->
                            <div class="col-span-full text-center text-gray-500 py-12">
                                <i class="fas fa-spinner fa-spin text-4xl mb-4 text-primary"></i>
                                <p class="text-lg">Loading events...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
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

                    // Load content based on section
                    if (section === 'dashboard') {
                        setTimeout(() => loadDashboardStats(), 100);
                    } else if (section === 'my-requests') {
                        setTimeout(() => loadMyRequests(), 100);
                    } else if (section === 'announcements') {
                        setTimeout(() => loadAnnouncements(), 100);
                    } else if (section === 'events') {
                        setTimeout(() => loadEvents(), 100);
                    }
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
                sidebar.classList.remove('open');
            }
        });
    });

    // Set default active state (Dashboard) and load content
    const dashboardLink = document.querySelector('#sidebar nav a[href="#dashboard"]');
    if (dashboardLink) {
        dashboardLink.click();
        // Ensure dashboard content is loaded
        setTimeout(() => {
            if (!document.getElementById('content-area').innerHTML.trim()) {
                showSection('dashboard');
            }
        }, 200);
    }

    // Load announcements for users
    async function loadAnnouncements() {
        try {
            const result = await AdminUtils.getAllAnnouncements();
            const container = document.getElementById('announcements-container');

            if (!result.success || !result.data || result.data.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center text-gray-500 py-12">
                        <i class="fas fa-bullhorn text-5xl mb-4 text-gray-300"></i>
                        <p class="text-xl font-medium">No announcements yet</p>
                        <p class="text-base">Check back later for church announcements.</p>
                    </div>
                `;
                return;
            }

            // Filter only active announcements
            const activeAnnouncements = result.data.filter(announcement => announcement.status === 'active');

            if (activeAnnouncements.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center text-gray-500 py-12">
                        <i class="fas fa-bullhorn text-5xl mb-4 text-gray-300"></i>
                        <p class="text-xl font-medium">No active announcements</p>
                        <p class="text-base">Check back later for church announcements.</p>
                    </div>
                `;
                return;
            }

            const priorityColors = {
                'low': 'border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100',
                'normal': 'border-l-green-500 bg-gradient-to-br from-green-50 to-green-100',
                'high': 'border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100',
                'urgent': 'border-l-red-500 bg-gradient-to-br from-red-50 to-red-100'
            };

            const priorityIcons = {
                'low': 'fas fa-info-circle text-blue-600',
                'normal': 'fas fa-bell text-green-600',
                'high': 'fas fa-exclamation-triangle text-yellow-600',
                'urgent': 'fas fa-exclamation-circle text-red-600'
            };

            container.innerHTML = activeAnnouncements.map(announcement => `
                <div class="dashboard-announcement-card bg-white rounded-2xl p-6 border-l-4 ${priorityColors[announcement.priority] || 'border-l-gray-500 bg-gradient-to-br from-gray-50 to-gray-100'}">
                    <div class="flex flex-col gap-4">
                        <div class="flex items-start gap-4">
                            <div class="flex-shrink-0">
                                <div class="w-14 h-14 rounded-full flex items-center justify-center ${priorityColors[announcement.priority] ? priorityColors[announcement.priority].replace('border-l-', 'bg-').replace('-500', '-200').replace(' bg-gradient-to-br from-', 'bg-').replace(' to-', '/').replace('-50', '-100') : 'bg-gray-200'} shadow-lg dashboard-card-icon">
                                    <i class="${priorityIcons[announcement.priority] || 'fas fa-bullhorn text-gray-600'} text-2xl"></i>
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-3 mb-3">
                                    <h3 class="dashboard-card-title text-xl font-display font-bold text-gray-900 leading-tight">${announcement.title}</h3>
                                    <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full priority-badge-${announcement.priority} capitalize shadow-sm">
                                        ${announcement.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="ml-18">
                            <p class="dashboard-card-content text-gray-700 text-base leading-relaxed mb-4">${announcement.content}</p>
                            <div class="dashboard-card-meta flex items-center justify-between text-sm text-gray-500 pt-3">
                                <span class="flex items-center gap-2">
                                    <i class="fas fa-user text-primary"></i>
                                    ${announcement.users ? `${announcement.users.first_name} ${announcement.users.last_name}` : 'Church Administration'}
                                </span>
                                <span class="flex items-center gap-2">
                                    <i class="fas fa-calendar text-primary"></i>
                                    ${new Date(announcement.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading announcements:', error);
            const container = document.getElementById('announcements-container');
            container.innerHTML = `
                <div class="col-span-full text-center text-gray-500 py-12">
                    <i class="fas fa-exclamation-triangle text-5xl mb-4 text-yellow-400"></i>
                    <p class="text-xl font-medium">Error loading announcements</p>
                    <p class="text-base">Please try refreshing the page.</p>
                </div>
            `;
        }
    }

    // Load events for users
    async function loadEvents() {
        try {
            const result = await AdminUtils.getAllEvents();
            const container = document.getElementById('events-container');

            if (!result.success || !result.data || result.data.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center text-gray-500 py-12">
                        <i class="fas fa-calendar-alt text-5xl mb-4 text-gray-300"></i>
                        <p class="text-xl font-medium">No events scheduled</p>
                        <p class="text-base">Check back later for upcoming church events.</p>
                    </div>
                `;
                return;
            }

            // Filter events that are not cancelled
            const activeEvents = result.data.filter(event => event.status !== 'cancelled');

            if (activeEvents.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center text-gray-500 py-12">
                        <i class="fas fa-calendar-alt text-5xl mb-4 text-gray-300"></i>
                        <p class="text-xl font-medium">No upcoming events</p>
                        <p class="text-base">Check back later for upcoming church events.</p>
                    </div>
                `;
                return;
            }

            const categoryColors = {
                'mass': 'border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100',
                'service': 'border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100',
                'meeting': 'border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100',
                'celebration': 'border-l-pink-500 bg-gradient-to-br from-pink-50 to-pink-100',
                'general': 'border-l-green-500 bg-gradient-to-br from-green-50 to-green-100'
            };

            const categoryIcons = {
                'mass': 'fas fa-church text-yellow-600',
                'service': 'fas fa-praying-hands text-blue-600',
                'meeting': 'fas fa-users text-purple-600',
                'celebration': 'fas fa-birthday-cake text-pink-600',
                'general': 'fas fa-calendar-check text-green-600'
            };

            const statusColors = {
                'upcoming': 'bg-green-200 text-green-900',
                'ongoing': 'bg-blue-200 text-blue-900',
                'completed': 'bg-gray-200 text-gray-900'
            };

            container.innerHTML = activeEvents.map(event => `
                <div class="dashboard-event-card bg-white rounded-2xl p-6 border-l-4 ${categoryColors[event.category] || 'border-l-gray-500 bg-gradient-to-br from-gray-50 to-gray-100'}">
                    <div class="flex flex-col gap-4">
                        <div class="flex items-start gap-4">
                            <div class="flex-shrink-0">
                                <div class="w-14 h-14 rounded-full flex items-center justify-center ${categoryColors[event.category] ? categoryColors[event.category].replace('border-l-', 'bg-').replace('-500', '-200').replace(' bg-gradient-to-br from-', 'bg-').replace(' to-', '/').replace('-50', '-100') : 'bg-gray-200'} shadow-lg dashboard-card-icon">
                                    <i class="${categoryIcons[event.category] || 'fas fa-calendar-alt text-gray-600'} text-2xl"></i>
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-3 mb-3">
                                    <h3 class="dashboard-card-title text-xl font-display font-bold text-gray-900 leading-tight">${event.title}</h3>
                                    <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full status-badge-${event.status} shadow-sm">
                                        ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="ml-18">
                            ${event.description ? `<p class="dashboard-card-content text-gray-700 text-base leading-relaxed mb-4">${event.description}</p>` : ''}
                            <div class="grid gap-3 mb-4">
                                <div class="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                    <i class="fas fa-calendar text-primary text-lg"></i>
                                    <span class="font-medium">${new Date(event.event_date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                ${event.event_time ? `
                                <div class="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                    <i class="fas fa-clock text-primary text-lg"></i>
                                    <span class="font-medium">${event.event_time}</span>
                                </div>
                                ` : ''}
                                ${event.location ? `
                                <div class="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                    <i class="fas fa-map-marker-alt text-primary text-lg"></i>
                                    <span class="font-medium">${event.location}</span>
                                </div>
                                ` : ''}
                            </div>
                            <div class="dashboard-card-meta flex items-center justify-between text-sm text-gray-500 pt-3">
                                <span class="flex items-center gap-2">
                                    <i class="fas fa-tag text-primary"></i>
                                    <span class="capitalize font-medium px-2 py-1 category-badge-${event.category} rounded-full text-xs">${event.category}</span>
                                </span>
                                <span class="flex items-center gap-2">
                                    <i class="fas fa-user text-primary"></i>
                                    ${event.users ? `${event.users.first_name} ${event.users.last_name}` : 'Church Administration'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading events:', error);
            const container = document.getElementById('events-container');
            container.innerHTML = `
                <div class="col-span-full text-center text-gray-500 py-12">
                    <i class="fas fa-exclamation-triangle text-5xl mb-4 text-yellow-400"></i>
                    <p class="text-xl font-medium">Error loading events</p>
                    <p class="text-base">Please try refreshing the page.</p>
                </div>
            `;
        }
    }

    // Handle profile form submission - Use event delegation since form is dynamically generated
    document.addEventListener('submit', async function(e) {
        if (e.target && e.target.id === 'profile-form') {
            console.log('Profile form submitted via event delegation');
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

    // Handle user filter button clicks
    document.addEventListener('click', function(e) {
        const filterButtons = ['user-filter-all', 'user-filter-certificates', 'user-filter-services'];
        filterButtons.forEach(btnId => {
            if (e.target && (e.target.id === btnId || e.target.closest(`#${btnId}`))) {
                e.preventDefault();
                const filterType = btnId.replace('user-filter-', '');
                applyUserFilter(filterType);
            }
        });

        // Handle dashboard action buttons
        if (e.target && (e.target.id === 'request-services-btn' || e.target.closest('#request-services-btn'))) {
            e.preventDefault();
            console.log('Request Services button clicked');
            // Find the sidebar link and click it
            const servicesLink = document.querySelector('#sidebar nav a[href="#services"]');
            if (servicesLink) {
                servicesLink.click();
            } else {
                console.error('Services link not found');
            }
        }

        if (e.target && (e.target.id === 'view-my-requests-btn' || e.target.closest('#view-my-requests-btn'))) {
            e.preventDefault();
            console.log('View My Requests button clicked');
            // Find the sidebar link and click it
            const requestsLink = document.querySelector('#sidebar nav a[href="#my-requests"]');
            if (requestsLink) {
                requestsLink.click();
            } else {
                console.error('My Requests link not found');
            }
        }

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

    // Load dashboard statistics
    async function loadDashboardStats() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
            if (!currentUser.id) {
                console.error('No user ID found');
                return;
            }

            // Load announcements count
            const announcementsResult = await AdminUtils.getAllAnnouncements();
            const activeAnnouncements = announcementsResult.success ?
                announcementsResult.data.filter(a => a.status === 'active').length : 0;

            // Load events count
            const eventsResult = await AdminUtils.getAllEvents();
            const upcomingEvents = eventsResult.success ?
                eventsResult.data.filter(e => e.status === 'upcoming').length : 0;

            // Load user's pending requests count
            const { data: userRequests, error } = await supabaseClient
                .from('service_requests')
                .select('status')
                .eq('user_id', currentUser.id);

            console.log('User requests data:', userRequests);
            console.log('User requests error:', error);

            let pendingRequests = 0;
            if (error) {
                console.error('Error fetching user requests:', error);
                pendingRequests = 0;
            } else if (userRequests && Array.isArray(userRequests)) {
                pendingRequests = userRequests.filter(r => r.status === 'pending').length;
                console.log('Filtered pending requests:', userRequests.filter(r => r.status === 'pending'));
                console.log('All request statuses:', userRequests.map(r => ({ id: r.id, status: r.status })));
            } else {
                console.log('No user requests found or invalid data structure');
                pendingRequests = 0;
            }

            console.log('Final pending requests count:', pendingRequests);

            // Update the stats
            const announcementsCount = document.getElementById('user-announcements-count');
            const eventsCount = document.getElementById('user-events-count');
            const pendingCount = document.getElementById('user-pending-count');

            if (announcementsCount) announcementsCount.textContent = activeAnnouncements;
            if (eventsCount) eventsCount.textContent = upcomingEvents;
            if (pendingCount) pendingCount.textContent = pendingRequests;

            // Load recent activity
            loadRecentActivity();

        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    // Load recent activity
    async function loadRecentActivity() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
            if (!currentUser.id) return;

            // Get recent requests (last 5)
            const { data: recentRequests, error } = await supabaseClient
                .from('service_requests')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(5);

            const activityContainer = document.getElementById('recent-activity');

            if (error || !recentRequests || recentRequests.length === 0) {
                activityContainer.innerHTML = `
                    <div class="text-center text-gray-500 py-6">
                        <i class="fas fa-history text-3xl mb-3 text-gray-300"></i>
                        <p class="text-sm">No recent activity</p>
                        <p class="text-xs">Your recent requests and updates will appear here</p>
                    </div>
                `;
                return;
            }

            const typeLabels = {
                'confirmation': 'Confirmation Certificate',
                'mass-offering': 'Mass Offering Certificate',
                'funeral': 'Funeral Certificate',
                'mass-card': 'Mass Card Certificate',
                'sick-call': 'Sick Call Certificate',
                'marriage': 'Marriage Certificate',
                'baptism': 'Baptism Certificate',
                'baptism-service': 'Baptism Service',
                'confirmation-service': 'Confirmation Service',
                'communion': 'First Holy Communion',
                'marriage-service': 'Marriage Service',
                'anointing': 'Anointing of the Sick',
                'funeral-service': 'Funeral Service'
            };

            const statusColors = {
                'pending': 'text-yellow-600',
                'processing': 'text-blue-600',
                'completed': 'text-green-600',
                'cancelled': 'text-red-600'
            };

            activityContainer.innerHTML = recentRequests.map(request => `
                <div class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-all duration-200">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        request.status === 'completed' ? 'bg-green-500' :
                        request.status === 'processing' ? 'bg-blue-500' :
                        request.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                    }">
                        ${typeLabels[request.request_type]?.charAt(0) || 'R'}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">${typeLabels[request.request_type] || request.request_type}</p>
                        <p class="text-xs text-gray-500">${new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    <span class="text-xs font-medium ${statusColors[request.status] || 'text-gray-600'} capitalize">
                        ${request.status}
                    </span>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading recent activity:', error);
            const activityContainer = document.getElementById('recent-activity');
            activityContainer.innerHTML = `
                <div class="text-center text-gray-500 py-6">
                    <i class="fas fa-exclamation-triangle text-3xl mb-3 text-yellow-400"></i>
                    <p class="text-sm">Error loading activity</p>
                </div>
            `;
        }
    }

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

// Service section navigation functions
function showCertificateSection() {
    document.getElementById('certificate-form').classList.remove('hidden');
    document.getElementById('service-form').classList.add('hidden');
}

function hideCertificateSection() {
    document.getElementById('certificate-form').classList.add('hidden');
}

function showServiceSection() {
    document.getElementById('service-form').classList.remove('hidden');
    document.getElementById('certificate-form').classList.add('hidden');
}

function hideServiceSection() {
    document.getElementById('service-form').classList.add('hidden');
}

// Toggle certificate specific fields
function toggleCertificateFields() {
    const certificateType = document.getElementById('certificate-type').value;
    const baptismFields = document.getElementById('baptism-fields');
    const confirmationFields = document.getElementById('confirmation-fields');
    const massOfferingFields = document.getElementById('mass-offering-fields');
    const funeralFields = document.getElementById('funeral-fields');
    const massCardFields = document.getElementById('mass-card-fields');
    const sickCallFields = document.getElementById('sick-call-fields');

    // Hide all specific fields first
    baptismFields.classList.add('hidden');
    confirmationFields.classList.add('hidden');
    massOfferingFields.classList.add('hidden');
    funeralFields.classList.add('hidden');
    massCardFields.classList.add('hidden');
    sickCallFields.classList.add('hidden');

    // Show relevant fields based on selection
    if (certificateType === 'baptism') {
        baptismFields.classList.remove('hidden');
    } else if (certificateType === 'confirmation') {
        confirmationFields.classList.remove('hidden');
    } else if (certificateType === 'mass-offering') {
        massOfferingFields.classList.remove('hidden');
    } else if (certificateType === 'funeral') {
        funeralFields.classList.remove('hidden');
        // Add event listener for civil status to show/hide spouse field
        const civilStatusSelect = document.getElementById('funeral-civil-status');
        if (civilStatusSelect) {
            civilStatusSelect.addEventListener('change', function() {
                const spouseField = document.getElementById('spouse-field');
                if (this.value === 'married') {
                    spouseField.classList.remove('hidden');
                } else {
                    spouseField.classList.add('hidden');
                }
            });
        }
    } else if (certificateType === 'mass-card') {
        massCardFields.classList.remove('hidden');
    } else if (certificateType === 'sick-call') {
        sickCallFields.classList.remove('hidden');
    }
}

// Service request functions with Supabase integration
async function requestCertificate() {
    const certificateType = document.getElementById('certificate-type').value;
    const details = document.getElementById('certificate-details').value.trim();

    if (!certificateType) {
        showErrorMessage('Selection Required', 'Please select a certificate type first.');
        return;
    }

    let additionalDetails = details;

    // Collect baptism certificate specific information
    if (certificateType === 'baptism') {
        const baptismData = {
            childName: document.getElementById('baptism-child-name').value.trim(),
            birthDate: document.getElementById('baptism-birth-date').value,
            birthPlace: document.getElementById('baptism-birth-place').value.trim(),
            legitimacy: document.getElementById('baptism-legitimacy').value,
            fatherName: document.getElementById('baptism-father-name').value.trim(),
            motherName: document.getElementById('baptism-mother-name').value.trim(),
            fatherCatholic: document.getElementById('baptism-father-catholic').value,
            fatherReligion: document.getElementById('baptism-father-religion').value.trim(),
            fatherConfirmed: document.getElementById('baptism-father-confirmed').value,
            fatherConfirmationPlace: document.getElementById('baptism-father-confirmation-place').value.trim(),
            motherCatholic: document.getElementById('baptism-mother-catholic').value,
            motherReligion: document.getElementById('baptism-mother-religion').value.trim(),
            motherConfirmed: document.getElementById('baptism-mother-confirmed').value,
            motherConfirmationPlace: document.getElementById('baptism-mother-confirmation-place').value.trim()
        };

        // Validate required baptism fields
        if (!baptismData.childName || !baptismData.birthDate || !baptismData.birthPlace || !baptismData.legitimacy ||
            !baptismData.fatherName || !baptismData.motherName || !baptismData.fatherCatholic || !baptismData.fatherConfirmed ||
            !baptismData.motherCatholic || !baptismData.motherConfirmed) {
            showErrorMessage('Missing Information', 'Please fill in all required fields for the baptism certificate.');
            return;
        }

        // Format the details with baptism information
        additionalDetails = `Baptism Certificate Information:
- Name of Child: ${baptismData.childName}
- Date of Birth: ${baptismData.birthDate}
- Place of Birth: ${baptismData.birthPlace}
- Legitimate or Illegitimate: ${baptismData.legitimacy}
- Father's Name: ${baptismData.fatherName}
- Father (Are you Catholic?): ${baptismData.fatherCatholic}${baptismData.fatherReligion ? `
- Father's Religion: ${baptismData.fatherReligion}` : ''}
- Father (Are you confirmed?): ${baptismData.fatherConfirmed}${baptismData.fatherConfirmationPlace ? `
- Father's Confirmation Place: ${baptismData.fatherConfirmationPlace}` : ''}
- Mother's Name: ${baptismData.motherName}
- Mother (Are you Catholic?): ${baptismData.motherCatholic}${baptismData.motherReligion ? `
- Mother's Religion: ${baptismData.motherReligion}` : ''}
- Mother (Are you confirmed?): ${baptismData.motherConfirmed}${baptismData.motherConfirmationPlace ? `
- Mother's Confirmation Place: ${baptismData.motherConfirmationPlace}` : ''}

Additional Details: ${details || 'None provided'}`;
    }

    // Collect confirmation certificate specific information
    if (certificateType === 'confirmation') {
        const confirmationData = {
            childName: document.getElementById('confirmation-child-name').value.trim(),
            birthDate: document.getElementById('confirmation-birth-date').value,
            birthPlace: document.getElementById('confirmation-birth-place').value.trim(),
            legitimacy: document.getElementById('confirmation-legitimacy').value,
            fatherName: document.getElementById('confirmation-father-name').value.trim(),
            motherName: document.getElementById('confirmation-mother-name').value.trim(),
            fatherCatholic: document.getElementById('confirmation-father-catholic').value,
            fatherReligion: document.getElementById('confirmation-father-religion').value.trim(),
            fatherConfirmed: document.getElementById('confirmation-father-confirmed').value,
            fatherConfirmationPlace: document.getElementById('confirmation-father-confirmation-place').value.trim(),
            motherCatholic: document.getElementById('confirmation-mother-catholic').value,
            motherReligion: document.getElementById('confirmation-mother-religion').value.trim(),
            motherConfirmed: document.getElementById('confirmation-mother-confirmed').value,
            motherConfirmationPlace: document.getElementById('confirmation-mother-confirmation-place').value.trim()
        };

        // Validate required confirmation fields
        if (!confirmationData.childName || !confirmationData.birthDate || !confirmationData.birthPlace || !confirmationData.legitimacy ||
            !confirmationData.fatherName || !confirmationData.motherName || !confirmationData.fatherCatholic || !confirmationData.fatherConfirmed ||
            !confirmationData.motherCatholic || !confirmationData.motherConfirmed) {
            showErrorMessage('Missing Information', 'Please fill in all required fields for the confirmation certificate.');
            return;
        }

        // Format the details with confirmation information
        additionalDetails = `Confirmation Certificate Information:
- Name of Child: ${confirmationData.childName}
- Date of Birth: ${confirmationData.birthDate}
- Place of Birth: ${confirmationData.birthPlace}
- Legitimate or Illegitimate: ${confirmationData.legitimacy}
- Father's Name: ${confirmationData.fatherName}
- Father (Are you Catholic?): ${confirmationData.fatherCatholic}${confirmationData.fatherReligion ? `
- Father's Religion: ${confirmationData.fatherReligion}` : ''}
- Father (Are you confirmed?): ${confirmationData.fatherConfirmed}${confirmationData.fatherConfirmationPlace ? `
- Father's Confirmation Place: ${confirmationData.fatherConfirmationPlace}` : ''}
- Mother's Name: ${confirmationData.motherName}
- Mother (Are you Catholic?): ${confirmationData.motherCatholic}${confirmationData.motherReligion ? `
- Mother's Religion: ${confirmationData.motherReligion}` : ''}
- Mother (Are you confirmed?): ${confirmationData.motherConfirmed}${confirmationData.motherConfirmationPlace ? `
- Mother's Confirmation Place: ${confirmationData.motherConfirmationPlace}` : ''}

Additional Details: ${details || 'None provided'}`;
    }

    // Collect mass offering certificate specific information
    if (certificateType === 'mass-offering') {
        const massOfferingData = {
            souls: document.getElementById('mass-offering-souls').value.trim(),
            petitions: document.getElementById('mass-offering-petitions').value.trim(),
            thanksgiving: document.getElementById('mass-offering-thanksgiving').value.trim(),
            timeDay: document.getElementById('mass-offering-time-day').value.trim(),
            informant: document.getElementById('mass-offering-informant').value.trim()
        };

        // Validate required mass offering fields
        if (!massOfferingData.souls || !massOfferingData.petitions || !massOfferingData.thanksgiving || !massOfferingData.timeDay || !massOfferingData.informant) {
            showErrorMessage('Missing Information', 'Please fill in all required fields for the mass offering certificate.');
            return;
        }

        // Format the details with mass offering information
        additionalDetails = `Mass Offering Information:
- Names of Souls: ${massOfferingData.souls}
- Petitions: ${massOfferingData.petitions}
- Thanksgiving: ${massOfferingData.thanksgiving}
- Time and Day: ${massOfferingData.timeDay}
- Name of the Informant: ${massOfferingData.informant}

Additional Details: ${details || 'None provided'}`;
    }

    // Collect funeral certificate specific information
    if (certificateType === 'funeral') {
        const funeralData = {
            deceasedName: document.getElementById('funeral-deceased-name').value.trim(),
            age: document.getElementById('funeral-age').value.trim(),
            gender: document.getElementById('funeral-gender').value,
            civilStatus: document.getElementById('funeral-civil-status').value,
            spouseName: document.getElementById('funeral-spouse-name').value.trim(),
            address: document.getElementById('funeral-address').value.trim(),
            description: document.getElementById('funeral-description').value.trim(),
            occupation: document.getElementById('funeral-occupation').value.trim(),
            churchInvolvement: document.getElementById('funeral-church-involvement').value.trim(),
            causeOfDeath: document.getElementById('funeral-cause-of-death').value.trim(),
            dateOfDeath: document.getElementById('funeral-date-of-death').value,
            informantName: document.getElementById('funeral-informant-name').value.trim(),
            informantContact: document.getElementById('funeral-informant-contact').value.trim()
        };

        // Validate required funeral fields
        if (!funeralData.deceasedName || !funeralData.age || !funeralData.gender || !funeralData.civilStatus ||
            !funeralData.address || !funeralData.description || !funeralData.occupation ||
            !funeralData.churchInvolvement || !funeralData.causeOfDeath || !funeralData.dateOfDeath ||
            !funeralData.informantName || !funeralData.informantContact) {
            showErrorMessage('Missing Information', 'Please fill in all required fields for the funeral certificate.');
            return;
        }

        // Check if spouse name is required
        if (funeralData.civilStatus === 'married' && !funeralData.spouseName) {
            showErrorMessage('Missing Information', 'Please provide the spouse name for married individuals.');
            return;
        }

        // Format the details with funeral information
        additionalDetails = `Funeral Certificate Information:
- Name of the Deceased: ${funeralData.deceasedName}
- Age: ${funeralData.age}
- Gender: ${funeralData.gender}
- Civil Status: ${funeralData.civilStatus}${funeralData.spouseName ? `
- Name of Spouse: ${funeralData.spouseName}` : ''}
- Address of Deceased: ${funeralData.address}
- Description as a Person: ${funeralData.description}
- Work/Occupation: ${funeralData.occupation}
- Church Involvement: ${funeralData.churchInvolvement}
- Cause of Death: ${funeralData.causeOfDeath}
- Date of Death: ${funeralData.dateOfDeath}
- Name of Informant: ${funeralData.informantName}
- Contact Number of Informant: ${funeralData.informantContact}

Additional Details: ${details || 'None provided'}`;
    }

    // Collect mass card specific information
    if (certificateType === 'mass-card') {
        const massCardData = {
            deceasedName: document.getElementById('mass-card-deceased-name').value.trim(),
            from: document.getElementById('mass-card-from').value.trim()
        };

        // Validate required mass card fields
        if (!massCardData.deceasedName || !massCardData.from) {
            showErrorMessage('Missing Information', 'Please fill in all required fields for the mass card certificate.');
            return;
        }

        // Format the details with mass card information
        additionalDetails = `Mass Card Information:
- Name of the Deceased: ${massCardData.deceasedName}
- From: ${massCardData.from}

Additional Details: ${details || 'None provided'}`;
    }

    // Collect sick call specific information
    if (certificateType === 'sick-call') {
        const sickCallData = {
            name: document.getElementById('sick-call-name').value.trim(),
            age: document.getElementById('sick-call-age').value.trim(),
            sex: document.getElementById('sick-call-sex').value,
            civilStatus: document.getElementById('sick-call-civil-status').value,
            patientStatus: document.getElementById('sick-call-status').value,
            contactName: document.getElementById('sick-call-contact-name').value.trim(),
            contactNumber: document.getElementById('sick-call-contact-number').value.trim()
        };

        // Validate required sick call fields
        if (!sickCallData.name || !sickCallData.age || !sickCallData.sex || !sickCallData.civilStatus || !sickCallData.patientStatus || !sickCallData.contactName || !sickCallData.contactNumber) {
            showErrorMessage('Missing Information', 'Please fill in all required fields for the sick call certificate.');
            return;
        }

        // Format the details with sick call information
        additionalDetails = `Patient Information:
- Name: ${sickCallData.name}
- Age: ${sickCallData.age}
- Sex: ${sickCallData.sex}
- Civil Status: ${sickCallData.civilStatus}
- Status of Patient: ${sickCallData.patientStatus}
- Contact Person: ${sickCallData.contactName}
- Contact Number: ${sickCallData.contactNumber}

Additional Details: ${details || 'None provided'}`;
    }

    try {
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        if (!currentUser.id) {
            showErrorMessage('Authentication Error', 'Please log in again.');
            return;
        }

        // First, insert certificate data into the appropriate certificate table
        let certificateId = null;
        let certificateTable = '';

        if (certificateType === 'baptism') {
            const baptismData = {
                child_name: document.getElementById('baptism-child-name').value.trim(),
                birth_date: document.getElementById('baptism-birth-date').value,
                birth_place: document.getElementById('baptism-birth-place').value.trim(),
                legitimacy: document.getElementById('baptism-legitimacy').value,
                father_name: document.getElementById('baptism-father-name').value.trim(),
                mother_name: document.getElementById('baptism-mother-name').value.trim(),
                father_catholic: document.getElementById('baptism-father-catholic').value,
                father_religion: document.getElementById('baptism-father-religion').value.trim(),
                father_confirmed: document.getElementById('baptism-father-confirmed').value,
                father_confirmation_place: document.getElementById('baptism-father-confirmation-place').value.trim(),
                mother_catholic: document.getElementById('baptism-mother-catholic').value,
                mother_religion: document.getElementById('baptism-mother-religion').value.trim(),
                mother_confirmed: document.getElementById('baptism-mother-confirmed').value,
                mother_confirmation_place: document.getElementById('baptism-mother-confirmation-place').value.trim()
            };

            const { data: certData, error: certError } = await supabaseClient
                .from('baptism_certificates')
                .insert([baptismData])
                .select();

            if (certError) throw certError;
            certificateId = certData[0].id;
            certificateTable = 'baptism_certificate_id';

        } else if (certificateType === 'confirmation') {
            const confirmationData = {
                child_name: document.getElementById('confirmation-child-name').value.trim(),
                birth_date: document.getElementById('confirmation-birth-date').value,
                birth_place: document.getElementById('confirmation-birth-place').value.trim(),
                legitimacy: document.getElementById('confirmation-legitimacy').value,
                father_name: document.getElementById('confirmation-father-name').value.trim(),
                mother_name: document.getElementById('confirmation-mother-name').value.trim(),
                father_catholic: document.getElementById('confirmation-father-catholic').value,
                father_religion: document.getElementById('confirmation-father-religion').value.trim(),
                father_confirmed: document.getElementById('confirmation-father-confirmed').value,
                father_confirmation_place: document.getElementById('confirmation-father-confirmation-place').value.trim(),
                mother_catholic: document.getElementById('confirmation-mother-catholic').value,
                mother_religion: document.getElementById('confirmation-mother-religion').value.trim(),
                mother_confirmed: document.getElementById('confirmation-mother-confirmed').value,
                mother_confirmation_place: document.getElementById('confirmation-mother-confirmation-place').value.trim()
            };

            const { data: certData, error: certError } = await supabaseClient
                .from('confirmation_certificates')
                .insert([confirmationData])
                .select();

            if (certError) throw certError;
            certificateId = certData[0].id;
            certificateTable = 'confirmation_certificate_id';

        } else if (certificateType === 'mass-offering') {
            const massOfferingData = {
                souls: document.getElementById('mass-offering-souls').value.trim(),
                petitions: document.getElementById('mass-offering-petitions').value.trim(),
                thanksgiving: document.getElementById('mass-offering-thanksgiving').value.trim(),
                time_day: document.getElementById('mass-offering-time-day').value.trim(),
                informant: document.getElementById('mass-offering-informant').value.trim()
            };

            const { data: certData, error: certError } = await supabaseClient
                .from('mass_offering_certificates')
                .insert([massOfferingData])
                .select();

            if (certError) throw certError;
            certificateId = certData[0].id;
            certificateTable = 'mass_offering_certificate_id';

        } else if (certificateType === 'funeral') {
            const funeralData = {
                deceased_name: document.getElementById('funeral-deceased-name').value.trim(),
                age: parseInt(document.getElementById('funeral-age').value),
                gender: document.getElementById('funeral-gender').value,
                civil_status: document.getElementById('funeral-civil-status').value,
                spouse_name: document.getElementById('funeral-spouse-name').value.trim(),
                address: document.getElementById('funeral-address').value.trim(),
                description: document.getElementById('funeral-description').value.trim(),
                occupation: document.getElementById('funeral-occupation').value.trim(),
                church_involvement: document.getElementById('funeral-church-involvement').value.trim(),
                cause_of_death: document.getElementById('funeral-cause-of-death').value.trim(),
                date_of_death: document.getElementById('funeral-date-of-death').value,
                informant_name: document.getElementById('funeral-informant-name').value.trim(),
                informant_contact: document.getElementById('funeral-informant-contact').value.trim()
            };

            const { data: certData, error: certError } = await supabaseClient
                .from('funeral_certificates')
                .insert([funeralData])
                .select();

            if (certError) throw certError;
            certificateId = certData[0].id;
            certificateTable = 'funeral_certificate_id';

        } else if (certificateType === 'mass-card') {
            const massCardData = {
                deceased_name: document.getElementById('mass-card-deceased-name').value.trim(),
                from_person: document.getElementById('mass-card-from').value.trim()
            };

            const { data: certData, error: certError } = await supabaseClient
                .from('mass_card_certificates')
                .insert([massCardData])
                .select();

            if (certError) throw certError;
            certificateId = certData[0].id;
            certificateTable = 'mass_card_certificate_id';

        } else if (certificateType === 'sick-call') {
            const sickCallData = {
                patient_name: document.getElementById('sick-call-name').value.trim(),
                patient_age: parseInt(document.getElementById('sick-call-age').value),
                patient_sex: document.getElementById('sick-call-sex').value,
                patient_civil_status: document.getElementById('sick-call-civil-status').value,
                patient_status: document.getElementById('sick-call-status').value,
                contact_person: document.getElementById('sick-call-contact-name').value.trim(),
                contact_number: document.getElementById('sick-call-contact-number').value.trim()
            };

            const { data: certData, error: certError } = await supabaseClient
                .from('sick_call_certificates')
                .insert([sickCallData])
                .select();

            if (certError) throw certError;
            certificateId = certData[0].id;
            certificateTable = 'sick_call_certificate_id';

        } else if (certificateType === 'marriage') {
            const marriageData = {
                groom_name: document.getElementById('marriage-groom-name').value.trim(),
                groom_birth_date: document.getElementById('marriage-groom-birth-date').value,
                groom_birth_place: document.getElementById('marriage-groom-birth-place').value.trim(),
                groom_father_name: document.getElementById('marriage-groom-father-name').value.trim(),
                groom_mother_name: document.getElementById('marriage-groom-mother-name').value.trim(),
                groom_address: document.getElementById('marriage-groom-address').value.trim(),
                bride_name: document.getElementById('marriage-bride-name').value.trim(),
                bride_birth_date: document.getElementById('marriage-bride-birth-date').value,
                bride_birth_place: document.getElementById('marriage-bride-birth-place').value.trim(),
                bride_father_name: document.getElementById('marriage-bride-father-name').value.trim(),
                bride_mother_name: document.getElementById('marriage-bride-mother-name').value.trim(),
                bride_address: document.getElementById('marriage-bride-address').value.trim(),
                marriage_date: document.getElementById('marriage-date').value,
                marriage_place: document.getElementById('marriage-place').value.trim()
            };

            const { data: certData, error: certError } = await supabaseClient
                .from('marriage_certificates')
                .insert([marriageData])
                .select();

            if (certError) throw certError;
            certificateId = certData[0].id;
            certificateTable = 'marriage_certificate_id';
        }

        // Now insert the service request with reference to the certificate
        const requestData = {
            user_id: currentUser.id,
            request_type: certificateType,
            details: additionalDetails || null,
            status: 'pending'
        };

        if (certificateId && certificateTable) {
            requestData[certificateTable] = certificateId;
        }

        const { data, error } = await supabaseClient
            .from('service_requests')
            .insert([requestData])
            .select();

        if (error) throw error;

        const typeNames = {
            'confirmation': 'Confirmation Certificate',
            'mass-offering': 'Mass Offering Certificate',
            'funeral': 'Funeral Certificate',
            'mass-card': 'Mass Card Certificate',
            'sick-call': 'Sick Call Certificate',
            'marriage': 'Marriage Certificate',
            'baptism': 'Baptism Certificate'
        };

        showSuccessMessage('Certificate Request Submitted', `Your ${typeNames[certificateType]} request has been submitted successfully. You will be contacted soon.`);
        hideCertificateSection();

        // Clear form
        document.getElementById('certificate-type').value = '';
        document.getElementById('certificate-details').value = '';

        // Clear specific certificate fields
        if (certificateType === 'baptism') {
            document.getElementById('baptism-child-name').value = '';
            document.getElementById('baptism-birth-date').value = '';
            document.getElementById('baptism-birth-place').value = '';
            document.getElementById('baptism-legitimacy').value = '';
            document.getElementById('baptism-father-name').value = '';
            document.getElementById('baptism-mother-name').value = '';
            document.getElementById('baptism-father-catholic').value = '';
            document.getElementById('baptism-father-religion').value = '';
            document.getElementById('baptism-father-confirmed').value = '';
            document.getElementById('baptism-father-confirmation-place').value = '';
            document.getElementById('baptism-mother-catholic').value = '';
            document.getElementById('baptism-mother-religion').value = '';
            document.getElementById('baptism-mother-confirmed').value = '';
            document.getElementById('baptism-mother-confirmation-place').value = '';
            document.getElementById('baptism-fields').classList.add('hidden');
        } else if (certificateType === 'confirmation') {
            document.getElementById('confirmation-child-name').value = '';
            document.getElementById('confirmation-birth-date').value = '';
            document.getElementById('confirmation-birth-place').value = '';
            document.getElementById('confirmation-legitimacy').value = '';
            document.getElementById('confirmation-father-name').value = '';
            document.getElementById('confirmation-mother-name').value = '';
            document.getElementById('confirmation-father-catholic').value = '';
            document.getElementById('confirmation-father-religion').value = '';
            document.getElementById('confirmation-father-confirmed').value = '';
            document.getElementById('confirmation-father-confirmation-place').value = '';
            document.getElementById('confirmation-mother-catholic').value = '';
            document.getElementById('confirmation-mother-religion').value = '';
            document.getElementById('confirmation-mother-confirmed').value = '';
            document.getElementById('confirmation-mother-confirmation-place').value = '';
            document.getElementById('confirmation-fields').classList.add('hidden');
        } else if (certificateType === 'mass-offering') {
            document.getElementById('mass-offering-souls').value = '';
            document.getElementById('mass-offering-petitions').value = '';
            document.getElementById('mass-offering-thanksgiving').value = '';
            document.getElementById('mass-offering-time-day').value = '';
            document.getElementById('mass-offering-informant').value = '';
            document.getElementById('mass-offering-fields').classList.add('hidden');
        } else if (certificateType === 'funeral') {
            document.getElementById('funeral-deceased-name').value = '';
            document.getElementById('funeral-age').value = '';
            document.getElementById('funeral-gender').value = '';
            document.getElementById('funeral-civil-status').value = '';
            document.getElementById('funeral-spouse-name').value = '';
            document.getElementById('funeral-address').value = '';
            document.getElementById('funeral-description').value = '';
            document.getElementById('funeral-occupation').value = '';
            document.getElementById('funeral-church-involvement').value = '';
            document.getElementById('funeral-cause-of-death').value = '';
            document.getElementById('funeral-date-of-death').value = '';
            document.getElementById('funeral-informant-name').value = '';
            document.getElementById('funeral-informant-contact').value = '';
            document.getElementById('spouse-field').classList.add('hidden');
            document.getElementById('funeral-fields').classList.add('hidden');
        } else if (certificateType === 'mass-card') {
            document.getElementById('mass-card-deceased-name').value = '';
            document.getElementById('mass-card-from').value = '';
            document.getElementById('mass-card-fields').classList.add('hidden');
        } else if (certificateType === 'sick-call') {
            document.getElementById('sick-call-name').value = '';
            document.getElementById('sick-call-age').value = '';
            document.getElementById('sick-call-sex').value = '';
            document.getElementById('sick-call-civil-status').value = '';
            document.getElementById('sick-call-status').value = '';
            document.getElementById('sick-call-contact-name').value = '';
            document.getElementById('sick-call-contact-number').value = '';
            document.getElementById('sick-call-fields').classList.add('hidden');
        }

    } catch (error) {
        console.error('Error submitting certificate request:', error);
        console.error('Error details:', error.message);
        console.error('Error code:', error.code);
        showErrorMessage('Submission Failed', `Failed to submit certificate request. Error: ${error.message}`);
    }
}

async function requestService() {
    const serviceType = document.getElementById('service-type').value;
    const preferredDate = document.getElementById('service-date').value;
    const details = document.getElementById('service-details').value.trim();

    if (!serviceType) {
        showErrorMessage('Selection Required', 'Please select a service type first.');
        return;
    }

    try {
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        if (!currentUser.id) {
            showErrorMessage('Authentication Error', 'Please log in again.');
            return;
        }

        const { data, error } = await supabaseClient
            .from('service_requests')
            .insert({
                user_id: currentUser.id,
                request_type: serviceType,
                preferred_date: preferredDate || null,
                details: details || null,
                status: 'pending'
            })
            .select();

        if (error) throw error;

        const typeNames = {
            'baptism-service': 'Baptism Service',
            'confirmation-service': 'Confirmation Service',
            'communion': 'First Holy Communion',
            'marriage-service': 'Marriage / Matrimony Service',
            'anointing': 'Anointing of the Sick',
            'funeral-service': 'Funeral Rites / Burial Masses'
        };

        showSuccessMessage('Service Request Submitted', `Your ${typeNames[serviceType]} request has been submitted successfully. You will be contacted soon.`);
        hideServiceSection();

        // Clear form
        document.getElementById('service-type').value = '';
        document.getElementById('service-date').value = '';
        document.getElementById('service-details').value = '';

    } catch (error) {
        console.error('Error submitting service request:', error);
        console.error('Error details:', error.message);
        console.error('Error code:', error.code);
        showErrorMessage('Submission Failed', `Failed to submit service request. Error: ${error.message}`);
    }
}


// Global variable to store all user requests
let allUserRequests = [];

// Load user's service requests
async function loadMyRequests() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        if (!currentUser.id) {
            showErrorMessage('Authentication Error', 'Please log in again.');
            return;
        }

        const { data: requests, error } = await supabaseClient
            .from('service_requests')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        allUserRequests = requests; // Store all requests globally

        // Apply current filter
        applyUserFilter();
    } catch (error) {
        console.error('Error loading user requests:', error);
        const myRequestsList = document.getElementById('my-requests-list');
        myRequestsList.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-exclamation-triangle text-4xl mb-3 text-yellow-400"></i>
                <p class="text-lg font-medium">Error loading requests</p>
                <p class="text-sm">Please try again later.</p>
            </div>
        `;
    }
}

// Apply filter to user requests
function applyUserFilter(filterType = 'all') {
    const myRequestsList = document.getElementById('my-requests-list');

    // Update button styles
    const buttons = ['user-filter-all', 'user-filter-certificates', 'user-filter-services'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            if (btnId === `user-filter-${filterType}`) {
                btn.classList.remove('bg-gray-600', 'bg-blue-600', 'bg-green-600');
                btn.classList.add('bg-red-600');
            } else {
                btn.classList.remove('bg-red-600');
                if (btnId === 'user-filter-all') btn.classList.add('bg-gray-600');
                if (btnId === 'user-filter-certificates') btn.classList.add('bg-blue-600');
                if (btnId === 'user-filter-services') btn.classList.add('bg-green-600');
            }
        }
    });

    // Filter requests
    let filteredRequests = allUserRequests;
    if (filterType === 'certificates') {
        const certificateTypes = ['confirmation', 'mass-offering', 'funeral', 'mass-card', 'sick-call', 'marriage', 'baptism'];
        filteredRequests = allUserRequests.filter(request => certificateTypes.includes(request.request_type));
    } else if (filterType === 'services') {
        const serviceTypes = ['baptism-service', 'confirmation-service', 'communion', 'marriage-service', 'anointing', 'funeral-service'];
        filteredRequests = allUserRequests.filter(request => serviceTypes.includes(request.request_type));
    }

    if (filteredRequests.length === 0) {
        myRequestsList.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
                <p class="text-lg font-medium">No ${filterType === 'all' ? '' : filterType} requests found</p>
                <p class="text-sm">You haven't submitted any ${filterType === 'all' ? '' : filterType} requests yet.</p>
            </div>
        `;
        return;
    }

    const statusColors = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'processing': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };

    const typeLabels = {
        'confirmation': 'Confirmation Certificate',
        'mass-offering': 'Mass Offering Certificate',
        'funeral': 'Funeral Certificate',
        'mass-card': 'Mass Card Certificate',
        'sick-call': 'Sick Call Certificate',
        'marriage': 'Marriage Certificate',
        'baptism': 'Baptism Certificate',
        'baptism-service': 'Baptism Service',
        'confirmation-service': 'Confirmation Service',
        'communion': 'First Holy Communion',
        'marriage-service': 'Marriage Service',
        'anointing': 'Anointing of the Sick',
        'funeral-service': 'Funeral Service'
    };

    myRequestsList.innerHTML = filteredRequests.map(request => `
        <div class="request-card-mobile flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all duration-200">
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    ${typeLabels[request.request_type]?.charAt(0) || 'R'}
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-900 text-sm truncate">${typeLabels[request.request_type] || request.request_type}</h4>
                    <p class="text-xs text-gray-600">Submitted: ${new Date(request.created_at).toLocaleDateString()}</p>
                    ${request.preferred_date ? `<p class="text-xs text-gray-500">Preferred: ${new Date(request.preferred_date).toLocaleDateString()}</p>` : ''}
                </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <span class="status-badge inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}">
                    ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                ${request.admin_notes ? '<i class="fas fa-sticky-note text-blue-600 text-sm" title="Admin notes available"></i>' : ''}
            </div>
        </div>
    `).join('');
}

// Close error modal
function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    if (modal) modal.remove();
}
