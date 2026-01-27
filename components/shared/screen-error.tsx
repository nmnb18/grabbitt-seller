/**
 * Screen Error State Component
 * Consistent error display with retry functionality
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { useRouter, useNavigation } from "expo-router";

interface ScreenErrorProps {
  title?: string;
  message?: string;
  icon?: string;
  onRetry?: () => void;
  showBackButton?: boolean;
  retryLabel?: string;
}

export function ScreenError({
  title = "Something went wrong",
  message = "We couldn't load the content. Please try again.",
  icon = "alert-circle-outline",
  onRetry,
  showBackButton = true,
  retryLabel = "Try Again",
}: ScreenErrorProps) {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/(drawer)/(tabs)/home");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.error + "15" },
          ]}
        >
          <MaterialCommunityIcons
            name={icon as any}
            size={56}
            color={theme.colors.error}
          />
        </View>

        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>

        <Text style={[styles.message, { color: theme.colors.onSurfaceDisabled }]}>
          {message}
        </Text>

        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>{retryLabel}</Text>
            </TouchableOpacity>
          )}

          {showBackButton && (
            <TouchableOpacity
              style={[
                styles.backButton,
                { borderColor: theme.colors.outline },
              ]}
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.onSurface }]}>
                Go Back
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * Network Error - Specialized error for network issues
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ScreenError
      icon="wifi-off"
      title="No Connection"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
      retryLabel="Retry"
    />
  );
}

/**
 * Not Found Error - For 404 cases
 */
export function NotFoundError({ itemName = "Item" }: { itemName?: string }) {
  return (
    <ScreenError
      icon="file-search-outline"
      title={`${itemName} Not Found`}
      message={`The ${itemName.toLowerCase()} you're looking for doesn't exist or has been removed.`}
      showBackButton={true}
    />
  );
}

/**
 * Permission Error - For access denied cases
 */
export function PermissionError() {
  return (
    <ScreenError
      icon="lock-outline"
      title="Access Denied"
      message="You don't have permission to view this content."
      showBackButton={true}
    />
  );
}

/**
 * Inline Error - Smaller error display for sections
 */
interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  const theme = useTheme();

  return (
    <Surface style={[styles.inlineContainer, { backgroundColor: theme.colors.error + "10" }]}>
      <View style={styles.inlineContent}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={20}
          color={theme.colors.error}
        />
        <Text style={[styles.inlineMessage, { color: theme.colors.error }]}>
          {message}
        </Text>
      </View>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={[styles.inlineRetry, { color: theme.colors.primary }]}>
            Retry
          </Text>
        </TouchableOpacity>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 320,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  actions: {
    gap: 12,
    width: "100%",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // Inline styles
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  inlineContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  inlineMessage: {
    fontSize: 13,
    flex: 1,
  },
  inlineRetry: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 12,
  },
});
