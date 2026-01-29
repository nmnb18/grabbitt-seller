/**
 * usePushNotifications Hook
 * Production-ready hook for managing push notifications in User App
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Platform, AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import {
  getExpoPushToken,
  registerPushToken,
  setupNotificationChannels,
  NotificationData,
} from "@/services/pushNotification";
import { useAuthStore } from "@/store/authStore";

interface UsePushNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
  isLoading: boolean;
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const router = useRouter();
  const { user } = useAuthStore();

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Handle notification navigation - User App specific screens
   */
  const handleNotificationNavigation = useCallback(
    (data: NotificationData) => {
      if (!data) return;

      const { type, screen, params } = data;

      // Handle different notification types for User App
      switch (type) {
        case "points_earned":
        case "points":
          router.push("/(drawer)/(tabs)/wallet");
          break;

        case "offer":
        case "deal":
          if (params?.storeId) {
            router.push(`/(drawer)/store/${params.storeId}`);
          } else {
            router.push("/(drawer)/(tabs)/home");
          }
          break;

        case "redemption":
        case "redeem_ready":
          router.push("/(drawer)/redeem");
          break;

        case "perk":
        case "perks":
          router.push("/(drawer)/perks-history");
          break;

        case "profile":
          router.push("/(drawer)/profile");
          break;

        case "store":
          if (params?.storeId) {
            router.push(`/(drawer)/store/${params.storeId}`);
          }
          break;

        default:
          // If a specific screen is provided, navigate to it
          if (screen) {
            router.push(screen as any);
          }
          break;
      }
    },
    [router]
  );

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      if (existingStatus === "granted") {
        setIsPermissionGranted(true);
        return true;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";
      setIsPermissionGranted(granted);
      return granted;
    } catch (err) {
      console.error("[usePushNotifications] Permission error:", err);
      setError("Failed to request notification permission");
      return false;
    }
  }, []);

  /**
   * Register push token
   */
  const registerToken = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Setup Android channels first
      await setupNotificationChannels();

      // Get token
      const token = await getExpoPushToken();

      if (token) {
        setExpoPushToken(token);
        setIsPermissionGranted(true);

        // Register with backend if user is logged in
        if (user?.uid) {
          await registerPushToken(token);
        }
      } else {
        setError("Could not get push token");
      }
    } catch (err) {
      console.error("[usePushNotifications] Registration error:", err);
      setError("Failed to register for notifications");
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  /**
   * Initialize notifications on mount
   */
  useEffect(() => {
    // Only run on physical devices
    if (Platform.OS === "web") {
      setIsLoading(false);
      return;
    }

    registerToken();

    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[usePushNotifications] Notification received:", notification);
        setNotification(notification);
      }
    );

    // Listener for when user interacts with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("[usePushNotifications] Notification response:", response);
        const data = response.notification.request.content.data as NotificationData;
        handleNotificationNavigation(data);
      }
    );

    // Check if app was opened from a notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        console.log("[usePushNotifications] App opened from notification:", response);
        const data = response.notification.request.content.data as NotificationData;
        // Small delay to ensure navigation is ready
        setTimeout(() => handleNotificationNavigation(data), 500);
      }
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [registerToken, handleNotificationNavigation]);

  /**
   * Re-register token when user logs in
   */
  useEffect(() => {
    if (user?.uid && expoPushToken) {
      registerPushToken(expoPushToken).catch(console.error);
    }
  }, [user?.uid, expoPushToken]);

  /**
   * Handle app state changes (for badge updates, etc.)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground
        // Refresh badge count or check for new notifications
        Notifications.getBadgeCountAsync().then((count) => {
          console.log("[usePushNotifications] Current badge count:", count);
        });
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
    error,
    isLoading,
    isPermissionGranted,
    requestPermission,
    registerToken,
  };
}

export default usePushNotifications;
