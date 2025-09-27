// Authentication JavaScript - Simplified Version

// User data storage
let users = JSON.parse(localStorage.getItem('churchUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Default test users
if (users.length === 0) {
    // Admin user
    users.push({
        email: 'admin@ompchurchdumaguete.com',
        password: 'admin123',
        role: 'admin',
        name: 'Administrator',
        accessCode: 'admin123'
    });

    // Test parishioner user
    users.push({
        email: 'test@test.com',
        password: 'test123',
        role: 'user',
        name: 'Test User',
        registrationDate: new Date().toISOString()
    });

    localStorage.setItem('churchUsers', JSON.stringify(users));
}

// Simple validation functions
function showError(input, message) {
    const formGroup = input.parentElement;
    formGroup.className = 'form-group error';

    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function showSuccess(input) {
    const formGroup = input.parentElement;
    formGroup.className = 'form-group success';

    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function checkEmail(input) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(input.value.trim())) {
        showSuccess(input);
        return true;
    } else {
        showError(input, 'Email is not valid');
        return false;
    }
}

function checkLength(input, min, max) {
    if (input.value.length < min) {
        showError(input, `Must be at least ${min} characters`);
        return false;
    } else if (input.value.length > max) {
        showError(input, `Must be less than ${max} characters`);
        return false;
    } else {
        showSuccess(input);
        return true;
    }
}

function checkPasswordsMatch(input1, input2) {
    if (input1.value !== input2.value) {
        showError(input2, 'Passwords do not match');
        return false;
    } else {
        showSuccess(input2);
        return true;
    }
}

function checkRequired(input) {
    if (input.value.trim() === '') {
        showError(input, 'This field is required');
        return false;
    } else {
        showSuccess(input);
        return true;
    }
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    // User login form handling
    const userLoginForm = document.getElementById('user-login-form');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                alert('Please fill in all required fields.');
                return;
            }

            // Check credentials
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                alert('Invalid email or password. Please try again.');
            }
        });

        // Simple validation for login
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        emailInput.addEventListener('blur', () => checkEmail(emailInput));
        passwordInput.addEventListener('blur', () => checkRequired(passwordInput));
    }

    // User registration form handling
    const userRegisterForm = document.getElementById('user-register-form');
    if (userRegisterForm) {
        userRegisterForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!email || !password || !confirmPassword) {
                alert('Please fill in all required fields.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            // Check if email already exists
            if (users.some(u => u.email === email)) {
                alert('An account with this email already exists.');
                return;
            }

            // Create new user
            const newUser = {
                email: email,
                password: password,
                role: 'user',
                name: email.split('@')[0],
                registrationDate: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('churchUsers', JSON.stringify(users));

            alert('Registration successful! Welcome to our parish community.');
            window.location.href = 'login.html';
        });

        // Simple validation for register
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');

        emailInput.addEventListener('blur', () => checkEmail(emailInput));
        passwordInput.addEventListener('blur', () => checkLength(passwordInput, 6, 50));
        confirmPasswordInput.addEventListener('blur', () => checkPasswordsMatch(passwordInput, confirmPasswordInput));
    }

    // Admin login form handling
    const adminLoginForm = document.getElementById('admin-login-form-element');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('admin-email').value.trim();
            const password = document.getElementById('admin-password').value;
            const accessCode = document.getElementById('admin-code').value;

            if (!email || !password || !accessCode) {
                alert('Please fill in all required fields.');
                return;
            }

            // Check admin credentials
            const admin = users.find(u => u.email === email && u.password === password && u.role === 'admin' && u.accessCode === accessCode);

            if (admin) {
                currentUser = admin;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                window.location.href = 'admin.html';
            } else {
                alert('Invalid admin credentials. Please contact the parish office for access.');
            }
        });

        // Simple validation for admin login
        const emailInput = document.getElementById('admin-email');
        const passwordInput = document.getElementById('admin-password');
        const codeInput = document.getElementById('admin-code');

        emailInput.addEventListener('blur', () => checkEmail(emailInput));
        passwordInput.addEventListener('blur', () => checkRequired(passwordInput));
        codeInput.addEventListener('blur', () => checkRequired(codeInput));
    }
});