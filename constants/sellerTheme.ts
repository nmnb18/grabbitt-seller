import { MD3LightTheme as DefaultTheme } from "react-native-paper";

// Grabbitt Seller App Theme - matches branding from grabbitt.in
export const sellerTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Brand colors
    primary: "#e91e63", // Deep Pink
    primaryContainer: "#ff6b35",
    secondary: "#ff6b35", // Orange
    accent: "#9CA3AF",

    // Surfaces
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceVariant: "#F5F5F5", // Card

    // Text
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#262626", // ~ HSL(0,0%,15%)
    onSurface: "#262626",

    // Misc
    error: "#D32F2F",
    outline: "#E6E6E6",
    shadow: "#000000",
  },
  roundness: 12,
};

// Seller App Specific Styles
export const sellerStyles = {
  // Brand gradients
  gradients: {
    primary: ["#e91e63", "#ff6b35"], // Grabbitt gradient
    subtle: ["#FFFFFF", "#F5F5F5"],
    accent: ["#ff6b35", "#e91e63"],
  },

  // Card styles
  card: {
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },

  // Stats display
  statCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    alignItems: "center" as const,
  },

  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Typography tokens
  typography: {
    heading: {
      fontFamily: "Poppins",
      fontSize: 24,
      fontWeight: "700" as const,
      color: "#262626",
    },
    subheading: {
      fontFamily: "Poppins",
      fontSize: 18,
      fontWeight: "600" as const,
      color: "#262626",
    },
    body: {
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: "400" as const,
      color: "#262626",
    },
    label: {
      fontFamily: "Inter",
      fontSize: 12,
      fontWeight: "600" as const,
      color: "#9CA3AF",
      textTransform: "uppercase" as const,
    },
  },
};
