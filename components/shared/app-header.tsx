/**
 * Enhanced App Header Components
 * Consistent header with proper back navigation handling
 */

import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { useRouter, useNavigation } from "expo-router";

interface GradientHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  colors?: [string, string];
  onBackPress?: () => void;
  testID?: string;
}

export function GradientHeader({
  title,
  showBackButton = true,
  rightComponent,
  colors,
  onBackPress,
  testID,
}: GradientHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const gradientColors = colors || [theme.colors.primary, theme.colors.secondary];

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    // Check if we can go back
    if (navigation.canGoBack()) {
      router.back();
    } else {
      // Fallback to home if no back navigation available
      router.replace("/(drawer)/(tabs)/home");
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.content}>
        {showBackButton ? (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            data-testid={testID ? `${testID}-back` : "header-back-button"}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}

        <Text
          style={[styles.title, { color: theme.colors.onPrimary }]}
          numberOfLines={1}
          data-testid={testID ? `${testID}-title` : "header-title"}
        >
          {title}
        </Text>

        {rightComponent ? (
          <View style={styles.rightComponent}>{rightComponent}</View>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
      </View>
    </LinearGradient>
  );
}

/**
 * Simple back header without gradient
 */
interface BackHeaderProps {
  title: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export function BackHeader({ title, onBackPress, rightComponent }: BackHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/(drawer)/(tabs)/home");
    }
  };

  return (
    <View style={[styles.simpleHeader, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.simpleBackButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={theme.colors.onSurface}
        />
      </TouchableOpacity>

      <Text style={[styles.simpleTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
        {title}
      </Text>

      {rightComponent ? (
        <View style={styles.rightComponent}>{rightComponent}</View>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}
    </View>
  );
}

/**
 * Back header with custom styling (V2)
 */
export function BackHeaderV2({
  title,
  onBackPress,
  rightComponent,
}: BackHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/(drawer)/(tabs)/home");
    }
  };

  return (
    <View
      style={[
        styles.headerV2,
        { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.outline },
      ]}
    >
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButtonV2}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={28}
          color={theme.colors.onSurface}
        />
      </TouchableOpacity>

      <Text style={[styles.titleV2, { color: theme.colors.onSurface }]} numberOfLines={1}>
        {title}
      </Text>

      {rightComponent ? (
        <View style={styles.rightComponentV2}>{rightComponent}</View>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Gradient Header styles
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 12,
  },
  rightComponent: {
    minWidth: 40,
    alignItems: "flex-end",
  },

  // Simple Header styles
  simpleHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  simpleBackButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  simpleTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },

  // V2 Header styles
  headerV2: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  backButtonV2: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleV2: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  rightComponentV2: {
    width: 40,
    alignItems: "center",
  },
});
