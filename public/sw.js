// sw.js - Example readable service worker

self.addEventListener('install', event => {
    self.skipWaiting();
    console.log('[SW] Installed');
});

self.addEventListener('activate', event => {
    self.clients.claim();
    console.log('[SW] Activated');
});

self.addEventListener('fetch', event => {
    // Example: Network-first strategy for all requests
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Optionally, cache the response here
                return response;
            })
            .catch(() => {
                // Optionally, return from cache if offline
                return caches.match(event.request);
            })
    );
});

// Listen for skipWaiting message from app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});