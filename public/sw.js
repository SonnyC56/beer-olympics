const CACHE_NAME = 'beer-olympics-v2';
const STATIC_CACHE_NAME = 'beer-olympics-static-v2';
const API_CACHE_NAME = 'beer-olympics-api-v2';

// URLs to cache when the SW is installed
const STATIC_URLS = [
  '/',
  '/manifest.json',
  '/vite.svg',
  // Add other static assets as needed
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/tournament/',
  '/api/leaderboard/',
  '/api/teams/',
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_URLS);
      }),
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('API cache ready');
        return cache;
      })
    ])
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== API_CACHE_NAME &&
            cacheName !== CACHE_NAME
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static resources
  if (
    url.pathname.includes('.') ||
    url.pathname === '/' ||
    url.pathname.startsWith('/static/')
  ) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Handle navigation requests (SPA routing)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Default: network first
  event.respondWith(fetch(request));
});

// Network first, then cache for API requests
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      
      // Only cache GET requests for certain endpoints
      const shouldCache = API_ENDPOINTS.some(endpoint => 
        url.pathname.startsWith(endpoint)
      );
      
      if (shouldCache) {
        cache.put(request, response.clone());
      }
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for API failures
    return new Response(
      JSON.stringify({
        error: 'Network unavailable. Please check your connection.',
        offline: true
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

// Cache first, then network for static resources
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Failed to fetch static resource:', request.url);
    
    // Return a fallback for failed static resources
    if (request.url.includes('.js') || request.url.includes('.css')) {
      return new Response('', { status: 503 });
    }
    
    return new Response('Resource unavailable offline', { status: 503 });
  }
}

// Handle navigation requests (SPA routing)
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('Navigation request failed, serving cached index');
    
    // Serve cached index.html for offline navigation
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Beer Olympics - Offline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            text-align: center;
            padding: 2rem;
            background: #1e40af;
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }
          h1 { margin-bottom: 1rem; }
          p { margin-bottom: 2rem; }
          button {
            background: white;
            color: #1e40af;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <h1>🍺 Beer Olympics</h1>
        <p>You're currently offline. Please check your internet connection.</p>
        <button onclick="window.location.reload()">Try Again</button>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'score-submission') {
    event.waitUntil(syncScoreSubmissions());
  }
});

// Sync pending score submissions when back online
async function syncScoreSubmissions() {
  try {
    // This would retrieve pending submissions from IndexedDB
    // and submit them when back online
    console.log('Syncing score submissions...');
    
    // Implementation would go here
    // For now, just log that sync is working
  } catch (error) {
    console.error('Failed to sync score submissions:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'beer-olympics',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  if (action === 'view') {
    // Open the app to view the content
    event.waitUntil(
      clients.openWindow(data.url || '/')
    );
  } else if (action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow(data.url || '/')
    );
  }
});