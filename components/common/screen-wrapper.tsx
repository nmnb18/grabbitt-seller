/**
 * Screen Wrapper Component
 * Provides consistent layout for all screens
 */

import React from "react";
import { View, StyleSheet, ViewStyle, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, useThemeColor } from "@/hooks/use-theme-color";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ("top" | "bottom" | "left" | "right")[];
  withPadding?: boolean;
  backgroundColor?: string;
}

export function ScreenWrapper({
  children,
  style,
  edges = ["top"],
  withPadding = false,
  backgroundColor,
}: ScreenWrapperProps) {
  const theme = useTheme();
  const bgColor = backgroundColor || theme.colors.background;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: bgColor }, style]}
      edges={edges}
    >
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <View style={[styles.content, withPadding && styles.withPadding]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

/**
 * Simple View wrapper with theme background
 */
export function ThemedContainer({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  withPadding: {
    paddingHorizontal: 16,
  },
});
