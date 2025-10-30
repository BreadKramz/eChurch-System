// Public Homepage JavaScript - Our Mother of Perpetual Help Redemptorist Church

// Function to close mobile menu
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            try {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    // Close mobile menu if open
                    closeMobileMenu();

                    // Individual offset calculations for each section
                    const headerHeight = 80; // Fixed header height
                    const rect = target.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const targetTop = rect.top + scrollTop;

                    let offset = headerHeight;

                    // Individual section adjustments
                    switch(targetId) {
                        case '#home':
                            offset = 80; // Hero section: just header height
                            break;
                        case '#about':
                            offset = 0; // About section: header + section padding
                            break;
                        case '#ministries':
                            offset = 0; // Ministries section: header + section padding
                            break;
                        case '#events':
                            offset = 0; // Events section: header + section padding
                            break;
                        case '#contact':
                            offset = 0; // Contact section: header + section padding
                            break;
                        case '#services':
                            offset = 0; // Services section: header + section padding
                            break;
                        default:
                            offset = 120; // Default for any other sections
                    }

                    const finalPosition = targetTop - offset;

                    window.scrollTo({
                        top: finalPosition,
                        behavior: 'smooth'
                    });
                }
            } catch (error) {
                console.error('Error in smooth scroll:', error);
                // Fallback to default anchor behavior
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Add fade-in animation for sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // Observe all sections except hero
    document.querySelectorAll('section:not(#home)').forEach(section => {
        observer.observe(section);
    });

    // Enhanced parallax and animation effects - Optimized for mobile
    let ticking = false;
    let isMobile = window.innerWidth <= 768;

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroSection = document.getElementById('home');
        const heroImage = document.querySelector('#home img');
        const eventsSection = document.getElementById('events');
        const eventsImage = document.querySelector('#events img');

        // Reduce parallax intensity on mobile for better performance
        const parallaxMultiplier = isMobile ? 0.2 : 0.4;
        const scaleMultiplier = isMobile ? 0.00005 : 0.0001;

        if (heroSection && scrolled < window.innerHeight) {
            // Parallax effect for hero background image
            if (heroImage) {
                const parallaxOffset = scrolled * parallaxMultiplier;
                heroImage.style.transform = `translateY(${parallaxOffset}px) scale(${1 + scrolled * scaleMultiplier})`;
            }

            // Fade out hero content as user scrolls - less intense on mobile
            const heroContent = document.querySelector('#home .relative.z-10');
            if (heroContent) {
                const fadeMultiplier = isMobile ? 0.3 : 0.5;
                const opacity = Math.max(0, 1 - (scrolled / (window.innerHeight * fadeMultiplier)));
                heroContent.style.opacity = opacity;
                heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        }

        // Parallax effect for events section - disabled on mobile for performance
        if (!isMobile && eventsSection && eventsImage) {
            const eventsRect = eventsSection.getBoundingClientRect();
            const eventsTop = eventsRect.top + scrolled;
            const eventsBottom = eventsTop + eventsRect.height;

            if (scrolled >= eventsTop && scrolled <= eventsBottom) {
                const parallaxOffset = (scrolled - eventsTop) * 0.3;
                eventsImage.style.transform = `translateY(${parallaxOffset}px) scale(${1 + (scrolled - eventsTop) * 0.00005})`;
            }
        }

        ticking = false;
    }

    // Throttle scroll events more aggressively on mobile
    const scrollThrottle = isMobile ? 16 : 8; // ~60fps on mobile, ~120fps on desktop
    let lastScrollTime = 0;

    window.addEventListener('scroll', function() {
        const now = Date.now();
        if (now - lastScrollTime >= scrollThrottle) {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
            lastScrollTime = now;
        }
    });

    // Update mobile detection on resize
    window.addEventListener('resize', function() {
        isMobile = window.innerWidth <= 768;
    });

    // Add entrance animations with delays - Optimized for mobile
    const logoDelay = isMobile ? 300 : 500; // Faster on mobile
    const headingDelay = isMobile ? 200 : 300; // Faster on mobile

    setTimeout(() => {
        const heroLogo = document.querySelector('#home .w-24.h-24');
        if (heroLogo) heroLogo.classList.add('hero-logo');
    }, logoDelay);

    setTimeout(() => {
        const heroHeading = document.querySelector('#home h1');
        if (heroHeading) heroHeading.classList.add('hero-heading');
    }, headingDelay);
});

