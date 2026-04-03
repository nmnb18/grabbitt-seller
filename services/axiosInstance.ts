import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const API_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Attach auth token (sync, no proactive refresh to avoid parallel race)
api.interceptors.request.use(
  (config) => {
    const { idToken } = useAuthStore.getState();
    if (idToken) {
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Refresh token reactively on 401, then retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { refreshToken, logout, user } = useAuthStore.getState();

      // Don't trigger auto-logout if the failing request is logout itself
      const isLogoutRequest = error.config?.url?.includes('/logout');
      if (isLogoutRequest) return Promise.reject(error);

      const newToken = await refreshToken();
      if (newToken && error.config) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      }

      if (user?.uid) {
        await logout(user.uid);
      }
    }

    return Promise.reject(error);
  }
);

export default api;




