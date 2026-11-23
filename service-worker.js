'use strict';

const CACHE_NAME = 'coldmatrix-v306';
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

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache each known page independently: one missing page must not abort installation.
    await Promise.all(ASSETS.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (response.ok && response.type === 'basic') {
          await cache.put(url, response);
        }
      } catch (_) {
        // A page that is unavailable now can still be loaded online later.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map((name) => {
      // Remove only previous ColdMatrix versions; leave unrelated site caches alone.
      if (name.startsWith('coldmatrix-') && name !== CACHE_NAME) {
        return caches.delete(name);
      }
      return Promise.resolve(false);
    }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Leave non-GET, cross-origin, range/media and credentialed requests to the browser.
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      request.headers.has('range') || request.credentials === 'include' ||
      request.headers.has('authorization')) {
    return;
  }

  // Do not cache analytics, external APIs, or non-HTTP(S) requests.
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      // Cache only complete, successful same-origin responses.
      if (response.ok && response.status === 200 && response.type === 'basic' &&
          !response.headers.has('content-range')) {
        try {
          await cache.put(request, response.clone());
        } catch (_) {
          // Cache quota/storage errors must never block the network response.
        }
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      throw error;
    }
  })());
});
