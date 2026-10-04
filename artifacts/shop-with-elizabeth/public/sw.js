const CACHE_PREFIX = "mkenya-shop-shell-";
const CACHE_NAME = `${CACHE_PREFIX}v4`;
const SHELL_FILES = [
  "./",
  "manifest.webmanifest",
  "mkenya-shop-icon-192.png",
  "mkenya-shop-icon-512.png",
  "mkenya-shop-icon.png",
  "favicon.svg",
  "offline.html",
];
const APP_SHELL = SHELL_FILES.map((file) => new URL(file, self.registration.scope).href);
const OFFLINE_URL = new URL("offline.html", self.registration.scope).href;
const MAX_DYNAMIC_ENTRIES = 80;
const MAX_CACHED_IMAGE_BYTES = 4 * 1024 * 1024;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  const scopeUrl = new URL(self.registration.scope);
  if (requestUrl.origin !== scopeUrl.origin || !requestUrl.pathname.startsWith(scopeUrl.pathname)) return;

  const scopedPath = requestUrl.pathname.slice(scopeUrl.pathname.length);
  if (scopedPath === "api" || scopedPath.startsWith("api/")) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        const imageBytes = Number(response.headers.get("content-length") ?? 0);
        const cacheable =
          response.ok &&
          response.type === "basic" &&
          (request.mode === "navigate" ||
            ["script", "style", "font"].includes(request.destination) ||
            (request.destination === "image" &&
              imageBytes > 0 &&
              imageBytes <= MAX_CACHED_IMAGE_BYTES));

        if (cacheable) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
          const keys = await cache.keys();
          const dynamicKeys = keys.filter((key) => !APP_SHELL.includes(key.url));
          const excess = dynamicKeys.length - MAX_DYNAMIC_ENTRIES;
          if (excess > 0) {
            await Promise.all(dynamicKeys.slice(0, excess).map((key) => cache.delete(key)));
          }
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;

        if (request.mode === "navigate") {
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;
        }

        return new Response("You are offline. Reconnect and try again.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    })(),
  );
});