// Mobile menu toggle functionality - Enhanced for better mobile UX
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const body = document.body;

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isHidden = mobileMenu.classList.contains('hidden');
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';

            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
                mobileMenuBtn.setAttribute('aria-label', 'Close mobile menu');
                body.style.overflow = 'hidden'; // Prevent background scrolling on mobile
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.setAttribute('aria-label', 'Open mobile menu');
                body.style.overflow = '';
            }
        });

        // Close mobile menu when clicking outside or on menu items
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.setAttribute('aria-label', 'Open mobile menu');
                body.style.overflow = '';
            }
        });

        // Close menu when window is resized to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) { // lg breakpoint
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.setAttribute('aria-label', 'Open mobile menu');
                body.style.overflow = '';
            }
        });

        // Prevent scroll bubbling when menu is open
        mobileMenu.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        });
    }

    // Password toggle functionality (if needed)
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }

    // Add entrance animation to login card (if on auth pages)
    const loginCard = document.querySelector('.bg-white\\/95');
    if (loginCard) {
        loginCard.style.opacity = '0';
        loginCard.style.transform = 'translateY(30px)';
        setTimeout(() => {
            loginCard.style.transition = 'all 0.8s ease-out';
            loginCard.style.opacity = '1';
            loginCard.style.transform = 'translateY(0)';
        }, 200);
    }

    // Contact form validation and submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const feedbackDiv = document.getElementById('form-feedback');
        const submitBtn = document.getElementById('contact-submit-btn');

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

        // Show feedback message
        function showFeedback(message, type = 'error') {
            if (feedbackDiv) {
                feedbackDiv.textContent = message;
                feedbackDiv.className = `text-xs mt-2 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
                feedbackDiv.classList.remove('hidden');
                setTimeout(() => {
                    feedbackDiv.classList.add('hidden');
                }, 5000);
            }
        }

        // Form submission handler
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            let isValid = true;
            let errors = [];

            // Get and sanitize inputs
            const name = sanitizeInput(formData.get('name') || '');
            const email = sanitizeInput(formData.get('email') || '');
            const phone = sanitizeInput(formData.get('phone') || '');
            const subject = sanitizeInput(formData.get('subject') || '');
            const message = sanitizeInput(formData.get('message') || '');

            // Validation
            if (name.length < 2) {
                isValid = false;
                errors.push('Name must be at least 2 characters long');
            }

            if (!isValidEmail(email)) {
                isValid = false;
                errors.push('Please enter a valid email address');
            }

            if (phone && !isValidPhone(phone)) {
                isValid = false;
                errors.push('Please enter a valid phone number');
            }

            if (!subject) {
                isValid = false;
                errors.push('Please select a subject');
            }

            if (message.length < 10) {
                isValid = false;
                errors.push('Message must be at least 10 characters long');
            }

            if (message.length > 500) {
                isValid = false;
                errors.push('Message must not exceed 500 characters');
            }

            if (!isValid) {
                showFeedback(errors.join('. '), 'error');
                return;
            }

            // Disable submit button
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i> Sending...';
            }

            // Here you would typically send the data to your backend
            // For now, we'll simulate a successful submission
            setTimeout(() => {
                showFeedback('Thank you for your message! We will respond within 24 hours.', 'success');

                // Reset form
                contactForm.reset();

                // Re-enable submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane text-xs"></i> Send Message';
                }
            }, 2000);
        });

        // Real-time validation feedback
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                const value = sanitizeInput(this.value);
                let error = '';

                switch(this.name) {
                    case 'name':
                        if (value.length > 0 && value.length < 2) {
                            error = 'Name must be at least 2 characters';
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
                    case 'message':
                        if (value.length > 0 && value.length < 10) {
                            error = 'Message must be at least 10 characters';
                        } else if (value.length > 500) {
                            error = 'Message must not exceed 500 characters';
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

    // Back to Top Button - Enhanced for mobile
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        let scrollTimer;

        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const scrollThreshold = window.innerWidth <= 768 ? 200 : 300; // Lower threshold on mobile
                if (window.pageYOffset > scrollThreshold) {
                    backToTopButton.classList.remove('opacity-0', 'pointer-events-none');
                    backToTopButton.classList.add('opacity-100', 'pointer-events-auto');
                } else {
                    backToTopButton.classList.remove('opacity-100', 'pointer-events-auto');
                    backToTopButton.classList.add('opacity-0', 'pointer-events-none');
                }
            }, 10); // Debounce scroll events
        });

        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Ensure button is properly sized for touch on mobile
        if (window.innerWidth <= 768) {
            backToTopButton.style.minWidth = '44px';
            backToTopButton.style.minHeight = '44px';
        }
    }

    // Auto-hiding Header on Scroll - COMMENTED OUT: Header now stays visible when scrolling down
    let lastScrollTop = 0;
    const header = document.getElementById('main-header');
    const scrollThreshold = 100; // Minimum scroll distance before hiding

    if (header) {
        window.addEventListener('scroll', function() {
            try {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                // Only apply effect after scrolling past threshold
                if (scrollTop > scrollThreshold) {
                    if (scrollTop > lastScrollTop) {
                        // Scrolling down - hide header
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        // Scrolling up - show header
                        header.style.transform = 'translateY(0)';
                    }
                } else {
                    // At top of page - always show header
                    header.style.transform = 'translateY(0)';
                }

                lastScrollTop = scrollTop;
            } catch (error) {
                console.error('Error in header scroll handler:', error);
            }
        });
    }
});

// Register Service Worker for PWA functionality with error handling
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        try {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('Service Worker registered successfully:', registration.scope);
                })
                .catch(function(error) {
                    console.error('Service Worker registration failed:', error);
                    // Could show user-friendly error message here if needed
                });
        } catch (error) {
            console.error('Error registering service worker:', error);
        }
    });
}