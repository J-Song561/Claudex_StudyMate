{% load static %}const CACHE = 'planner-v1';
const SHELL = [
    "{% url 'planner:index' %}",
    "{% static 'planner/app.css' %}",
    "{% static 'planner/app.js' %}",
    "{% static 'planner/icon-192.png' %}",
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
    self.clients.claim();
});

// Network first, so tasks are always fresh; the cached shell only covers offline starts.
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET' || request.url.includes('/api/')) return;
    event.respondWith(
        fetch(request)
            .then((response) => {
                const copy = response.clone();
                caches.open(CACHE).then((cache) => cache.put(request, copy));
                return response;
            })
            .catch(() => caches.match(request))
    );
});
