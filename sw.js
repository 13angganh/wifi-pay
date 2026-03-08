const CACHE = "wifipay-v6";
const ASSETS = ["/", "/index.html", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting()) // Langsung aktif tanpa tunggu tab tutup
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log("Deleting old cache:", k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim()) // Ambil alih semua tab sekarang juga
  );
});

self.addEventListener("fetch", e => {
  if (e.request.url.includes("firebase") || e.request.url.includes("googleapis")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Network first - selalu coba ambil versi terbaru dari network
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (!res || res.status !== 200 || res.type !== "basic") return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("/index.html")))
  );
});
