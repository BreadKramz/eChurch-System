// Get elements
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const adminLoginSection = document.getElementById('admin-login-section');
const dashboardSection = document.getElementById('dashboard-section');
const adminDashboardSection = document.getElementById('admin-dashboard-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const adminLoginForm = document.getElementById('admin-login-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const showAdminLogin = document.getElementById('show-admin-login');
const backToUserLogin = document.getElementById('back-to-user-login');

// Option elements
const scheduleBtn = document.getElementById('schedule-service-btn');
const donateBtn = document.getElementById('donate-btn');
const requestBtn = document.getElementById('request-certificate-btn');
const announcementsBtn = document.getElementById('announcements-btn');
const userLogoutBtn = document.getElementById('user-logout-btn');

const scheduleForm = document.getElementById('schedule-service-form');
const donateForm = document.getElementById('donate-form');
const requestForm = document.getElementById('request-certificate-form');
const announcementsSection = document.getElementById('announcements-section');

// Admin elements
const manageAnnouncementsBtn = document.getElementById('manage-announcements-btn');
const viewServiceRequestsBtn = document.getElementById('view-service-requests-btn');
const viewDonationsBtn = document.getElementById('view-donations-btn');
const viewCertificateRequestsBtn = document.getElementById('view-certificate-requests-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');

const manageAnnouncementsForm = document.getElementById('manage-announcements-form');
const viewServiceRequestsSection = document.getElementById('view-service-requests-section');
const viewDonationsSection = document.getElementById('view-donations-section');
const viewCertificateRequestsSection = document.getElementById('view-certificate-requests-section');

const announcementsText = document.getElementById('announcements-text');
const saveAnnouncementsBtn = document.getElementById('save-announcements-btn');
const previewAnnouncementsBtn = document.getElementById('preview-announcements-btn');

// Announcements data
let currentAnnouncements = [
    "Example...",
    "Example...",
    "Example..."
];

// Toggle between login and register
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.classList.add('hidden');
    registerSection.classList.remove('hidden');
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
});

// Admin login toggle
showAdminLogin.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.classList.add('hidden');
    adminLoginSection.classList.remove('hidden');
});

backToUserLogin.addEventListener('click', (e) => {
    e.preventDefault();
    adminLoginSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
});

// Handle login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulate login
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
});

// Handle register
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Simulate register
    registerSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
});

// Handle admin login
adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulate admin login
    adminLoginSection.classList.add('hidden');
    adminDashboardSection.classList.remove('hidden');
});

// Function to hide all option forms
function hideAllOptions() {
    scheduleForm.classList.add('hidden');
    donateForm.classList.add('hidden');
    requestForm.classList.add('hidden');
    announcementsSection.classList.add('hidden');
}

// Function to hide all admin option forms
function hideAllAdminOptions() {
    manageAnnouncementsForm.classList.add('hidden');
    viewServiceRequestsSection.classList.add('hidden');
    viewDonationsSection.classList.add('hidden');
    viewCertificateRequestsSection.classList.add('hidden');
}

// Function to update announcements display
function updateAnnouncementsDisplay() {
    const ul = announcementsSection.querySelector('ul');
    ul.innerHTML = '';
    currentAnnouncements.forEach(announcement => {
        const li = document.createElement('li');
        li.textContent = announcement;
        ul.appendChild(li);
    });
}

// Handle option buttons
scheduleBtn.addEventListener('click', () => {
    hideAllOptions();
    scheduleForm.classList.remove('hidden');
});

donateBtn.addEventListener('click', () => {
    hideAllOptions();
    donateForm.classList.remove('hidden');
});

requestBtn.addEventListener('click', () => {
    hideAllOptions();
    requestForm.classList.remove('hidden');
});

announcementsBtn.addEventListener('click', () => {
    hideAllOptions();
    announcementsSection.classList.remove('hidden');
});

userLogoutBtn.addEventListener('click', () => {
    dashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
});

// Admin option buttons
manageAnnouncementsBtn.addEventListener('click', () => {
    hideAllAdminOptions();
    announcementsText.value = currentAnnouncements.join('\n');
    manageAnnouncementsForm.classList.remove('hidden');
});

viewServiceRequestsBtn.addEventListener('click', () => {
    hideAllAdminOptions();
    viewServiceRequestsSection.classList.remove('hidden');
});

viewDonationsBtn.addEventListener('click', () => {
    hideAllAdminOptions();
    viewDonationsSection.classList.remove('hidden');
});

viewCertificateRequestsBtn.addEventListener('click', () => {
    hideAllAdminOptions();
    viewCertificateRequestsSection.classList.remove('hidden');
});

adminLogoutBtn.addEventListener('click', () => {
    adminDashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
});

// Save announcements
saveAnnouncementsBtn.addEventListener('click', () => {
    const text = announcementsText.value.trim();
    if (text) {
        currentAnnouncements = text.split('\n').filter(line => line.trim() !== '');
        updateAnnouncementsDisplay();
        alert('Announcements updated!');
    } else {
        alert('Please enter some announcements.');
    }
});

// Preview announcements
previewAnnouncementsBtn.addEventListener('click', () => {
    const text = announcementsText.value.trim();
    if (text) {
        const preview = text.split('\n').filter(line => line.trim() !== '');
        let previewText = '📢 Announcements Preview:\n\n';
        preview.forEach((item, index) => {
            previewText += `${index + 1}. ${item}\n`;
        });
        alert(previewText);
    } else {
        alert('No announcements to preview.');
    }
});

// Handle approve/reject buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('approve-btn')) {
        const id = e.target.getAttribute('data-id');
        handleApproval(id, 'approved');
    } else if (e.target.classList.contains('reject-btn')) {
        const id = e.target.getAttribute('data-id');
        handleApproval(id, 'rejected');
    }
});

function handleApproval(id, status) {
    const item = document.querySelector(`[data-id="${id}"]`);
    if (item) {
        const requestItem = item.closest('.request-item');
        const statusSpan = requestItem.querySelector('.status');
        const actionsDiv = requestItem.querySelector('.request-actions');

        // Update status
        statusSpan.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusSpan.className = `status ${status}`;

        // Update actions
        actionsDiv.innerHTML = '<span class="processed">Processed</span>';

        alert(`Request ${status}!`);
    }
}

// Handle form submissions (simulate)
scheduleForm.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Service scheduling request submitted! Admin will review.');
    e.target.reset();
});

donateForm.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Donation submitted! You will receive a confirmation.');
    e.target.reset();
});

requestForm.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Certificate request submitted! Admin will review.');
    e.target.reset();
});

// Initialize announcements display
updateAnnouncementsDisplay();