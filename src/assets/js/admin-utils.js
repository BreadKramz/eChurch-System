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

// Export functions for use in browser console or other scripts
if (typeof window !== 'undefined') {
    window.AdminUtils = {
        getAllUsers,
        deleteAllUsers,
        deleteUserByEmail,
        getUserStats
    };
}