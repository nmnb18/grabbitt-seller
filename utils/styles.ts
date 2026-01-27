/**
 * Common Styles - Reusable style patterns for the app
 * Use these to maintain consistency across components
 */

import { StyleSheet, Platform } from "react-native";
import { AppStyles, Colors } from "./theme";

// Common layout styles
export const layoutStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Scroll content
  scrollContent: {
    paddingHorizontal: AppStyles.spacing.md,
    paddingBottom: AppStyles.spacing.xl,
  },
  
  // Rows
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Gaps
  gap4: { gap: 4 },
  gap8: { gap: 8 },
  gap12: { gap: 12 },
  gap16: { gap: 16 },
  gap20: { gap: 20 },
  gap24: { gap: 24 },
});

// Card styles
export const cardStyles = StyleSheet.create({
  card: {
    borderRadius: AppStyles.card.borderRadius,
    padding: AppStyles.card.padding,
    ...AppStyles.shadows.small,
  },
  cardLarge: {
    borderRadius: 20,
    padding: AppStyles.spacing.lg,
    ...AppStyles.shadows.medium,
  },
  cardCompact: {
    borderRadius: 12,
    padding: AppStyles.spacing.sm,
  },
});

// Text styles
export const textStyles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
  },
  center: {
    textAlign: "center",
  },
  bold: {
    fontWeight: "700",
  },
  medium: {
    fontWeight: "500",
  },
});

// Input styles
export const inputStyles = StyleSheet.create({
  input: {
    marginBottom: AppStyles.spacing.sm,
  },
  inputGroup: {
    marginBottom: AppStyles.spacing.md,
  },
});

// Button styles
export const buttonStyles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    gap: AppStyles.spacing.sm,
  },
  buttonGroup: {
    gap: AppStyles.spacing.md,
    marginTop: AppStyles.spacing.lg,
  },
});

// Platform-specific styles
export const platformStyles = StyleSheet.create({
  headerPadding: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  bottomPadding: {
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  safeBottom: {
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
});

// Animation constants
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  spring: {
    damping: 15,
    stiffness: 150,
  },
};

// Dimensions
export const DIMENSIONS = {
  iconSize: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },
  qrCode: {
    small: 120,
    medium: 200,
    large: 280,
  },
  tabBar: {
    height: 80,
    iconSize: 24,
  },
  header: {
    height: Platform.OS === "ios" ? 100 : 80,
  },
};
