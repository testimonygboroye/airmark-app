/**
 * Forces the service worker to check for a new version on every page
 * load and activate it immediately, then reloads once — this is the fix
 * for the exact symptom of "deploy is live, but the phone still shows
 * old behavior," since PWA service workers otherwise keep serving a
 * cached old version until the browser decides to check on its own.
 */
export function initServiceWorkerAutoUpdate(): void {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => reg.update());
  });

  let hasReloaded = sessionStorage.getItem("airmark-sw-reloaded") === "1";

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hasReloaded) return;
    hasReloaded = true;
    sessionStorage.setItem("airmark-sw-reloaded", "1");
    window.location.reload();
  });
}
