// Church Management System JavaScript

// DOM Elements
const body = document.body;
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');

// Navigation handled in DOMContentLoaded below

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Sidebar close button
const sidebarClose = document.getElementById('sidebar-close');
if (sidebarClose) {
    sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (mobileMenuToggle && mainNav && !mobileMenuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('active');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Tab switching for login forms
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked tab
            btn.classList.add('active');

            // Hide all forms
            authForms.forEach(form => form.classList.remove('active'));

            // Show corresponding form
            const tabId = btn.getAttribute('data-tab') + '-form';
            const targetForm = document.getElementById(tabId);
            if (targetForm) {
                targetForm.classList.add('active');
            }
        });
    });
});

// Authentication handled in auth.js

// Dashboard navigation
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const dashboardSections = document.querySelectorAll('.dashboard-section');

if (sidebarLinks.length > 0) {
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');

            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');

            // Hide all sections
            dashboardSections.forEach(section => section.classList.remove('active'));

            // Show target section
            const targetSection = document.getElementById(sectionId + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }

            // Handle special cases
            if (sectionId === 'logout') {
                if (confirm('Are you sure you want to logout?')) {
                    window.location.href = 'index.html';
                }
            }
        });
    });
}

// Certificate type dynamic fields
const certificateTypeSelect = document.getElementById('certificate-type');
const certificateDetails = document.getElementById('certificate-details');

if (certificateTypeSelect && certificateDetails) {
    certificateTypeSelect.addEventListener('change', () => {
        const type = certificateTypeSelect.value;
        certificateDetails.innerHTML = '';

        switch(type) {
            case 'baptism':
                certificateDetails.innerHTML = `
                    <div class="form-group">
                        <label for="baptism-name">Name of Person</label>
                        <input type="text" id="baptism-name" required>
                    </div>
                    <div class="form-group">
                        <label for="baptism-date">Baptism Date (approximate)</label>
                        <input type="date" id="baptism-date">
                    </div>
                `;
                break;
            case 'confirmation':
                certificateDetails.innerHTML = `
                    <div class="form-group">
                        <label for="confirmation-name">Name of Person</label>
                        <input type="text" id="confirmation-name" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmation-date">Confirmation Date (approximate)</label>
                        <input type="date" id="confirmation-date">
                    </div>
                `;
                break;
            case 'marriage':
                certificateDetails.innerHTML = `
                    <div class="form-group">
                        <label for="spouse1-name">Spouse 1 Name</label>
                        <input type="text" id="spouse1-name" required>
                    </div>
                    <div class="form-group">
                        <label for="spouse2-name">Spouse 2 Name</label>
                        <input type="text" id="spouse2-name" required>
                    </div>
                    <div class="form-group">
                        <label for="marriage-date">Marriage Date (approximate)</label>
                        <input type="date" id="marriage-date">
                    </div>
                `;
                break;
            case 'communion':
                certificateDetails.innerHTML = `
                    <div class="form-group">
                        <label for="communion-name">Name of Person</label>
                        <input type="text" id="communion-name" required>
                    </div>
                    <div class="form-group">
                        <label for="communion-date">First Communion Date (approximate)</label>
                        <input type="date" id="communion-date">
                    </div>
                `;
                break;
            default:
                certificateDetails.innerHTML = `
                    <div class="form-group">
                        <label for="certificate-info">Additional Information</label>
                        <textarea id="certificate-info" rows="3" placeholder="Please provide any additional details..."></textarea>
                    </div>
                `;
        }
    });
}

// Form submissions
const serviceForm = document.querySelector('.service-form');
const certificateForm = document.querySelector('.certificate-form');
const prayerForm = document.querySelector('.prayer-form');
const donationForms = document.querySelectorAll('.donation-card button');
const announcementForm = document.querySelector('.announcement-form');
const eventForm = document.querySelector('.event-form');

if (serviceForm) {
    serviceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Service request submitted successfully! We will contact you soon.');
        serviceForm.reset();
    });
}

if (certificateForm) {
    certificateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Certificate request submitted successfully! Processing may take 3-5 business days.');
        certificateForm.reset();
    });
}

if (prayerForm) {
    prayerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Your prayer intention has been submitted. We will keep you in our prayers.');
        prayerForm.reset();
    });
}

