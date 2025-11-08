// Dashboard JavaScript - Our Mother of Perpetual Help Redemptorist Church

// Global variables
let currentUser = null;
let currentSection = 'dashboard';

// Load announcements for dashboard overview
async function loadDashboardAnnouncements() {
  try {
    console.log('Loading dashboard announcements...');
    const now = new Date().toISOString();

    // First, try to get ALL announcements to see what's in the database
    const { data: allAnnouncements, error: allError } = await supabaseClient
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('ALL announcements in database:', { allAnnouncements, allError, count: allAnnouncements?.length || 0 });

    // Get announcements that are active and either have no expiration or haven't expired
    const { data: announcements, error } = await supabaseClient
      .from('announcements')
      .select('*')
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('Dashboard announcements query result:', { announcements, error, count: announcements?.length || 0 });

    if (error) throw error;

    const announcementsList = document.querySelector('.dashboard-announcements ul');
    if (announcementsList) {
      announcementsList.innerHTML = '';

      if (announcements && announcements.length > 0) {
        console.log('Rendering', announcements.length, 'announcements to dashboard');
        announcements.forEach(announcement => {
          const li = document.createElement('li');
          li.className = 'flex items-start gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10 hover:border-primary/20 transition-all duration-200 cursor-pointer';
          li.onclick = () => switchSection('announcements');

          // Priority indicator
          const priorityColor = announcement.priority === 'urgent' ? 'bg-red-500' :
                                announcement.priority === 'high' ? 'bg-orange-500' :
                                announcement.priority === 'normal' ? 'bg-blue-500' : 'bg-gray-500';

          li.innerHTML = `
            <div class="flex-shrink-0">
              <div class="w-3 h-3 ${priorityColor} rounded-full shadow-sm"></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <p class="text-sm font-semibold text-gray-900 truncate">${announcement.title}</p>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium ${
                  announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  announcement.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  announcement.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }">${announcement.priority}</span>
              </div>
              <p class="text-xs text-gray-600 mb-2 line-clamp-2">${announcement.content.substring(0, 100)}${announcement.content.length > 100 ? '...' : ''}</p>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">${new Date(announcement.created_at).toLocaleDateString()}</span>
                <span class="text-xs text-primary hover:text-primary/80 font-medium">Read more →</span>
              </div>
            </div>
          `;
          announcementsList.appendChild(li);
        });
      } else {
        console.log('No announcements to display - showing empty state');
        announcementsList.innerHTML = `
          <li class="text-center py-6">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-bullhorn text-gray-400 text-lg"></i>
            </div>
            <p class="text-sm text-gray-500">No announcements available</p>
            <p class="text-xs text-gray-400 mt-1">Check back later for updates</p>
          </li>
        `;
      }
    } else {
      console.error('Could not find announcements list element');
    }
  } catch (error) {
    console.error('Error loading dashboard announcements:', error);
    // Don't throw error, just show empty state
    const announcementsList = document.querySelector('.dashboard-announcements ul');
    if (announcementsList) {
      announcementsList.innerHTML = `
        <li class="text-center py-6">
          <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-exclamation-triangle text-red-400 text-lg"></i>
          </div>
          <p class="text-sm text-red-600">Unable to load announcements</p>
          <p class="text-xs text-gray-400 mt-1">Please try refreshing the page</p>
        </li>
      `;
    }
  }
}

// Setup real-time subscription for announcements
function setupAnnouncementsSubscription() {
  console.log('Setting up announcements subscription...');

  const channel = supabaseClient
    .channel('dashboard-announcements')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'announcements'
      },
      (payload) => {
        console.log('Announcements change detected:', payload);
        // Reload announcements when any change occurs
        loadDashboardAnnouncements();
      }
    )
    .subscribe((status) => {
      console.log('Announcements subscription status:', status);
    });

  console.log('Announcements real-time subscription established');
  return channel;
}

// Load events for dashboard overview
async function loadDashboardEvents() {
  try {
    console.log('Loading dashboard events...');

    // First, try to get ALL events to see what's in the database
    const { data: allEvents, error: allError } = await supabaseClient
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    console.log('ALL events in database:', { allEvents, allError, count: allEvents?.length || 0 });

    // Get upcoming events that are not cancelled, ordered by date
    const today = new Date().toISOString().split('T')[0];
    const { data: events, error } = await supabaseClient
      .from('events')
      .select('*')
      .neq('status', 'cancelled')
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(3);

    console.log('Dashboard events query result:', { events, error, count: events?.length || 0 });

    if (error) throw error;

    const eventsList = document.querySelector('.dashboard-events .space-y-3');
    if (eventsList) {
      eventsList.innerHTML = '';

      if (events && events.length > 0) {
        console.log('Rendering', events.length, 'events to dashboard');
        events.forEach(event => {
          const eventDate = new Date(event.event_date);
          const dateStr = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          const timeStr = event.event_time || 'TBD';

          // Status color coding
          const statusColor = event.status === 'completed' ? 'border-green-200 bg-green-50' :
                              event.status === 'ongoing' ? 'border-blue-200 bg-blue-50' :
                              'border-yellow-200 bg-yellow-50';

          const eventDiv = document.createElement('div');
          eventDiv.className = `flex items-start gap-3 p-3 ${statusColor} rounded-lg border hover:shadow-sm transition-all duration-200 cursor-pointer`;
          eventDiv.onclick = () => switchSection('events');

          eventDiv.innerHTML = `
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                ${dateStr}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <p class="text-sm font-semibold text-gray-900 truncate">${event.title}</p>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium ${
                  event.status === 'completed' ? 'bg-green-100 text-green-700' :
                  event.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }">${event.status}</span>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-600 mb-1">
                <span class="flex items-center gap-1">
                  <i class="fas fa-clock text-primary/60"></i>
                  ${timeStr}
                </span>
                ${event.location ? `<span class="flex items-center gap-1">
                  <i class="fas fa-map-marker-alt text-primary/60"></i>
                  ${event.location}
                </span>` : ''}
              </div>
              ${event.description ? `<p class="text-xs text-gray-600 line-clamp-1">${event.description.substring(0, 80)}${event.description.length > 80 ? '...' : ''}</p>` : ''}
              <div class="flex items-center justify-end mt-2">
                <span class="text-xs text-primary hover:text-primary/80 font-medium">View details →</span>
              </div>
            </div>
          `;
          eventsList.appendChild(eventDiv);
        });
      } else {
        console.log('No events to display - showing empty state');
        eventsList.innerHTML = `
          <div class="text-center py-6">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-calendar-alt text-gray-400 text-lg"></i>
            </div>
            <p class="text-sm text-gray-500">No upcoming events</p>
            <p class="text-xs text-gray-400 mt-1">Check back later for new events</p>
          </div>
        `;
      }
    } else {
      console.error('Could not find events list element');
    }
  } catch (error) {
    console.error('Error loading dashboard events:', error);
    // Don't throw error, just show empty state
    const eventsList = document.querySelector('.dashboard-events .space-y-3');
    if (eventsList) {
      eventsList.innerHTML = `
        <div class="text-center py-6">
          <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-exclamation-triangle text-red-400 text-lg"></i>
          </div>
          <p class="text-sm text-red-600">Unable to load events</p>
          <p class="text-xs text-gray-400 mt-1">Please try refreshing the page</p>
        </div>
      `;
    }
  }
}

// Setup real-time subscription for events
function setupEventsSubscription() {
  console.log('Setting up events subscription...');

  const channel = supabaseClient
    .channel('dashboard-events')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events'
      },
      (payload) => {
        console.log('Events change detected:', payload);
        // Reload events when any change occurs
        loadDashboardEvents();
      }
    )
    .subscribe((status) => {
      console.log('Events subscription status:', status);
    });

  console.log('Events real-time subscription established');
  return channel;
}

