/**
 * Axios Instance
 * Authenticated API client — wraps apiClient with auth interceptors.
 *
 * Adds:
 *  - Request: attach Bearer token from auth store
 *  - Response: handle 401 with deduped token refresh + auto-logout
 */

import { useAuthStore } from "@/store/authStore";
import apiClient from "./apiClient";

// Single in-flight refresh promise — prevents token rotation race condition when
// multiple concurrent requests all get 401 and try to refresh simultaneously.
let refreshingPromise: Promise<string | null> | null = null;

// ── Request: attach auth token ────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const { idToken } = useAuthStore.getState();
    if (idToken) {
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: 401 → refresh → retry, or logout ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { logout, user } = useAuthStore.getState();

      // Don't trigger auto-logout for the logout request itself
      const isLogoutRequest = error.config?.url?.includes("/logout");
      if (isLogoutRequest) return Promise.reject(error);

      // Deduplicate concurrent 401s — all share one in-flight refresh
      if (!refreshingPromise) {
        refreshingPromise = useAuthStore
          .getState()
          .refreshToken()
          .finally(() => {
            refreshingPromise = null;
          });
      }

      const newToken = await refreshingPromise;
      if (newToken && error.config) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      }

      // Refresh failed — log out once
      if (user?.uid) {
        await logout(user.uid);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
