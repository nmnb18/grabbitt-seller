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