// Load announcements for announcements section
async function loadAnnouncementsSection() {
    try {
        const container = document.getElementById('announcements-container');
        if (!container) return;

        container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-primary text-2xl"></i><p class="text-gray-600 mt-2">Loading announcements...</p></div>';

        const { data: announcements, error } = await supabaseClient
            .from('announcements')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (announcements && announcements.length > 0) {
            container.innerHTML = announcements.map(announcement => {
                const priorityColor = announcement.priority === 'urgent' ? 'border-red-200 bg-red-50' :
                                    announcement.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                                    announcement.priority === 'normal' ? 'border-blue-200 bg-blue-50' :
                                    'border-gray-200 bg-gray-50';

                return `
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${priorityColor}">
                        <div class="flex items-start justify-between mb-3">
                            <h3 class="text-lg font-display font-bold text-secondary">${announcement.title}</h3>
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                announcement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                announcement.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }">
                                ${announcement.priority}
                            </span>
                        </div>
                        <p class="text-gray-700 mb-4 leading-relaxed">${announcement.content}</p>
                        <div class="flex items-center justify-between text-sm text-gray-500">
                            <span>Posted on ${new Date(announcement.created_at).toLocaleDateString()}</span>
                            ${announcement.expires_at ? `<span>Expires: ${new Date(announcement.expires_at).toLocaleDateString()}</span>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <i class="fas fa-bullhorn text-gray-400 text-4xl mb-4"></i>
                    <h3 class="text-lg font-display font-bold text-secondary mb-2">No Announcements</h3>
                    <p class="text-gray-600">There are no active announcements at this time.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading announcements section:', error);
        const container = document.getElementById('announcements-container');
        if (container) {
            container.innerHTML = `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
                    <h3 class="text-lg font-display font-bold text-secondary mb-2">Error Loading Announcements</h3>
                    <p class="text-gray-600">Unable to load announcements. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Load events for events section
async function loadEventsSection() {
    try {
        const container = document.getElementById('events-container');
        if (!container) return;

        container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-primary text-2xl"></i><p class="text-gray-600 mt-2">Loading events...</p></div>';

        const { data: events, error } = await supabaseClient
            .from('events')
            .select('*')
            .order('event_date', { ascending: true });

        if (error) throw error;

        if (events && events.length > 0) {
            container.innerHTML = events.map(event => {
                const eventDate = new Date(event.event_date);
                const dateStr = eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const timeStr = event.event_time || 'TBD';

                const statusColor = event.status === 'completed' ? 'border-green-200 bg-green-50' :
                                  event.status === 'ongoing' ? 'border-blue-200 bg-blue-50' :
                                  event.status === 'cancelled' ? 'border-red-200 bg-red-50' :
                                  'border-yellow-200 bg-yellow-50';

                return `
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${statusColor}">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex-1">
                                <h3 class="text-lg font-display font-bold text-secondary mb-1">${event.title}</h3>
                                ${event.description ? `<p class="text-gray-700 mb-3">${event.description}</p>` : ''}
                            </div>
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-4 ${
                                event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }">
                                ${event.status}
                            </span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-calendar text-primary"></i>
                                <span class="text-sm text-gray-700">${dateStr}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="fas fa-clock text-primary"></i>
                                <span class="text-sm text-gray-700">${timeStr}</span>
                            </div>
                            ${event.location ? `
                            <div class="flex items-center gap-2 md:col-span-2">
                                <i class="fas fa-map-marker-alt text-primary"></i>
                                <span class="text-sm text-gray-700">${event.location}</span>
                            </div>
                            ` : ''}
                        </div>

                        ${event.category ? `
                        <div class="flex items-center gap-2 mb-3">
                            <i class="fas fa-tag text-primary"></i>
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                ${event.category}
                            </span>
                        </div>
                        ` : ''}

                        <div class="text-sm text-gray-500">
                            Created on ${new Date(event.created_at).toLocaleDateString()}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <i class="fas fa-calendar-alt text-gray-400 text-4xl mb-4"></i>
                    <h3 class="text-lg font-display font-bold text-secondary mb-2">No Events</h3>
                    <p class="text-gray-600">There are no events scheduled at this time.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading events section:', error);
        const container = document.getElementById('events-container');
        if (container) {
            container.innerHTML = `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
                    <h3 class="text-lg font-display font-bold text-secondary mb-2">Error Loading Events</h3>
                    <p class="text-gray-600">Unable to load events. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard DOM loaded, initializing...');
    initializeDashboard();
});

// Initialize dashboard
async function initializeDashboard() {
    try {
        // Check if we're on the admin dashboard - if so, skip initialization
        // as admin dashboard handles its own auth and UI
        if (window.location.pathname.includes('/admin/')) {
            console.log('Admin dashboard detected, skipping user dashboard initialization');
            return;
        }

        // Wait a bit for auth to initialize (churchAuth.init() is called automatically in supabase.js)
        console.log('Waiting for auth system to initialize...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Auth system should be initialized');

        // Check if user is authenticated
        if (!churchAuth.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = '/src/pages/auth/login.html';
            return;
        }

        // Get current user
        currentUser = churchAuth.getCurrentUser();
        if (!currentUser) {
            console.log('No current user, redirecting to login');
            window.location.href = '/src/pages/auth/login.html';
            return;
        }

        console.log('Dashboard initializing for user:', currentUser.email);

        // Load user profile data (don't block initialization)
        await loadUserProfile();

        // Initialize navigation
        initializeNavigation();

        // Initialize logout functionality
        initializeLogout();

        // Load dashboard data
        loadDashboardData();

        // Load announcements and events for dashboard
        console.log('Loading dashboard announcements and events...');
        try {
          await loadDashboardAnnouncements();
          await loadDashboardEvents();
          console.log('Dashboard announcements and events loaded successfully');
        } catch (error) {
          console.error('Error loading dashboard content:', error);
          // Don't show error message for individual component failures
        }

        // Load service requests for dashboard
        console.log('Loading dashboard service requests...');
        try {
          await loadDashboardServiceRequests();
          console.log('Dashboard service requests loaded successfully');
        } catch (error) {
          console.error('Error loading dashboard service requests:', error);
          // Don't show error message for individual component failures
        }

        // Force refresh dashboard content after a short delay to ensure data is loaded
        setTimeout(async () => {
          try {
            console.log('Force refreshing dashboard content...');
            await loadDashboardAnnouncements();
            await loadDashboardEvents();
            console.log('Dashboard content refreshed successfully');
          } catch (error) {
            console.error('Error refreshing dashboard content:', error);
          }
        }, 2000);

        // Additional refresh after longer delay to catch any missed data
        setTimeout(async () => {
          try {
            console.log('Final dashboard content refresh...');
            await loadDashboardAnnouncements();
            await loadDashboardEvents();
            console.log('Final dashboard content refresh completed');
          } catch (error) {
            console.error('Error in final dashboard refresh:', error);
          }
        }, 5000);

        // Setup real-time subscriptions for live updates
        console.log('Setting up real-time subscriptions...');
        try {
          const announcementsChannel = setupAnnouncementsSubscription();
          const eventsChannel = setupEventsSubscription();
          console.log('Real-time subscriptions established successfully');

          // Store channels globally for cleanup if needed
          window.announcementsChannel = announcementsChannel;
          window.eventsChannel = eventsChannel;

          // Test the subscriptions by manually triggering a reload after setup
          setTimeout(async () => {
            console.log('Testing subscriptions by reloading data...');
            await loadDashboardAnnouncements();
            await loadDashboardEvents();
          }, 1000);
        } catch (error) {
          console.error('Error setting up real-time subscriptions:', error);
        }

        // Also load the full announcements and events sections for when users navigate
        try {
          await loadAnnouncementsSection();
          await loadEventsSection();
          console.log('Full announcements and events sections loaded successfully');
        } catch (error) {
          console.error('Error loading full sections:', error);
        }

    } catch (error) {
        console.error('Dashboard initialization error:', error);
        // Show error message for critical initialization failures
        showDashboardMessage('Failed to load dashboard. Please try again.', 'error');
    }
}

// Load user profile data
async function loadUserProfile() {
    try {
        console.log('Loading user profile...');
        const profile = await churchAuth.getUserProfile();
        console.log('Profile loaded:', profile);

        if (profile) {
            // Update sidebar user info - show full name instead of email
            const fullName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            const roleRaw = (profile.user_role || 'parishioner');
            const roleText = roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1);
            document.getElementById('user-name').textContent = roleText;
            document.getElementById('user-email').textContent = fullName; // Show full name instead of email
            // Header mini profile
            const headerRoleEl = document.getElementById('header-user-role');
            const headerNameEl = document.getElementById('header-user-fullname');
            const headerAvatarEl = document.getElementById('header-user-avatar');
            if (headerRoleEl) headerRoleEl.textContent = roleText;
            if (headerNameEl) headerNameEl.textContent = fullName || 'User';
            if (headerAvatarEl) headerAvatarEl.textContent = (profile.first_name || fullName || 'U').charAt(0).toUpperCase();

            // Update welcome message - show first name
            document.getElementById('welcome-name').textContent = profile.first_name;

            // Update profile section
            document.getElementById('profile-first-name').textContent = profile.first_name || 'Not provided';
            document.getElementById('profile-last-name').textContent = profile.last_name || 'Not provided';
            document.getElementById('profile-email').textContent = currentUser.email;
            document.getElementById('profile-phone').textContent = profile.phone || 'Not provided';

            // Update user avatar (first letter of first name)
            const avatarElement = document.getElementById('user-avatar');
            if (avatarElement && profile.first_name) {
                avatarElement.textContent = profile.first_name.charAt(0).toUpperCase();
            }
        } else {
            console.log('No profile found, checking user metadata...');
            // Try to get name from user metadata as fallback
            const userMeta = currentUser?.user_metadata || {};
            const metaFullName = userMeta.full_name || `${userMeta.first_name || ''} ${userMeta.last_name || ''}`.trim();
            const displayName = metaFullName.trim() || 'User';
            const firstName = userMeta.first_name || 'User';

            // Update sidebar user info
            document.getElementById('user-name').textContent = 'Parishioner';
            document.getElementById('user-email').textContent = displayName;
            // Header mini profile (fallback)
            const headerRoleEl2 = document.getElementById('header-user-role');
            const headerNameEl2 = document.getElementById('header-user-fullname');
            const headerAvatarEl2 = document.getElementById('header-user-avatar');
            if (headerRoleEl2) headerRoleEl2.textContent = 'Parishioner';
            if (headerNameEl2) headerNameEl2.textContent = displayName || 'User';
            if (headerAvatarEl2) headerAvatarEl2.textContent = (firstName || displayName || 'U').charAt(0).toUpperCase();

            // Update welcome message
            document.getElementById('welcome-name').textContent = firstName;

            // Update profile section with available data
            document.getElementById('profile-first-name').textContent = userMeta.first_name || 'Not provided';
            document.getElementById('profile-last-name').textContent = userMeta.last_name || 'Not provided';
            document.getElementById('profile-email').textContent = currentUser.email;
            document.getElementById('profile-phone').textContent = userMeta.phone || 'Not provided';

            // Update user avatar
            const avatarElement = document.getElementById('user-avatar');
            if (avatarElement && userMeta.first_name) {
                avatarElement.textContent = userMeta.first_name.charAt(0).toUpperCase();
            }
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Final fallback to basic user info
        document.getElementById('user-name').textContent = 'Parishioner';
        document.getElementById('user-email').textContent = 'User';
        document.getElementById('welcome-name').textContent = 'User';
    }
}

// Initialize navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const section = this.getAttribute('data-section');
            if (section) {
                switchSection(section);
            }

            // Close sidebar on mobile after navigation
            if (window.innerWidth < 1024) {
                closeSidebar();
            }
        });
    });

    // Initialize profile editing functionality
    initializeProfileEditing();

    // Initialize services tabs
    initializeServicesTabs();
}

// Initialize profile editing functionality
function initializeProfileEditing() {
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelProfileBtn = document.getElementById('cancel-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const profileViewMode = document.getElementById('profile-view-mode');
    const profileEditForm = document.getElementById('profile-edit-form');

    const changePasswordBtn = document.getElementById('change-password-btn');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    const savePasswordBtn = document.getElementById('save-password-btn');
    const passwordChangeForm = document.getElementById('password-change-form');

    // Profile editing
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            console.log('Edit profile button clicked');
            // Hide view mode, show edit form
            profileViewMode.classList.add('hidden');
            profileEditForm.classList.remove('hidden');

            // Populate form with current values
            const firstName = document.getElementById('profile-first-name').textContent;
            const lastName = document.getElementById('profile-last-name').textContent;
            const phone = document.getElementById('profile-phone').textContent;

            console.log('Current values:', { firstName, lastName, phone });

            document.getElementById('edit-first-name').value = firstName !== 'Not provided' ? firstName : '';
            document.getElementById('edit-last-name').value = lastName !== 'Not provided' ? lastName : '';
            document.getElementById('edit-phone').value = phone !== 'Not provided' ? phone : '';
        });
    }

    if (cancelProfileBtn) {
        cancelProfileBtn.addEventListener('click', function() {
            // Hide edit form, show view mode
            profileEditForm.classList.add('hidden');
            profileViewMode.classList.remove('hidden');
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            const formData = new FormData(profileEditForm);
            const firstName = formData.get('firstName').trim();
            const lastName = formData.get('lastName').trim();
            const phone = formData.get('phone').trim();

            // Validation
            if (!firstName || !lastName) {
                showDashboardMessage('First name and last name are required.', 'error');
                return;
            }

            if (!isValidName(firstName) || !isValidName(lastName)) {
                showDashboardMessage('Please enter valid names (letters and spaces only).', 'error');
                return;
            }

            if (phone && !isValidPhone(phone)) {
                showDashboardMessage('Please enter a valid phone number.', 'error');
                return;
            }

            // Disable save button
            saveProfileBtn.disabled = true;
            saveProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i> Saving...';

            try {
                console.log('Attempting to update profile with:', {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`.trim(),
                    phone: phone || null,
                    updated_at: new Date().toISOString()
                });

                const updates = {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`.trim(),
                    phone: phone || null,
                    updated_at: new Date().toISOString()
                };

                const result = await churchAuth.updateUserProfile(updates);
                console.log('Profile update result:', result);

                if (result.success) {
                    // Update display values
                    document.getElementById('profile-first-name').textContent = firstName;
                    document.getElementById('profile-last-name').textContent = lastName;
                    document.getElementById('profile-phone').textContent = phone || 'Not provided';

                    // Update sidebar and welcome message
                    const fullName = `${firstName} ${lastName}`.trim();
                    document.getElementById('user-name').textContent = 'Parishioner';
                    document.getElementById('user-email').textContent = fullName;
                    document.getElementById('welcome-name').textContent = firstName;
                    // Update header mini profile after save
                    const headerRoleEl3 = document.getElementById('header-user-role');
                    const headerNameEl3 = document.getElementById('header-user-fullname');
                    const headerAvatarEl3 = document.getElementById('header-user-avatar');
                    if (headerRoleEl3) headerRoleEl3.textContent = 'Parishioner';
                    if (headerNameEl3) headerNameEl3.textContent = fullName || 'User';
                    if (headerAvatarEl3) headerAvatarEl3.textContent = (firstName || 'U').charAt(0).toUpperCase();

                    // Update avatar
                    const avatarElement = document.getElementById('user-avatar');
                    if (avatarElement) {
                        avatarElement.textContent = firstName.charAt(0).toUpperCase();
                    }

                    // Hide edit form, show view mode
                    profileEditForm.classList.add('hidden');
                    profileViewMode.classList.remove('hidden');

                    showDashboardMessage('Profile updated successfully!', 'success');
                } else {
                    console.error('Profile update failed:', result.error);
                    showDashboardMessage(result.error || 'Failed to update profile.', 'error');
                }
            } catch (error) {
                console.error('Profile update error:', error);
                showDashboardMessage('Failed to update profile. Please try again.', 'error');
            } finally {
                saveProfileBtn.disabled = false;
                saveProfileBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save Changes';
            }
        });
    }

    // Password change functionality
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            passwordChangeForm.classList.remove('hidden');
            changePasswordBtn.classList.add('hidden');
        });
    }

    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', function() {
            passwordChangeForm.classList.add('hidden');
            changePasswordBtn.classList.remove('hidden');
            passwordChangeForm.reset();
            resetPasswordStrength();
        });
    }

    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            const formData = new FormData(passwordChangeForm);
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmNewPassword');

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                showDashboardMessage('All password fields are required.', 'error');
                return;
            }

            const { strength } = checkPasswordStrength(newPassword);
            if (strength < 3) {
                showDashboardMessage('New password is too weak. Please choose a stronger password.', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showDashboardMessage('New passwords do not match.', 'error');
                return;
            }

            // Disable save button
            savePasswordBtn.disabled = true;
            savePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i> Updating...';

            try {
                // First verify current password by attempting sign in
                const currentUser = churchAuth.getCurrentUser();
                if (!currentUser) {
                    showDashboardMessage('Session expired. Please login again.', 'error');
                    return;
                }

                // Try to sign in with current password to verify it
                const verifyResult = await churchAuth.signIn(currentUser.email, currentPassword, false);
                if (!verifyResult.success) {
                    showDashboardMessage('Current password is incorrect.', 'error');
                    return;
                }

                // Update password
                const result = await churchAuth.updatePassword(newPassword);

                if (result.success) {
                    passwordChangeForm.classList.add('hidden');
                    changePasswordBtn.classList.remove('hidden');
                    passwordChangeForm.reset();
                    resetPasswordStrength();
                    showDashboardMessage('Password updated successfully!', 'success');
                } else {
                    showDashboardMessage(result.error || 'Failed to update password.', 'error');
                }
            } catch (error) {
                console.error('Password update error:', error);
                showDashboardMessage('Failed to update password. Please try again.', 'error');
            } finally {
                savePasswordBtn.disabled = false;
                savePasswordBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Update Password';
            }
        });
    }

    // Password visibility toggles
    const passwordToggles = [
        { button: 'toggle-current-password', input: 'current-password' },
        { button: 'toggle-new-password', input: 'new-password' },
        { button: 'toggle-confirm-password', input: 'confirm-new-password' }
    ];

    passwordToggles.forEach(({ button, input }) => {
        const toggleBtn = document.getElementById(button);
        const inputField = document.getElementById(input);

        if (toggleBtn && inputField) {
            toggleBtn.addEventListener('click', function() {
                const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
                inputField.setAttribute('type', type);
                this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        }
    });

    // Password strength indicator for new password
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }

    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirm-new-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = newPasswordInput.value;
            const confirmPassword = this.value;
            const feedback = document.getElementById('confirm-password-feedback');

            if (confirmPassword && password !== confirmPassword) {
                feedback.textContent = 'Passwords do not match';
                feedback.classList.remove('hidden');
                this.classList.add('border-red-500');
                this.classList.remove('border-gray-300');
            } else {
                feedback.classList.add('hidden');
                this.classList.remove('border-red-500');
                this.classList.add('border-gray-300');
            }
        });
    }
}

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

// Reset password strength indicator
function resetPasswordStrength() {
    const strengthBars = ['strength-1', 'strength-2', 'strength-3', 'strength-4'];
    strengthBars.forEach(id => {
        document.getElementById(id).className = 'h-0.5 w-1/4 bg-gray-200 rounded';
    });
    const feedbackElement = document.getElementById('password-feedback');
    if (feedbackElement) {
        feedbackElement.textContent = 'Use uppercase, lowercase, number & symbol';
        feedbackElement.className = 'text-xs text-gray-500';
    }
}

// Validation functions
function isValidName(name) {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone) || phone === '';
}

// Switch between sections
function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => {
        section.classList.add('hidden');
    });

    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Add active class to selected nav link
    const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }

    currentSection = sectionName;

    // Update page title
    updatePageTitle(sectionName);
}

// Update page title based on section
function updatePageTitle(section) {
    const titles = {
        dashboard: 'Dashboard - Our Mother of Perpetual Help Church',
        profile: 'My Profile - Our Mother of Perpetual Help Church',
        services: 'Services - Our Mother of Perpetual Help Church',
        announcements: 'Announcements - Our Mother of Perpetual Help Church',
        events: 'Events - Our Mother of Perpetual Help Church',
        settings: 'Settings - Our Mother of Perpetual Help Church'
    };

    document.title = titles[section] || 'Dashboard - Our Mother of Perpetual Help Church';
}

// Initialize logout functionality
function initializeLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            // Use custom modal popup instead of browser alert
            confirmLogout();

            async function confirmLogout() {
                // Remove any existing popup
                const existingPopup = document.getElementById('logout-popup');
                if (existingPopup) {
                    existingPopup.remove();
                }

                // Create popup overlay
                const overlay = document.createElement('div');
                overlay.id = 'logout-popup';
                overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                overlay.innerHTML = `
                    <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <div class="flex items-center mb-4">
                            <div class="flex-shrink-0 mr-3">
                                <i class="fas fa-sign-out-alt text-red-500 text-2xl"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-800">Confirm Logout</h3>
                            </div>
                        </div>
                        <p class="text-gray-700 mb-6">Are you sure you want to logout?</p>
                        <div class="flex gap-2">
                            <button onclick="closeLogoutPopup()" class="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                                Cancel
                            </button>
                            <button onclick="proceedLogout()" class="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                `;

                document.body.appendChild(overlay);

                // Define functions in global scope for onclick handlers
                window.closeLogoutPopup = function() {
                    const popup = document.getElementById('logout-popup');
                    if (popup) {
                        popup.remove();
                    }
                };

                window.proceedLogout = async function() {
                    closeLogoutPopup();
                    try {
                        console.log('Starting logout process...');

                        // Clear local storage immediately
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('rememberMe');

                        console.log('Local storage cleared, signing out from Supabase...');

                        // Sign out from Supabase
                        const { error } = await supabaseClient.auth.signOut();
                        if (error) {
                            console.error('Supabase signout error:', error);
                        }

                        console.log('Supabase signout completed, forcing redirect to login...');

                        // Force immediate redirect to login page
                        window.location.replace('/src/pages/auth/login.html');

                    } catch (error) {
                        console.error('Logout error:', error);
                        // Even if there's an error, redirect to login
                        window.location.replace('/src/pages/auth/login.html');
                    }
                };
            }
        });
    }
}

// Load user's service requests for dashboard overview
async function loadDashboardServiceRequests() {
    try {
        console.log('Loading dashboard service requests...');

        if (!currentUser?.id) {
            console.log('No current user, skipping service requests load');
            return;
        }

        // Load certificate requests
        const certificateTables = [
            'mass_offering_requests',
            'funeral_certificate_requests',
            'mass_card_requests',
            'sick_call_certificate_requests',
            'marriage_certificate_requests',
            'confirmation_baptism_certificate_requests'
        ];

        let allCertificateRequests = [];
        for (const table of certificateTables) {
            try {
                const { data, error } = await supabaseClient
                    .from(table)
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('submitted_at', { ascending: false })
                    .limit(5);

                if (error) {
                    console.warn(`Error loading from ${table}:`, error);
                    continue;
                }

                if (data && data.length > 0) {
                    allCertificateRequests = allCertificateRequests.concat(
                        data.map(req => ({ ...req, type: 'certificate', table }))
                    );
                }
            } catch (err) {
                console.warn(`Failed to load from ${table}:`, err);
            }
        }

        // Load service requests
        const serviceTables = [
            'confirmation_baptism_service_requests',
            'funeral_service_requests',
            'communion_service_requests',
            'marriage_service_requests',
            'convocation_service_requests',
            'other_service_requests'
        ];

        let allServiceRequests = [];
        for (const table of serviceTables) {
            try {
                const { data, error } = await supabaseClient
                    .from(table)
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('submitted_at', { ascending: false })
                    .limit(5);

                if (error) {
                    console.warn(`Error loading from ${table}:`, error);
                    continue;
                }

                if (data && data.length > 0) {
                    allServiceRequests = allServiceRequests.concat(
                        data.map(req => ({ ...req, type: 'service', table }))
                    );
                }
            } catch (err) {
                console.warn(`Failed to load from ${table}:`, err);
            }
        }

        // Combine and sort all requests by submitted_at
        const allRequests = [...allCertificateRequests, ...allServiceRequests]
            .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
            .slice(0, 5); // Show only the 5 most recent

        console.log('Dashboard service requests loaded:', allRequests.length, 'requests');

        // Update dashboard UI
        const requestsContainer = document.querySelector('.dashboard-service-requests');
        if (requestsContainer) {
            const requestsList = requestsContainer.querySelector('ul') || requestsContainer;

            if (allRequests.length > 0) {
                const requestsHtml = allRequests.map(request => {
                    const statusColor = request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800';

                    const typeLabel = request.type === 'certificate' ? 'Certificate' : 'Service';
                    const tableName = request.table.replace(/_/g, ' ').replace('requests', '').trim();

                    // Get a meaningful title based on the request data
                    let title = tableName;
                    if (request.type === 'certificate') {
                        if (request.soul_name) title = `Mass Offering for ${request.soul_name}`;
                        else if (request.deceased_name) title = `Funeral Certificate for ${request.deceased_name}`;
                        else if (request.patient_name) title = `Sick Call for ${request.patient_name}`;
                        else if (request.person_name) title = `Confirmation/Baptism for ${request.person_name}`;
                    }

                    return `
                        <li class="flex items-start gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10 hover:border-primary/20 transition-all duration-200">
                            <div class="flex-shrink-0">
                                <div class="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-1">
                                    <p class="text-sm font-semibold text-gray-900 truncate">${title}</p>
                                    <span class="text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}">${request.status}</span>
                                </div>
                                <p class="text-xs text-gray-600 mb-2">${typeLabel} Request</p>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs text-gray-500">${new Date(request.submitted_at).toLocaleDateString()}</span>
                                    <span class="text-xs text-primary hover:text-primary/80 font-medium">View details →</span>
                                </div>
                            </div>
                        </li>
                    `;
                }).join('');

                requestsList.innerHTML = requestsHtml;
            } else {
                requestsList.innerHTML = `
                    <li class="text-center py-6">
                        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-file-alt text-gray-400 text-lg"></i>
                        </div>
                        <p class="text-sm text-gray-500">No service requests yet</p>
                        <p class="text-xs text-gray-400 mt-1">Your submitted requests will appear here</p>
                    </li>
                `;
            }
        }

    } catch (error) {
        console.error('Error loading dashboard service requests:', error);
        // Show error state
        const requestsContainer = document.querySelector('.dashboard-service-requests');
        if (requestsContainer) {
            const requestsList = requestsContainer.querySelector('ul') || requestsContainer;
            requestsList.innerHTML = `
                <li class="text-center py-6">
                    <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-triangle text-red-400 text-lg"></i>
                    </div>
                    <p class="text-sm text-red-600">Unable to load requests</p>
                    <p class="text-xs text-gray-400 mt-1">Please try refreshing the page</p>
                </li>
            `;
        }
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load user's service requests
        await loadDashboardServiceRequests();

        // You could load additional data here:
        // - Recent service requests
        // - Upcoming events
        // - Prayer request count
        // - Ministry memberships
        // etc.

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Show dashboard message
function showDashboardMessage(message, type = 'info') {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'success' ? 'bg-green-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Sidebar toggle functions for mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar.classList.contains('-translate-x-full')) {
        openSidebar();
    } else {
        closeSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// Handle window resize for sidebar
window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) {
        closeSidebar();
    }
});

// Handle browser back/forward navigation
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.section) {
        switchSection(event.state.section);
    }
});

