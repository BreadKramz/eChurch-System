// Authentication JavaScript - Enhanced Version

// User data storage
let users = JSON.parse(localStorage.getItem('churchUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let rememberMe = localStorage.getItem('rememberMe') === 'true';

// Check for old unhashed data and clear if needed
const authVersion = localStorage.getItem('authVersion');
if (authVersion !== 'hashed') {
    // Clear old data to ensure compatibility with new hashed passwords
    localStorage.removeItem('churchUsers');
    localStorage.removeItem('currentUser');
    localStorage.setItem('authVersion', 'hashed');
    users = [];
    currentUser = null;
}

// Simple password hashing function (for demo purposes - in production use proper hashing)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

// Default test users with hashed passwords
if (users.length === 0) {
    // Admin user
    users.push({
        email: 'admin@ompchurchdumaguete.com',
        password: hashPassword('admin123'),
        role: 'admin',
        name: 'Administrator',
        accessCode: hashPassword('admin123'),
        createdAt: new Date().toISOString()
    });

    // Test parishioner user
    users.push({
        email: 'test@test.com',
        password: hashPassword('test123'),
        role: 'user',
        name: 'Test User',
        registrationDate: new Date().toISOString()
    });

    localStorage.setItem('churchUsers', JSON.stringify(users));
}

// Enhanced validation functions with inline feedback
function showError(input, message) {
    const formGroup = input.closest('.relative') || input.parentElement;
    formGroup.classList.add('error');
    formGroup.classList.remove('success');

    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message text-red-500 text-sm mt-1 block';
        formGroup.appendChild(errorElement);
    }
    errorElement.textContent = message;

    // Add error styling to input
    input.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
    input.classList.remove('border-green-500', 'focus:ring-green-500', 'focus:border-green-500');
}

function showSuccess(input) {
    const formGroup = input.closest('.relative') || input.parentElement;
    formGroup.classList.add('success');
    formGroup.classList.remove('error');

    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }

    // Add success styling to input
    input.classList.add('border-green-500', 'focus:ring-green-500', 'focus:border-green-500');
    input.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
}

function clearValidation(input) {
    const formGroup = input.closest('.relative') || input.parentElement;
    formGroup.classList.remove('error', 'success');

    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }

    input.classList.remove('border-red-500', 'border-green-500', 'focus:ring-red-500', 'focus:ring-green-500', 'focus:border-red-500', 'focus:border-green-500');
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

