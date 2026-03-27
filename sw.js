// FLOTAR — Service Worker v9
// Permite instalación como PWA y funcionamiento básico offline

const CACHE = 'flotar-v9';
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
];

// Instalación: cachear assets principales
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Activación: limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Network-first para Firebase, Cache-first para assets estáticos
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Siempre usar red para Firebase y Google APIs (datos en tiempo real)
  if (url.includes('firebase') || url.includes('googleapis') || url.includes('firestore')) {
    return; // fetch normal, sin interceptar
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guardar copia en cache
        if (res && res.status === 200 && e.request.method === 'GET') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request)) // Si no hay red, usar cache
  );
});