// Load announcements when announcements section is shown
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link[data-section="announcements"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(() => {
                if (document.getElementById('announcements-section').classList.contains('hidden') === false) {
                    loadAnnouncementsSection();
                }
            }, 100);
        });
    });

    const eventLinks = document.querySelectorAll('.nav-link[data-section="events"]');
    eventLinks.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(() => {
                if (document.getElementById('events-section').classList.contains('hidden') === false) {
                    loadEventsSection();
                }
            }, 100);
        });
    });

    // Load services history when services section is shown
    const servicesLinks = document.querySelectorAll('.nav-link[data-section="services"]');
    servicesLinks.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(() => {
                if (document.getElementById('services-section').classList.contains('hidden') === false) {
                    // Always load services history when entering services section
                    // This ensures data is fresh when switching to the history tab
                    loadUserServiceRequests();
                }
            }, 100);
        });
    });

    // Refresh dashboard content when navigating back to dashboard
    const dashboardLinks = document.querySelectorAll('.nav-link[data-section="dashboard"]');
    dashboardLinks.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(() => {
                if (document.getElementById('dashboard-section').classList.contains('hidden') === false) {
                    // Refresh dashboard content
                    loadDashboardAnnouncements();
                    loadDashboardEvents();
                    loadDashboardServiceRequests();
                }
            }, 100);
        });
    });
});

