/**
 * View Mode Summary Component - Displays active reward type in view mode
 */

import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Chip, Surface, Text } from "react-native-paper";
import { TiersPreview } from "./tiers-preview";
import { RewardType } from "./types";

interface ViewModeSummaryProps {
    theme: ReturnType<typeof useTheme>;
    rewardType: string;
    selectedType?: RewardType;
    getCurrentValueDisplay: string;
    slabPreviewRows: Array<{ key: string; min: number; max: string; points: string }>;
    offersCount: number;
    onEdit: () => void;
}

export const ViewModeSummary = React.memo(function ViewModeSummary({
    theme,
    rewardType,
    selectedType,
    getCurrentValueDisplay,
    slabPreviewRows,
    offersCount,
    onEdit,
}: ViewModeSummaryProps) {
    return (
        <View style={styles.viewMode}>
            <Surface
                style={[
                    styles.activeTypeCard,
                    {
                        backgroundColor: selectedType?.color + "15",
                        borderColor: selectedType?.color + "40",
                    },
                ]}
            >
                <View style={[styles.activeTypeIcon, { backgroundColor: selectedType?.color + "60" }]}>
                    <MaterialCommunityIcons
                        name={selectedType?.icon as any}
                        size={28}
                        color={theme.colors.onPrimary}
                    />
                </View>
                <View style={styles.activeTypeInfo}>
                    <Text style={[styles.activeTypeTitle, { color: theme.colors.onSurface }]}>
                        {selectedType?.title}
                    </Text>
                    <Text style={[styles.activeTypeValue, { color: theme.colors.warning }]}>
                        {getCurrentValueDisplay}
                    </Text>
                </View>
                <Chip
                    compact
                    style={{ backgroundColor: theme.colors.success + "20" }}
                    textStyle={{ color: theme.colors.success, fontWeight: "600", fontSize: 11 }}
                >
                    Active
                </Chip>
            </Surface>

            {rewardType === "slab" && <TiersPreview slabPreviewRows={slabPreviewRows} />}

            <View style={styles.statsRow}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onEdit}
                    style={[styles.statBox, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                    <MaterialCommunityIcons name="tag-multiple" size={18} color={theme.colors.primary} />
                    <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{offersCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.onSurfaceDisabled }]}>Offers</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    viewMode: {
        marginTop: 16,
    },
    activeTypeCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    activeTypeIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    activeTypeInfo: {
        flex: 1,
        marginLeft: 14,
    },
    activeTypeTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    activeTypeValue: {
        fontSize: 14,
        fontWeight: "700",
        marginTop: 2,
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    statBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 12,
        borderRadius: 10,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "700",
    },
    statLabel: {
        fontSize: 12,
    },
});
