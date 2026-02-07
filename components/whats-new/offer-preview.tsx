/**
 * OfferPreview Component
 * Preview of how offers will appear
 * Used by: offer-add.tsx
 */

import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { View } from "react-native";
import { Card, Divider, Text } from "react-native-paper";

interface Offer {
    id: string;
    title: string;
    min_spend: string;
    terms: string;
}

interface OfferPreviewProps {
    date: dayjs.Dayjs;
    offers: Offer[];
}

export function OfferPreview({ date, offers }: OfferPreviewProps) {
    const theme = useTheme();

    const validOffers = useMemo(
        () =>
            offers
                .filter((o) => o.title && o.min_spend)
                .slice()
                .sort((a, b) => Number(a.min_spend) - Number(b.min_spend)),
        [offers]
    );

    return (
        <Card style={{ borderRadius: 16, marginBottom: 16, backgroundColor: theme.colors.surface }}>
            <Card.Content>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <MaterialCommunityIcons name="eye" size={22} color={theme.colors.primary} />
                    <Text style={{ fontSize: 17, fontWeight: "600", color: theme.colors.onSurface }}>
                        Preview
                    </Text>
                </View>

                <View
                    style={{
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: theme.colors.surfaceVariant,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 15,
                            fontWeight: "700",
                            textAlign: "center",
                            color: theme.colors.onSurface,
                        }}
                    >
                        {date.format("ddd, DD MMM YYYY")}
                    </Text>
                    <Divider style={{ marginVertical: 12 }} />

                    {validOffers.length > 0 ? (
                        validOffers.map((offer) => (
                            <View
                                key={offer.id}
                                style={{
                                    paddingLeft: 12,
                                    paddingVertical: 10,
                                    borderLeftWidth: 3,
                                    borderLeftColor: theme.colors.primary,
                                    marginBottom: 8,
                                }}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text
                                        style={{
                                            fontSize: 15,
                                            fontWeight: "500",
                                            flex: 1,
                                            color: theme.colors.onSurface,
                                        }}
                                    >
                                        {offer.title || "Untitled Offer"}
                                    </Text>
                                    <View
                                        style={{
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 10,
                                            marginLeft: 10,
                                            backgroundColor: theme.colors.primaryContainer,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                fontWeight: "700",
                                                color: theme.colors.onPrimary,
                                            }}
                                        >
                                            ₹ {offer.min_spend || "0"}+
                                        </Text>
                                    </View>
                                </View>
                                {offer.terms && (
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            marginTop: 4,
                                            color: theme.colors.onSurfaceDisabled,
                                        }}
                                    >
                                        {offer.terms}
                                    </Text>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text
                            style={{
                                textAlign: "center",
                                fontStyle: "italic",
                                paddingVertical: 20,
                                color: theme.colors.onSurfaceDisabled,
                            }}
                        >
                            Fill in the offers above to see preview
                        </Text>
                    )}
                </View>
            </Card.Content>
        </Card>
    );
}