// Service Request Form Toggle Functions
function toggleCertificateForm() {
    const formSection = document.getElementById('certificate-form-section');
    const isHidden = formSection.classList.contains('hidden');

    // Hide service form if it's open
    const serviceForm = document.getElementById('service-form-section');
    if (serviceForm && !serviceForm.classList.contains('hidden')) {
        serviceForm.classList.add('hidden');
        document.getElementById('service-form').reset();
    }

    if (isHidden) {
        formSection.classList.remove('hidden');
        // Scroll to form
        setTimeout(() => {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        formSection.classList.add('hidden');
        // Reset form and hide conditional fields
        document.getElementById('certificate-form').reset();
        document.getElementById('mass-offering-fields').classList.add('hidden');
        document.getElementById('funeral-fields').classList.add('hidden');
        document.getElementById('mass-card-fields').classList.add('hidden');
        document.getElementById('sick-call-fields').classList.add('hidden');
        document.getElementById('marriage-requirements').classList.add('hidden');
        document.getElementById('confirmation-baptism-fields').classList.add('hidden');
        document.getElementById('spouse-field').classList.add('hidden');
    }
}

function toggleServiceForm() {
    const formSection = document.getElementById('service-form-section');
    const isHidden = formSection.classList.contains('hidden');

    // Hide certificate form if it's open
    const certificateForm = document.getElementById('certificate-form-section');
    if (certificateForm && !certificateForm.classList.contains('hidden')) {
        certificateForm.classList.add('hidden');
        document.getElementById('certificate-form').reset();
    }

    if (isHidden) {
        formSection.classList.remove('hidden');
        // Scroll to form
        setTimeout(() => {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        formSection.classList.add('hidden');
        document.getElementById('service-form').reset();
    }
}

// Certificate form type change handler
function handleCertificateTypeChange() {
    const certificateType = document.getElementById('certificate-type').value;
    const massOfferingFields = document.getElementById('mass-offering-fields');
    const funeralFields = document.getElementById('funeral-fields');
    const massCardFields = document.getElementById('mass-card-fields');
    const sickCallFields = document.getElementById('sick-call-fields');
    const marriageRequirements = document.getElementById('marriage-requirements');
    const confirmationBaptismFields = document.getElementById('confirmation-baptism-fields');

    // Hide all conditional fields first
    massOfferingFields.classList.add('hidden');
    funeralFields.classList.add('hidden');
    massCardFields.classList.add('hidden');
    sickCallFields.classList.add('hidden');
    marriageRequirements.classList.add('hidden');
    confirmationBaptismFields.classList.add('hidden');

    // Clear all conditional fields
    const massFields = ['soul-name', 'petitions', 'thanksgiving', 'mass-date-time', 'mass-in-charge'];
    massFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });

    const funeralFieldsList = [
        'deceased-name', 'deceased-age', 'deceased-gender', 'civil-status', 'spouse-name',
        'children-count', 'deceased-address', 'occupation', 'church-involvement',
        'cause-of-death', 'death-date', 'informant-name', 'informant-contact'
    ];
    funeralFieldsList.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });

    const massCardFieldsList = ['mass-card-deceased-name', 'mass-card-from'];
    massCardFieldsList.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });

    const sickCallFieldsList = [
        'patient-name', 'patient-age', 'patient-sex', 'patient-civil-status', 'patient-status',
        'hospital-room', 'patient-address', 'contact-person-name', 'contact-number'
    ];
    sickCallFieldsList.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });

    const confirmationBaptismFieldsList = [
        'person-name', 'person-dob', 'place-birth', 'father-name', 'mother-name',
        'godfather-name', 'godmother-name', 'baptism-date', 'confirmation-date',
        'confirmation-sponsor', 'confirmation-name'
    ];
    confirmationBaptismFieldsList.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });

    // Clear all checkboxes
    const allCheckboxes = [
        'need-anointing', 'need-confession', 'need-continuous-care'
    ];
    allCheckboxes.forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) checkbox.checked = false;
    });

    // Hide spouse field
    document.getElementById('spouse-field').classList.add('hidden');

    // Show relevant fields based on selection
    if (certificateType === 'mass-offering') {
        massOfferingFields.classList.remove('hidden');
    } else if (certificateType === 'funeral') {
        funeralFields.classList.remove('hidden');
    } else if (certificateType === 'mass-card') {
        massCardFields.classList.remove('hidden');
    } else if (certificateType === 'sick-call') {
        sickCallFields.classList.remove('hidden');
    } else if (certificateType === 'marriage') {
        marriageRequirements.classList.remove('hidden');
    } else if (certificateType === 'confirmation-baptism') {
        confirmationBaptismFields.classList.remove('hidden');
    }
}

