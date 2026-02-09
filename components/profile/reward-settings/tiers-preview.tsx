/**
 * Tiered Preview Component - Shows visual preview of slab tiers
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface TierPreviewRow {
    key: string;
    min: number;
    max: string;
    points: string;
}

interface TiersPreviewProps {
    slabPreviewRows: TierPreviewRow[];
}

export const TiersPreview = React.memo(function TiersPreview({ slabPreviewRows }: TiersPreviewProps) {
    const theme = useTheme();

    return (
        <View style={styles.tiersPreview}>
            {slabPreviewRows.map((slab) => (
                <View
                    key={slab.key}
                    style={[styles.tierRow, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                    <Text style={[styles.tierRange, { color: theme.colors.onSurface }]}>
                        ₹{slab.min} - ₹{slab.max}
                    </Text>
                    <View style={[styles.tierPoints, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.tierPointsText}>{slab.points}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    tiersPreview: {
        marginTop: 12,
        gap: 6,
    },
    tierRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
    },
    tierRange: {
        fontSize: 14,
    },
    tierPoints: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tierPointsText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
});
