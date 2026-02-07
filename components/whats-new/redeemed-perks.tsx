import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Surface, Text } from "react-native-paper";

interface PerkItem {
    id: string;
    customer_name: string;
    offer_title: string;
    redeem_code: string;
    min_spend: number;
    status: string;
}

interface RedeemedPerksProps {
    open: boolean;
    loading: boolean;
    perks: PerkItem[];
    onToggle: (open: boolean) => void;
}

export function RedeemedPerks({
    open,
    loading,
    perks,
    onToggle,
}: RedeemedPerksProps) {
    const theme = useTheme();

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return theme.colors.warning;
            case "redeemed":
                return theme.colors.success;
            case "claimed":
                return theme.colors.warning;
            case "expired":
                return theme.colors.error;
            default:
                return theme.colors.onSurfaceVariant;
        }
    };

    return (
        <Surface
            style={{
                borderRadius: 14,
                marginTop: 20,
                paddingVertical: 8,
                backgroundColor: theme.colors.surfaceVariant,
            }}
        >
            <TouchableOpacity
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                }}
                onPress={() => onToggle(!open)}
            >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <MaterialCommunityIcons
                        name="history"
                        size={18}
                        color={theme.colors.primary}
                    />
                    <Text
                        style={{
                            color: theme.colors.onSurface,
                            fontWeight: "600",
                        }}
                    >
                        Perks Information
                    </Text>
                </View>

                <MaterialCommunityIcons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={22}
                    color={theme.colors.onSurface}
                />
            </TouchableOpacity>

            {open && (
                <>
                    {loading ? (
                        <Text
                            style={{
                                padding: 12,
                                color: theme.colors.onSurfaceDisabled,
                            }}
                        >
                            Loading...
                        </Text>
                    ) : (
                        <FlatList
                            data={perks}
                            keyExtractor={(perk) => perk.id}
                            renderItem={({ item: perk }) => (
                                <View
                                    style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 12,
                                        borderBottomColor: theme.colors.outline,
                                        borderBottomWidth: 1,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontWeight: "600",
                                            color: theme.colors.onSurface,
                                        }}
                                    >
                                        {perk.customer_name}
                                    </Text>

                                    <Text
                                        style={{
                                            color: theme.colors.onSurface,
                                        }}
                                    >
                                        {perk.offer_title} | {perk.redeem_code}
                                    </Text>

                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: theme.colors.onSurfaceDisabled,
                                        }}
                                    >
                                        ₹ {perk.min_spend}+ |{" "}
                                        <Text
                                            style={{
                                                color: getStatusColor(perk.status),
                                            }}
                                        >
                                            {perk.status}
                                        </Text>
                                    </Text>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text
                                    style={{
                                        padding: 12,
                                        color: theme.colors.onSurfaceDisabled,
                                    }}
                                >
                                    No redeemed perks yet
                                </Text>
                            }
                        />
                    )}
                </>
            )}
        </Surface>
    );
}
