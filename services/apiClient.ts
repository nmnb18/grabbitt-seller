/**
 * Base API client — no auth interceptors.
 *
 * Kept separate from axiosInstance.ts so that authStore can import it
 * without creating a circular dependency (axiosInstance imports useAuthStore).
 *
 * Responsibilities:
 *  - Sets baseURL and default timeout/headers
 *  - Unwraps the standardized backend envelope { success, data } → data
 *    so every caller works directly with the payload via response.data
 *  - DEV network logging
 */

import { ENABLE_NETWORK_LOGGING } from "@/config/env";
import { clientLogger } from "@/utils/clientLogger";
import { API_TIMEOUT } from "@/utils/constants";
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
  timeout: API_TIMEOUT.DEFAULT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── DEV: request/response timing logs ────────────────────────────────────────
const buildFullUrl = (config: import("axios").InternalAxiosRequestConfig) => {
  const base = (config.baseURL ?? "").replace(/\/$/, "");
  const path = config.url ?? "";
  const params = config.params
    ? "?" + new URLSearchParams(config.params).toString()
    : "";
  return `${base}${path}${params}`;
};

if (ENABLE_NETWORK_LOGGING) {
  apiClient.interceptors.request.use((config) => {
    (config as any).metadata = { startTime: Date.now() };
    console.log(`\n🌐 [REQUEST] ${config.method?.toUpperCase()} ${buildFullUrl(config)}`);
    if (config.data) console.log("   Body:", JSON.stringify(config.data));
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      const ms = Date.now() - ((response.config as any).metadata?.startTime ?? Date.now());
      console.log(`\n✅ [RESPONSE] ${response.status} ${buildFullUrl(response.config)} (${ms}ms)`);
      console.log("   Data:", JSON.stringify(response.data).slice(0, 800));
      return response;
    },
    (error) => {
      const ms = Date.now() - ((error.config as any)?.metadata?.startTime ?? Date.now());
      const url = error.config ? buildFullUrl(error.config) : "unknown";
      console.log(`\n❌ [ERROR] ${error.response?.status ?? "NETWORK"} ${url} (${ms}ms)`);
      console.log("   Response:", JSON.stringify(error.response?.data ?? error.message));
      return Promise.reject(error);
    }
  );
}

// ── Envelope unwrap + error capture ─────────────────────────────────────────
// Applied after DEV logging so the raw shape is visible in dev logs.
// The error handler here covers ALL callers of apiClient (axiosInstance users
// AND direct callers such as authStore). This is the single source of truth
// for network error capture — axiosInstance.ts does NOT duplicate this.
// 401s are skipped: axiosInstance handles token refresh; they are not app bugs.
// /logout errors are intentional flows — not worth reporting.
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      "data" in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status as number | undefined;
    const isLogoutUrl = (error.config?.url ?? "").includes("/logout");
    if (status !== 401 && !isLogoutUrl) {
      clientLogger.captureNetworkError(
        error.config?.url ?? "unknown",
        status,
        error.message ?? "Network error",
      );
    }
    return Promise.reject(error);
  },
);

export default apiClient;
