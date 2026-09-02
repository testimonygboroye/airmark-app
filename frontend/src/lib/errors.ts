import axios, { type AxiosError } from "axios";

export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (!axiosErr.response) {
      if (axiosErr.code === "ECONNABORTED") {
        return "The server is taking longer than usual to respond — it may be waking up after being idle. Please try again in a few seconds.";
      }
      return "Couldn't reach the server. Please check your connection and try again.";
    }
    return axiosErr.response.data?.message || fallback;
  }

  // Not a network/axios error — a real client-side error (e.g. our own
  // validation check) has a genuine message worth showing directly,
  // rather than being misreported as a connectivity problem.
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
