const CACHE_NAME = "timelocus-cache-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./style.css",
  "./assets/css/tailwind.min.css",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

// Instalar SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Cacheando app shell...");
      return cache.addAll(ASSETS);
    })
  );
});

// Activar SW
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => k !== CACHE_NAME && caches.delete(k))
      )
    )
  );
});

// Fetch offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() =>
          caches.match("./index.html")
        )
      );
    })
  );
});
