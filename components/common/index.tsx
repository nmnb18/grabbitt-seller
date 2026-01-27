/**
 * Common UI Components - Reusable across the app
 */

import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Text, ActivityIndicator, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { layoutStyles, textStyles } from "@/utils/styles";

// ============================================
// Spacer Component
// ============================================
interface SpacerProps {
  size?: number;
  horizontal?: boolean;
}

export function Spacer({ size = 16, horizontal = false }: SpacerProps) {
  return (
    <View
      style={
        horizontal
          ? { width: size }
          : { height: size }
      }
    />
  );
}

// ============================================
// Divider Component
// ============================================
interface DividerProps {
  color?: string;
  thickness?: number;
  marginVertical?: number;
}

export function Divider({
  color,
  thickness = 1,
  marginVertical = 16,
}: DividerProps) {
  const theme = useTheme();
  
  return (
    <View
      style={{
        height: thickness,
        backgroundColor: color || theme.colors.outline,
        marginVertical,
      }}
    />
  );
}

// ============================================
// Badge Component
// ============================================
interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "small" | "medium";
}

export function Badge({ label, variant = "default", size = "medium" }: BadgeProps) {
  const theme = useTheme();
  
  const getColors = () => {
    switch (variant) {
      case "success":
        return { bg: theme.colors.success + "20", text: theme.colors.success };
      case "warning":
        return { bg: theme.colors.warning + "20", text: theme.colors.warning };
      case "error":
        return { bg: theme.colors.error + "20", text: theme.colors.error };
      case "info":
        return { bg: theme.colors.primary + "20", text: theme.colors.primary };
      default:
        return { bg: theme.colors.surfaceVariant, text: theme.colors.onSurface };
    }
  };

  const colors = getColors();
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: colors.text },
          isSmall && styles.badgeTextSmall,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ============================================
// Icon Button Component
// ============================================
interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  size = 24,
  color,
  backgroundColor,
  disabled = false,
}: IconButtonProps) {
  const theme = useTheme();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.iconButton,
        backgroundColor && { backgroundColor },
        disabled && { opacity: 0.5 },
      ]}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={size}
        color={color || theme.colors.onSurface}
      />
    </TouchableOpacity>
  );
}

// ============================================
// Info Row Component
// ============================================
interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
  icon?: string;
}

export function InfoRow({ label, value, icon }: InfoRowProps) {
  const theme = useTheme();
  
  return (
    <View style={styles.infoRow}>
      <View style={layoutStyles.row}>
        {icon && (
          <MaterialCommunityIcons
            name={icon as any}
            size={18}
            color={theme.colors.onSurfaceDisabled}
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceDisabled }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
        {value ?? "—"}
      </Text>
    </View>
  );
}

// ============================================
// Empty State Component
// ============================================
interface EmptyStateProps {
  icon: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyStateView({ icon, title, message, action }: EmptyStateProps) {
  const theme = useTheme();
  
  return (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={48}
          color={theme.colors.onSurfaceDisabled}
        />
      </View>
      <Text
        style={[
          styles.emptyTitle,
          { color: theme.colors.onSurface },
        ]}
      >
        {title}
      </Text>
      {message && (
        <Text
          style={[
            styles.emptyMessage,
            { color: theme.colors.onSurfaceDisabled },
          ]}
        >
          {message}
        </Text>
      )}
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={[styles.emptyAction, { borderColor: theme.colors.primary }]}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// Section Header Component
// ============================================
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  const theme = useTheme();
  
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={[textStyles.subheading, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              textStyles.caption,
              { color: theme.colors.onSurfaceDisabled, marginTop: 2 },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={{ color: theme.colors.primary, fontWeight: "500" }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  badgeTextSmall: {
    fontSize: 11,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyAction: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
});
