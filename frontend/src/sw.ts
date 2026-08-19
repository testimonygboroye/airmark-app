/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

declare let self: ServiceWorkerGlobalScope;

// Activate the new service worker as soon as it finishes installing,
// and take control of any already-open tabs immediately — important for
// a live-event tool where a stale cached version must never linger.
self.skipWaiting();
clientsClaim();

// Injection point — vite-plugin-pwa replaces this with the real
// precache manifest (list of build assets + their hashes) at build time.
precacheAndRoute(self.__WB_MANIFEST);
