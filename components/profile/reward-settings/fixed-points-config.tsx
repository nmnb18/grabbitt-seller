/**
 * Fixed Points Configuration Component
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, TextInput } from "react-native-paper";

interface FixedPointsConfigProps {
    pointsPerVisit: string;
    onChangePoints: (value: string) => void;
}

export const FixedPointsConfig = React.memo(function FixedPointsConfig({
    pointsPerVisit,
    onChangePoints,
}: FixedPointsConfigProps) {
    const theme = useTheme();

    return (
        <View>
            <Text style={[styles.configLabel, { color: theme.colors.onSurfaceDisabled }]}>
                Points awarded per scan
            </Text>
            <View style={styles.inputRow}>
                <TextInput
                    value={pointsPerVisit}
                    onChangeText={onChangePoints}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.configInput, { backgroundColor: theme.colors.surface }]}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.onSurface}
                    testID="points-input"
                />
                <Text style={[styles.inputSuffix, { color: theme.colors.onSurfaceDisabled }]}>points</Text>
            </View>
            <Text style={[styles.configHint, { color: theme.colors.onSurfaceDisabled }]}>
                Customer scans your QR → Gets {pointsPerVisit || "0"} points instantly
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    configLabel: {
        fontSize: 13,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    configInput: {
        flex: 1,
        maxWidth: 120,
    },
    inputSuffix: {
        fontSize: 14,
    },
    configHint: {
        fontSize: 12,
        marginTop: 12,
        fontStyle: "italic",
    },
});
