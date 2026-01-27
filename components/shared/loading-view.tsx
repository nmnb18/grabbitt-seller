/**
 * Loading View Component
 * Consistent loading states across the app
 */

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface LoadingViewProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function LoadingView({
  message,
  size = "large",
  color,
  fullScreen = true,
  style,
}: LoadingViewProps) {
  const theme = useTheme();
  const indicatorColor = color || theme.colors.primary;

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={indicatorColor} />
      {message && (
        <Text style={[styles.message, { color: theme.colors.onSurface }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

/**
 * Inline loader for buttons/cards
 */
export function InlineLoader({
  size = 20,
  color,
}: {
  size?: number;
  color?: string;
}) {
  const theme = useTheme();
  return (
    <ActivityIndicator size={size} color={color || theme.colors.primary} />
  );
}

/**
 * Skeleton placeholder for loading content
 */
interface LoadingPlaceholderProps {
  type: "card" | "list" | "text" | "avatar";
  count?: number;
}

export function LoadingPlaceholder({
  type,
  count = 1,
}: LoadingPlaceholderProps) {
  const theme = useTheme();
  const bgColor = theme.colors.surfaceVariant;

  const renderItem = (index: number) => {
    switch (type) {
      case "card":
        return (
          <View
            key={index}
            style={[styles.placeholderCard, { backgroundColor: bgColor }]}
          />
        );
      case "list":
        return (
          <View key={index} style={styles.placeholderListItem}>
            <View
              style={[styles.placeholderAvatar, { backgroundColor: bgColor }]}
            />
            <View style={styles.placeholderTextContainer}>
              <View
                style={[
                  styles.placeholderTextLine,
                  { backgroundColor: bgColor, width: "60%" },
                ]}
              />
              <View
                style={[
                  styles.placeholderTextLine,
                  { backgroundColor: bgColor, width: "40%" },
                ]}
              />
            </View>
          </View>
        );
      case "text":
        return (
          <View
            key={index}
            style={[
              styles.placeholderTextLine,
              { backgroundColor: bgColor, width: "100%" },
            ]}
          />
        );
      case "avatar":
        return (
          <View
            key={index}
            style={[styles.placeholderAvatar, { backgroundColor: bgColor }]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.placeholderContainer}>
      {Array.from({ length: count }).map((_, i) => renderItem(i))}
    </View>
  );
}

/**
 * Error state with retry
 */
interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  icon?: string;
}

export function ErrorView({
  message = "Something went wrong",
  onRetry,
  icon = "alert-circle-outline",
}: ErrorViewProps) {
  const theme = useTheme();

  return (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons
        name={icon as any}
        size={48}
        color={theme.colors.error}
      />
      <Text style={[styles.errorMessage, { color: theme.colors.onSurface }]}>
        {message}
      </Text>
      {onRetry && (
        <Text
          onPress={onRetry}
          style={[styles.retryText, { color: theme.colors.primary }]}
        >
          Tap to retry
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },
  placeholderContainer: {
    gap: 12,
  },
  placeholderCard: {
    height: 120,
    borderRadius: 12,
  },
  placeholderListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  placeholderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderTextContainer: {
    flex: 1,
    gap: 8,
  },
  placeholderTextLine: {
    height: 12,
    borderRadius: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorMessage: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  retryText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
});
