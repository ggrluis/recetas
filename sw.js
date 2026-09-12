const CACHE_NAME = 'recetario-shell-v4';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(
        nombres.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// Shell: cache-first (para que abra instantáneo e instalable).
// Cualquier llamada a script.google.com (datos) va siempre a la red,
// nunca se sirve desde caché.
self.addEventListener('fetch', function (event) {
  const url = event.request.url;
  if (url.indexOf('script.google.com') !== -1) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
