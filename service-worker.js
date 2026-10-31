const CACHE_NAME = 'coldmatrix-v305';
const ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/solutions.html',
  '/blog.html',
  '/gallery.html',
  '/privacy-policy.html',
  '/terms-of-use.html',
  '/cookie-policy.html',
  '/security.html',
  '/sandwich-panel-calculator.html',
  '/cold-store-calculator.html',
  '/cooling-requirement-calculator.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((response) => {
      // DYNAMIC CACHING: Automatically saves every page the user visits!
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(e.request, responseClone);
      });
      return response;
    }).catch(() => {
      // If offline, load from cache
      return caches.match(e.request);
    })
  );
});