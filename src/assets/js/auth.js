// Authentication JavaScript - Our Mother of Perpetual Help Redemptorist Church
// Integrated with Supabase for authentication

// Password strength checker
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

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthBars = ['strength-1', 'strength-2', 'strength-3', 'strength-4'];
    const feedbackElement = document.getElementById('password-feedback');

    if (!password) {
        strengthBars.forEach(id => {
            document.getElementById(id).className = 'h-0.5 w-1/4 bg-gray-200 rounded';
        });
        if (feedbackElement) feedbackElement.textContent = 'Use uppercase, lowercase, number & symbol';
        return;
    }

    const { strength, feedback } = checkPasswordStrength(password);

    strengthBars.forEach((id, index) => {
        const element = document.getElementById(id);
        if (index < strength) {
            if (strength <= 2) element.className = 'h-0.5 w-1/4 bg-red-400 rounded';
            else if (strength <= 3) element.className = 'h-0.5 w-1/4 bg-yellow-400 rounded';
            else if (strength <= 4) element.className = 'h-0.5 w-1/4 bg-blue-400 rounded';
            else element.className = 'h-0.5 w-1/4 bg-green-400 rounded';
        } else {
            element.className = 'h-0.5 w-1/4 bg-gray-200 rounded';
        }
    });

    if (feedbackElement) {
        if (strength >= 4) {
            feedbackElement.textContent = 'Strong password!';
            feedbackElement.className = 'text-xs text-green-600';
        } else if (strength >= 3) {
            feedbackElement.textContent = 'Good password. ' + feedback.join(', ') + ' would make it stronger.';
            feedbackElement.className = 'text-xs text-blue-600';
        } else if (strength >= 2) {
            feedbackElement.textContent = 'Weak password. Add: ' + feedback.join(', ');
            feedbackElement.className = 'text-xs text-yellow-600';
        } else {
            feedbackElement.textContent = 'Very weak password. Add: ' + feedback.join(', ');
            feedbackElement.className = 'text-xs text-red-600';
        }
    }
}

// Sanitize input function
function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}

// Validate email function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone function
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone) || phone === '';
}

// Validate name function
function isValidName(name) {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
}

// Show feedback message
function showFeedback(message, type = 'error') {
    const feedbackDiv = document.getElementById('form-feedback');
    if (feedbackDiv) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `text-xs mt-3 text-center p-3 rounded-lg border ${
            type === 'success'
                ? 'text-green-700 bg-green-50 border-green-200'
                : 'text-red-700 bg-red-50 border-red-200'
        }`;
        feedbackDiv.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            feedbackDiv.classList.add('hidden');
        }, 5000);
    }
}

// Show popup message (modal style)
function showPopupMessage(message, type = 'error') {
    // Remove any existing popup
    const existingPopup = document.getElementById('auth-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'auth-popup';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div class="flex items-center mb-4">
                <div class="flex-shrink-0 mr-3">
                    ${type === 'success'
                        ? '<i class="fas fa-check-circle text-green-500 text-2xl"></i>'
                        : '<i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>'
                    }
                </div>
                <div class="flex-1">
                    <h3 class="text-lg font-semibold ${
                        type === 'success' ? 'text-green-800' : 'text-red-800'
                    }">
                        ${type === 'success' ? 'Success' : 'Error'}
                    </h3>
                </div>
            </div>
            <p class="text-gray-700 mb-6">${message}</p>
            <div class="text-right">
                <button onclick="closeAuthPopup()" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                    OK
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Auto-close after 5 seconds
    setTimeout(() => {
        closeAuthPopup();
    }, 5000);
}

// Close popup
function closeAuthPopup() {
    const popup = document.getElementById('auth-popup');
    if (popup) {
        popup.remove();
    }
}

// Close forgot password popup
function closeForgotPasswordPopup() {
    const popup = document.getElementById('forgot-password-popup');
    if (popup) {
        popup.remove();
    }
}

