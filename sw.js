// Service Worker for Our Mother of Perpetual Help Church PWA
const CACHE_NAME = 'omp-church-v1.0.0';
const STATIC_CACHE = 'omp-church-static-v1.0.0';
const DYNAMIC_CACHE = 'omp-church-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/src/pages/public/index.html',
  '/src/assets/css/public.css',
  '/src/assets/js/public.js',
  '/src/assets/images/favicon.ico.png',
  '/src/assets/images/Perpetual Church Logo.png',
  '/src/assets/images/Perpetual Church.png',
  '/src/assets/images/Mother-of-Perpetual-Help.png',
  '/src/assets/images/Perpetual Church Inside.png',
  '/src/assets/images/Perpetual Church Schedule.png',
  '/src/assets/images/Ministry.png',
  '/src/assets/images/Fr._Gaspe.png',
  '/src/assets/images/Fr._James.png',
  '/src/assets/images/Fr._Eliodoro.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and enforce HTTPS
  if (url.origin !== location.origin || url.protocol !== 'https:') {
    return;
  }

  // Handle API requests differently
  if (url.hostname.includes('supabase.co')) {
    // For Supabase API calls, try network first, then cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache the response
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.log('Service Worker: Fetch failed, returning offline page');
            // Return cached homepage for navigation requests
            if (request.destination === 'document') {
              return caches.match('/src/pages/public/index.html');
            }
          });
      })
  );
});

// Background sync for offline service requests
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // This would handle syncing offline service requests when connection is restored
  console.log('Service Worker: Performing background sync');
  // Implementation would depend on your specific offline data handling needs
}

// Push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/src/assets/images/Perpetual Church Logo.png',
      badge: '/src/assets/images/favicon.ico.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});