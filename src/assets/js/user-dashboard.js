// User Dashboard JavaScript - Our Mother of Perpetual Help Redemptorist Church

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Load user data and update dashboard
function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../auth/login.html';
        return;
    }

    // Update header with user data
    const userNameElement = document.querySelector('.text-lg.font-display.font-bold.text-secondary + p');
    const userAvatarElement = document.querySelector('.bg-primary.rounded-full');
    const userNameDisplay = document.querySelector('.hidden.sm\\:block.text-sm.font-medium.text-gray-700');

    if (userNameElement) {
        userNameElement.textContent = `Welcome back, ${currentUser.name || 'Parishioner'}`;
    }

    if (userAvatarElement) {
        userAvatarElement.textContent = (currentUser.name || 'P').charAt(0).toUpperCase();
    }

    if (userNameDisplay) {
        userNameDisplay.textContent = currentUser.name || 'Parishioner';
    }

    // Update profile section with user data
    const profileForm = document.querySelector('#profile-section form');
    if (profileForm) {
        const firstNameInput = profileForm.querySelector('input[value="John"]');
        const lastNameInput = profileForm.querySelector('input[value="Doe"]');
        const emailInput = profileForm.querySelector('input[type="email"]');
        const phoneInput = profileForm.querySelector('input[type="tel"]');
        const addressInput = profileForm.querySelector('input[value*="Main St"]');

        if (firstNameInput) firstNameInput.value = currentUser.name ? currentUser.name.split(' ')[0] : '';
        if (lastNameInput) lastNameInput.value = currentUser.name ? currentUser.name.split(' ').slice(1).join(' ') : '';
        if (emailInput) emailInput.value = currentUser.email || '';

        // Set default values for new fields
        if (phoneInput) phoneInput.value = currentUser.phone || '';
        if (addressInput) addressInput.value = currentUser.address || 'Dumaguete City';
    }

    // Update account summary
    const memberSinceElement = document.querySelector('.text-gray-600 + .font-medium.text-gray-800');
    const servicesRequestedElement = document.querySelector('.text-gray-600 + .font-medium.text-gray-800:last-child');

    if (memberSinceElement && currentUser.registrationDate) {
        const regDate = new Date(currentUser.registrationDate);
        memberSinceElement.textContent = regDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    if (servicesRequestedElement) {
        servicesRequestedElement.textContent = currentUser.servicesRequested || '0';
    }

    // Update user avatar in profile section
    const profileAvatar = document.querySelector('#profile-section .bg-primary.rounded-full');
    if (profileAvatar) {
        profileAvatar.textContent = (currentUser.name || 'P').charAt(0).toUpperCase();
    }
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

// Handle profile form submission
function handleProfileUpdate(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const updatedUser = {
        ...JSON.parse(localStorage.getItem('currentUser')),
        name: `${formData.get('firstName') || ''} ${formData.get('lastName') || ''}`.trim(),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        birthDate: formData.get('birthDate')
    };

    // Update users array
    const users = JSON.parse(localStorage.getItem('churchUsers')) || [];
    const userIndex = users.findIndex(u => u.email === updatedUser.email);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('churchUsers', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    // Show success message with better UX
    showNotification('Profile updated successfully!', 'success');
    loadUserData(); // Refresh the UI
}

// Handle service request form submission
function handleServiceRequest(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';

    try {
        const formData = new FormData(form);

        const serviceRequest = {
            id: Date.now(),
            type: formData.get('serviceType'),
            date: formData.get('preferredDate'),
            time: formData.get('preferredTime'),
            contactPerson: formData.get('contactPerson'),
            contactPhone: formData.get('contactPhone'),
            details: formData.get('details'),
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Store service requests (in a real app, this would go to a backend)
        const serviceRequests = JSON.parse(localStorage.getItem('serviceRequests')) || [];
        serviceRequests.push(serviceRequest);
        localStorage.setItem('serviceRequests', JSON.stringify(serviceRequests));

        // Update user's service count
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser.servicesRequested = (currentUser.servicesRequested || 0) + 1;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showNotification('Service request submitted successfully! We will contact you soon.', 'success');
        form.reset();
        loadUserData(); // Refresh stats
    } catch (error) {
        console.error('Service request error:', error);
        showNotification('Failed to submit service request. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Handle certificate request form submission
function handleCertificateRequest(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';

    try {
        const formData = new FormData(form);

        const certificateRequest = {
            id: Date.now(),
            type: formData.get('certificateType'),
            purpose: formData.get('purpose'),
            copies: parseInt(formData.get('copies')) || 1,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Store certificate requests
        const certificateRequests = JSON.parse(localStorage.getItem('certificateRequests')) || [];
        certificateRequests.push(certificateRequest);
        localStorage.setItem('certificateRequests', JSON.stringify(certificateRequests));

        showNotification('Certificate request submitted successfully! Processing may take 3-5 business days.', 'success');
        form.reset();
    } catch (error) {
        console.error('Certificate request error:', error);
        showNotification('Failed to submit certificate request. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Handle prayer request form submission
function handlePrayerRequest(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';

    try {
        const formData = new FormData(form);

        const prayerRequest = {
            id: Date.now(),
            name: formData.get('name') || 'Anonymous',
            intention: formData.get('intention'),
            isPublic: formData.get('makePublic') === 'on',
            status: 'active',
            submittedAt: new Date().toISOString()
        };

        // Store prayer requests
        const prayerRequests = JSON.parse(localStorage.getItem('prayerRequests')) || [];
        prayerRequests.push(prayerRequest);
        localStorage.setItem('prayerRequests', JSON.stringify(prayerRequests));

        showNotification('Your prayer intention has been submitted. We will keep you in our prayers.', 'success');
        form.reset();
    } catch (error) {
        console.error('Prayer request error:', error);
        showNotification('Failed to submit prayer request. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    updateTime();
    setInterval(updateTime, 1000);

    // Add form event listeners
    const profileForm = document.querySelector('#profile-section form');
    const serviceForm = document.querySelector('#schedule-service-section form');
    const certificateForm = document.querySelector('#request-certificate-section form');
    const prayerForm = document.querySelector('#prayer-requests-section form');

    if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);
    if (serviceForm) serviceForm.addEventListener('submit', handleServiceRequest);
    if (certificateForm) certificateForm.addEventListener('submit', handleCertificateRequest);
    if (prayerForm) prayerForm.addEventListener('submit', handlePrayerRequest);
});