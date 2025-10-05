// Certificate Forms Configuration
// This file contains the form generation logic for different certificate types

const certificateFormConfigs = {
    'mass-card': {
        title: 'Mass Card Certificate Request',
        fields: `
            <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <h4 class="font-semibold text-green-800 mb-3">Mass Card Details</h4>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of the Deceased</label>
                        <input type="text" name="deceasedName" required placeholder="Enter the full name of the deceased"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">From</label>
                        <input type="text" name="requester" required placeholder="Your name or the person requesting the mass card"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                </div>
            </div>
        `
    },

    'baptism': {
        title: 'Baptism Certificate Request',
        fields: `
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <h4 class="font-semibold text-blue-800 mb-3">Baptism Details</h4>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of Person Baptized</label>
                        <input type="text" name="baptizedName" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Baptism Date (approximate)</label>
                            <input type="date" name="baptismDate"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Baptism Place</label>
                            <input type="text" name="baptismPlace" placeholder="Church or location"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                </div>
            </div>
        `
    },

    'confirmation': {
        title: 'Confirmation Certificate Request',
        fields: `
            <div class="bg-primary/10 border-l-4 border-primary p-4 mb-4">
                <h4 class="font-semibold text-secondary mb-3">Confirmation Details</h4>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of Person Confirmed</label>
                        <input type="text" name="confirmedName" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Confirmation Date (approximate)</label>
                            <input type="date" name="confirmationDate"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Confirmation Place</label>
                            <input type="text" name="confirmationPlace" placeholder="Church or location"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                    </div>
                </div>
            </div>
        `
    },

    'marriage': {
        title: 'Marriage Certificate Request',
        fields: `
            <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4">
                <h4 class="font-semibold text-indigo-800 mb-3">Marriage Details</h4>
                <div class="space-y-3">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Spouse 1 Name</label>
                            <input type="text" name="spouse1Name" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Spouse 2 Name</label>
                            <input type="text" name="spouse2Name" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Marriage Date (approximate)</label>
                        <input type="date" name="marriageDate"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                </div>
            </div>
        `
    },

    'funeral': {
        title: 'Funeral Certificate Request',
        fields: `
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
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Funeral Date</label>
                            <input type="date" name="funeralDate"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Cemetery</label>
                            <input type="text" name="cemetery" placeholder="Cemetery name/location"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                        </div>
                    </div>
                </div>
            </div>
        `
    },

    'mass-offering': {
        title: 'Mass Offering Certificate Request',
        fields: `
            <div class="bg-secondary/10 border-l-4 border-secondary p-4 mb-4">
                <h4 class="font-semibold text-secondary mb-3">Mass Offering Details</h4>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Intention</label>
                        <input type="text" name="intention" required placeholder="For whom or what intention"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Mass Date (if specific)</label>
                        <input type="date" name="massDate"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent">
                    </div>
                </div>
            </div>
        `
    },

    'sick-call': {
        title: 'Sick Call Certificate Request',
        fields: `
            <div class="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
                <h4 class="font-semibold text-purple-800 mb-3">Sick Call Details</h4>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name of Person</label>
                        <input type="text" name="personName" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Visit Date</label>
                            <input type="date" name="visitDate"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                            <input type="text" name="location" placeholder="Hospital, home, etc."
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        </div>
                    </div>
                </div>
            </div>
        `
    }
};

// Common form fields used by all certificate types
const commonFormFields = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input type="text" name="requesterName" required
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
        <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
            <input type="tel" name="contactNumber" required
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
        </div>
    </div>
    <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
        <input type="email" name="email" required
               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
    </div>
`;

// Additional common fields (purpose, copies, notes)
const additionalFormFields = `
    <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
        <select name="purpose" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="">Select purpose</option>
            <option value="personal">Personal Use</option>
            <option value="legal">Legal/Documentation</option>
            <option value="church">Church Records</option>
            <option value="other">Other</option>
        </select>
    </div>
    <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Copies</label>
        <input type="number" name="copies" value="1" min="1" max="10" required
               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
    </div>
    <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
        <textarea name="notes" rows="3" placeholder="Any additional information or special requests..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
    </div>
`;

// Function to generate form fields for a specific certificate type
function generateCertificateFormFields(certificateType) {
    const config = certificateFormConfigs[certificateType];

    if (!config) {
        // Default/generic form for unknown certificate types
        return commonFormFields + `
            <div class="bg-gray-50 border-l-4 border-gray-500 p-4 mb-4">
                <h4 class="font-semibold text-gray-800 mb-3">Additional Information</h4>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Details</label>
                    <textarea name="additionalDetails" rows="3" placeholder="Please provide any additional details needed for this certificate..."
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"></textarea>
                </div>
            </div>
        ` + additionalFormFields;
    }

    return commonFormFields + config.fields + additionalFormFields;
}

// Function to get the title for a certificate type
function getCertificateFormTitle(certificateType) {
    const config = certificateFormConfigs[certificateType];
    return config ? config.title : 'Certificate Request';
}

// Export functions for use in other files
window.generateCertificateFormFields = generateCertificateFormFields;
window.getCertificateFormTitle = getCertificateFormTitle;