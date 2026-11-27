const KNOWN_PRODUCTION_HOSTS = new Set(["airmark-backend.onrender.com"]);

export function resolveTestBaseUrl(env: Record<string, string | undefined>): string {
  const configured = env.TEST_BASE_URL?.trim();
  if (!configured) {
    throw new Error(
      "TEST_BASE_URL is required. Point the integration suite at a local or disposable test environment; no live-service default is allowed.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    throw new Error("TEST_BASE_URL must be a valid absolute HTTP or HTTPS URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("TEST_BASE_URL must use HTTP or HTTPS.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("TEST_BASE_URL must not contain embedded credentials.");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (KNOWN_PRODUCTION_HOSTS.has(hostname)) {
    throw new Error("The known live Airmark API host is blocked as a test target.");
  }

  const isLoopback =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost");

  if (!isLoopback && env.ALLOW_REMOTE_TEST_TARGET !== "true") {
    throw new Error(
      "Remote test targets are blocked by default. Use a disposable staging environment and set ALLOW_REMOTE_TEST_TARGET=true only after confirming it is not production.",
    );
  }

  return parsed.toString().replace(/\/+$/, "");
}
