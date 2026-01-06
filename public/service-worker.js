// Service Worker for Study Planner Notifications
// Save this file as: public/service-worker.js

const CACHE_NAME = 'study-planner-v1';

// Install event - setup service worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Installing...');
  self.skipWaiting(); // Activate immediately
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activated');
  event.waitUntil(
    clients.claim() // Take control of all pages immediately
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();
  
  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (let client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed');
});

// Optional: Background sync for checking deadlines even when app is closed
// Note: This requires user to keep the browser open, but not necessarily the tab
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-study-deadlines') {
    console.log('🔄 Periodic sync: Checking study deadlines...');
    event.waitUntil(checkDeadlinesInBackground());
  }
});

async function checkDeadlinesInBackground() {
  try {
    // This is a placeholder - you'd need to implement the actual check
    // For now, this just logs that the sync happened
    console.log('📚 Background check completed');
  } catch (error) {
    console.error('❌ Background check failed:', error);
  }
}

// Message handling from the main app
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
