// ColdMatrix Tools Service Worker – offline PWA support
// IMPORTANT: bump CACHE_NAME every time you deploy a real content update.
// Changing this string is what makes browsers detect a new service worker,
// wipe the old cache, and start serving your latest files.
const CACHE_NAME = 'coldmatrix-cache-v2';

const ASSETS = [
  '/',
  '/index.html',

  // Core pages
  '/about.html',
  '/contact.html',
  '/solutions.html',
  '/blog.html',
  '/gallery.html',
  '/privacy-policy.html',
  '/terms-of-use.html',
  '/cookie-policy.html',
  '/security.html',
  '/sitemap.html',
  '/manifest.json',

  // Blog articles
  '/article-31.html',
  '/article-32.html',
  '/article-33.html',

  // Engineering tools
  '/cold-store-calculator.html',
  '/sandwich-panel-calculator.html',
  '/cooling-requirement-calculator.html',
  '/peb-material-calculator.html',
  '/steel-weight-calculator.html',
  '/concrete-calculator.html',
  '/construction-cost-calculator.html',
  '/cft-calculator.html',
  '/electrical-solar-calculator.html',

  // Business & finance tools
  '/business-planner.html',
  '/roi-calculator.html',
  '/build-vs-buy-calculator.html',
  '/startup-cost-calculator.html',
  '/ecommerce-profit-calculator.html',
  '/profit-margin-calculator.html',
  '/quotation-generator.html',
  '/loan-emi-calculator.html',
  '/currency-converter.html',
  '/business-calculator-suite.html',
  '/cold-invoice-studio/',
  '/cold-matrix-studio/',

  // Everyday utilities
  '/internet-speed-test.html',
  '/unit-converter.html',
  '/image-converter-tool.html',
  '/cold-matrix-bmi-calculator.html',
  '/step-counter-wellness.html',
  '/electricity-bill-calculator.html',
  '/password-generator.html',
  '/smart-scanner.html',
  '/womens-corner.html',
  '/pdf-toolkit.html',
  '/pdf-reader.html',
  '/qr-code-generator.html',
  '/qr-business-card.html',
  '/percentage-calculator.html',
  '/stopwatch-timer.html',
  '/world-clock.html',
  '/age-calculator.html',
  '/birthday-countdown.html',
  '/notepad.html',

  // Images
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

// Install event – cache all assets, activate new SW immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event – delete every old cache version, take control right away
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
// - HTML pages (navigations): NETWORK-FIRST, so visitors always get your
//   latest deployed version. Falls back to cache only when offline.
// - Everything else (images, manifest, etc.): CACHE-FIRST, so the site
//   still feels fast and works offline.
self.addEventListener('fetch', event => {
  const request = event.request;
  const isHTMLRequest =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  if (isHTMLRequest) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached => cached || caches.match('/index.html'))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      // Cache dynamic requests (same-origin only)
      if (request.url.startsWith(self.location.origin)) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
      }
      return response;
    }))
  );
});