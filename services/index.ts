/**
 * Services Barrel Export
 */

// Legacy `api` now maps to the firebase-backed API wrapper
export * from "./api";
export { default as api, default as apiService } from "./api";
export * from "./notificationService";
export * from "./userService";

