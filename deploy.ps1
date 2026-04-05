Write-Host "=== WiFi Pay Auto Deploy ===" -ForegroundColor Cyan

# Generate timestamp
$ts = Get-Date -Format "yyyyMMddHHmmss"
Write-Host "Cache version: wifipay-$ts" -ForegroundColor Yellow

# Tulis sw.js baru dengan versi cache fresh
$swContent = @"
const CACHE = "wifipay-$ts";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-192.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.url.includes("firebase") ||
      e.request.url.includes("googleapis") ||
      e.request.url.includes("gstatic") ||
      e.request.url.includes("cdnjs") ||
      e.request.url.includes("fonts.g")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (!res || res.status !== 200 || res.type !== "basic") return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});

self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
"@

Set-Content -Path "public\sw.js" -Value $swContent -Encoding UTF8
Write-Host "sw.js diperbarui!" -ForegroundColor Green

# Deploy ke Firebase
Write-Host "Deploying..." -ForegroundColor Cyan
firebase deploy --only hosting

Write-Host "=== Deploy selesai! ===" -ForegroundColor Green
