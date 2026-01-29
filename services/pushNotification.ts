/**
 * Push Notification Service - Production Ready
 * Enhanced notification handling for Grabbitt User App
 */

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import api from "./axiosInstance";

// Types
export interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
}

export interface NotificationData {
  type?: string;
  screen?: string;
  params?: Record<string, any>;
  [key: string]: any;
}

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Setup Android notification channels
 * Required for Android 8.0+ (API level 26+)
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  // Default channel for general notifications
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    description: "General notifications",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4A90D9", // Grabbitt User primary color
    sound: "default",
    enableLights: true,
    enableVibrate: true,
    showBadge: true,
  });

  // Channel for points & rewards
  await Notifications.setNotificationChannelAsync("rewards", {
    name: "Points & Rewards",
    description: "Notifications for earned points and rewards",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 500, 250, 500],
    lightColor: "#4CAF50",
    sound: "default",
    enableLights: true,
    enableVibrate: true,
    showBadge: true,
  });

  // Channel for offers & deals
  await Notifications.setNotificationChannelAsync("offers", {
    name: "Offers & Deals",
    description: "Special offers from your favorite stores",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
    enableVibrate: true,
    showBadge: true,
  });

  // Channel for redemption updates
  await Notifications.setNotificationChannelAsync("redemptions", {
    name: "Redemptions",
    description: "Updates on your reward redemptions",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    enableVibrate: true,
    showBadge: true,
  });

  // Channel for reminders
  await Notifications.setNotificationChannelAsync("reminders", {
    name: "Reminders",
    description: "Reminder notifications",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
    enableVibrate: true,
    showBadge: true,
  });

  console.log("[PushNotification] Android channels configured");
}

/**
 * Request notification permissions
 * Returns true if permissions granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // Check if running on a physical device
  if (!Device.isDevice) {
    console.warn("[PushNotification] Push notifications require a physical device");
    return false;
  }

  // Get current permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("[PushNotification] Permission not granted");
    return false;
  }

  console.log("[PushNotification] Permission granted");
  return true;
}

/**
 * Get the Expo push token
 * Returns null if unable to get token
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    // Check device
    if (!Device.isDevice) {
      console.warn("[PushNotification] Must use physical device for push notifications");
      return null;
    }

    // Check permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Setup Android channels
    await setupNotificationChannels();

    // Get project ID from app config
    const projectId = Constants.expoConfig?.extra?.eas?.projectId 
      ?? Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn("[PushNotification] Project ID not found in app config");
      // Try to get token without project ID (development)
      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log("[PushNotification] Token obtained:", tokenData.data);
      return tokenData.data;
    }

    // Get token with project ID (production)
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log("[PushNotification] Token obtained:", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("[PushNotification] Error getting push token:", error);
    return null;
  }
}

/**
 * Register push token with backend
 */
export async function registerPushToken(token: string): Promise<boolean> {
  try {
    await api.post("/registerPushToken", {
      push_token: token,
      platform: Platform.OS,
      device_name: Device.deviceName || "Unknown",
      device_model: Device.modelName || "Unknown",
    });
    
    console.log("[PushNotification] Token registered with backend");
    return true;
  } catch (error) {
    console.error("[PushNotification] Error registering token:", error);
    return false;
  }
}

/**
 * Unregister push token from backend (e.g., on logout)
 */
export async function unregisterPushToken(token: string): Promise<boolean> {
  try {
    await api.post("/unregisterPushToken", {
      push_token: token,
    });
    
    console.log("[PushNotification] Token unregistered from backend");
    return true;
  } catch (error) {
    console.error("[PushNotification] Error unregistering token:", error);
    return false;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: "default",
    },
    trigger: trigger || null, // null = immediate
  });

  console.log("[PushNotification] Local notification scheduled:", notificationId);
  return notificationId;
}

/**
 * Schedule a notification for a specific date
 */
export async function scheduleNotificationForDate(
  title: string,
  body: string,
  date: Date,
  data?: NotificationData,
  channelId?: string
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: "default",
      ...(Platform.OS === "android" && channelId ? { channelId } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });

  console.log("[PushNotification] Notification scheduled for:", date);
  return notificationId;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  console.log("[PushNotification] Notification cancelled:", notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("[PushNotification] All notifications cancelled");
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Set badge count (iOS)
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Dismiss all notifications from notification center
 */
export async function dismissAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Get the last notification response (when app was opened via notification)
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return await Notifications.getLastNotificationResponseAsync();
}

// Export notification listeners for use in hooks
export const addNotificationReceivedListener = Notifications.addNotificationReceivedListener;
export const addNotificationResponseReceivedListener = Notifications.addNotificationResponseReceivedListener;

export default {
  setupNotificationChannels,
  requestNotificationPermissions,
  getExpoPushToken,
  registerPushToken,
  unregisterPushToken,
  scheduleLocalNotification,
  scheduleNotificationForDate,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
  setBadgeCount,
  getBadgeCount,
  dismissAllNotifications,
  getLastNotificationResponse,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
};
