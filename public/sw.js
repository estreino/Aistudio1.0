// Service Worker - MyRoutine AI (HealthOS)
// Cache offline e bypass de APIs de IA e MCP
const CACHE_NAME = 'myroutine-cache-v1.0.0';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg'
];

// Instalação do Service Worker e pré-cache de ativos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de versões antigas de cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições com estratégia Network-First com fallback de Cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // REGRA CRÍTICA: Bypass absoluto para endpoints de API (Gemini IA e Servidor MCP), requisições internas do Vite em dev/HMR, WebSockets e não-GET
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.includes('vite') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:' ||
    event.request.method !== 'GET' ||
    url.protocol.startsWith('chrome-extension:')
  ) {
    return;
  }

  // Network-First para manter código e assets sincronizados, caindo no cache se offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a resposta for válida, clonamos e armazenamos no cache para contingência offline
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Se a rede falhar (Modo Avião / Sem Internet), recuperamos do cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Se for uma requisição de navegação (HTML), devolve a casca do app
        if (event.request.mode === 'navigate') {
          return caches.match('/') || caches.match('/index.html');
        }

        return new Response('Offline - Conteúdo indisponível', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      })
  );
});
