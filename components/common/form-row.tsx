/**
 * FormRow Component
 * Reusable form section container
 * Provides consistent spacing for form fields
 */

import { AppStyles } from "@/utils/theme";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface FormRowProps {
    children: React.ReactNode;
    style?: ViewStyle;
    gap?: number;
}

export function FormRow({
    children,
    style,
    gap = AppStyles.spacing.md,
}: FormRowProps) {
    return (
        <View style={[styles.formRow, { gap }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    formRow: {
        width: "100%",
    },
});
