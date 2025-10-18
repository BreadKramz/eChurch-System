// Authentication JavaScript - Our Mother of Perpetual Help Redemptorist Church

// Error message display function
function showErrorMessage(title, message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        // Update content if title and message are provided
        if (title && message) {
            const titleElement = errorMessage.querySelector('h3');
            const messageElement = errorMessage.querySelector('p');
            if (titleElement) titleElement.textContent = title;
            if (messageElement) messageElement.textContent = message;
        }
        errorMessage.classList.remove('hidden');
    }
}

// Close error message
function closeErrorMessage() {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

// Close success message
function closeSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
    // Redirect to login page
    window.location.href = 'login.html';
}

// Success message display function
function showSuccessMessage(title, message) {
    const successMessage = document.getElementById('success-message');
    const progressBar = document.getElementById('progress-bar');

    if (successMessage) {
        successMessage.classList.remove('hidden');

        // Animate progress bar if it exists (for login success)
        if (progressBar) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 1;
                progressBar.style.width = progress + '%';

                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, 30); // 3 seconds total (3000ms / 100 = 30ms per step)
        }
    }
}

// Password strength indicator
function updatePasswordStrength(password) {
    const strengthBars = ['strength-1', 'strength-2', 'strength-3', 'strength-4'];
    const strengthText = document.getElementById('strength-text');

    let strength = 0;
    let feedback = [];

    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    // Update visual bars
    strengthBars.forEach((barId, index) => {
        const bar = document.getElementById(barId);
        if (index < strength) {
            if (strength <= 2) bar.className = 'flex-1 h-1 bg-red-400 rounded-full';
            else if (strength <= 4) bar.className = 'flex-1 h-1 bg-yellow-400 rounded-full';
            else bar.className = 'flex-1 h-1 bg-green-400 rounded-full';
        } else {
            bar.className = 'flex-1 h-1 bg-gray-200 rounded-full';
        }
    });

    // Update text feedback
    if (password.length === 0) {
        strengthText.textContent = 'Password must be at least 6 characters';
        strengthText.className = 'text-gray-500 mt-1';
    } else if (strength <= 2) {
        strengthText.textContent = 'Weak password - add uppercase, numbers, or symbols';
        strengthText.className = 'text-red-500 mt-1';
    } else if (strength <= 4) {
        strengthText.textContent = 'Fair password - consider adding more complexity';
        strengthText.className = 'text-yellow-600 mt-1';
    } else {
        strengthText.textContent = 'Strong password!';
        strengthText.className = 'text-green-600 mt-1';
    }
}

// Password confirmation validation
function validatePasswordMatch() {
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const matchIndicator = document.getElementById('password-match');

    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            matchIndicator.classList.add('hidden');
            return true;
        } else {
            matchIndicator.classList.remove('hidden');
            return false;
        }
    } else {
        matchIndicator.classList.add('hidden');
        return false;
    }
}

// Simple hash function for demo purposes (not secure for production)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

// Load users from localStorage
function loadUsers() {
    const users = localStorage.getItem('church_users');
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('church_users', JSON.stringify(users));
}

// Registration form handler
document.addEventListener('DOMContentLoaded', function() {
    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const togglePasswordBtn = document.getElementById('toggle-register-password');

        // Password strength indicator
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
            validatePasswordMatch();
        });

        // Password confirmation validation
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);

        // Toggle password visibility
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        }

        // Form submission
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const userData = {
                firstName: formData.get('firstName').trim(),
                lastName: formData.get('lastName').trim(),
                email: formData.get('email').toLowerCase().trim(),
                contactNumber: formData.get('contactNumber').trim(),
                password: simpleHash(formData.get('password')),
                createdAt: new Date().toISOString(),
                id: Date.now()
            };

            // Load existing users
            const users = loadUsers();

            // Check if email already exists
            const existingUser = users.find(user => user.email === userData.email);
            if (existingUser) {
                showErrorMessage('Registration Failed', 'An account with this email already exists. Please use a different email or try logging in.');
                return;
            }

            // Add new user
            users.push(userData);
            saveUsers(users);

            // Show success message
            showSuccessMessage('Account Created Successfully!', 'Welcome to our church community!');
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const togglePasswordBtn = document.getElementById('toggle-password');

        // Toggle password visibility
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', function() {
                const passwordInput = document.getElementById('login-password');
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        }

        // Form submission
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const email = formData.get('email').toLowerCase().trim();
            const password = simpleHash(formData.get('password'));

            // Load users
            const users = loadUsers();

            // Find user
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Store current user session
                localStorage.setItem('current_user', JSON.stringify(user));

                // Show success message and redirect
                showSuccessMessage('Login Successful!', 'Welcome back! Redirecting to your dashboard...');
                setTimeout(() => {
                    window.location.href = '../dashboard/dashboard.html';
                }, 3000);
            } else {
                showErrorMessage('Login Failed', 'Invalid email or password. Please try again.');
            }
        });

        // Remember me functionality removed
    }

    // Add entrance animation to auth forms
    const authCard = document.querySelector('.bg-white\\/95');
    if (authCard) {
        authCard.style.opacity = '0';
        authCard.style.transform = 'translateY(30px)';
        setTimeout(() => {
            authCard.style.transition = 'all 0.8s ease-out';
            authCard.style.opacity = '1';
            authCard.style.transform = 'translateY(0)';
        }, 200);
    }
});