// Get elements
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');

// Option elements
const scheduleBtn = document.getElementById('schedule-service-btn');
const donateBtn = document.getElementById('donate-btn');
const requestBtn = document.getElementById('request-certificate-btn');
const announcementsBtn = document.getElementById('announcements-btn');

const scheduleForm = document.getElementById('schedule-service-form');
const donateForm = document.getElementById('donate-form');
const requestForm = document.getElementById('request-certificate-form');
const announcementsSection = document.getElementById('announcements-section');

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

// Function to hide all option forms
function hideAllOptions() {
    scheduleForm.classList.add('hidden');
    donateForm.classList.add('hidden');
    requestForm.classList.add('hidden');
    announcementsSection.classList.add('hidden');
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