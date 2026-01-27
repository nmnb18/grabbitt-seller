/**
 * Formatting Utilities
 * Common formatters for dates, numbers, currency, etc.
 */

import { FirebaseTimestamp } from "@/types/auth";

/**
 * Format Firebase timestamp to readable date string
 */
export const formatTimestamp = (
  timestamp: FirebaseTimestamp | Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!timestamp) return "—";

  try {
    let date: Date;

    if (typeof timestamp === "object" && "_seconds" in timestamp) {
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return "—";

    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...options,
    };

    return date.toLocaleDateString("en-IN", defaultOptions);
  } catch (e) {
    console.warn("Failed to parse timestamp:", timestamp, e);
    return "—";
  }
};

/**
 * Format timestamp with time
 */
export const formatDateTime = (
  timestamp: FirebaseTimestamp | Date | string | null | undefined
): string => {
  return formatTimestamp(timestamp, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get relative time string (e.g., "2 hours ago", "Just now")
 */
export const getRelativeTime = (
  timestamp: FirebaseTimestamp | Date | string | null | undefined
): string => {
  if (!timestamp) return "—";

  try {
    let date: Date;

    if (typeof timestamp === "object" && "_seconds" in timestamp) {
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return "—";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

    return formatTimestamp(timestamp);
  } catch {
    return "—";
  }
};

/**
 * Format currency (Indian Rupee)
 */
export const formatCurrency = (
  amount: number | null | undefined,
  options?: { showSymbol?: boolean; decimals?: number }
): string => {
  if (amount === null || amount === undefined) return "—";

  const { showSymbol = true, decimals = 0 } = options || {};

  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Format points with comma separator
 */
export const formatPoints = (points: number | null | undefined): string => {
  if (points === null || points === undefined) return "0";

  return new Intl.NumberFormat("en-IN").format(points);
};

/**
 * Format phone number for display
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return "—";

  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // Format as XXX XXX XXXX
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  // Return original if not 10 digits
  return phone;
};

/**
 * Format distance
 */
export const formatDistance = (km: number | null | undefined): string => {
  if (km === null || km === undefined) return "—";

  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }

  return `${km.toFixed(1)} km`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (
  text: string | null | undefined,
  maxLength: number
): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength - 3) + "...";
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string | null | undefined): string => {
  if (!text) return "";

  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Generate initials from name
 */
export const getInitials = (
  name: string | null | undefined,
  maxLength = 2
): string => {
  if (!name) return "?";

  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join("");
};
