import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

type TabType = "active" | "upcoming" | "expired";

interface TabSwitcherProps {
    activeTab: TabType;
    counts: {
        active: number;
        upcoming: number;
        expired: number;
    };
    onTabChange: (tab: TabType) => void;
}

export function TabSwitcher({ activeTab, counts, onTabChange }: TabSwitcherProps) {
    const theme = useTheme();

    return (
        <View
            style={{
                flexDirection: "row",
                marginHorizontal: 16,
                marginTop: 12,
                borderRadius: 12,
                padding: 6,
                backgroundColor: theme.colors.surfaceVariant + "50",
            }}
        >
            {(["active", "upcoming", "expired"] as TabType[]).map((tab) => {
                const isSelected = activeTab === tab;
                const count = counts[tab];

                return (
                    <TouchableOpacity
                        key={tab}
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingVertical: 10,
                            borderRadius: 8,
                            gap: 6,
                            ...(isSelected && {
                                backgroundColor: theme.colors.surface,
                            }),
                        }}
                        onPress={() => onTabChange(tab)}
                        testID={`tab-${tab}`}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                color: isSelected
                                    ? theme.colors.onSurface
                                    : theme.colors.onSurfaceDisabled,
                                ...(isSelected && { fontWeight: "700" }),
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                        {count > 0 && (
                            <View
                                style={{
                                    minWidth: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    paddingHorizontal: 6,
                                    backgroundColor: isSelected
                                        ? theme.colors.primary
                                        : theme.colors.outline,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontSize: 11,
                                        fontWeight: "700",
                                    }}
                                >
                                    {count}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