// Civil status change handler for funeral form
function handleCivilStatusChange() {
    const civilStatus = document.getElementById('civil-status').value;
    const spouseField = document.getElementById('spouse-field');

    if (civilStatus === 'married') {
        spouseField.classList.remove('hidden');
    } else {
        spouseField.classList.add('hidden');
        document.getElementById('spouse-name').value = '';
    }
}

// Initialize certificate form handlers
document.addEventListener('DOMContentLoaded', function() {
    const certificateTypeSelect = document.getElementById('certificate-type');
    if (certificateTypeSelect) {
        certificateTypeSelect.addEventListener('change', handleCertificateTypeChange);
    }

    const civilStatusSelect = document.getElementById('civil-status');
    if (civilStatusSelect) {
        civilStatusSelect.addEventListener('change', handleCivilStatusChange);
    }
});

// Submit certificate request
async function submitCertificateRequest(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const certificateType = formData.get('certificateType');

    if (!certificateType) {
        showDashboardMessage('Please select a certificate type.', 'error');
        return;
    }

    // Determine the correct table based on certificate type
    const tableMap = {
        'mass-offering': 'mass_offering_requests',
        'funeral': 'funeral_certificate_requests',
        'mass-card': 'mass_card_requests',
        'sick-call': 'sick_call_certificate_requests',
        'marriage': 'marriage_certificate_requests',
        'confirmation-baptism': 'confirmation_baptism_certificate_requests'
    };

    const tableName = tableMap[certificateType];
    if (!tableName) {
        showDashboardMessage('Invalid certificate type.', 'error');
        return;
    }

    // Prepare data based on certificate type
    let insertData = {
        user_id: currentUser.id,
        additional_details: formData.get('details') || ''
    };

    if (certificateType === 'mass-offering') {
        insertData.soul_name = formData.get('soulName') || '';
        insertData.petitions = formData.get('petitions') || '';
        insertData.thanksgiving = formData.get('thanksgiving') || '';
        insertData.mass_date_time = formData.get('massDateTime') || null;
        insertData.mass_in_charge = formData.get('massInCharge') || '';
    } else if (certificateType === 'funeral') {
        insertData.deceased_name = formData.get('deceasedName') || '';
        insertData.deceased_age = formData.get('deceasedAge') ? parseInt(formData.get('deceasedAge')) : null;
        insertData.deceased_gender = formData.get('deceasedGender') || '';
        insertData.civil_status = formData.get('civilStatus') || '';
        insertData.spouse_name = formData.get('spouseName') || '';
        insertData.children_count = formData.get('childrenCount') ? parseInt(formData.get('childrenCount')) : 0;
        insertData.deceased_address = formData.get('deceasedAddress') || '';
        insertData.occupation = formData.get('occupation') || '';
        insertData.church_involvement = formData.get('churchInvolvement') || '';
        insertData.cause_of_death = formData.get('causeOfDeath') || '';
        insertData.death_date = formData.get('deathDate') || null;
        insertData.informant_name = formData.get('informantName') || '';
        insertData.informant_contact = formData.get('informantContact') || '';
    } else if (certificateType === 'mass-card') {
        insertData.deceased_name = formData.get('massCardDeceasedName') || '';
        insertData.requester_name = formData.get('massCardFrom') || '';
    } else if (certificateType === 'sick-call') {
        insertData.patient_name = formData.get('patientName') || '';
        insertData.patient_age = formData.get('patientAge') ? parseInt(formData.get('patientAge')) : null;
        insertData.patient_sex = formData.get('patientSex') || '';
        insertData.patient_civil_status = formData.get('patientCivilStatus') || '';
        insertData.patient_status = formData.get('patientStatus') || '';
        insertData.hospital_room = formData.get('hospitalRoom') || '';
        insertData.patient_address = formData.get('patientAddress') || '';
        insertData.contact_person_name = formData.get('contactPersonName') || '';
        insertData.contact_number = formData.get('contactNumber') || '';

        // Handle checkboxes for needs
        const needs = [];
        if (form.querySelector('#need-anointing')?.checked) needs.push('ANOINTING');
        if (form.querySelector('#need-confession')?.checked) needs.push('CONFESSION');
        if (form.querySelector('#need-continuous-care')?.checked) needs.push('CONTINUOUS CARE FOR THE SICK');
        insertData.needs = needs;
    } else if (certificateType === 'confirmation-baptism') {
        insertData.person_name = formData.get('personName') || '';
        insertData.person_dob = formData.get('personDOB') || null;
        insertData.place_of_birth = formData.get('placeOfBirth') || '';
        insertData.father_name = formData.get('fatherName') || '';
        insertData.mother_name = formData.get('motherName') || '';
        insertData.godfather_name = formData.get('godfatherName') || '';
        insertData.godmother_name = formData.get('godmotherName') || '';
        insertData.baptism_date = formData.get('baptismDate') || null;
        insertData.confirmation_date = formData.get('confirmationDate') || null;
        insertData.confirmation_sponsor = formData.get('confirmationSponsor') || '';
        insertData.confirmation_name = formData.get('confirmationName') || '';
    }

    try {
        const { data, error } = await supabaseClient
            .from(tableName)
            .insert(insertData);

        if (error) throw error;

        showDashboardMessage('Certificate request submitted successfully!', 'success');
        toggleCertificateForm(); // Close the form

        // Switch to history tab and refresh data
        setTimeout(() => {
            switchToHistoryTab();
            // Refresh both dashboard and services history
            loadUserServiceRequests();
            loadDashboardServiceRequests();
        }, 500); // Small delay to ensure database commit
    } catch (error) {
        console.error('Error submitting certificate request:', error);
        showDashboardMessage('Failed to submit certificate request. Please try again.', 'error');
    }
}

