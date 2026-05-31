// Service worker PWA: cangkang offline ter-precache, pembersihan cache lama,
// dan cache gambar stale-while-revalidate.
const CACHE = "bae-v2";
const IMG_CACHE = "bae-img-v1";
const PRECACHE = ["/offline", "/manifest-icon-192"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Sapu cache versi lama agar deploy tak memaku HTML basi.
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE && k !== IMG_CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // Jangan cache area admin / API (dinamis & terproteksi).
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;

  // Navigasi: network-first -> cache -> cangkang offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/offline"))),
    );
    return;
  }

  // Gambar: stale-while-revalidate dari cache gambar terpisah (wajah keluarga
  // tetap tampil luring & tak diunduh ulang tiap kunjungan).
  if (req.destination === "image") {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok && (res.type === "basic" || res.type === "cors")) {
              cache.put(req, res.clone()).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
