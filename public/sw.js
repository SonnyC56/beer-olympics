const CACHE_NAME = 'beer-olympics-v3';
const STATIC_CACHE_NAME = 'beer-olympics-static-v3';
const API_CACHE_NAME = 'beer-olympics-api-v3';
const OFFLINE_QUEUE_NAME = 'beer-olympics-offline-queue';

// URLs to cache when the SW is installed
const STATIC_URLS = [
  '/',
  '/manifest.json',
  '/vite.svg',
  '/icons/icon-72x72.svg',
  '/icons/icon-144x144.svg',
  // Add other static assets as needed
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/tournament/',
  '/api/leaderboard/',
  '/api/teams/',
  '/api/trpc/',
];

// IndexedDB setup for offline queue
const OFFLINE_DB_NAME = 'BeerOlympicsOffline';
const OFFLINE_DB_VERSION = 1;
const OFFLINE_STORE_NAME = 'pendingRequests';

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

// IndexedDB helper functions
async function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE_NAME)) {
        db.createObjectStore(OFFLINE_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function saveOfflineRequest(request, body) {
  const db = await openOfflineDB();
  const transaction = db.transaction([OFFLINE_STORE_NAME], 'readwrite');
  const store = transaction.objectStore(OFFLINE_STORE_NAME);
  
  const offlineRequest = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: body,
    timestamp: Date.now(),
  };
  
  return store.add(offlineRequest);
}

async function getPendingRequests() {
  const db = await openOfflineDB();
  const transaction = db.transaction([OFFLINE_STORE_NAME], 'readonly');
  const store = transaction.objectStore(OFFLINE_STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteOfflineRequest(id) {
  const db = await openOfflineDB();
  const transaction = db.transaction([OFFLINE_STORE_NAME], 'readwrite');
  const store = transaction.objectStore(OFFLINE_STORE_NAME);
  
  return store.delete(id);
}

// Handle offline form submissions
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Handle POST/PUT/PATCH requests that might need offline queue
  if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.url.includes('/api/')) {
    event.respondWith(handleMutableRequest(request));
    return;
  }
});

async function handleMutableRequest(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // Network failed, save to offline queue
    console.log('Offline - saving request to queue:', request.url);
    
    const body = await request.text();
    await saveOfflineRequest(request, body);
    
    // Register sync event
    if ('sync' in self.registration) {
      await self.registration.sync.register('offline-sync');
    }
    
    // Return a response indicating offline storage
    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        message: 'Your action has been saved and will be synced when online.',
      }),
      {
        status: 202,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-sync') {
    event.waitUntil(syncOfflineRequests());
  }
});

// Sync pending requests when back online
async function syncOfflineRequests() {
  try {
    console.log('Syncing offline requests...');
    
    const pendingRequests = await getPendingRequests();
    console.log(`Found ${pendingRequests.length} pending requests`);
    
    for (const offlineRequest of pendingRequests) {
      try {
        const response = await fetch(offlineRequest.url, {
          method: offlineRequest.method,
          headers: offlineRequest.headers,
          body: offlineRequest.body,
        });
        
        if (response.ok) {
          await deleteOfflineRequest(offlineRequest.id);
          console.log('Successfully synced:', offlineRequest.url);
          
          // Notify the app about successful sync
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'sync-success',
              url: offlineRequest.url,
              timestamp: Date.now(),
            });
          });
        } else {
          console.error('Failed to sync:', offlineRequest.url, response.status);
        }
      } catch (error) {
        console.error('Error syncing request:', offlineRequest.url, error);
      }
    }
  } catch (error) {
    console.error('Failed to sync offline requests:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  // Enhanced notification options
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    tag: data.tag || 'beer-olympics',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200],
    image: data.image,
    renotify: data.renotify || false,
    timestamp: Date.now(),
  };
  
  // Play sound if specified and not silent
  if (data.sound && !data.silent) {
    // This would be handled by the notification itself
    options.sound = data.sound;
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => {
        // Track notification display
        if (data.data && data.data.type) {
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'notification-displayed',
                notificationType: data.data.type,
                timestamp: Date.now(),
              });
            });
          });
        }
      })
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  // Handle different actions
  const handleAction = async () => {
    const allClients = await clients.matchAll({ type: 'window' });
    
    if (action === 'ready' && data.type === 'your-turn') {
      // Player is ready - notify the app
      if (allClients.length > 0) {
        allClients[0].postMessage({
          type: 'player-ready',
          matchId: data.matchId,
          tournamentId: data.tournamentId,
        });
        allClients[0].focus();
      } else {
        clients.openWindow(`/tournament/${data.tournamentId}/match/${data.matchId}`);
      }
    } else if (action === 'delay' && data.type === 'your-turn') {
      // Player needs delay - notify the app
      if (allClients.length > 0) {
        allClients[0].postMessage({
          type: 'player-delay',
          matchId: data.matchId,
          tournamentId: data.tournamentId,
          delay: 5, // 5 minutes
        });
        allClients[0].focus();
      } else {
        clients.openWindow(`/tournament/${data.tournamentId}`);
      }
    } else if (action === 'view') {
      // View specific content
      const urlToOpen = data.url || 
        (data.type === 'leaderboard-update' ? `/tournament/${data.tournamentId}/leaderboard` :
         data.type === 'game-start' ? `/tournament/${data.tournamentId}/match/${data.matchId}` :
         data.type === 'tournament-complete' ? `/tournament/${data.tournamentId}/results` :
         `/tournament/${data.tournamentId}`);
      
      if (allClients.length > 0) {
        allClients[0].navigate(urlToOpen);
        allClients[0].focus();
      } else {
        clients.openWindow(urlToOpen);
      }
    } else if (action === 'dismiss') {
      // Just close the notification
      return;
    } else {
      // Default action - open or focus the app
      if (allClients.length > 0) {
        allClients[0].focus();
        if (data.tournamentId) {
          allClients[0].navigate(`/tournament/${data.tournamentId}`);
        }
      } else {
        clients.openWindow(data.url || '/');
      }
    }
  };
  
  event.waitUntil(handleAction());
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {};
  
  // Track notification dismissal
  if (data.type) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'notification-dismissed',
          notificationType: data.type,
          timestamp: Date.now(),
        });
      });
    });
  }
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'test-notification') {
    // Show a test notification
    self.registration.showNotification('🎯 Test Notification', {
      body: 'This is a test notification from Beer Olympics!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'test',
      data: { type: 'test' },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      vibrate: [200, 100, 200],
    });
  }
});