/**
 * Notification Settings Component
 * Allows users to manage notification preferences
 */

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Linking, Platform } from "react-native";
import { Card, Switch, Text, Divider, List, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useTheme } from "@/hooks/use-theme-color";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/paper-button";

export default function NotificationSettings() {
  const theme = useTheme();
  const {
    expoPushToken,
    isPermissionGranted,
    isLoading,
    error,
    requestPermission,
    registerToken,
  } = useNotifications();

  const [notificationPrefs, setNotificationPrefs] = useState({
    orders: true,
    promotions: true,
    reminders: true,
  });

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();

    if (!granted) {
      Alert.alert(
        "Permission Required",
        "To receive notifications, please enable them in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    } else {
      await registerToken();
    }
  };

  const togglePreference = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // TODO: Save preference to backend
  };

  if (isLoading) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={{ marginLeft: 10 }}>Loading notification settings...</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: theme.colors.primary + "20" }]}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={theme.colors.primary} />
          </View>
          <View>
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              Notifications
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceDisabled }]}>
              Manage your notification preferences
            </Text>
          </View>
        </View>

        <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

        {/* Permission Status */}
        <View
          style={[
            styles.statusBox,
            {
              backgroundColor: isPermissionGranted
                ? theme.colors.success + "15"
                : theme.colors.warning + "15",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={isPermissionGranted ? "check-circle" : "alert-circle"}
            size={20}
            color={isPermissionGranted ? theme.colors.success : theme.colors.warning}
          />
          <View style={styles.statusTextContainer}>
            <Text
              style={[
                styles.statusTitle,
                { color: isPermissionGranted ? theme.colors.success : theme.colors.warning },
              ]}
            >
              {isPermissionGranted ? "Notifications Enabled" : "Notifications Disabled"}
            </Text>
            {expoPushToken && (
              <Text style={[styles.tokenText, { color: theme.colors.onSurfaceDisabled }]}>
                Token: ...{expoPushToken.slice(-12)}
              </Text>
            )}
          </View>
          {!isPermissionGranted && (
            <Button variant="outlined" onPress={handlePermissionRequest} size="medium">
              Enable
            </Button>
          )}
        </View>

        {/* Notification Categories */}
        {isPermissionGranted && (
          <View style={styles.preferencesContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Notification Types
            </Text>

            <List.Item
              title="Orders & Transactions"
              description="New orders, redemptions, and payment alerts"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="shopping"
                  color={theme.colors.primary}
                />
              )}
              right={() => (
                <Switch
                  value={notificationPrefs.orders}
                  onValueChange={() => togglePreference("orders")}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
            />

            <Divider style={{ backgroundColor: theme.colors.outline + "30" }} />

            <List.Item
              title="Promotions & Offers"
              description="Special deals and promotional notifications"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="tag"
                  color={theme.colors.primary}
                />
              )}
              right={() => (
                <Switch
                  value={notificationPrefs.promotions}
                  onValueChange={() => togglePreference("promotions")}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
            />

            <Divider style={{ backgroundColor: theme.colors.outline + "30" }} />

            <List.Item
              title="Reminders"
              description="Daily summaries and important reminders"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="clock-outline"
                  color={theme.colors.primary}
                />
              )}
              right={() => (
                <Switch
                  value={notificationPrefs.reminders}
                  onValueChange={() => togglePreference("reminders")}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.error + "15" }]}>
            <MaterialCommunityIcons name="alert" size={18} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    marginVertical: 16,
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  tokenText: {
    fontSize: 11,
    marginTop: 2,
  },
  preferencesContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  listItem: {
    paddingVertical: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
});
