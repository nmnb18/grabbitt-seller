import { useAuthStore } from "@/store/authStore";
import axios, { AxiosRequestConfig } from "axios";

const API_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to attach Bearer token from authStore
 * Automatically includes idToken in Authorization header
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const authStore = useAuthStore.getState();
      const token = authStore.idToken;

      // Attach bearer token if available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.warn("Error attaching token to request", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor to handle token refresh on 401
 * Automatically attempts to refresh token if it's expired
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If 401 Unauthorized and we haven't already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const authStore = useAuthStore.getState();
        const refreshToken = authStore.refreshTokenValue;

        if (!refreshToken) {
          // No refresh token available, user needs to login again
          return Promise.reject(error);
        }

        // Try to refresh the token
        const newToken = await authStore.refreshToken();

        if (newToken) {
          // Update the original request with new token
          originalRequest.headers!.Authorization = `Bearer ${newToken}`;
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        // If refresh fails, reject the original request
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;




