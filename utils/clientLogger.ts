/**
 * Client-side Logger
 *
 * Captures app crashes, network errors, and manual log events.
 * Queues events in memory and flushes to POST /clientLog in batches.
 *
 * Behaviour:
 *  - Always writes to console (respects configured min level)
 *  - Remote dispatch: controlled by ENABLE_REMOTE_LOGGING
 *      Default in __DEV__: false (console only)
 *      Default in production: true
 *      Override: EXPO_PUBLIC_ENABLE_REMOTE_LOGGING=true|false
 *  - Minimum remote level: controlled by CLIENT_LOG_LEVEL
 *      Default in __DEV__: "warn"
 *      Default in production: "error"
 *      Override: EXPO_PUBLIC_CLIENT_LOG_LEVEL=debug|info|warn|error|fatal
 *  - Uses raw fetch() — never axios (avoids interceptor loops + circular deps)
 *  - Fire-and-forget: never throws, never blocks UI
 *  - PII-safe: strips query params from endpoint URLs before logging
 */

import { CLIENT_LOG_LEVEL, ENABLE_REMOTE_LOGGING } from "@/config/env";
import Constants from "expo-constants";
import { Platform } from "react-native";

// ── Types ──────────────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogSource = "error_boundary" | "network" | "unhandled_rejection" | "manual";

interface ClientLogEntry {
  level: LogLevel;
  source: LogSource;
  message: string;
  stack?: string;
  componentStack?: string;
  endpoint?: string;
  httpStatus?: number;
  appVersion: string;
  platform: "ios" | "android" | "unknown";
  appId: "user" | "seller";
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ── Constants ──────────────────────────────────────────────────────────────

/** Identifies which app produced this log */
const APP_ID: "user" | "seller" = "seller";

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const VALID_LEVELS = new Set<string>(["debug", "info", "warn", "error", "fatal"]);

/** Max events before an automatic flush is triggered */
const BATCH_SIZE = 10;

/** Max milliseconds before a pending queue is flushed */
const FLUSH_INTERVAL_MS = 30_000;

// ── Helpers ────────────────────────────────────────────────────────────────

function normalisedPlatform(): "ios" | "android" | "unknown" {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "unknown";
}

/**
 * Strip query params from URLs before storing so that UIDs, tokens,
 * and other PII embedded in query strings are never persisted.
 */
function stripQueryParams(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    // Relative path — just strip everything after "?"
    return url.split("?")[0];
  }
}

/**
 * Resolve min level from the configured string, with safe fallback.
 * Called once at construction time.
 */
function resolvedMinLevel(configured: string): LogLevel {
  return VALID_LEVELS.has(configured)
    ? (configured as LogLevel)
    : __DEV__
    ? "warn"
    : "error";
}

/**
 * Obtain the current idToken without importing authStore at module level.
 * A top-level import would create a circular dependency:
 *   apiClient → clientLogger → authStore → apiClient
 */
function getIdToken(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAuthStore } = require("@/store/authStore") as {
      useAuthStore: { getState: () => { idToken: string | null } };
    };
    return useAuthStore.getState()?.idToken ?? null;
  } catch {
    return null;
  }
}

// ── Logger ─────────────────────────────────────────────────────────────────

class ClientLogger {
  private queue: ClientLogEntry[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly backendUrl = (
    process.env.EXPO_PUBLIC_BACKEND_URL ?? ""
  ).replace(/\/$/, "");
  private readonly appVersion =
    Constants.expoConfig?.version ?? "unknown";
  private readonly appPlatform = normalisedPlatform();
  private readonly minLevelRank =
    LOG_LEVEL_RANK[resolvedMinLevel(CLIENT_LOG_LEVEL)];

  // ── Internal ─────────────────────────────────────────────────────────────

  private shouldSendRemote(level: LogLevel): boolean {
    return ENABLE_REMOTE_LOGGING && LOG_LEVEL_RANK[level] >= this.minLevelRank;
  }

  private emit(
    entry: Omit<ClientLogEntry, "appVersion" | "platform" | "appId" | "timestamp">,
  ): void {
    const full: ClientLogEntry = {
      ...entry,
      appVersion: this.appVersion,
      platform: this.appPlatform,
      appId: APP_ID,
      timestamp: new Date().toISOString(),
    };

    // Always log to console regardless of remote settings
    const consoleFn =
      entry.level === "fatal" || entry.level === "error"
        ? console.error
        : entry.level === "warn"
        ? console.warn
        : console.log;
    consoleFn(
      `[${APP_ID.toUpperCase()} ${entry.level.toUpperCase()}]`,
      entry.message,
      entry.metadata ?? "",
    );

    if (!this.shouldSendRemote(entry.level)) return;

    this.queue.push(full);
    if (this.queue.length >= BATCH_SIZE) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), FLUSH_INTERVAL_MS);
    }
  }

  private async flush(): Promise<void> {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0 || !this.backendUrl) return;

    const batch = this.queue.splice(0, this.queue.length);
    try {
      const token = getIdToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${this.backendUrl}/clientLog`, {
        method: "POST",
        headers,
        body: JSON.stringify({ logs: batch }),
      });
    } catch {
      // Silently discard — this logger must never surface errors to the app
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.emit({ level: "debug", source: "manual", message, metadata });
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.emit({ level: "info", source: "manual", message, metadata });
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.emit({ level: "warn", source: "manual", message, metadata });
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.emit({ level: "error", source: "manual", message, metadata });
  }

  fatal(message: string, metadata?: Record<string, unknown>): void {
    this.emit({ level: "fatal", source: "manual", message, metadata });
  }

  /**
   * Called by ErrorBoundary.componentDidCatch.
   * Flushes immediately so the event reaches the server before any reload.
   */
  captureErrorBoundary(error: Error, componentStack: string): void {
    this.emit({
      level: "fatal",
      source: "error_boundary",
      message: error.message,
      stack: error.stack?.slice(0, 5000),
      componentStack: componentStack.slice(0, 2000),
    });
    void this.flush();
  }

  /**
   * Called by axios interceptors for API / network failures.
   * Strips query params from the URL before logging.
   */
  captureNetworkError(
    rawUrl: string,
    httpStatus: number | undefined,
    errorMessage: string,
    metadata?: Record<string, unknown>,
  ): void {
    const level: LogLevel =
      httpStatus === undefined || httpStatus >= 500 ? "error" : "warn";
    this.emit({
      level,
      source: "network",
      message: errorMessage,
      endpoint: stripQueryParams(rawUrl),
      httpStatus,
      metadata,
    });
  }

  /**
   * Force-flush any outstanding queue.
   * Call from AppState listener when the app moves to background.
   */
  scheduleFlush(): void {
    void this.flush();
  }
}

export const clientLogger = new ClientLogger();
