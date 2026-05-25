// BoobLog Service Worker – cached die App-Hülle, damit sie wie eine native App startet.
// Daten kommen live aus Supabase (nicht gecacht), die Oberfläche aber lädt sofort.
const CACHE = "bootslog-v1";
const SHELL = ["./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  // Supabase- und CDN-Anfragen immer live aus dem Netz holen
  if (url.includes("supabase.co") || url.includes("cdn.jsdelivr.net") || url.includes("fonts.")) {
    return; // Browser macht das normal
  }
  // App-Hülle: erst Cache, dann Netz (so startet sie offline)
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request))
  );
});
