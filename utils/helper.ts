/**
 * Helper Utilities
 * Common helper functions for the app
 */

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=<>/{}[\]|~])[A-Za-z\d@$!%*?&#^()_\-+=<>/{}[\]|~]{8,}$/;
  return regex.test(password);
};

/**
 * Check if QR data is a UPI payment QR
 */
export const isPaymentQR = (data: string): boolean => {
  return (
    data.startsWith("upi://") ||
    data.includes("upi://pay") ||
    data.includes("@")
  );
};

/**
 * Check if QR data is a Grabbitt QR
 */
export const isGrabbittQR = (data: string): boolean => {
  return data.startsWith("grabbitt://");
};

/**
 * Extract QR ID from Grabbitt QR
 */
export const extractGrabbittQRId = (data: string): string => {
  return data.replace("grabbitt://", "");
};

/**
 * Parse UPI QR data to extract payment details
 */
export const parseUPIQR = (
  qrData: string
): Record<string, string | undefined> => {
  const params: Record<string, string | undefined> = {};

  try {
    if (qrData.startsWith("upi://")) {
      const url = new URL(qrData);
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    } else {
      // Handle other UPI formats
      const parts = qrData.split("&");
      parts.forEach((part) => {
        const [key, value] = part.split("=");
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });
    }
  } catch (e) {
    console.warn("Failed to parse UPI QR:", e);
  }

  return params;
};

/**
 * Generate a unique ID
 */
export const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Delay execution
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T>(
  json: string | null | undefined,
  fallback: T
): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

/**
 * Clamp number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Get random item from array
 */
export const getRandomItem = <T>(array: T[]): T | undefined => {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Remove duplicates from array
 */
export const uniqueArray = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * Sort array by key
 */
export const sortByKey = <T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc"
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
};

// Re-export formatTimestamp from formatters for backward compatibility
export { formatTimestamp } from "./formatters";