if (donationForms.length > 0) {
    donationForms.forEach(btn => {
        btn.addEventListener('click', () => {
            const donationType = btn.parentElement.querySelector('h3').textContent;
            alert(`Redirecting to ${donationType} donation page...`);
        });
    });
}

if (announcementForm) {
    announcementForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Announcement published successfully!');
        announcementForm.reset();
    });
}

if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Event created successfully!');
        eventForm.reset();
    });
}

// Request management (approve/reject)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-approve')) {
        const requestItem = e.target.closest('.request-item') || e.target.closest('.certificate-item');
        const statusElement = requestItem.querySelector('.request-status') || requestItem.querySelector('.certificate-status');
        statusElement.textContent = 'Approved';
        statusElement.className = (statusElement.classList.contains('request-status') ? 'request-status' : 'certificate-status') + ' approved';
        e.target.style.display = 'none';
        e.target.nextElementSibling.style.display = 'none';
        alert('Request approved successfully!');
    }

    if (e.target.classList.contains('btn-reject')) {
        const requestItem = e.target.closest('.request-item') || e.target.closest('.certificate-item');
        const statusElement = requestItem.querySelector('.request-status') || requestItem.querySelector('.certificate-status');
        statusElement.textContent = 'Rejected';
        statusElement.className = (statusElement.classList.contains('request-status') ? 'request-status' : 'certificate-status') + ' rejected';
        e.target.style.display = 'none';
        e.target.previousElementSibling.style.display = 'none';
        alert('Request rejected.');
    }

    if (e.target.classList.contains('btn-complete')) {
        const requestItem = e.target.closest('.request-item') || e.target.closest('.certificate-item');
        const statusElement = requestItem.querySelector('.request-status') || requestItem.querySelector('.certificate-status');
        statusElement.textContent = 'Completed';
        statusElement.className = (statusElement.classList.contains('request-status') ? 'request-status' : 'certificate-status') + ' completed';
        e.target.style.display = 'none';
        alert('Request marked as completed!');
    }
});

// Prayer management
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('prayer-btn')) {
        e.target.textContent = e.target.textContent === '🙏 Pray' ? '❤️ Prayed' : '🙏 Pray';
    }

    if (e.target.classList.contains('btn-feature') || e.target.classList.contains('btn-hide')) {
        const action = e.target.classList.contains('btn-feature') ? 'featured' : 'hidden';
        alert(`Prayer request ${action} successfully!`);
    }
});

// User management
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-deactivate')) {
        if (confirm('Are you sure you want to deactivate this user?')) {
            const userItem = e.target.closest('.user-item');
            const statusElement = userItem.querySelector('.user-status');
            statusElement.textContent = 'Inactive';
            statusElement.className = 'user-status inactive';
            alert('User deactivated successfully.');
        }
    }
});

// Settings form
const settingsForm = document.querySelector('.settings-form');
if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Settings saved successfully!');
    });
}

// Maintenance actions
const maintenanceButtons = document.querySelectorAll('.maintenance-actions button');
if (maintenanceButtons.length > 0) {
    maintenanceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.textContent.toLowerCase().replace(' ', '_');
            alert(`${btn.textContent} completed successfully!`);
        });
    });
}

// Filter functionality for requests
const filterBtns = document.querySelectorAll('.filter-btn');
if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            const requestItems = document.querySelectorAll('.request-item');

            requestItems.forEach(item => {
                if (filter === 'all') {
                    item.style.display = 'block';
                } else {
                    const status = item.querySelector('.request-status').textContent.toLowerCase();
                    item.style.display = status === filter ? 'block' : 'none';
                }
            });
        });
    });
}

// Form validation handled in auth.js

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set default active section
    const defaultSection = document.querySelector('.dashboard-section.active');
    if (defaultSection) {
        const sectionId = defaultSection.id.replace('-section', '');
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Add loading animation to buttons
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.form && this.form.checkValidity()) {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                this.disabled = true;

                // Re-enable after 2 seconds (for demo)
                setTimeout(() => {
                    this.innerHTML = this.getAttribute('data-original-text') || 'Submit';
                    this.disabled = false;
                }, 2000);
            }
        });

        // Store original text
        btn.setAttribute('data-original-text', btn.innerHTML);
    });
});

