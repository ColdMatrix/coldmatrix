const CACHE_NAME = 'coldmatrix-v1';
const urlsToCache = [
  '/index.html',
  '/cold-store-calculator.html',
  '/sandwich-panel-calculator.html',
  '/qr-code-generator.html',
  '/about.html',
  '/contact.html',
  '/privacy-policy.html',
  '/terms-of-use.html',
  '/manifest.json'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));