// Submit service request
async function submitServiceRequest(event) {
    event.preventDefault();
    console.log('Submitting service request...');

    const form = event.target;
    const formData = new FormData(form);
    const serviceType = formData.get('serviceType');
    console.log('Service type:', serviceType);

    if (!serviceType) {
        showDashboardMessage('Please select a service type.', 'error');
        return;
    }

    // Determine the correct table based on service type
    const tableMap = {
        'confirmation-baptism': 'confirmation_baptism_service_requests',
        'funeral': 'funeral_service_requests',
        'communion': 'communion_service_requests',
        'marriage': 'marriage_service_requests',
        'convocation': 'convocation_service_requests',
        'other': 'other_service_requests'
    };

    const tableName = tableMap[serviceType];
    console.log('Table name:', tableName);
    if (!tableName) {
        showDashboardMessage('Invalid service type.', 'error');
        return;
    }

    // Prepare data - all service tables currently just have additional_details
    const insertData = {
        user_id: currentUser.id,
        additional_details: formData.get('details') || ''
    };
    console.log('Insert data:', insertData);

    try {
        const { data, error } = await supabaseClient
            .from(tableName)
            .insert(insertData);

        console.log('Insert result:', { data, error });

        if (error) throw error;

        showDashboardMessage('Service request submitted successfully!', 'success');
        toggleServiceForm(); // Close the form

        // Switch to history tab and refresh data
        setTimeout(() => {
            switchToHistoryTab();
            // Refresh both dashboard and services history
            loadUserServiceRequests();
            loadDashboardServiceRequests();
        }, 500); // Small delay to ensure database commit
    } catch (error) {
        console.error('Error submitting service request:', error);
        showDashboardMessage('Failed to submit service request. Please try again.', 'error');
    }
}

