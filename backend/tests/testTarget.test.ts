import { resolveTestBaseUrl } from "../src/config/testTarget";

describe("resolveTestBaseUrl", () => {
  it("requires an explicit test target instead of using a live-service default", () => {
    expect(() => resolveTestBaseUrl({})).toThrow(/TEST_BASE_URL is required/i);
  });

  it("rejects malformed URLs and non-HTTP protocols", () => {
    expect(() => resolveTestBaseUrl({ TEST_BASE_URL: "localhost:5000/api" })).toThrow(/HTTP or HTTPS/i);
    expect(() => resolveTestBaseUrl({ TEST_BASE_URL: "ftp://localhost/api" })).toThrow(/HTTP or HTTPS/i);
  });

  it("rejects embedded credentials", () => {
    expect(() => resolveTestBaseUrl({ TEST_BASE_URL: "https://user:secret@staging.example/api" })).toThrow(/embedded credentials/i);
  });

  it("allows local IPv4, IPv6 and localhost test servers without a remote-target override", () => {
    expect(resolveTestBaseUrl({ TEST_BASE_URL: "http://localhost:5000/api/" })).toBe("http://localhost:5000/api");
    expect(resolveTestBaseUrl({ TEST_BASE_URL: "http://127.0.0.1:5000/api" })).toBe("http://127.0.0.1:5000/api");
    expect(resolveTestBaseUrl({ TEST_BASE_URL: "http://[::1]:5000/api" })).toBe("http://[::1]:5000/api");
  });

  it("blocks the known live API host even when remote testing is enabled", () => {
    expect(() => resolveTestBaseUrl({
      TEST_BASE_URL: "https://airmark-backend.onrender.com/api",
      ALLOW_REMOTE_TEST_TARGET: "true",
    })).toThrow(/known live Airmark API host is blocked/i);
  });

  it("requires an explicit opt-in for a remote disposable staging target", () => {
    expect(() => resolveTestBaseUrl({ TEST_BASE_URL: "https://airmark-staging.example/api" })).toThrow(/Remote test targets are blocked/i);
    expect(resolveTestBaseUrl({
      TEST_BASE_URL: "https://airmark-staging.example/api/",
      ALLOW_REMOTE_TEST_TARGET: "true",
    })).toBe("https://airmark-staging.example/api");
  });
});
