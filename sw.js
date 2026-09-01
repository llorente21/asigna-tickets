const CACHE = 'asigna-tickets-v1.3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './logo-hero.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // No interceptar llamadas a Firebase
  if (e.request.url.includes('firestore') || e.request.url.includes('firebase')) return;
  // Red primero, sin usar la caché HTTP del navegador (evita servir index.html/JS viejos
  // después de un deploy), y solo cae a la caché offline si de verdad no hay conexión.
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
