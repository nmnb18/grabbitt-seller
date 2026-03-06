/**
 * OfferForm Component
 * Reusable form for creating/editing offers
 * Used by: offer-add.tsx
 */

import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { View } from "react-native";
import { Card, Chip, HelperText, IconButton, Surface, Text, TextInput } from "react-native-paper";
import { FormTextInput } from "../form/form-text-input";

export interface Offer {
    id: string;
    title: string;
    min_spend: string;
    terms: string;
}

interface OfferFormProps {
    offers: Offer[];
    errors: Record<string, string>;
    onUpdateOffer: (index: number, field: keyof Offer, value: string) => void;
    onAddOffer: () => void;
    onRemoveOffer: (index: number) => void;
    maxOffers?: number;
    minOffers?: number;
}

const MAX_OFFERS = 10;
const MIN_OFFERS = 2;

export function OfferForm({
    offers,
    errors,
    onUpdateOffer,
    onAddOffer,
    onRemoveOffer,
    maxOffers = MAX_OFFERS,
    minOffers = MIN_OFFERS,
}: OfferFormProps) {
    const theme = useTheme();

    return (
        <Card style={{ borderRadius: 16, marginBottom: 16, backgroundColor: theme.colors.surface }}>
            <Card.Content>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <MaterialCommunityIcons name="gift" size={22} color={theme.colors.primary} />
                    <Text style={{ fontSize: 17, fontWeight: "600", color: theme.colors.onSurface }}>
                        Configure Offers
                    </Text>
                    <Chip compact style={{ marginLeft: "auto" }}>
                        {offers.length}/{maxOffers}
                    </Chip>
                </View>

                <Text
                    style={{
                        fontSize: 13,
                        marginBottom: 16,
                        marginTop: -4,
                        color: theme.colors.onSurfaceDisabled,
                    }}
                >
                    Add {minOffers}-{maxOffers} offers with different minimum spend amounts
                </Text>

                {errors.duplicate && (
                    <HelperText type="error" visible style={{ marginBottom: 8 }}>
                        {errors.duplicate}
                    </HelperText>
                )}

                {offers.map((offer, index) => (
                    <OfferRow
                        key={offer.id}
                        offer={offer}
                        index={index}
                        minOffers={minOffers}
                        totalOffers={offers.length}
                        errors={errors}
                        onUpdateOffer={onUpdateOffer}
                        onRemoveOffer={onRemoveOffer}
                    />
                ))}

                {offers.length < maxOffers && (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            paddingVertical: 14,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderStyle: "dashed",
                            borderColor: theme.colors.primary,
                        }}
                        onTouchEnd={onAddOffer}
                    >
                        <MaterialCommunityIcons name="plus-circle" size={22} color={theme.colors.primary} />
                        <Text style={{ fontSize: 15, fontWeight: "600", color: theme.colors.primary }}>
                            Add Another Offer
                        </Text>
                    </View>
                )}
            </Card.Content>
        </Card>
    );
}

interface OfferRowProps {
    offer: Offer;
    index: number;
    minOffers: number;
    totalOffers: number;
    errors: Record<string, string>;
    onUpdateOffer: (index: number, field: keyof Offer, value: string) => void;
    onRemoveOffer: (index: number) => void;
}

const OfferRow = React.memo(function OfferRow({
    offer,
    index,
    minOffers,
    totalOffers,
    errors,
    onUpdateOffer,
    onRemoveOffer,
}: OfferRowProps) {
    const theme = useTheme();
    const titleError = errors[`offer_${index}_title`];
    const minSpendError = errors[`offer_${index}_min_spend`];

    const handleTitleChange = useCallback(
        (value: string) => onUpdateOffer(index, "title", value),
        [index, onUpdateOffer]
    );

    const handleMinSpendChange = useCallback(
        (value: string) => onUpdateOffer(index, "min_spend", value.replace(/[^0-9]/g, "")),
        [index, onUpdateOffer]
    );

    const handleTermsChange = useCallback(
        (value: string) => onUpdateOffer(index, "terms", value),
        [index, onUpdateOffer]
    );

    const handleRemove = useCallback(() => onRemoveOffer(index), [index, onRemoveOffer]);

    return (
        <Surface
            style={{
                padding: 14,
                borderRadius: 12,
                marginBottom: 14,
                backgroundColor: theme.colors.surfaceVariant,
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: theme.colors.primary,
                    }}
                >
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                        {index + 1}
                    </Text>
                </View>
                <Text
                    style={{
                        fontSize: 15,
                        fontWeight: "600",
                        marginLeft: 10,
                        flex: 1,
                        color: theme.colors.onSurface,
                    }}
                >
                    Offer {index + 1}
                </Text>
                {totalOffers > minOffers && (
                    <IconButton
                        icon="close-circle"
                        size={22}
                        iconColor={theme.colors.error}
                        onPress={handleRemove}
                        style={{ margin: 0 }}
                    />
                )}
            </View>

            <FormTextInput
                label="Offer Title *"
                placeholder="e.g., Free Coffee"
                value={offer.title}
                onChangeText={handleTitleChange}
                autoCapitalize="words"
                leftIcon="gift"
                style={{ marginBottom: 8 }}
            />

            {titleError && (
                <HelperText type="error" visible>
                    {titleError}
                </HelperText>
            )}

            <FormTextInput
                label="Minimum Spend (₹) *"
                placeholder="e.g., 300"
                value={offer.min_spend}
                onChangeText={handleMinSpendChange}
                keyboardType="numeric"
                leftIcon="currency-inr"
                style={{ marginBottom: 8 }}
                error={!!minSpendError}
            />

            {minSpendError && (
                <HelperText type="error" visible>
                    {minSpendError}
                </HelperText>
            )}

            <TextInput
                label="Terms & Conditions (Optional)"
                placeholder="e.g., Valid on dine-in only"
                value={offer.terms}
                onChangeText={handleTermsChange}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={{ marginBottom: 0 }}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.onSurface}
                left={<TextInput.Icon icon="text" color={theme.colors.onSurface} />}
                theme={{
                    colors: {
                        primary: theme.colors.primary,
                        onSurfaceVariant: theme.colors.onSurface,
                    },
                }}
            />
        </Surface>
    );
});