// Responsive adjustments
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        if (mainNav) mainNav.classList.remove('active');
        if (sidebar) sidebar.classList.remove('active');
    }
});

// Print functionality for certificates
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-print')) {
        window.print();
    }
});

// View details modal (simplified)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-view')) {
        const item = e.target.closest('.request-item, .certificate-item, .user-item');
        const title = item.querySelector('h4').textContent;
        alert(`Viewing details for: ${title}\n\nThis would open a detailed modal in a full implementation.`);
    }
});

// Edit functionality (simplified)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-edit')) {
        const item = e.target.closest('.announcement-item, .event-item, .user-item');
        const title = item.querySelector('h4, h3').textContent;
        alert(`Editing: ${title}\n\nThis would open an edit form in a full implementation.`);
    }
});

// Delete functionality (simplified)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
        if (confirm('Are you sure you want to delete this item?')) {
            const item = e.target.closest('.announcement-item, .event-item');
            item.remove();
            alert('Item deleted successfully.');
        }
    }
});

// RSVP functionality
document.addEventListener('click', (e) => {
    if (e.target.textContent === 'RSVP' || e.target.textContent === 'Join' || e.target.textContent === 'Volunteer') {
        const eventTitle = e.target.closest('.event-card, .event-item').querySelector('h3, h4').textContent;
        alert(`Thank you for your interest in: ${eventTitle}\n\nWe will contact you with more details.`);
        e.target.textContent = 'Registered';
        e.target.style.background = '#27ae60';
    }
});

// Quick actions
const actionBtns = document.querySelectorAll('.action-btn');
if (actionBtns.length > 0) {
    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            if (section) {
                const targetLink = document.querySelector(`[data-section="${section}"]`);
                if (targetLink) {
                    targetLink.click();
                }
            }
        });
    });
}

// Announcement and event management
let announcements = [
    { title: 'Sunday Mass Schedule Update', content: 'Dear parishioners...', date: 'Oct 10, 2024', priority: 'normal' },
    { title: 'Community Potluck Dinner', content: 'Join us for...', date: 'Oct 8, 2024', priority: 'normal' }
];

let events = [
    { title: 'Community Potluck', date: '2024-10-15', time: '18:00', location: 'Parish Hall', category: 'fellowship' },
    { title: 'Youth Group Meeting', date: '2024-10-20', time: '19:00', location: 'Youth Center', category: 'ministry' }
];

// Update displays (simplified for demo)
function updateAnnouncementsDisplay() {
    const container = document.querySelector('.announcements-list');
    if (container) {
        // This would update the announcements list in a full implementation
        console.log('Announcements updated');
    }
}

function updateEventsDisplay() {
    const container = document.querySelector('.events-list');
    if (container) {
        // This would update the events list in a full implementation
        console.log('Events updated');
    }
}

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you within 24 hours.');
        contactForm.reset();
    });
}

// Newsletter signup
const newsletterSignup = document.querySelector('.newsletter-signup');
if (newsletterSignup) {
    newsletterSignup.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterSignup.querySelector('.newsletter-input').value;
        if (email) {
            alert('Thank you for subscribing to our newsletter!');
            newsletterSignup.reset();
        }
    });
}

// Ministry and event registration
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-primary') && e.target.textContent.includes('Join')) {
        const ministryName = e.target.closest('.ministry-detail-card').querySelector('h3').textContent;
        alert(`Thank you for your interest in joining ${ministryName}! We will contact you soon.`);
    }

    if (e.target.textContent === 'RSVP' || e.target.textContent === 'Join' || e.target.textContent === 'Volunteer') {
        const eventTitle = e.target.closest('.event-card, .event-card-large').querySelector('h3').textContent;
        alert(`Thank you for your interest in: ${eventTitle}\n\nWe will contact you with more details.`);
        e.target.textContent = 'Registered';
        e.target.style.background = '#27ae60';
    }
});

// Smooth scrolling for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Mobile menu toggle for all pages
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            mainNav.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuToggle.contains(e.target) && !mainNav.contains(e.target)) {
                mainNav.classList.remove('active');
            }
        });

        // Close mobile menu when clicking on a nav link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
            });
        });
    }
});

// Password toggle handled in auth.js

// Export functions for global access
window.updateAnnouncementsDisplay = updateAnnouncementsDisplay;
window.updateEventsDisplay = updateEventsDisplay;