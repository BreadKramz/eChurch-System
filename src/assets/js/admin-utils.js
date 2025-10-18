// Admin Utilities - Our Mother of Perpetual Help Redemptorist Church
// This file contains administrative functions for managing user accounts

// Load users from localStorage
function loadUsers() {
    const users = localStorage.getItem('church_users');
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('church_users', JSON.stringify(users));
}

// Get all registered users
function getAllUsers() {
    return loadUsers();
}

// Delete all user accounts
function deleteAllUsers() {
    const confirmation = confirm(
        '⚠️ WARNING: This action cannot be undone!\n\n' +
        'Are you sure you want to delete ALL user accounts?\n\n' +
        'This will permanently remove all registered users from the system.'
    );

    if (confirmation) {
        const users = loadUsers();
        const userCount = users.length;

        // Clear all users
        localStorage.removeItem('church_users');
        localStorage.removeItem('current_user');
        localStorage.removeItem('remember_user');

        alert(`✅ Successfully deleted ${userCount} user account(s).\n\nAll user data has been permanently removed.`);
        return true;
    }

    return false;
}

// Delete specific user by email
function deleteUserByEmail(email) {
    const users = loadUsers();
    const initialCount = users.length;

    const filteredUsers = users.filter(user => user.email.toLowerCase() !== email.toLowerCase());

    if (filteredUsers.length < initialCount) {
        saveUsers(filteredUsers);

        // Clear current user session if they deleted themselves
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        if (currentUser.email && currentUser.email.toLowerCase() === email.toLowerCase()) {
            localStorage.removeItem('current_user');
        }

        alert(`✅ User account "${email}" has been successfully deleted.`);
        return true;
    } else {
        alert(`❌ User account "${email}" not found.`);
        return false;
    }
}

// Get user statistics
function getUserStats() {
    const users = loadUsers();
    return {
        totalUsers: users.length,
        recentUsers: users.filter(user => {
            const userDate = new Date(user.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return userDate > weekAgo;
        }).length,
        users: users.map(user => ({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            createdAt: new Date(user.createdAt).toLocaleDateString()
        }))
    };
}

// Export functions for use in browser console or other scripts
if (typeof window !== 'undefined') {
    window.AdminUtils = {
        getAllUsers,
        deleteAllUsers,
        deleteUserByEmail,
        getUserStats,
        loadUsers,
        saveUsers
    };
}

// Console usage examples (for development/admin use):
/*
// In browser console, you can run:
// AdminUtils.deleteAllUsers() - Delete all users
// AdminUtils.deleteUserByEmail('user@example.com') - Delete specific user
// AdminUtils.getUserStats() - Get user statistics
// AdminUtils.getAllUsers() - List all users
*/