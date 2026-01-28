/**
 * App Constants
 * Centralized configuration for the entire app
 */

import { PerkStatus } from "@/types/perks";

// User roles
export const ROLES = {
  USER: "user",
  SELLER: "seller",
} as const;

// Business types for filtering/display
export const BUSINESS_TYPES = [
  { label: "All", value: "all" },
  { label: "Restaurant/Cafe", value: "restaurant" },
  { label: "Retail Store", value: "retail" },
  { label: "Professional Services", value: "service" },
  { label: "FMCG/Manufacturer", value: "fmcg" },
  { label: "Other", value: "other" },
] as const;

// Business categories by type
export const CATEGORIES = {
  retail: [
    "Electronics",
    "Fashion & Apparel",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Books & Stationery",
    "Jewelry & Accessories",
    "Other Retail",
  ],
  restaurant: [
    "Fine Dining",
    "Casual Dining",
    "Fast Food",
    "Cafe & Bakery",
    "Food Truck",
    "Bar & Pub",
    "Other Food Service",
  ],
  service: [
    "Salon & Spa",
    "Repair Services",
    "Professional Services",
    "Health & Wellness",
    "Education & Training",
    "Other Services",
  ],
  fmcg: [
    "Food & Beverages",
    "Personal Care",
    "Household Care",
    "Healthcare",
    "Other FMCG",
  ],
  other: ["Other"],
} as const;

// QR Code types
export const QR_CODE_TYPES = [
  { value: "dynamic", label: "Dynamic QR", description: "Expires after use" },
  {
    value: "static",
    label: "Static QR",
    description: "Once per day per customer",
  },
  {
    value: "static_hidden",
    label: "Static with Hidden Code",
    description: "For product packaging",
  },
] as const;

// Perk status metadata
export const PERK_STATUS_META: Record<
  PerkStatus,
  {
    label: string;
    icon: string;
    colorKey: "success" | "warning" | "error";
  }
> = {
  CLAIMED: {
    label: "Claimed",
    icon: "qrcode",
    colorKey: "warning",
  },
  REDEEMED: {
    label: "Redeemed",
    icon: "check-circle",
    colorKey: "success",
  },
  EXPIRED: {
    label: "Expired",
    icon: "clock-alert",
    colorKey: "error",
  },
};

// Transaction types
export const TRANSACTION_TYPES = {
  EARN: "earn",
  REDEEM: "redeem",
  PAYMENT: "payment",
} as const;

// Redemption status
export const REDEMPTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

// API timeouts
export const API_TIMEOUT = {
  DEFAULT: 15000,
  LONG: 30000,
  SHORT: 5000,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER: "user",
  THEME: "theme",
  ONBOARDING_COMPLETE: "onboarding_complete",
  LAST_LOCATION: "last_location",
  CACHED_QR: "cached_qr",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "Session expired. Please login again.",
  SERVER: "Server error. Please try again later.",
  VALIDATION: "Please check your input and try again.",
  UNKNOWN: "Something went wrong. Please try again.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully.",
  PASSWORD_CHANGED: "Password changed successfully.",
  POINTS_REDEEMED: "Points redeemed successfully!",
  QR_SCANNED: "QR code scanned successfully!",
} as const;

// Placeholder images
export const PLACEHOLDER_IMAGES = {
  STORE_BANNER:
    "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
  STORE_LOGO: null,
  USER_AVATAR: null,
} as const;

// External links
export const EXTERNAL_LINKS = {
  SUPPORT_EMAIL: "support@grabbitt.in",
  PRIVACY_POLICY: "https://grabbitt.in/privacy",
  TERMS_CONDITIONS: "https://grabbitt.in/terms",
  WEBSITE: "https://grabbitt.in",
} as const;

// Feature flags (for gradual rollout)
export const FEATURES = {
  PHONE_LOGIN: false, // Phone OTP login
  PAYMENT_QR: false, // UPI payment via QR scan
  OFFLINE_MODE: false, // Offline QR caching
  PERKS_V2: true, // New perks system
} as const;
