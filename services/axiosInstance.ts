/**
 * Axios Instance
 * Configured API client with interceptors for auth
 */

import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import Constants from "expo-constants";
import { API_TIMEOUT } from "@/utils/constants";

const API_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT.DEFAULT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Attach auth token
api.interceptors.request.use(
  async (config) => {
    const { refreshToken, idToken } = useAuthStore.getState();

    let token = idToken;
    
    // Try to refresh token if available
    try {
      const fresh = await refreshToken();
      if (fresh) token = fresh;
    } catch (err) {
      console.warn("Token refresh failed before request", err);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      const { refreshToken, logout, user } = useAuthStore.getState();
      
      // Try refresh token once
      const newToken = await refreshToken();
      if (newToken && error.config) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      }
      
      // If refresh fails, logout
      if (user?.uid) {
        await logout(user.uid);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
