/**
 * Environment & dev-mode flags
 *
 * Use these named constants instead of bare `__DEV__` checks so that:
 *  - intent is self-documenting
 *  - individual behaviours can be toggled without changing build mode
 *  - a single place to audit what changes between dev and prod
 */

/** True in Expo dev/preview builds, false in production. */
export const IS_DEV = __DEV__;

/**
 * Skip real device location lookup and use a hard-coded Bengaluru coord.
 * Useful when testing on an emulator or Expo Go without GPS.
 */
export const USE_MOCK_LOCATION = __DEV__;

/**
 * Log every axios request/response with timing in the console.
 * Automatically disabled in production.
 */
export const ENABLE_NETWORK_LOGGING = __DEV__;

/**
 * Send captured log events to the backend POST /clientLog endpoint.
 *  - Default in __DEV__: false (console-only — override with EXPO_PUBLIC_ENABLE_REMOTE_LOGGING=true)
 *  - Default in production: true (override with EXPO_PUBLIC_ENABLE_REMOTE_LOGGING=false)
 */
export const ENABLE_REMOTE_LOGGING: boolean =
  process.env.EXPO_PUBLIC_ENABLE_REMOTE_LOGGING !== undefined
    ? process.env.EXPO_PUBLIC_ENABLE_REMOTE_LOGGING === "true"
    : !__DEV__;

/**
 * Minimum log level that triggers remote dispatch.
 * Events below this level are console-only even when ENABLE_REMOTE_LOGGING is true.
 *  - Default in __DEV__: "warn"
 *  - Default in production: "error"
 *  - Override: EXPO_PUBLIC_CLIENT_LOG_LEVEL=debug|info|warn|error|fatal
 */
export const CLIENT_LOG_LEVEL: string =
  process.env.EXPO_PUBLIC_CLIENT_LOG_LEVEL ?? (__DEV__ ? "warn" : "error");
