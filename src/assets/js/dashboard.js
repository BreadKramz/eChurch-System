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
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if user is authenticated
        if (!churchAuth.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'https://e-church-system.vercel.app/src/pages/auth/login.html';
            return;
        }

        // Get current user
        currentUser = churchAuth.getCurrentUser();
        if (!currentUser) {
            console.log('No current user, redirecting to login');
            window.location.href = 'https://e-church-system.vercel.app/src/pages/auth/login.html';
            return;
        }

        console.log('Dashboard initializing for user:', currentUser.email);

        // Load user profile data
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
            document.getElementById('user-name').textContent = fullName || 'Parishioner';
            document.getElementById('user-email').textContent = fullName || 'Parishioner'; // Show full name instead of email

            // Update welcome message - show first name
            document.getElementById('welcome-name').textContent = profile.first_name || 'Parishioner';

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
            console.log('No profile found, using fallback');
            // Fallback to basic user info - show name instead of email
            document.getElementById('user-name').textContent = 'Parishioner';
            document.getElementById('user-email').textContent = 'Parishioner'; // Show name instead of email
            document.getElementById('welcome-name').textContent = 'Parishioner';
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to basic user info - show name instead of email
        document.getElementById('user-name').textContent = 'Parishioner';
        document.getElementById('user-email').textContent = 'Parishioner'; // Show name instead of email
        document.getElementById('welcome-name').textContent = 'Parishioner';
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
        prayers: 'Prayer Requests - Our Mother of Perpetual Help Church',
        events: 'Events - Our Mother of Perpetual Help Church',
        ministries: 'Ministries - Our Mother of Perpetual Help Church',
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

            if (confirm('Are you sure you want to logout?')) {
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
                    window.location.replace('https://e-church-system.vercel.app/src/pages/auth/login.html');

                } catch (error) {
                    console.error('Logout error:', error);
                    // Even if there's an error, redirect to login
                    window.location.replace('https://e-church-system.vercel.app/src/pages/auth/login.html');
                }
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