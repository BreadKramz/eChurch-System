// Admin Utilities - Our Mother of Perpetual Help Redemptorist Church
// This file contains administrative functions for managing user accounts with Supabase

// Get all registered users from Supabase
async function getAllUsers() {
    try {
        const result = await SupabaseUsers.getAllUsers();
        if (result.success) {
            return result.data;
        } else {
            console.error('Error fetching users:', result.error);
            return [];
        }
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        return [];
    }
}

// Delete all user accounts from Supabase
async function deleteAllUsers() {
    try {
        const result = await SupabaseUsers.deleteAllUsers();
        // Clear current user session
        localStorage.removeItem('current_user');
        return result; // Return the full result object
    } catch (error) {
        console.error('Error in deleteAllUsers:', error);
        return { success: false, deletedCount: 0, error: error.message };
    }
}

// Delete specific user by email from Supabase
async function deleteUserByEmail(email) {
    try {
        const result = await SupabaseUsers.deleteUserByEmail(email);
        // Clear current user session if they deleted themselves
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        if (currentUser.email && currentUser.email.toLowerCase() === email.toLowerCase()) {
            localStorage.removeItem('current_user');
        }
        return result; // Return the full result object
    } catch (error) {
        console.error('Error in deleteUserByEmail:', error);
        return { success: false, error: error.message };
    }
}

// Get user statistics from Supabase
async function getUserStats() {
    try {
        const users = await getAllUsers();

        // Calculate recent users (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const recentUsers = users.filter(user => {
            const userDate = new Date(user.created_at);
            return userDate > weekAgo;
        }).length;

        return {
            totalUsers: users.length,
            recentUsers: recentUsers,
            users: users.map(user => ({
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                createdAt: new Date(user.created_at).toLocaleDateString()
            }))
        };
    } catch (error) {
        console.error('Error in getUserStats:', error);
        return {
            totalUsers: 0,
            recentUsers: 0,
            users: []
        };
    }
}

