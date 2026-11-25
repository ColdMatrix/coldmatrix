'use strict';

// Bump this name whenever the service-worker rules or precached site shell change.
const CACHE_NAME = 'coldmatrix-v308';
const PRECACHE_URLS = [
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

const STATIC_ASSET_RE = /\.(?:avif|bmp|css|eot|gif|ico|jpe?g|js|json|m4a|mp3|mp4|ogg|otf|png|svg|ttf|webp|woff2?)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // A single missing page must not prevent the new worker from installing.
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (response.ok && response.type === 'basic') {
          await cache.put(url, response);
        }
      } catch (_) {
        // The page can still be fetched normally when connectivity returns.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map((name) => {
      if (name.startsWith('coldmatrix-') && name !== CACHE_NAME) {
        return caches.delete(name);
      }
      return Promise.resolve(false);
    }));
    await self.clients.claim();
  })());
});

async function networkAndUpdate(request, cache) {
  const response = await fetch(request);
  if (response.ok && response.status === 200 && response.type === 'basic' &&
      !response.headers.has('content-range')) {
    try {
      await cache.put(request, response.clone());
    } catch (_) {
      // Storage quota errors must never block a successful network response.
    }
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Leave non-GET, cross-origin, range, credentialed and authorized requests alone.
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      request.headers.has('range') || request.credentials === 'include' ||
      request.headers.has('authorization') ||
      (url.protocol !== 'https:' && url.protocol !== 'http:')) {
    return;
  }

  if (STATIC_ASSET_RE.test(url.pathname)) {
    // Cache-first for same-origin static assets: avoid a network request on
    // every repeat visit. A new deployment bumps CACHE_NAME to refresh assets.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;

      const fresh = await fetch(request);
      if (fresh.ok && fresh.status === 200 && fresh.type === 'basic' &&
          !fresh.headers.has('content-range')) {
        try {
          await cache.put(request, fresh.clone());
        } catch (_) {
          // A storage quota error must not block the network response.
        }
      }
      return fresh;
    })());
    return;
  }

  // HTML pages stay network-first so visitors receive current page content.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      return await networkAndUpdate(request, cache);
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      throw error;
    }
  })());
});
