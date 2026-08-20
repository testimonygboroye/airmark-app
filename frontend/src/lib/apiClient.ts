import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends the httpOnly refresh cookie automatically
  timeout: 60000, // accommodates Render free-tier cold starts (up to ~60s)
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

function resolveQueue() {
  pendingQueue.forEach((resolve) => resolve());
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthRoute = originalRequest?.url?.includes("/auth/");
    const isRefreshRoute = originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRoute
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve) => pendingQueue.push(resolve));
        return apiClient(originalRequest);
      }

      isRefreshing = true;
      try {
        const { data } = await apiClient.post("/auth/refresh");
        useAuthStore.getState().setAuth(
          data.data.accessToken,
          useAuthStore.getState().user!
        );
        isRefreshing = false;
        resolveQueue();
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        pendingQueue = [];
        useAuthStore.getState().clearAuth();
        if (!isAuthRoute) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
