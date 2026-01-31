/**
 * usePushNotifications Hook
 * Production-ready hook for managing push notifications
 */

import {
  getExpoPushToken,
  NotificationData,
  registerPushToken,
  setupNotificationChannel,
} from "@/services/pushNotification";
import { useAuthStore } from "@/store/authStore";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

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
   * Handle notification navigation
   */
  const handleNotificationNavigation = useCallback(
    (data: NotificationData) => {
      if (!data) return;

      const { type, screen, params } = data;

      // Handle different notification types
      switch (type) {
        case "new_order":
        case "order":
          router.push("/(drawer)/redemptions");
          break;

        case "offer":
        case "whats_new":
          router.push("/(drawer)/whats-new/whats-new-home");
          break;

        case "scan":
        case "points":
          router.push("/(drawer)/(tabs)/scan-customer");
          break;

        case "subscription":
          router.push("/(drawer)/subscription");
          break;

        case "profile":
          router.push("/(drawer)/profile-setup");
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
      await setupNotificationChannel();

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
        // You can refresh badge count or check for new notifications here
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
