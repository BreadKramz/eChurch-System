// Service Scheduler - Calendar and Time Selection Functionality

// Service information and requirements
const serviceInfo = {
    'baptism': {
        title: 'Baptism',
        description: 'The sacrament of Baptism welcomes new members into the Christian community.',
        requirements: 'Parents must attend baptismal preparation classes. Godparents must be confirmed Catholics.',
        duration: '30-45 minutes'
    },
    'confirmation': {
        title: 'Confirmation',
        description: 'The sacrament that strengthens faith and bestows the gifts of the Holy Spirit.',
        requirements: 'Candidates must be baptized and have completed confirmation preparation.',
        duration: '45-60 minutes'
    },
    'communion': {
        title: 'First Holy Communion',
        description: 'The first reception of the Eucharist by baptized Catholics.',
        requirements: 'Children must complete religious education and be prepared for the sacrament.',
        duration: '30-45 minutes'
    },
    'confession': {
        title: 'Penance / Reconciliation',
        description: 'The sacrament of forgiveness and reconciliation with God.',
        requirements: 'Individual confession sessions available by appointment.',
        duration: '15-30 minutes'
    },
    'anointing': {
        title: 'Anointing of the Sick',
        description: 'The sacrament for healing and spiritual strength.',
        requirements: 'Available for those who are seriously ill or facing major surgery.',
        duration: '20-30 minutes'
    },
    'matrimony': {
        title: 'Matrimony / Wedding',
        description: 'The sacrament of marriage uniting a man and woman in holy matrimony.',
        requirements: 'Couples must complete marriage preparation and obtain necessary documents.',
        duration: '45-60 minutes'
    },
    'funeral': {
        title: 'Funeral / Burial Rites',
        description: 'The final rites and prayers for the deceased.',
        requirements: 'Family coordination required. Wake and funeral mass scheduling.',
        duration: '60-90 minutes'
    }
};

// Available time slots for different services
const timeSlots = {
    'baptism': ['08:00', '09:30', '11:00', '14:00', '15:30'],
    'confirmation': ['09:00', '10:30', '14:00', '15:30'],
    'communion': ['08:30', '10:00', '11:30', '14:30', '16:00'],
    'confession': ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    'anointing': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    'matrimony': ['10:00', '11:00', '14:00', '15:00', '16:00'],
    'funeral': ['09:00', '14:00']
};

