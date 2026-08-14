// ColdMatrix Tools Service Worker – offline PWA support
const CACHE_NAME = 'coldmatrix-cache-v1';
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
  '/manifest.json',
  '/hero-bg.jpg',
  '/ad-bg.jpg',
  '/cold_room_calc.jpg',
  '/panel_calc.jpg',
  '/cooling_req_calc.jpg',
  '/steel_weight_calc.jpg',
  '/peb_calculator.jpg',
  '/concrete_calc.jpg',
  '/construction_cost_calc.jpg',
  '/profit_margin_calc.jpg',
  '/quotation_maker.jpg',
  '/qr_business_card.jpg',
  '/pdf_toolkit.jpg',
  '/smart_scanner.jpg',
  '/business-calc.jpg',
  '/cft_calc.jpg',
  '/pdf_reader.jpg',
  '/qr_generator.jpg',
  '/business-invoice-studio.jpg',
  '/coldmatrix-design-studio.jpg',
  '/speed_test.jpg',
  '/bmi_calc.jpg',
  '/image_converter.jpg',
  '/loan_emi_calc.jpg',
  '/currency_converter.jpg',
  '/percentage_calc.jpg',
  '/unit_converter.jpg',
  '/stopwatch_timer.jpg',
  '/age_calc.jpg',
  '/birthday_calc.jpg',
  '/project_gallery.jpg',
  '/knowledge_hub.jpg',
  '/world_clock.jpg',
  '/password_generator.jpg'
];

// Install event – cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event – serve from cache first, then network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request).then(response => {
        // Cache dynamic requests (same-origin only)
        if (event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html')))
  );
});