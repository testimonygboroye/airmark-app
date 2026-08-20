import type { AxiosError } from "axios";

/**
 * Distinguishes "the server responded with a real error" from "the request
 * never got a response at all" (timeout, cold start, network drop) — the
 * two were previously indistinguishable to the user, which made a slow
 * Render cold-start look identical to a wrong password.
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const axiosErr = err as AxiosError<{ message?: string }>;

  if (!axiosErr?.response) {
    if (axiosErr?.code === "ECONNABORTED") {
      return "The server is taking longer than usual to respond — it may be waking up after being idle. Please try again in a few seconds.";
    }
    return "Couldn't reach the server. Please check your connection and try again.";
  }

  return axiosErr.response.data?.message || fallback;
}
