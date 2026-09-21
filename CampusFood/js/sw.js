/* Service Worker — CampusFood */
const CF_CACHE = 'campusfood-v1';
const CF_ASSETS = [
  './',
  './index.html',
  './menu.html',
  './cart.html',
  './checkout.html',
  './orders.html',
  './tracking.html',
  './profile.html',
  './wallet.html',
  './favorites.html',
  './settings.html',
  './login.html',
  './register.html',
  './css/style.css',
  './css/responsive.css',
  './css/enhance.css',
  './js/products.js',
  './js/auth.js',
  './js/cart.js',
  './js/orders.js',
  './js/main.js',
  './js/enhancements.js',
  './js/favorites.js',
  './js/settings.js',
  './manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CF_CACHE).then(c => c.addAll(CF_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CF_CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Network-first cho HTML, cache-first cho asset tĩnh
  const isHTML = req.destination === 'document';

  if (isHTML){
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CF_CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok && new URL(req.url).origin === location.origin){
        const copy = res.clone();
        caches.open(CF_CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});