// Initialize form event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Certificate form submission
    const certificateForm = document.getElementById('certificate-form');
    if (certificateForm) {
        certificateForm.addEventListener('submit', submitCertificateRequest);
    }

    // Service form submission
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', submitServiceRequest);
    }
});

// Load user's service requests history for the services section
async function loadUserServiceRequests() {
    try {
        console.log('Loading user service requests history...');

        if (!currentUser?.id) {
            console.log('No current user, skipping service requests load');
            return;
        }

        const container = document.getElementById('services-history-container');
        if (!container) return;

        container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-primary text-2xl"></i><p class="text-gray-600 mt-2">Loading your service requests...</p></div>';

        // Load certificate requests
        const certificateTables = [
            'mass_offering_requests',
            'funeral_certificate_requests',
            'mass_card_requests',
            'sick_call_certificate_requests',
            'marriage_certificate_requests',
            'confirmation_baptism_certificate_requests'
        ];

        let allCertificateRequests = [];
        for (const table of certificateTables) {
            try {
                const { data, error } = await supabaseClient
                    .from(table)
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('submitted_at', { ascending: false });

                if (error) {
                    console.warn(`Error loading from ${table}:`, error);
                    continue;
                }

                if (data && data.length > 0) {
                    allCertificateRequests = allCertificateRequests.concat(
                        data.map(req => ({ ...req, type: 'certificate', table, requestType: getRequestTypeLabel(table) }))
                    );
                }
            } catch (err) {
                console.warn(`Failed to load from ${table}:`, err);
            }
        }

        // Load service requests
        const serviceTables = [
            'confirmation_baptism_service_requests',
            'funeral_service_requests',
            'communion_service_requests',
            'marriage_service_requests',
            'convocation_service_requests',
            'other_service_requests'
        ];

        let allServiceRequests = [];
        for (const table of serviceTables) {
            try {
                const { data, error } = await supabaseClient
                    .from(table)
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('submitted_at', { ascending: false });

                if (error) {
                    console.warn(`Error loading from ${table}:`, error);
                    continue;
                }

                if (data && data.length > 0) {
                    allServiceRequests = allServiceRequests.concat(
                        data.map(req => ({ ...req, type: 'service', table, requestType: getRequestTypeLabel(table) }))
                    );
                }
            } catch (err) {
                console.warn(`Failed to load from ${table}:`, err);
            }
        }

        // Combine all requests
        let allRequests = [...allCertificateRequests, ...allServiceRequests];

        console.log('Loaded', allRequests.length, 'total service requests');

        if (allRequests.length > 0) {
            // Store requests globally for filtering/sorting
            window.userServiceRequests = allRequests;

            // Render requests
            renderServiceRequests(allRequests);
        } else {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-file-alt text-gray-400 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-display font-bold text-secondary mb-2">No Service Requests</h3>
                    <p class="text-gray-600 mb-4">You haven't submitted any service requests yet.</p>
                    <button onclick="switchToRequestTab()" class="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all">
                        <i class="fas fa-plus text-xs mr-2"></i>Request a Service
                    </button>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error loading user service requests:', error);
        const container = document.getElementById('services-history-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-display font-bold text-secondary mb-2">Error Loading Requests</h3>
                    <p class="text-gray-600 mb-4">Unable to load your service requests. Please try again later.</p>
                    <button onclick="loadUserServiceRequests()" class="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all">
                        <i class="fas fa-refresh text-xs mr-2"></i>Try Again
                    </button>
                </div>
            `;
        }
    }
}

// Helper function to get human-readable request type labels
function getRequestTypeLabel(tableName) {
    const labels = {
        'mass_offering_requests': 'Mass Offering',
        'funeral_certificate_requests': 'Funeral Certificate',
        'mass_card_requests': 'Mass Card',
        'sick_call_certificate_requests': 'Sick Call Certificate',
        'marriage_certificate_requests': 'Marriage Certificate',
        'confirmation_baptism_certificate_requests': 'Confirmation/Baptism Certificate',
        'confirmation_baptism_service_requests': 'Confirmation/Baptism Service',
        'funeral_service_requests': 'Funeral Service',
        'communion_service_requests': 'Communion Service',
        'marriage_service_requests': 'Marriage Service',
        'convocation_service_requests': 'Convocation Service',
        'other_service_requests': 'Other Service'
    };
    return labels[tableName] || tableName.replace(/_/g, ' ').replace('requests', '').trim();
}

// Render service requests with filtering and sorting
function renderServiceRequests(requests, filter = 'all', sort = 'newest') {
    const container = document.getElementById('services-history-container');
    if (!container) return;

    // Apply filtering
    let filteredRequests = requests;
    if (filter !== 'all') {
        filteredRequests = requests.filter(req => req.status === filter);
    }

    // Apply sorting
    filteredRequests.sort((a, b) => {
        switch (sort) {
            case 'oldest':
                return new Date(a.submitted_at) - new Date(b.submitted_at);
            case 'status':
                const statusOrder = { 'pending': 1, 'approved': 2, 'completed': 3, 'rejected': 4 };
                return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
            case 'newest':
            default:
                return new Date(b.submitted_at) - new Date(a.submitted_at);
        }
    });

    if (filteredRequests.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-filter text-gray-400 text-lg"></i>
                </div>
                <p class="text-sm text-gray-500">No requests match your current filters.</p>
                <button onclick="resetServiceFilters()" class="text-primary hover:text-primary/80 text-sm mt-2 underline">Clear filters</button>
            </div>
        `;
        return;
    }

    const requestsHtml = filteredRequests.map(request => {
        const statusColor = request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800';

        const statusIcon = request.status === 'completed' ? 'fas fa-check-circle' :
                          request.status === 'approved' ? 'fas fa-clock' :
                          request.status === 'rejected' ? 'fas fa-times-circle' :
                          'fas fa-hourglass-half';

        // Get meaningful title and details
        const { title, details } = getRequestDisplayInfo(request);

        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="text-base font-semibold text-secondary">${title}</h4>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusColor}">
                                <i class="${statusIcon} text-xs"></i>
                                ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                        </div>
                        <p class="text-sm text-gray-600 mb-2">${request.requestType}</p>
                        ${details ? `<p class="text-sm text-gray-700 mb-2">${details}</p>` : ''}
                    </div>
                </div>

                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>Submitted ${new Date(request.submitted_at).toLocaleDateString()}</span>
                    <button onclick="viewRequestDetails('${request.id}', '${request.table}', '${request.type}')" class="text-primary hover:text-primary/80 font-medium">
                        View Details →
                    </button>
                </div>

                ${request.admin_notes ? `
                    <div class="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-primary">
                        <p class="text-xs font-medium text-secondary mb-1">Admin Notes:</p>
                        <p class="text-xs text-gray-700">${request.admin_notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    container.innerHTML = requestsHtml;
}

// Get display information for a request
function getRequestDisplayInfo(request) {
    let title = request.requestType;
    let details = '';

    if (request.type === 'certificate') {
        if (request.soul_name) {
            title = `Mass Offering for ${request.soul_name}`;
            details = request.petitions ? `Petitions: ${request.petitions.substring(0, 100)}${request.petitions.length > 100 ? '...' : ''}` : '';
        } else if (request.deceased_name) {
            title = `${request.table.includes('funeral') ? 'Funeral Certificate' : 'Mass Card'} for ${request.deceased_name}`;
            if (request.table.includes('funeral')) {
                details = `Age: ${request.deceased_age || 'N/A'}, ${request.civil_status || 'N/A'}`;
            }
        } else if (request.patient_name) {
            title = `Sick Call for ${request.patient_name}`;
            details = `Age: ${request.patient_age || 'N/A'}, Status: ${request.patient_status || 'N/A'}`;
        } else if (request.person_name) {
            title = `Confirmation/Baptism Certificate for ${request.person_name}`;
            details = `DOB: ${request.person_dob ? new Date(request.person_dob).toLocaleDateString() : 'N/A'}`;
        }
    } else {
        // Service requests
        title = request.requestType;
        details = request.additional_details ? request.additional_details.substring(0, 150) + (request.additional_details.length > 150 ? '...' : '') : '';
    }

    return { title, details };
}

// View request details in a modal
function viewRequestDetails(requestId, tableName, requestType) {
    // Find the request in our stored data
    const request = window.userServiceRequests?.find(req => req.id === requestId && req.table === tableName);
    if (!request) {
        showDashboardMessage('Request details not found.', 'error');
        return;
    }

    // Create modal with request details
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-display font-bold text-secondary">Request Details</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                            <p class="text-sm text-gray-900">${request.requestType}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }">
                                <i class="${
                                    request.status === 'completed' ? 'fas fa-check-circle' :
                                    request.status === 'approved' ? 'fas fa-clock' :
                                    request.status === 'rejected' ? 'fas fa-times-circle' :
                                    'fas fa-hourglass-half'
                                } text-xs"></i>
                                ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Submitted Date</label>
                        <p class="text-sm text-gray-900">${new Date(request.submitted_at).toLocaleString()}</p>
                    </div>

                    ${request.type === 'certificate' ? generateCertificateDetailsHTML(request) : generateServiceDetailsHTML(request)}

                    ${request.admin_notes ? `
                        <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <label class="block text-sm font-medium text-blue-800 mb-1">Admin Notes</label>
                            <p class="text-sm text-blue-700">${request.admin_notes}</p>
                        </div>
                    ` : ''}

                    ${request.status === 'pending' ? `
                        <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                            <p class="text-sm text-yellow-800">
                                <i class="fas fa-info-circle mr-1"></i>
                                Your request is being reviewed. You will be notified once there's an update.
                            </p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Generate HTML for certificate request details
function generateCertificateDetailsHTML(request) {
    let html = '';

    if (request.soul_name) {
        html += `
            <div class="grid grid-cols-1 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Soul Name</label>
                    <p class="text-sm text-gray-900">${request.soul_name}</p>
                </div>
                ${request.petitions ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Petitions</label>
                        <p class="text-sm text-gray-900">${request.petitions}</p>
                    </div>
                ` : ''}
                ${request.thanksgiving ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Thanksgiving</label>
                        <p class="text-sm text-gray-900">${request.thanksgiving}</p>
                    </div>
                ` : ''}
                ${request.mass_date_time ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Mass Date & Time</label>
                        <p class="text-sm text-gray-900">${new Date(request.mass_date_time).toLocaleString()}</p>
                    </div>
                ` : ''}
                ${request.mass_in_charge ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Person in Charge</label>
                        <p class="text-sm text-gray-900">${request.mass_in_charge}</p>
                    </div>
                ` : ''}
            </div>
        `;
    } else if (request.deceased_name) {
        html += `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Deceased Name</label>
                    <p class="text-sm text-gray-900">${request.deceased_name}</p>
                </div>
                ${request.deceased_age ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <p class="text-sm text-gray-900">${request.deceased_age}</p>
                    </div>
                ` : ''}
                ${request.deceased_gender ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <p class="text-sm text-gray-900">${request.deceased_gender}</p>
                    </div>
                ` : ''}
                ${request.civil_status ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                        <p class="text-sm text-gray-900">${request.civil_status}</p>
                    </div>
                ` : ''}
                ${request.spouse_name ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
                        <p class="text-sm text-gray-900">${request.spouse_name}</p>
                    </div>
                ` : ''}
                ${request.occupation ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                        <p class="text-sm text-gray-900">${request.occupation}</p>
                    </div>
                ` : ''}
                ${request.cause_of_death ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cause of Death</label>
                        <p class="text-sm text-gray-900">${request.cause_of_death}</p>
                    </div>
                ` : ''}
                ${request.death_date ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date of Death</label>
                        <p class="text-sm text-gray-900">${new Date(request.death_date).toLocaleDateString()}</p>
                    </div>
                ` : ''}
            </div>
        `;
    } else if (request.patient_name) {
        html += `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                    <p class="text-sm text-gray-900">${request.patient_name}</p>
                </div>
                ${request.patient_age ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <p class="text-sm text-gray-900">${request.patient_age}</p>
                    </div>
                ` : ''}
                ${request.patient_sex ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                        <p class="text-sm text-gray-900">${request.patient_sex}</p>
                    </div>
                ` : ''}
                ${request.patient_status ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <p class="text-sm text-gray-900">${request.patient_status}</p>
                    </div>
                ` : ''}
                ${request.needs && request.needs.length > 0 ? `
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Needs</label>
                        <p class="text-sm text-gray-900">${request.needs.join(', ')}</p>
                    </div>
                ` : ''}
            </div>
        `;
    } else if (request.person_name) {
        html += `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Person Name</label>
                    <p class="text-sm text-gray-900">${request.person_name}</p>
                </div>
                ${request.person_dob ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <p class="text-sm text-gray-900">${new Date(request.person_dob).toLocaleDateString()}</p>
                    </div>
                ` : ''}
                ${request.father_name ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                        <p class="text-sm text-gray-900">${request.father_name}</p>
                    </div>
                ` : ''}
                ${request.mother_name ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                        <p class="text-sm text-gray-900">${request.mother_name}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    if (request.additional_details) {
        html += `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                <p class="text-sm text-gray-900">${request.additional_details}</p>
            </div>
        `;
    }

    return html;
}

// Generate HTML for service request details
function generateServiceDetailsHTML(request) {
    return `
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
            <p class="text-sm text-gray-900">${request.additional_details || 'No additional details provided.'}</p>
        </div>
    `;
}

// Initialize services tab functionality
function initializeServicesTabs() {
    const tabButtons = document.querySelectorAll('.services-tab');
    const tabContents = document.querySelectorAll('.services-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');

            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active', 'border-primary', 'text-primary'));
            tabButtons.forEach(btn => btn.classList.add('border-transparent', 'text-gray-500'));

            // Add active class to clicked tab
            this.classList.add('active', 'border-primary', 'text-primary');
            this.classList.remove('border-transparent', 'text-gray-500');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.add('hidden'));

            // Show selected tab content
            const targetContent = document.getElementById(`services-${tabName}-content`);
            if (targetContent) {
                targetContent.classList.remove('hidden');

                // Load data if it's the history tab
                if (tabName === 'history') {
                    loadUserServiceRequests();
                }
            }
        });
    });

    // Auto-switch to history tab after successful form submission
    window.switchToHistoryTab = function() {
        const historyTab = document.getElementById('services-history-tab');
        if (historyTab) {
            historyTab.click();
        }
    };

    // Initialize filter and sort functionality
    const filterSelect = document.getElementById('services-filter');
    const sortSelect = document.getElementById('services-sort');

    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const sortValue = sortSelect ? sortSelect.value : 'newest';
            renderServiceRequests(window.userServiceRequests || [], this.value, sortValue);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const filterValue = filterSelect ? filterSelect.value : 'all';
            renderServiceRequests(window.userServiceRequests || [], filterValue, this.value);
        });
    }
}

// Reset service filters
function resetServiceFilters() {
    const filterSelect = document.getElementById('services-filter');
    const sortSelect = document.getElementById('services-sort');

    if (filterSelect) filterSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'newest';

    renderServiceRequests(window.userServiceRequests || [], 'all', 'newest');
}

// Switch to request tab
function switchToRequestTab() {
    const requestTab = document.getElementById('services-request-tab');
    if (requestTab) {
        requestTab.click();
    }
}

// Export functions for global access
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.toggleCertificateForm = toggleCertificateForm;
window.toggleServiceForm = toggleServiceForm;
window.loadUserServiceRequests = loadUserServiceRequests;
window.viewRequestDetails = viewRequestDetails;
window.resetServiceFilters = resetServiceFilters;
window.switchToRequestTab = switchToRequestTab;