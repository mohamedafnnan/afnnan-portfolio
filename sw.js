const CACHE_NAME = "dawn-rover-shell-v4";
const APP_SHELL = [
  "/dawn/index.html",
  "/manifest.webmanifest",
  "/assets/dawn-rover-icon-192.png",
  "/assets/dawn-rover-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok && event.request.method === "GET" && !event.request.headers.has("range")) {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        const fallback = await cache.match("/dawn/index.html");
        if (fallback && event.request.mode === "navigate") return fallback;
        throw error;
      }
    })
  );
});
