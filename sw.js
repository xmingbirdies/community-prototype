// Offline cache for the Community prototype. Bump VERSION when files change.
// Videos are not pre-downloaded: they stream when played, so installing stays small.
const VERSION = "community-proto-v6";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png",
  "./img/a1.jpg", "./img/a2.jpg", "./img/a3.jpg",
  "./img/i1.jpg", "./img/i2.jpg", "./img/i3.jpg", "./img/i4.jpg",
  "./vid/v1.jpg", "./vid/v2.jpg", "./vid/v3.jpg", "./vid/v4.jpg", "./vid/v5.jpg", "./vid/v6.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Let the browser stream video directly (range requests); never cache it here.
  if (url.pathname.endsWith(".mp4")) return;
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((res) => {
        if (res.ok && res.status === 200) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit)
    )
  );
});
