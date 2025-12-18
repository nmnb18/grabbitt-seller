import { FormTextInput } from "@/components/form/form-text-input";
import { AppHeader } from "@/components/shared/app-header";
import { GradientText } from "@/components/ui/gradient-text";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import dayjs, { Dayjs } from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";

type Offer = {
    id: number;
    title: string;
    min_spend: string;
    terms: string;
};

export default function SellerEditOfferScreen() {
    const theme = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const selectedDate = params.date as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [date] = useState<Dayjs>(dayjs(selectedDate));
    const [offers, setOffers] = useState<
        Offer[]
    >([]);

    // -------------------------
    // LOAD OFFER TO EDIT
    // -------------------------
    useEffect(() => {
        const loadOffer = async () => {
            try {
                const resp = await api.get(`/getSellerOffers?date=${selectedDate}`);
                if (resp.data?.offer) {
                    const loaded = resp.data.offer.offers.map((o: any) => ({
                        id: o.id,
                        title: o.title,
                        min_spend: String(o.min_spend),
                        terms: o.terms || "",
                    }));
                    setOffers(loaded);
                }
            } catch (err: any) {
                Alert.alert("Error", err.response?.data?.error || "Failed to load offer.");
                router.back();
            } finally {
                setLoading(false);
            }
        };

        loadOffer();
    }, [selectedDate]);

    const onChangeOffer = (index: number, key: string, value: Offer[keyof Offer]) => {
        const updated = [...offers];
        updated[index] = {
            ...updated[index],
            [key]: value
        };
        setOffers(updated);
    };

    const addOffer = () => {
        if (offers.length >= 15)
            return Alert.alert("Limit", "You can add max 15 offers.");
        setOffers([
            ...offers,
            { id: Date.now(), title: "", min_spend: "", terms: "" },
        ]);
    };

    const removeOffer = (index: number) => {
        if (offers.length <= 5)
            return Alert.alert("Minimum", "At least 5 offers are required.");
        setOffers(offers.filter((_, i) => i !== index));
    };

    // -------------------------
    // SAVE UPDATED OFFER
    // -------------------------
    const saveOffer = async () => {
        for (let offer of offers) {
            if (!offer.title) return Alert.alert("Validation", "Offer title required.");
            if (!offer.min_spend)
                return Alert.alert("Validation", "Minimum spend required.");
        }

        try {
            setSaving(true);

            await api.post("/saveSellerOffer", {
                date: selectedDate, // locked date
                offers: offers.map((o) => ({
                    id: o.id,
                    title: o.title,
                    min_spend: Number(o.min_spend),
                    terms: o.terms,
                })),
            });

            Alert.alert("Success", "Offer updated successfully!", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert("Error", err.response?.data?.error || "Failed to update offer.");
        } finally {
            setSaving(false);
        }
    };

    // -------------------------
    // UI
    // -------------------------
    if (loading) {
        return (
            <View style={styles.loaderWrapper}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 10 }}>Loading…</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader />

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <GradientText style={styles.title}>Edit Offers</GradientText>

                        {/* DATE - READ ONLY */}
                        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                            📅 Offer Date
                        </Text>

                        <Button mode="outlined" disabled>
                            {date.format("DD MMM YYYY")}
                        </Button>

                        <Divider
                            style={[styles.divider, { backgroundColor: theme.colors.outline }]}
                        />

                        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                            📝 Offer List (2–15)
                        </Text>

                        {offers.map((offer, index) => (
                            <View key={offer.id} style={styles.offerBlock}>
                                <FormTextInput
                                    label="Offer Title *"
                                    value={offer.title}
                                    onChangeText={(v) => onChangeOffer(index, "title", v)}
                                    leftIcon="gift"
                                />

                                <FormTextInput
                                    label="Minimum Spend (₹)"
                                    value={offer.min_spend}
                                    onChangeText={(v) => onChangeOffer(index, "min_spend", v)}
                                    keyboardType="numeric"
                                    leftIcon="currency-inr"
                                />

                                <FormTextInput
                                    label="Terms & Conditions"
                                    value={offer.terms}
                                    onChangeText={(v) => onChangeOffer(index, "terms", v)}
                                    numberOfLines={3}
                                    multiline
                                    leftIcon="note-text"
                                />

                                {offers.length > 5 && (
                                    <Button
                                        icon="delete"
                                        textColor={theme.colors.error}
                                        onPress={() => removeOffer(index)}
                                    >
                                        Remove
                                    </Button>
                                )}

                                <Divider style={{ marginVertical: 14 }} />
                            </View>
                        ))}

                        <Button
                            mode="text"
                            icon="plus"
                            onPress={addOffer}
                            disabled={offers.length >= 15}
                        >
                            Add Offer
                        </Button>

                        <View style={styles.saveRow}>
                            <Button mode="outlined" onPress={() => router.back()}>
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={saveOffer}
                                loading={saving}
                            >
                                Save Changes
                            </Button>
                        </View>
                    </Card.Content>

                    {/* Saving Overlay */}
                    {saving && (
                        <View
                            style={[
                                styles.overlay,
                                {
                                    backgroundColor: theme.dark
                                        ? "rgba(0,0,0,0.4)"
                                        : "rgba(255,255,255,0.7)",
                                },
                            ]}
                        >
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={{ marginTop: 8 }}>Saving…</Text>
                        </View>
                    )}
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { paddingVertical: 12, borderRadius: 16 },
    title: { fontWeight: "500", fontSize: 18, marginBottom: 20 },
    divider: { marginVertical: 12 },
    offerBlock: { marginBottom: 10 },
    saveRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
    overlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
    },
    loaderWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
