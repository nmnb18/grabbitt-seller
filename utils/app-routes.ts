/**
 * App Routes
 * Centralized route definitions for type-safe navigation
 */

export const ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_OTP: "/auth/verify-otp",
    RESET_SUCCESS: "/auth/reset-success",
  },

  // Main app routes
  DRAWER: {
    HOME: "/(drawer)/(tabs)/home",
    MY_QR: "/(drawer)/(tabs)/my-qr",
    WALLET: "/(drawer)/(tabs)/wallet",
    PROFILE: "/(drawer)/profile",
    PERKS_HISTORY: "/(drawer)/perks-history",
  },

  // Store routes
  STORE: {
    DETAILS: "/(drawer)/store/store-details",
  },

  // Redemption routes
  REDEEM: {
    HOME: "/(drawer)/redeem/redeem-home",
    HISTORY: "/(drawer)/redeem/redemption-history",
    QR: "/(drawer)/redeem/redemption-qr",
  },
} as const;

// Route params types
export type RouteParams = {
  [ROUTES.STORE.DETAILS]: { storeId: string };
  [ROUTES.REDEEM.HOME]: { store: string };
  [ROUTES.REDEEM.QR]: { redemptionId: string };
  [ROUTES.AUTH.RESET_PASSWORD]: { oobCode: string };
};
