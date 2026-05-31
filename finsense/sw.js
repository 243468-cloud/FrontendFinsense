const CACHE_NAME = 'finsense-cache-v1';
const ASSETS = [
  './index.html',
  './login.html',
  './dashboard.html',
  './registro.html',
  './metas.html',
  './grupos.html',
  './perfil.html',
  './css/base.css',
  './css/components.css',
  './css/layouts.css',
  './css/animations.css',
  './js/app.js',
  './js/utils/helpers.js',
  './js/services/authService.js',
  './js/services/transactionService.js',
  './js/services/benchmarkService.js',
  './js/services/goalService.js',
  './js/services/groupService.js',
  './js/components/navigation.js',
  './js/components/notifications.js',
  './js/components/charts.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Devuelve el recurso de caché, e intenta actualizar en segundo plano
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {/* Ignorar errores de red */});
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
