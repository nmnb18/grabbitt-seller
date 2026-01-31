/**
 * Notification Context Provider
 * Provides notification state and methods throughout the app
 */

import React, { createContext, useContext, ReactNode } from "react";
import * as Notifications from "expo-notifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  scheduleLocalNotification,
  scheduleNotificationForDate,
  cancelNotification,
  cancelAllNotifications,
  setBadgeCount,
  getBadgeCount,
  NotificationData,
} from "@/services/pushNotification";

interface NotificationContextType {
  // State
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
  isLoading: boolean;
  isPermissionGranted: boolean;

  // Methods
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<void>;
  sendLocalNotification: (
    title: string,
    body: string,
    data?: NotificationData
  ) => Promise<string>;
  scheduleNotification: (
    title: string,
    body: string,
    date: Date,
    data?: NotificationData,
    channelId?: string
  ) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  setBadge: (count: number) => Promise<void>;
  getBadge: () => Promise<number>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const {
    expoPushToken,
    notification,
    error,
    isLoading,
    isPermissionGranted,
    requestPermission,
    registerToken,
  } = usePushNotifications();

  const sendLocalNotification = async (
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<string> => {
    return scheduleLocalNotification(title, body, data);
  };

  const scheduleNotification = async (
    title: string,
    body: string,
    date: Date,
    data?: NotificationData,
    channelId?: string
  ): Promise<string> => {
    return scheduleNotificationForDate(title, body, date, data, channelId);
  };

  const setBadge = async (count: number): Promise<void> => {
    await setBadgeCount(count);
  };

  const getBadge = async (): Promise<number> => {
    return getBadgeCount();
  };

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    error,
    isLoading,
    isPermissionGranted,
    requestPermission,
    registerToken,
    sendLocalNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadge,
    getBadge,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access notification context
 */
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }

  return context;
}

export default NotificationProvider;
