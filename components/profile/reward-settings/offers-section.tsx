/**
 * Offers Management Component
 */

import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Chip, Divider, Surface, Text, TextInput } from "react-native-paper";
import { Offer } from "./types";

interface OffersSectionProps {
    offers: Offer[];
    disableEdits: boolean;
    onUpdateOffer: (index: number, field: keyof Offer, value: string) => void;
    onRemoveOffer: (index: number) => void;
    onAddOffer: () => void;
}

export const OffersSection = React.memo(function OffersSection({
    offers,
    disableEdits,
    onUpdateOffer,
    onRemoveOffer,
    onAddOffer,
}: OffersSectionProps) {
    const theme = useTheme();

    return (
        <View style={styles.advancedSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 8 }]}>
                Redemption Offers
            </Text>
            <Text style={[styles.sectionHint, { color: theme.colors.onSurfaceDisabled }]}>
                What can customers redeem points for?
            </Text>
            {offers.length === 0 && (
                <Text style={[styles.sectionHint, { color: theme.colors.onSurfaceDisabled }]}>
                    No redemption offers yet. Add one to let customers redeem points.
                </Text>
            )}
            {offers.map((offer, index) => (
                <Surface
                    key={`offer-${offer.reward_name || "offer"}-${index}`}
                    style={[styles.offerCard, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                    <View style={styles.offerHeader}>
                        <Chip compact style={{ backgroundColor: theme.colors.primary + "90" }}>
                            <Text style={{ color: theme.colors.onPrimary, fontSize: 12 }}>Offer {index + 1}</Text>
                        </Chip>
                        {offers.length > 1 && !disableEdits && (
                            <TouchableOpacity onPress={() => onRemoveOffer(index)}>
                                <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.error} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TextInput
                        label="Offer Name"
                        value={offer.reward_name}
                        onChangeText={(value) => onUpdateOffer(index, "reward_name", value)}
                        mode="outlined"
                        style={[styles.offerInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        theme={{
                            colors: {
                                primary: theme.colors.primary,
                                onSurfaceVariant: theme.colors.onSurface,
                            },
                        }}
                        placeholder="e.g., Free Coffee"
                    />
                    <TextInput
                        label="Points Required"
                        value={offer.reward_points}
                        onChangeText={(value) => onUpdateOffer(index, "reward_points", value)}
                        mode="outlined"
                        keyboardType="numeric"
                        style={[styles.offerInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        theme={{
                            colors: {
                                primary: theme.colors.primary,
                                onSurfaceVariant: theme.colors.onSurface,
                            },
                        }}
                    />
                    <TextInput
                        label="Offer Description"
                        value={offer.reward_description}
                        onChangeText={(value) => onUpdateOffer(index, "reward_description", value)}
                        mode="outlined"
                        multiline
                        numberOfLines={2}
                        style={[styles.offerInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        placeholder="e.g. Redeem points for a free coffee on your next visit"
                        theme={{
                            colors: {
                                primary: theme.colors.primary,
                                onSurfaceVariant: theme.colors.onSurface,
                            },
                        }}
                    />
                </Surface>
            ))}

            <Button
                mode="outlined"
                icon="plus"
                onPress={onAddOffer}
                style={styles.addBtn}
                compact
                disabled={disableEdits}
            >
                Add Offer
            </Button>

            <Divider style={[styles.sectionDivider, { backgroundColor: theme.colors.outline }]} />
        </View>
    );
});

const styles = StyleSheet.create({
    advancedSection: {
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
    },
    sectionHint: {
        fontSize: 12,
        marginBottom: 12,
        marginTop: 6,
    },
    offerCard: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    offerHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    offerInput: {
        marginBottom: 20,
    },
    addBtn: {
        marginTop: 4,
    },
    sectionDivider: {
        marginVertical: 20,
    },
});
