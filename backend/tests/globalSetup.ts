import axios from "axios";
import { resolveTestBaseUrl } from "../src/config/testTarget";

/**
 * Warm an explicitly configured local or disposable staging API before the
 * integration suite. With no TEST_BASE_URL, the focused unit suite can still
 * run, while integration tests fail closed when they import tests/setup.ts.
 */
module.exports = async function globalSetup() {
  if (!process.env.TEST_BASE_URL?.trim()) {
    console.log("[jest] TEST_BASE_URL is not configured; skipping remote API warm-up.");
    return;
  }

  const baseUrl = resolveTestBaseUrl(process.env);
  console.log("[jest] Warming the explicitly configured test API...");
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await axios.get(baseUrl + "/system/health", { timeout: 60000 });
      console.log("[jest] Test API is warm and responding.");
      return;
    } catch {
      console.log("[jest] Attempt " + attempt + "/5 — test API not ready yet, retrying in 5s...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  throw new Error("The configured test API did not become healthy after five attempts.");
};