// Calendar functionality
class ServiceCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedService = null;

        this.initializeCalendar();
        this.bindEvents();
    }

    initializeCalendar() {
        this.renderCalendar();
    }

    bindEvents() {
        // Service type selection
        const serviceSelect = document.getElementById('service-type');
        serviceSelect.addEventListener('change', (e) => {
            this.selectedService = e.target.value;
            this.updateServiceInfo();
            if (this.selectedService) {
                document.getElementById('calendar-section').style.display = 'block';
                this.renderCalendar();
            } else {
                document.getElementById('calendar-section').style.display = 'none';
                document.getElementById('time-selection').style.display = 'none';
                document.getElementById('service-form').style.display = 'none';
            }
        });

        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Back buttons
        document.getElementById('back-to-calendar').addEventListener('click', () => {
            document.getElementById('time-selection').style.display = 'none';
            document.getElementById('calendar-section').style.display = 'block';
            this.selectedDate = null;
            this.selectedTime = null;
        });

        document.getElementById('back-to-time').addEventListener('click', () => {
            document.getElementById('service-form').style.display = 'none';
            document.getElementById('time-selection').style.display = 'block';
            this.selectedTime = null;
        });

        // Cancel buttons
        document.getElementById('cancel-service').addEventListener('click', () => {
            this.resetScheduler();
        });

        // Form submission
        document.getElementById('service-request-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleServiceRequest(e);
        });
    }

    updateServiceInfo() {
        const infoElement = document.getElementById('service-info');
        if (this.selectedService && serviceInfo[this.selectedService]) {
            const info = serviceInfo[this.selectedService];
            infoElement.innerHTML = `
                <strong>${info.title}:</strong> ${info.description}<br>
                <strong>Requirements:</strong> ${info.requirements}<br>
                <strong>Duration:</strong> ${info.duration}
            `;
        } else {
            infoElement.textContent = 'Please select a service type to view requirements and scheduling information.';
        }
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update calendar title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('calendar-title').textContent = `${monthNames[month]} ${year}`;

        // Get calendar data
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';

        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day p-2 text-xs text-center cursor-pointer hover:bg-primary/10 transition-colors rounded border border-transparent hover:border-primary/20';
            dayElement.textContent = currentDate.getDate();

            // Check if day is in current month
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('text-gray-400');
            } else {
                // Check if date is in the past
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (currentDate >= today) {
                    dayElement.addEventListener('click', () => {
                        this.selectDate(currentDate);
                    });
                } else {
                    dayElement.classList.add('text-gray-300', 'cursor-not-allowed');
                }
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    selectDate(date) {
        this.selectedDate = date;

        // Update UI
        document.getElementById('calendar-section').style.display = 'none';
        document.getElementById('time-selection').style.display = 'block';

        // Update selected date display
        const dateDisplay = document.getElementById('selected-date-display');
        const dateSpan = dateDisplay.querySelector('span');
        dateSpan.textContent = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.renderTimeSlots();
    }

    renderTimeSlots() {
        const timeSlotsContainer = document.getElementById('time-slots');
        timeSlotsContainer.innerHTML = '';

        if (!this.selectedService || !timeSlots[this.selectedService]) {
            timeSlotsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">No time slots available for this service.</p>';
            return;
        }

        const availableSlots = timeSlots[this.selectedService];

        availableSlots.forEach(time => {
            const timeElement = document.createElement('button');
            timeElement.type = 'button';
            timeElement.className = 'time-slot p-2 text-xs border border-gray-300 rounded hover:border-primary hover:bg-primary/5 transition-all text-center font-medium';
            timeElement.textContent = time;
            timeElement.addEventListener('click', () => {
                this.selectTime(time);
            });
            timeSlotsContainer.appendChild(timeElement);
        });
    }

    selectTime(time) {
        this.selectedTime = time;

        // Update UI
        document.getElementById('time-selection').style.display = 'none';
        document.getElementById('service-form').style.display = 'block';

        // Update confirmation details
        document.getElementById('confirm-service').textContent = serviceInfo[this.selectedService].title;
        document.getElementById('confirm-date').textContent = this.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        document.getElementById('confirm-time').textContent = this.selectedTime;

        // Update form title
        document.getElementById('service-form-title').textContent = `${serviceInfo[this.selectedService].title} Request`;

        // Generate service-specific fields
        this.renderServiceSpecificFields();
    }

    renderServiceSpecificFields() {
        const fieldsContainer = document.getElementById('service-specific-fields');
        fieldsContainer.innerHTML = '';

        let specificFields = '';

        switch(this.selectedService) {
            case 'baptism':
                specificFields = `
                    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                        <h4 class="font-semibold text-blue-800 mb-3">Baptism Details</h4>
                        <div class="space-y-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Child's Full Name</label>
                                    <input type="text" name="childName" required
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                                    <input type="date" name="birthDate" required
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Father's Name</label>
                                    <input type="text" name="fatherName" required
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Mother's Name</label>
                                    <input type="text" name="motherName" required
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'confirmation':
                specificFields = `
                    <div class="bg-primary/10 border-l-4 border-primary p-4 mb-4">
                        <h4 class="font-semibold text-secondary mb-3">Confirmation Details</h4>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-1">Candidate's Full Name</label>
                                <input type="text" name="candidateName" required
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                                    <input type="number" name="age" required min="12"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Chosen Confirmation Name</label>
                                    <input type="text" name="confirmationName"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'matrimony':
                specificFields = `
                    <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4">
                        <h4 class="font-semibold text-indigo-800 mb-3">Wedding Details</h4>
                        <div class="space-y-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Partner 1 Full Name</label>
                                    <input type="text" name="partner1Name" required
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Partner 2 Full Name</label>
                                    <input type="text" name="partner2Name" required
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Partner 1 Contact</label>
                                    <input type="tel" name="partner1Contact" required
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Partner 2 Contact</label>
                                    <input type="tel" name="partner2Contact" required
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-1">Wedding Officiant</label>
                                <select name="officiant" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                    <option value="">Select officiant...</option>
                                    <option value="fr-gasp">Fr. Nestor Gaspe, C.Ss.R.</option>
                                    <option value="fr-james">Fr. James Philip Narisma, C.Ss.R.</option>
                                    <option value="fr-eliodoro">Fr. Eliodoro Reteracion C.Ss.R.</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'funeral':
                specificFields = `
                    <div class="bg-accent/10 border-l-4 border-accent p-4 mb-4">
                        <h4 class="font-semibold text-accent mb-3">Funeral Details</h4>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-1">Name of the Deceased</label>
                                <input type="text" name="deceasedName" required
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Date of Death</label>
                                    <input type="date" name="deathDate"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Age at Death</label>
                                    <input type="number" name="ageAtDeath"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-1">Next of Kin</label>
                                <input type="text" name="nextOfKin" required
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                            </div>
                        </div>
                    </div>
                `;
                break;
            default:
                specificFields = `
                    <div class="bg-gray-50 border-l-4 border-gray-500 p-4 mb-4">
                        <h4 class="font-semibold text-gray-800 mb-3">Service Details</h4>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Additional Information</label>
                            <textarea name="serviceDetails" rows="3" placeholder="Please provide any additional details needed for this service..."
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"></textarea>
                        </div>
                    </div>
                `;
        }

        fieldsContainer.innerHTML = specificFields;
    }

    handleServiceRequest(e) {
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Scheduling...';

        try {
            const formData = new FormData(form);

            const serviceRequest = {
                id: Date.now(),
                serviceType: this.selectedService,
                serviceTitle: serviceInfo[this.selectedService].title,
                date: this.selectedDate.toISOString().split('T')[0],
                time: this.selectedTime,
                requesterName: formData.get('requesterName'),
                contactNumber: formData.get('contactNumber'),
                email: formData.get('email'),
                notes: formData.get('notes'),
                status: 'pending',
                submittedAt: new Date().toISOString()
            };

            // Add service-specific data
            if (this.selectedService === 'baptism') {
                serviceRequest.childName = formData.get('childName');
                serviceRequest.birthDate = formData.get('birthDate');
                serviceRequest.fatherName = formData.get('fatherName');
                serviceRequest.motherName = formData.get('motherName');
            } else if (this.selectedService === 'confirmation') {
                serviceRequest.candidateName = formData.get('candidateName');
                serviceRequest.age = formData.get('age');
                serviceRequest.confirmationName = formData.get('confirmationName');
            } else if (this.selectedService === 'matrimony') {
                serviceRequest.partner1Name = formData.get('partner1Name');
                serviceRequest.partner2Name = formData.get('partner2Name');
                serviceRequest.partner1Contact = formData.get('partner1Contact');
                serviceRequest.partner2Contact = formData.get('partner2Contact');
                serviceRequest.officiant = formData.get('officiant');
            } else if (this.selectedService === 'funeral') {
                serviceRequest.deceasedName = formData.get('deceasedName');
                serviceRequest.deathDate = formData.get('deathDate');
                serviceRequest.ageAtDeath = formData.get('ageAtDeath');
                serviceRequest.nextOfKin = formData.get('nextOfKin');
            } else if (formData.get('serviceDetails')) {
                serviceRequest.serviceDetails = formData.get('serviceDetails');
            }

            // Store service requests
            const serviceRequests = JSON.parse(localStorage.getItem('serviceRequests')) || [];
            serviceRequests.push(serviceRequest);
            localStorage.setItem('serviceRequests', JSON.stringify(serviceRequests));

            showNotification(`Service request for ${serviceInfo[this.selectedService].title} scheduled successfully! We will contact you to confirm.`, 'success');

            // Reset the scheduler
            this.resetScheduler();

        } catch (error) {
            console.error('Service request error:', error);
            showNotification('Failed to schedule service. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    resetScheduler() {
        this.selectedService = null;
        this.selectedDate = null;
        this.selectedTime = null;

        // Reset form
        document.getElementById('service-type').value = '';
        document.getElementById('service-request-form').reset();

        // Hide all sections
        document.getElementById('calendar-section').style.display = 'none';
        document.getElementById('time-selection').style.display = 'none';
        document.getElementById('service-form').style.display = 'none';

        // Reset service info
        this.updateServiceInfo();
    }
}

// Initialize service scheduler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the schedule service section
    if (document.getElementById('schedule-service-section')) {
        new ServiceCalendar();
    }
});

// Export for potential use in other files
window.ServiceCalendar = ServiceCalendar;