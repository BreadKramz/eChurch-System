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
        userNameElement.textContent = `${user.firstName} ${user.lastName}`;
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

// Sidebar navigation with content switching
document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('#sidebar nav a, #profile-dropdown a');
    const contentArea = document.getElementById('content-area');

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
            description: 'View and update your personal information, contact details, and account settings.'
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
        });
    });

    // Set default active state (Dashboard)
    const dashboardLink = document.querySelector('#sidebar nav a[href="#dashboard"]');
    if (dashboardLink) {
        dashboardLink.click();
    }
});