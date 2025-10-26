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


// Registration form handler with Supabase integration
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

        // Email verification state
        let isEmailVerified = false;
        let currentEmail = '';

        // Send verification code
        const sendVerificationBtn = document.getElementById('send-verification-btn');
        if (sendVerificationBtn) {
            sendVerificationBtn.addEventListener('click', async function() {
                const emailInput = document.getElementById('register-email');
                const email = emailInput.value.trim().toLowerCase();

                if (!email) {
                    showErrorMessage('Email Required', 'Please enter your email address first.');
                    return;
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    showErrorMessage('Invalid Email', 'Please enter a valid email address.');
                    return;
                }

                // Disable button during sending
                const originalText = this.innerHTML;
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Sending...';

                try {
                    const result = await EmailVerification.sendVerificationCode(email);

                    if (result.success) {
                        currentEmail = email;
                        isEmailVerified = false;

                        // Show verification section
                        document.getElementById('verification-section').classList.remove('hidden');

                        // Update status
                        const statusDiv = document.getElementById('verification-status');
                        statusDiv.innerHTML = '<span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Verification code sent to your email!</span>';

                        // Focus on verification input
                        document.getElementById('verification-code').focus();

                        // Show resend button after 30 seconds
                        setTimeout(() => {
                            document.getElementById('resend-code-btn').classList.remove('hidden');
                        }, 30000);

                    } else {
                        showErrorMessage('Failed to Send Code', result.error || 'Unable to send verification code. Please try again.');
                    }
                } catch (error) {
                    console.error('Send verification error:', error);
                    showErrorMessage('Network Error', 'Unable to send verification code. Please check your connection and try again.');
                } finally {
                    this.disabled = false;
                    this.innerHTML = originalText;
                }
            });
        }

        // Verify code
        const verifyCodeBtn = document.getElementById('verify-code-btn');
        if (verifyCodeBtn) {
            verifyCodeBtn.addEventListener('click', async function() {
                const codeInput = document.getElementById('verification-code');
                const code = codeInput.value.trim();

                if (!code || code.length !== 6) {
                    const statusDiv = document.getElementById('verification-status');
                    statusDiv.innerHTML = '<span class="text-red-600"><i class="fas fa-exclamation-triangle mr-1"></i>Please enter a valid 6-digit code.</span>';
                    return;
                }

                // Disable button during verification
                const originalText = this.innerHTML;
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Verifying...';

                try {
                    const result = await EmailVerification.verifyCode(currentEmail, code);

                    if (result.success) {
                        isEmailVerified = true;
                        const statusDiv = document.getElementById('verification-status');
                        statusDiv.innerHTML = '<span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Email verified successfully!</span>';

                        // Disable verification inputs
                        codeInput.disabled = true;
                        this.disabled = true;
                        document.getElementById('send-verification-btn').disabled = true;
                        document.getElementById('register-email').disabled = true;

                        // Hide resend button
                        document.getElementById('resend-code-btn').classList.add('hidden');

                    } else {
                        const statusDiv = document.getElementById('verification-status');
                        statusDiv.innerHTML = `<span class="text-red-600"><i class="fas fa-exclamation-triangle mr-1"></i>${result.error}</span>`;
                    }
                } catch (error) {
                    console.error('Verify code error:', error);
                    const statusDiv = document.getElementById('verification-status');
                    statusDiv.innerHTML = '<span class="text-red-600"><i class="fas fa-exclamation-triangle mr-1"></i>Network error. Please try again.</span>';
                } finally {
                    this.disabled = false;
                    this.innerHTML = originalText;
                }
            });
        }

        // Resend code
        const resendCodeBtn = document.getElementById('resend-code-btn');
        if (resendCodeBtn) {
            resendCodeBtn.addEventListener('click', async function() {
                // Reuse the send verification logic
                const sendBtn = document.getElementById('send-verification-btn');
                if (sendBtn && !sendBtn.disabled) {
                    sendBtn.click();
                }
            });
        }

        // Form submission with Supabase
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Check if email is verified
            if (!isEmailVerified) {
                showErrorMessage('Email Verification Required', 'Please verify your email address before creating your account.');
                return;
            }

            const formData = new FormData(this);
            const userData = {
                firstName: formData.get('firstName').trim(),
                lastName: formData.get('lastName').trim(),
                email: currentEmail,
                phone: formData.get('contactNumber').trim(),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };

            // Client-side validation
            if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone || !userData.password) {
                showErrorMessage('Validation Error', 'All fields are required.');
                return;
            }

            if (userData.password !== userData.confirmPassword) {
                showErrorMessage('Validation Error', 'Passwords do not match.');
                return;
            }

            if (userData.password.length < 6) {
                showErrorMessage('Validation Error', 'Password must be at least 6 characters long.');
                return;
            }

            // Disable form during submission
            const submitBtn = document.getElementById('register-btn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating Account...';

            try {
                // Create user in Supabase
                const result = await SupabaseUsers.createUser(userData);

                if (result.success) {
                    // Mark email as verified in the verification table
                    await EmailVerification.verifyCode(currentEmail, 'verified'); // This will mark as verified

                    // Show success message
                    showSuccessMessage('Account Created Successfully!', 'Welcome to our church community!');
                } else {
                    // Handle specific error messages
                    let errorMessage = result.error || 'An error occurred during registration.';

                    // Convert database errors to user-friendly messages
                    if (errorMessage.includes('duplicate key value violates unique constraint "users_email_key"')) {
                        errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
                    } else if (errorMessage.includes('duplicate key') || errorMessage.includes('already exists')) {
                        errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
                    }

                    showErrorMessage('Registration Failed', errorMessage);
                }
            } catch (error) {
                console.error('Registration error:', error);
                showErrorMessage('Registration Failed', 'Network error. Please try again.');
            } finally {
                // Re-enable form
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Login form with Supabase integration
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

        // Form submission with Supabase
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const email = formData.get('email').toLowerCase().trim();
            const password = formData.get('password');

            // Client-side validation
            if (!email || !password) {
                showErrorMessage('Validation Error', 'Email and password are required.');
                return;
            }

            // Disable form during submission
            const submitBtn = document.getElementById('login-btn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Signing In...';

            try {
                // Authenticate user with Supabase
                const result = await SupabaseUsers.authenticateUser(email, password);

                if (result.success) {
                    // Store current user session
                    localStorage.setItem('current_user', JSON.stringify(result.user));

                    // Show success message and redirect
                    showSuccessMessage('Login Successful!', 'Welcome back! Redirecting to your dashboard...');
                    setTimeout(() => {
                        window.location.href = '../dashboard/dashboard.html';
                    }, 3000);
                } else {
                    // Show user-friendly error message
                    showErrorMessage('Login Failed', 'Invalid email or password. Please try again.');
                }
            } catch (error) {
                console.error('Login error:', error);
                // Show user-friendly error message instead of technical error
                showErrorMessage('Login Failed', 'Invalid email or password. Please try again.');
            } finally {
                // Re-enable form
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
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