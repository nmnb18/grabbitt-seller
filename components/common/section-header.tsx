/**
 * SectionHeader Component
 * Reusable section header with title and actions
 * Used in profile, settings, and other sections
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";

interface SectionHeaderProps {
    title: string;
    actions?: React.ReactNode;
    style?: ViewStyle;
    titleVariant?: "titleLarge" | "titleMedium" | "titleSmall";
}

export function SectionHeader({
    title,
    actions,
    style,
    titleVariant = "titleMedium",
}: SectionHeaderProps) {
    const theme = useTheme();

    return (
        <View style={[styles.sectionHeader, style]}>
            <Text
                variant={titleVariant}
                style={[styles.title, { color: theme.colors.onSurface }]}
            >
                {title}
            </Text>
            {actions && <View style={styles.actions}>{actions}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        flex: 1,
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