function updatePasswordStrength(input) {
    const password = input.value;
    const formGroup = input.closest('.relative') || input.parentElement;
    let strengthIndicator = formGroup.querySelector('.password-strength');

    if (!strengthIndicator) {
        strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength mt-2';
        formGroup.appendChild(strengthIndicator);
    }

    if (password.length === 0) {
        strengthIndicator.innerHTML = '';
        return;
    }

    const { strength, feedback } = checkPasswordStrength(password);

    let strengthText = '';
    let strengthClass = '';

    if (strength <= 2) {
        strengthText = 'Weak';
        strengthClass = 'text-red-500';
    } else if (strength <= 3) {
        strengthText = 'Fair';
        strengthClass = 'text-yellow-500';
    } else if (strength <= 4) {
        strengthText = 'Good';
        strengthClass = 'text-blue-500';
    } else {
        strengthText = 'Strong';
        strengthClass = 'text-green-500';
    }

    const strengthBar = `<div class="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div class="h-2 rounded-full transition-all duration-300 ${
            strength <= 2 ? 'bg-red-500 w-1/4' :
            strength <= 3 ? 'bg-yellow-500 w-1/2' :
            strength <= 4 ? 'bg-blue-500 w-3/4' : 'bg-green-500 w-full'
        }"></div>
    </div>`;

    strengthIndicator.innerHTML = `
        <div class="flex items-center justify-between text-sm">
            <span class="${strengthClass} font-medium">Password Strength: ${strengthText}</span>
        </div>
        ${strengthBar}
        ${feedback.length > 0 ? `<div class="text-xs text-gray-500 mt-1">Suggestions: ${feedback.join(', ')}</div>` : ''}
    `;
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

// Logout functionality is now handled in script.js

// Check authentication on protected pages
function checkAuth() {
    const protectedPages = ['dashboard.html', 'admin.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage)) {
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Check role for admin page
        if (currentPage === 'admin.html' && currentUser.role !== 'admin') {
            window.location.href = 'login.html';
            return;
        }
    }
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication on page load
    checkAuth();
    // User login form handling
    const userLoginForm = document.getElementById('user-login-form');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const rememberMeCheckbox = document.getElementById('remember-me');
            const submitBtn = userLoginForm.querySelector('button[type="submit"]');

            // Clear previous errors
            clearValidation(emailInput);
            clearValidation(passwordInput);

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const remember = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

            let isValid = true;

            // Validate email
            if (!email) {
                showError(emailInput, 'Email is required');
                isValid = false;
            } else if (!checkEmail(emailInput)) {
                isValid = false;
            }

            // Validate password
            if (!password) {
                showError(passwordInput, 'Password is required');
                isValid = false;
            }

            if (!isValid) return;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Signing in...';

            try {
                // Check credentials with hashed password (new system)
                const hashedPassword = hashPassword(password);
                let user = users.find(u => u.email === email && u.password === hashedPassword);

                // Fallback: check plain text password for backward compatibility
                if (!user) {
                    user = users.find(u => u.email === email && u.password === password);
                    // If found with plain text, update to hashed password
                    if (user) {
                        user.password = hashedPassword;
                        localStorage.setItem('churchUsers', JSON.stringify(users));
                    }
                }

                if (user) {
                    currentUser = user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    // Show success message
                    showSuccess(emailInput);
                    showSuccess(passwordInput);

                    // Redirect after short delay
                    setTimeout(() => {
                        if (user.role === 'admin') {
                            window.location.href = 'admin.html';
                        } else {
                            window.location.href = 'dashboard.html';
                        }
                    }, 1000);
                } else {
                    showError(emailInput, 'Invalid email or password');
                    showError(passwordInput, 'Invalid email or password');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Login to Account';
                }
            } catch (error) {
                console.error('Login error:', error);
                showError(emailInput, 'An error occurred. Please try again.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Login to Account';
            }
        });

        // Real-time validation for login
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        emailInput.addEventListener('input', () => {
            if (emailInput.value.trim()) {
                checkEmail(emailInput);
            } else {
                clearValidation(emailInput);
            }
        });

        passwordInput.addEventListener('input', () => {
            if (passwordInput.value) {
                showSuccess(passwordInput);
            } else {
                clearValidation(passwordInput);
            }
        });
    }

    // User registration form handling
    const userRegisterForm = document.getElementById('user-register-form');
    if (userRegisterForm) {
        userRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            const submitBtn = userRegisterForm.querySelector('button[type="submit"]');

            // Clear previous errors
            clearValidation(emailInput);
            clearValidation(passwordInput);
            clearValidation(confirmPasswordInput);

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            let isValid = true;

            // Validate email
            if (!email) {
                showError(emailInput, 'Email is required');
                isValid = false;
            } else if (!checkEmail(emailInput)) {
                isValid = false;
            } else if (users.some(u => u.email === email)) {
                showError(emailInput, 'An account with this email already exists');
                isValid = false;
            }

            // Validate password
            if (!password) {
                showError(passwordInput, 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                showError(passwordInput, 'Password must be at least 6 characters long');
                isValid = false;
            } else if (!checkLength(passwordInput, 6, 50)) {
                isValid = false;
            }

            // Validate confirm password
            if (!confirmPassword) {
                showError(confirmPasswordInput, 'Please confirm your password');
                isValid = false;
            } else if (password !== confirmPassword) {
                showError(confirmPasswordInput, 'Passwords do not match');
                isValid = false;
            } else if (!checkPasswordsMatch(passwordInput, confirmPasswordInput)) {
                isValid = false;
            }

            if (!isValid) return;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating Account...';

            try {
                // Create new user with hashed password
                const newUser = {
                    email: email,
                    password: hashPassword(password),
                    role: 'user',
                    name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').trim() || 'Parishioner',
                    registrationDate: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };

                users.push(newUser);
                localStorage.setItem('churchUsers', JSON.stringify(users));

                // Show success
                showSuccess(emailInput);
                showSuccess(passwordInput);
                showSuccess(confirmPasswordInput);

                // Redirect after success message
                setTimeout(() => {
                    alert('Registration successful! Welcome to our parish community. You can now log in.');
                    window.location.href = 'login.html';
                }, 1000);

            } catch (error) {
                console.error('Registration error:', error);
                showError(emailInput, 'An error occurred during registration. Please try again.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-user-plus mr-2"></i>Create Account';
            }
        });

        // Real-time validation for registration
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');

        emailInput.addEventListener('input', () => {
            if (emailInput.value.trim()) {
                if (checkEmail(emailInput)) {
                    // Check if email exists
                    const email = emailInput.value.trim();
                    if (users.some(u => u.email === email)) {
                        showError(emailInput, 'An account with this email already exists');
                    }
                }
            } else {
                clearValidation(emailInput);
            }
        });

        passwordInput.addEventListener('input', () => {
            if (passwordInput.value) {
                updatePasswordStrength(passwordInput);
                if (passwordInput.value.length >= 6) {
                    showSuccess(passwordInput);
                } else {
                    showError(passwordInput, 'Password must be at least 6 characters long');
                }
            } else {
                clearValidation(passwordInput);
                const strengthIndicator = passwordInput.parentElement.querySelector('.password-strength');
                if (strengthIndicator) strengthIndicator.innerHTML = '';
            }
            // Also check confirm password match
            if (confirmPasswordInput.value) {
                checkPasswordsMatch(passwordInput, confirmPasswordInput);
            }
        });

        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value) {
                checkPasswordsMatch(passwordInput, confirmPasswordInput);
            } else {
                clearValidation(confirmPasswordInput);
            }
        });
    }

    // Admin login form handling
    const adminLoginForm = document.getElementById('admin-login-form-element');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('admin-email');
            const passwordInput = document.getElementById('admin-password');
            const codeInput = document.getElementById('admin-code');
            const submitBtn = adminLoginForm.querySelector('button[type="submit"]');

            // Clear previous errors
            clearValidation(emailInput);
            clearValidation(passwordInput);
            clearValidation(codeInput);

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const accessCode = codeInput.value;

            let isValid = true;

            // Validate email
            if (!email) {
                showError(emailInput, 'Email is required');
                isValid = false;
            } else if (!checkEmail(emailInput)) {
                isValid = false;
            }

            // Validate password
            if (!password) {
                showError(passwordInput, 'Password is required');
                isValid = false;
            }

            // Validate access code
            if (!accessCode) {
                showError(codeInput, 'Access code is required');
                isValid = false;
            }

            if (!isValid) return;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Authenticating...';

            try {
                // Check admin credentials with hashed password and access code
                const hashedPassword = hashPassword(password);
                const hashedAccessCode = hashPassword(accessCode);
                let admin = users.find(u => u.email === email && u.password === hashedPassword && u.role === 'admin' && u.accessCode === hashedAccessCode);

                // Fallback: check plain text for backward compatibility
                if (!admin) {
                    admin = users.find(u => u.email === email && u.password === password && u.role === 'admin' && u.accessCode === accessCode);
                    // If found with plain text, update to hashed
                    if (admin) {
                        admin.password = hashedPassword;
                        admin.accessCode = hashedAccessCode;
                        localStorage.setItem('churchUsers', JSON.stringify(users));
                    }
                }

                if (admin) {
                    currentUser = admin;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    // Show success
                    showSuccess(emailInput);
                    showSuccess(passwordInput);
                    showSuccess(codeInput);

                    // Redirect after short delay
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1000);
                } else {
                    showError(emailInput, 'Invalid admin credentials');
                    showError(passwordInput, 'Invalid admin credentials');
                    showError(codeInput, 'Invalid admin credentials');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Access Admin Panel';
                }
            } catch (error) {
                console.error('Admin login error:', error);
                showError(emailInput, 'An error occurred. Please try again.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Access Admin Panel';
            }
        });

        // Real-time validation for admin login
        const emailInput = document.getElementById('admin-email');
        const passwordInput = document.getElementById('admin-password');
        const codeInput = document.getElementById('admin-code');

        emailInput.addEventListener('input', () => {
            if (emailInput.value.trim()) {
                checkEmail(emailInput);
            } else {
                clearValidation(emailInput);
            }
        });

        passwordInput.addEventListener('input', () => {
            if (passwordInput.value) {
                showSuccess(passwordInput);
            } else {
                clearValidation(passwordInput);
            }
        });

        codeInput.addEventListener('input', () => {
            if (codeInput.value) {
                showSuccess(codeInput);
            } else {
                clearValidation(codeInput);
            }
        });
    }
});