// Registration form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    // Registration Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const submitBtn = document.getElementById('register-submit-btn');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const confirmFeedback = document.getElementById('confirm-feedback');

        // Password strength indicator
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value);
            });
        }

        // Password confirmation validation
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', function() {
                const password = passwordInput.value;
                const confirmPassword = this.value;

                if (confirmPassword && password !== confirmPassword) {
                    confirmFeedback.textContent = 'Passwords do not match';
                    confirmFeedback.classList.remove('hidden');
                    this.classList.add('border-red-500');
                    this.classList.remove('border-gray-300');
                } else {
                    confirmFeedback.classList.add('hidden');
                    this.classList.remove('border-red-500');
                    this.classList.add('border-gray-300');
                }
            });
        }

        // Form submission
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            let isValid = true;
            let errors = [];

            // Get and sanitize inputs
            const firstName = sanitizeInput(formData.get('firstName') || '');
            const lastName = sanitizeInput(formData.get('lastName') || '');
            const email = sanitizeInput(formData.get('email') || '');
            const phone = sanitizeInput(formData.get('phone') || '');
            const password = formData.get('password') || '';
            const confirmPassword = formData.get('confirmPassword') || '';
            const termsAccepted = formData.get('terms');

            // Validation
            if (!isValidName(firstName)) {
                isValid = false;
                errors.push('Please enter a valid first name (2-50 characters, letters only)');
            }

            if (!isValidName(lastName)) {
                isValid = false;
                errors.push('Please enter a valid last name (2-50 characters, letters only)');
            }

            if (!isValidEmail(email)) {
                isValid = false;
                errors.push('Please enter a valid email address');
            }

            if (!isValidPhone(phone)) {
                isValid = false;
                errors.push('Please enter a valid phone number');
            }

            const { strength } = checkPasswordStrength(password);
            if (strength < 3) {
                isValid = false;
                errors.push('Password is too weak. Please choose a stronger password');
            }

            if (password !== confirmPassword) {
                isValid = false;
                errors.push('Passwords do not match');
            }

            if (!termsAccepted) {
                isValid = false;
                errors.push('Please accept the Terms of Service and Privacy Policy');
            }

            if (!isValid) {
                showPopupMessage(errors.join('. '), 'error');
                return;
            }

            // Disable submit button
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i> Creating Account...';
            }

            try {
                // Register with Supabase
                const result = await churchAuth.signUp(email, password, {
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone
                });

                if (result.success) {
                    showPopupMessage('Account created successfully! Please check your email to verify your account before logging in.', 'success');

                    // Reset form
                    registerForm.reset();
                    updatePasswordStrength(''); // Reset password strength indicator

                    // Re-enable submit button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-user-plus text-xs"></i> Create Account';
                    }

                    // Don't redirect immediately - let Supabase handle the auth state change
                    // The user will be redirected to dashboard automatically after email verification
                    // For now, just show the success message
                } else {
                    showPopupMessage(result.error || 'Registration failed. Please try again.', 'error');

                    // Re-enable submit button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-user-plus text-xs"></i> Create Account';
                    }
                }
            } catch (error) {
                console.error('Registration error:', error);
                showFeedback('An unexpected error occurred. Please try again.', 'error');

                // Re-enable submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-user-plus text-xs"></i> Create Account';
                }
            }
        });

        // Real-time validation feedback
        const inputs = registerForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                const value = sanitizeInput(this.value);
                let error = '';

                switch(this.name) {
                    case 'firstName':
                        if (value.length > 0 && !isValidName(value)) {
                            error = 'Please enter a valid first name';
                        }
                        break;
                    case 'lastName':
                        if (value.length > 0 && !isValidName(value)) {
                            error = 'Please enter a valid last name';
                        }
                        break;
                    case 'email':
                        if (value.length > 0 && !isValidEmail(value)) {
                            error = 'Please enter a valid email';
                        }
                        break;
                    case 'phone':
                        if (value.length > 0 && !isValidPhone(value)) {
                            error = 'Please enter a valid phone number';
                        }
                        break;
                }

                // Show/hide error styling
                if (error) {
                    this.classList.add('border-red-500');
                    this.classList.remove('border-gray-300');
                } else {
                    this.classList.remove('border-red-500');
                    this.classList.add('border-gray-300');
                }
            });
        });
    }

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const submitBtn = document.getElementById('login-submit-btn');

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const email = sanitizeInput(formData.get('email') || '');
            const password = formData.get('password') || '';
            const remember = false; // Remember me removed

            let isValid = true;
            let errors = [];

            if (!isValidEmail(email)) {
                isValid = false;
                errors.push('Please enter a valid email address');
            }

            if (!password || password.length < 1) {
                isValid = false;
                errors.push('Please enter your password');
            }

            if (!isValid) {
                showPopupMessage(errors.join('. '), 'error');
                return;
            }

            // Disable submit button
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i> Signing In...';
            }

            try {
                // Sign in with Supabase
                const result = await churchAuth.signIn(email, password, remember);

                if (result.success) {
                    showPopupMessage(result.message, 'success');

                    // Don't redirect here - let Supabase auth state change handle it
                    // The auth state change will redirect to dashboard automatically
                    console.log('Login successful, auth state change will handle redirect');
                } else {
                    // Error is already shown via popup in supabase.js
                    // No need to show again here

                    // Re-enable submit button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt text-xs"></i> Sign In';
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                showFeedback('An unexpected error occurred. Please try again.', 'error');

                // Re-enable submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt text-xs"></i> Sign In';
                }
            }
        });
    }

    // Password toggle functionality
    const toggleButtons = document.querySelectorAll('#toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    });

    // Forgot password functionality
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async function(e) {
            e.preventDefault();

            // Create forgot password popup
            const existingPopup = document.getElementById('forgot-password-popup');
            if (existingPopup) {
                existingPopup.remove();
            }

            const overlay = document.createElement('div');
            overlay.id = 'forgot-password-popup';
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            overlay.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                    <div class="flex items-center mb-4">
                        <div class="flex-shrink-0 mr-3">
                            <i class="fas fa-key text-primary text-2xl"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-secondary">Reset Password</h3>
                        </div>
                    </div>
                    <p class="text-gray-700 mb-4">Enter your email address and we'll send you a link to reset your password.</p>
                    <form id="forgot-password-form" class="space-y-3">
                        <div>
                            <label for="reset-email" class="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input type="email" id="reset-email" name="email" required
                                   class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                                   placeholder="your.email@example.com">
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button type="button" onclick="closeForgotPasswordPopup()"
                                    class="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm">
                                Cancel
                            </button>
                            <button type="submit" id="reset-submit-btn"
                                    class="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-all text-sm">
                                Send Reset Link
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(overlay);

            // Handle form submission
            const form = overlay.querySelector('#forgot-password-form');
            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const email = sanitizeInput(form.email.value);
                if (!isValidEmail(email)) {
                    showPopupMessage('Please enter a valid email address.', 'error');
                    return;
                }

                const submitBtn = form.querySelector('#reset-submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-sm"></i> Sending...';

                try {
                    const result = await churchAuth.resetPassword(email);
                    if (result.success) {
                        closeForgotPasswordPopup();
                        showPopupMessage(result.message, 'success');
                    } else {
                        showPopupMessage(result.error || 'Failed to send reset email. Please try again.', 'error');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Send Reset Link';
                    }
                } catch (error) {
                    console.error('Forgot password error:', error);
                    showPopupMessage('An unexpected error occurred. Please try again.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Send Reset Link';
                }
            });
        });
    }

    // Check if user is already logged in (handled by Supabase auth state)
    // The churchAuth.init() will handle this automatically
});