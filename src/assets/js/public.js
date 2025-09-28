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

    // Enhanced parallax and animation effects
    let ticking = false;

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroSection = document.getElementById('home');
        const heroImage = document.querySelector('#home img');
        const eventsSection = document.getElementById('events');
        const eventsImage = document.querySelector('#events img');

        if (heroSection && scrolled < window.innerHeight) {
            // Parallax effect for hero background image
            if (heroImage) {
                const parallaxOffset = scrolled * 0.4;
                heroImage.style.transform = `translateY(${parallaxOffset}px) scale(${1 + scrolled * 0.0001})`;
            }

            // Fade out hero content as user scrolls
            const heroContent = document.querySelector('#home .relative.z-10');
            if (heroContent) {
                const opacity = Math.max(0, 1 - (scrolled / (window.innerHeight * 0.5)));
                heroContent.style.opacity = opacity;
                heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
            }
        }

        // Parallax effect for events section
        if (eventsSection && eventsImage) {
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

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    // Add entrance animations with delays
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            const heroLogo = document.querySelector('#home .w-24.h-24');
            if (heroLogo) heroLogo.classList.add('hero-logo');
        }, 500);

        setTimeout(() => {
            const heroHeading = document.querySelector('#home h1');
            if (heroHeading) heroHeading.classList.add('hero-heading');
        }, 800);

        // Buttons are already visible with the main fade-in animation
    });
});

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
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

    // Back to Top Button
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'pointer-events-none');
                backToTopButton.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                backToTopButton.classList.remove('opacity-100', 'pointer-events-auto');
                backToTopButton.classList.add('opacity-0', 'pointer-events-none');
            }
        });

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Auto-hiding Header on Scroll - COMMENTED OUT: Header now stays visible when scrolling down
    let lastScrollTop = 0;
    const header = document.getElementById('main-header');
    const scrollThreshold = 100; // Minimum scroll distance before hiding

    if (header) {
        window.addEventListener('scroll', function() {
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
        });
    }
});