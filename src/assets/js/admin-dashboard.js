// Admin Dashboard JavaScript - Our Mother of Perpetual Help Redemptorist Church

// Load admin data and update dashboard
function loadAdminData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '../auth/admin-login.html';
        return;
    }

    // Update header with admin data
    const adminNameElement = document.querySelector('.hidden.sm\\:block.text-sm.font-medium.text-gray-700');
    const adminAvatarElement = document.querySelector('.bg-red-500.rounded-full');

    if (adminNameElement) {
        adminNameElement.textContent = currentUser.name || 'Administrator';
    }

    if (adminAvatarElement) {
        adminAvatarElement.textContent = (currentUser.name || 'A').charAt(0).toUpperCase();
    }

    // Load dynamic stats
    loadDashboardStats();
}

// Load dashboard statistics
function loadDashboardStats() {
    const users = JSON.parse(localStorage.getItem('churchUsers')) || [];
    const serviceRequests = JSON.parse(localStorage.getItem('serviceRequests')) || [];
    const certificateRequests = JSON.parse(localStorage.getItem('certificateRequests')) || [];

    // Update user stats
    const totalUsersElement = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 .font-bold.text-secondary');
    const pendingRequestsElement = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 .font-bold.text-orange-600');

    if (totalUsersElement) {
        totalUsersElement.textContent = users.length;
    }

    if (pendingRequestsElement) {
        const pendingCount = serviceRequests.filter(r => r.status === 'pending').length +
                            certificateRequests.filter(r => r.status === 'pending').length;
        pendingRequestsElement.textContent = pendingCount;
    }
}

// Handle announcement form submission
function handleAnnouncementSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const announcement = {
        id: Date.now(),
        title: formData.get('title'),
        content: formData.get('content'),
        author: JSON.parse(localStorage.getItem('currentUser')).name,
        createdAt: new Date().toISOString(),
        status: 'published'
    };

    // Store announcements
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    announcements.unshift(announcement);
    localStorage.setItem('announcements', JSON.stringify(announcements));

    alert('Announcement published successfully!');
    form.reset();

    // Refresh announcements list
    loadAnnouncements();
}

// Handle event form submission
function handleEventSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const event = {
        id: Date.now(),
        title: formData.get('title'),
        date: formData.get('date'),
        time: formData.get('time'),
        location: formData.get('location'),
        description: formData.get('description'),
        category: formData.get('category'),
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    // Store events
    const events = JSON.parse(localStorage.getItem('events')) || [];
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));

    alert('Event created successfully!');
    form.reset();

    // Refresh events list
    loadEvents();
}

// Load announcements for display
function loadAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    const container = document.querySelector('#announcements-section .space-y-4');

    if (container && announcements.length > 0) {
        container.innerHTML = announcements.slice(0, 2).map(announcement => `
            <div class="border-l-4 border-primary pl-4">
                <h4 class="font-semibold text-gray-800">${announcement.title}</h4>
                <p class="text-sm text-gray-600">Posted: ${new Date(announcement.createdAt).toLocaleDateString()}</p>
            </div>
        `).join('');
    }
}

// Load events for display
function loadEvents() {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const container = document.getElementById('events-list');

    if (container && events.length > 0) {
        container.innerHTML = events.slice(0, 3).map(event => `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <i class="fas fa-calendar-alt text-primary"></i>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800">${event.title}</h4>
                        <p class="text-sm text-gray-500">${new Date(event.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="bg-secondary text-white px-3 py-1 rounded text-sm hover:bg-secondary/90">Edit</button>
                    <button class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Delete</button>
                </div>
            </div>
        `).join('');
    }
}

// Handle settings form submission
function handleSettingsSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const settings = {
        churchName: formData.get('churchName'),
        churchAddress: formData.get('churchAddress'),
        contactEmail: formData.get('contactEmail'),
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('churchSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
}

// Current time display functionality
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
    loadAnnouncements();
    loadEvents();
    updateTime();
    setInterval(updateTime, 1000);

    // Add form event listeners
    const announcementForm = document.querySelector('#announcements-section form');
    const eventForm = document.querySelector('#events-section form');
    const settingsForm = document.querySelector('#settings-section form');

    if (announcementForm) announcementForm.addEventListener('submit', handleAnnouncementSubmit);
    if (eventForm) eventForm.addEventListener('submit', handleEventSubmit);
    if (settingsForm) settingsForm.addEventListener('submit', handleSettingsSubmit);
});