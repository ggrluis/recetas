const CACHE_NAME = 'puchero-shell-v16';

// Solo los recursos que casi nunca cambian van en caché de inicio.
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(SHELL_FILES); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(
        nombres.filter(function (n) { return n !== CACHE_NAME; })
               .map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  const url = event.request.url;

  // Datos: siempre en vivo, nunca desde caché.
  if (url.indexOf('script.google.com') !== -1) return;

  const esDocumento = event.request.mode === 'navigate' || url.indexOf('index.html') !== -1;

  if (esDocumento) {
    // Red primero: con cobertura siempre se ve la última versión publicada,
    // sin tener que cerrar y reabrir la app. Sin cobertura, la caché.
    event.respondWith(
      fetch(event.request)
        .then(function (respuesta) {
          const copia = respuesta.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copia); });
          return respuesta;
        })
        .catch(function () {
          return caches.match(event.request).then(function (cached) {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Iconos y manifest: caché primero, que no cambian casi nunca.
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
