/**
 * Services Barrel Export
 * REST API service layer with Bearer token authentication
 */

// Export REST API services
export * from "./api";
export { default as axiosInstance } from "./axiosInstance";

// Legacy exports for backwards compatibility
export { default as api, default as apiService } from "./api";

// Other services
export * from "./notificationService";