// Get service request statistics
async function getServiceRequestStats() {
    try {
        const { data: requests, error } = await supabaseClient
            .from('service_requests')
            .select(`
                *,
                users:user_id (
                    first_name,
                    last_name,
                    email
                ),
                baptism_certificates:baptism_certificate_id (
                    child_name,
                    birth_date,
                    birth_place
                ),
                confirmation_certificates:confirmation_certificate_id (
                    child_name,
                    birth_date,
                    birth_place
                ),
                mass_offering_certificates:mass_offering_certificate_id (
                    souls,
                    informant
                ),
                funeral_certificates:funeral_certificate_id (
                    deceased_name,
                    date_of_death,
                    informant_name
                ),
                mass_card_certificates:mass_card_certificate_id (
                    deceased_name,
                    from_person
                ),
                sick_call_certificates:sick_call_certificate_id (
                    patient_name,
                    patient_age,
                    contact_person
                ),
                marriage_certificates:marriage_certificate_id (
                    groom_name,
                    bride_name,
                    marriage_date
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const totalRequests = requests.length;
        const pendingRequests = requests.filter(req => req.status === 'pending').length;
        const processingRequests = requests.filter(req => req.status === 'processing').length;

        return {
            totalRequests,
            pendingRequests,
            processingRequests,
            requests: requests.map(request => {
                // Get certificate data based on request type
                let certificateData = null;
                if (request.baptism_certificates) {
                    certificateData = {
                        type: 'baptism',
                        name: request.baptism_certificates.child_name,
                        date: request.baptism_certificates.birth_date,
                        place: request.baptism_certificates.birth_place
                    };
                } else if (request.confirmation_certificates) {
                    certificateData = {
                        type: 'confirmation',
                        name: request.confirmation_certificates.child_name,
                        date: request.confirmation_certificates.birth_date,
                        place: request.confirmation_certificates.birth_place
                    };
                } else if (request.mass_offering_certificates) {
                    certificateData = {
                        type: 'mass-offering',
                        souls: request.mass_offering_certificates.souls,
                        informant: request.mass_offering_certificates.informant
                    };
                } else if (request.funeral_certificates) {
                    certificateData = {
                        type: 'funeral',
                        name: request.funeral_certificates.deceased_name,
                        date: request.funeral_certificates.date_of_death,
                        informant: request.funeral_certificates.informant_name
                    };
                } else if (request.mass_card_certificates) {
                    certificateData = {
                        type: 'mass-card',
                        name: request.mass_card_certificates.deceased_name,
                        from: request.mass_card_certificates.from_person
                    };
                } else if (request.sick_call_certificates) {
                    certificateData = {
                        type: 'sick-call',
                        name: request.sick_call_certificates.patient_name,
                        age: request.sick_call_certificates.patient_age,
                        contact: request.sick_call_certificates.contact_person
                    };
                } else if (request.marriage_certificates) {
                    certificateData = {
                        type: 'marriage',
                        groom: request.marriage_certificates.groom_name,
                        bride: request.marriage_certificates.bride_name,
                        date: request.marriage_certificates.marriage_date
                    };
                }

                return {
                    id: request.id,
                    userName: request.users ? `${request.users.first_name} ${request.users.last_name}` : 'Anonymous',
                    userEmail: request.users?.email || 'N/A',
                    requestType: request.request_type,
                    status: request.status,
                    createdAt: new Date(request.created_at).toLocaleDateString(),
                    details: request.details,
                    preferredDate: request.preferred_date ? new Date(request.preferred_date).toLocaleDateString() : null,
                    certificateData: certificateData
                };
            })
        };
    } catch (error) {
        console.error('Error getting service request stats:', error);
        return { totalRequests: 0, pendingRequests: 0, processingRequests: 0, requests: [] };
    }
}

// Update service request status
async function updateServiceRequestStatus(requestId, newStatus) {
    try {
        const { data, error } = await supabaseClient
            .from('service_requests')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error updating service request status:', error);
        return { success: false, error: error.message };
    }
}

// Announcement management functions
async function createAnnouncement(announcementData) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('admin_session') || '{}');
        const { data, error } = await supabaseClient
            .from('announcements')
            .insert({
                title: announcementData.title,
                content: announcementData.content,
                priority: announcementData.priority || 'normal',
                status: 'active',
                created_by: currentUser.id
            })
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error creating announcement:', error);
        return { success: false, error: error.message };
    }
}

async function getAllAnnouncements() {
    try {
        const { data, error } = await supabaseClient
            .from('announcements')
            .select(`
                *,
                users:created_by (
                    first_name,
                    last_name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return { success: false, error: error.message };
    }
}

async function updateAnnouncementStatus(id, status) {
    try {
        const { data, error } = await supabaseClient
            .from('announcements')
            .update({ status: status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error updating announcement:', error);
        return { success: false, error: error.message };
    }
}

async function updateAnnouncement(id, announcementData) {
    try {
        const { data, error } = await supabaseClient
            .from('announcements')
            .update({
                title: announcementData.title,
                content: announcementData.content,
                priority: announcementData.priority,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error updating announcement:', error);
        return { success: false, error: error.message };
    }
}

async function deleteAnnouncement(id) {
    try {
        const { error } = await supabaseClient
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting announcement:', error);
        return { success: false, error: error.message };
    }
}

// Event management functions
async function createEvent(eventData) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('admin_session') || '{}');
        const { data, error } = await supabaseClient
            .from('events')
            .insert({
                title: eventData.title,
                description: eventData.description,
                event_date: eventData.eventDate,
                event_time: eventData.eventTime,
                location: eventData.location,
                category: eventData.category || 'general',
                status: 'upcoming',
                created_by: currentUser.id
            })
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error creating event:', error);
        return { success: false, error: error.message };
    }
}

async function getAllEvents() {
    try {
        const { data, error } = await supabaseClient
            .from('events')
            .select(`
                *,
                users:created_by (
                    first_name,
                    last_name
                )
            `)
            .order('event_date', { ascending: true });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Error fetching events:', error);
        return { success: false, error: error.message };
    }
}

async function updateEventStatus(id, status) {
    try {
        const { data, error } = await supabaseClient
            .from('events')
            .update({ status: status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error updating event:', error);
        return { success: false, error: error.message };
    }
}

async function updateEvent(id, eventData) {
    try {
        const { data, error } = await supabaseClient
            .from('events')
            .update({
                title: eventData.title,
                description: eventData.description,
                event_date: eventData.eventDate,
                event_time: eventData.eventTime,
                location: eventData.location,
                category: eventData.category,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error updating event:', error);
        return { success: false, error: error.message };
    }
}

async function deleteEvent(id) {
    try {
        const { error } = await supabaseClient
            .from('events')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting event:', error);
        return { success: false, error: error.message };
    }
}

// Export functions for use in browser console or other scripts
if (typeof window !== 'undefined') {
    window.AdminUtils = {
        getAllUsers,
        deleteAllUsers,
        deleteUserByEmail,
        getUserStats,
        getServiceRequestStats,
        updateServiceRequestStatus,
        createAnnouncement,
        getAllAnnouncements,
        updateAnnouncementStatus,
        updateAnnouncement,
        deleteAnnouncement,
        createEvent,
        getAllEvents,
        updateEventStatus,
        updateEvent,
        deleteEvent
    };
}