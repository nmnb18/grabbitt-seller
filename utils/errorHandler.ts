/**
 * Error Handler Utility
 * Centralized error handling for API calls and user feedback
 */

import { Alert } from "react-native";
import { ERROR_MESSAGES } from "./constants";

export interface ApiError {
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
  code?: string;
}

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: ApiError | Error | unknown): string => {
  if (!error) return ERROR_MESSAGES.UNKNOWN;

  // Handle Axios errors
  if (typeof error === "object" && error !== null && "response" in error) {
    const apiError = error as ApiError;
    
    // Check response status
    if (apiError.response?.status === 401) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    
    if (apiError.response?.status === 500) {
      return ERROR_MESSAGES.SERVER;
    }

    // Get error message from response
    const message =
      apiError.response?.data?.error ||
      apiError.response?.data?.message ||
      apiError.message;

    if (message) return message;
  }

  // Handle standard Error
  if (error instanceof Error) {
    // Network error detection
    if (
      error.message.includes("Network") ||
      error.message.includes("timeout")
    ) {
      return ERROR_MESSAGES.NETWORK;
    }
    return error.message;
  }

  // Handle string error
  if (typeof error === "string") {
    return error;
  }

  return ERROR_MESSAGES.UNKNOWN;
};

/**
 * Show error alert with consistent styling
 */
export const showErrorAlert = (
  error: ApiError | Error | unknown,
  title = "Error"
): void => {
  const message = getErrorMessage(error);
  Alert.alert(title, message);
};

/**
 * Show success alert
 */
export const showSuccessAlert = (
  message: string,
  title = "Success",
  onPress?: () => void
): void => {
  Alert.alert(title, message, [{ text: "OK", onPress }]);
};

/**
 * Show confirmation dialog
 */
export const showConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  options?: {
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
  }
): void => {
  const { confirmText = "Confirm", cancelText = "Cancel", destructive = false } =
    options || {};

  Alert.alert(title, message, [
    {
      text: cancelText,
      style: "cancel",
      onPress: onCancel,
    },
    {
      text: confirmText,
      style: destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
};

/**
 * Log error for debugging (production-safe)
 */
export const logError = (
  context: string,
  error: unknown,
  additionalData?: Record<string, unknown>
): void => {
  const message = getErrorMessage(error);
  
  // In production, this would send to error tracking service
  console.error(`[${context}] ${message}`, {
    error,
    ...additionalData,
  });
};
