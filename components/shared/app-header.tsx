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
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { useRouter, useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { GradientText } from "../ui/gradient-text";

interface AppHeaderProps {
  showMenu?: boolean;
  showNotifications?: boolean;
  onNotificationsPress?: () => void;
  backgroundColor?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  showMenu = true,
  showNotifications = true,
  onNotificationsPress,
  backgroundColor,
}) => {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const bg = backgroundColor || theme.colors.background;
  const iconColor = theme.colors.onSurface;

  return (
    <View style={[styles.headerContainer, { backgroundColor: bg, paddingTop: Platform.OS === 'ios' ? 50 : 35 }]}>
      {showMenu ? (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={26} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}

      <GradientText
        style={{
          fontFamily: "JostMedium",
          fontSize: 40,
        }}
      >
        grabbitt
      </GradientText>

      {showNotifications ? (
        <TouchableOpacity
          onPress={onNotificationsPress || (() => console.log("Notifications pressed"))}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
};

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

    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/(drawer)/(tabs)/dashboard");
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientHeader}
    >
      <View style={styles.gradientContent}>
        {showBackButton ? (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={testID ? `${testID}-back` : "header-back-button"}
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
          style={[styles.gradientTitle, { color: theme.colors.onPrimary }]}
          numberOfLines={1}
          testID={testID ? `${testID}-title` : "header-title"}
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
      router.replace("/(drawer)/(tabs)/dashboard");
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

const styles = StyleSheet.create({
  // App Header styles
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 0,
    paddingHorizontal: 8,
  },
  iconButton: {
    width: 40,
    alignItems: "center",
  },

  // Gradient Header styles
  gradientHeader: {
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
  gradientContent: {
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
  gradientTitle: {
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
});
