import axios from "axios";
import { BASE_URL } from "./setup";

/**
 * Pings the backend before any test runs, with a generous timeout that
 * tolerates a Render cold start or an in-progress deploy. This prevents
 * the exact failure mode of tests racing a redeploy and getting spurious
 * timeouts across the entire suite.
 */
module.exports = async function globalSetup() {
  console.log("[jest] Warming up backend before running tests...");
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await axios.get(`${BASE_URL}/system/health`, { timeout: 60000 });
      console.log("[jest] Backend is warm and responding.");
      return;
    } catch {
      console.log(`[jest] Attempt ${attempt}/5 — backend not ready yet, retrying in 5s...`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  console.warn("[jest] Backend did not respond after 5 attempts — tests will proceed anyway.");
};
