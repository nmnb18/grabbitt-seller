import { useTheme } from "@/hooks/use-theme-color";
import dayjs from "dayjs";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Chip, IconButton, Text } from "react-native-paper";

export default function OfferCard({ item, state, onEdit, onDelete }: any) {
    const theme = useTheme();

    // STATE → COLOR MAP
    const stateColorMap: any = {
        active: {
            bg: theme.colors.success + "22",
            text: theme.colors.success,
        },
        upcoming: {
            bg: theme.colors.warning + "22",
            text: theme.colors.warning,
        },
        expired: {
            bg: theme.colors.error + "22",
            text: theme.colors.error,
        },
    };

    const colors = stateColorMap[state] ?? stateColorMap["upcoming"];

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={[styles.date, { color: theme.colors.onSurface }]}>
                        {dayjs(item.date).format('DD MMM YYYY').toString()}
                    </Text>

                    <Chip
                        style={{ backgroundColor: colors.bg }}
                        textStyle={{ color: colors.text }}
                    >
                        {state.toUpperCase()}
                    </Chip>
                </View>

                {/* BODY */}
                <View style={styles.footer}>
                    <View style={{ flex: 1 }}>
                        {item.offers.map((offer: any) => (
                            <View key={offer.id} style={styles.offerRow}>
                                <Text
                                    style={[
                                        styles.offerTitle,
                                        { color: theme.colors.onSurface }
                                    ]}
                                >
                                    • {offer.title}
                                </Text>
                                <Text
                                    style={[
                                        styles.offerTerms,
                                        { color: theme.colors.onSurfaceDisabled }
                                    ]}
                                >
                                    Min Spend: ₹{offer.min_spend}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* ACTIONS only for UPCOMING */}
                    {state === "upcoming" && (
                        <View style={styles.actions}>
                            <IconButton
                                icon="pencil"
                                size={22}
                                onPress={onEdit}
                            />
                            <IconButton
                                icon="delete"
                                size={22}
                                iconColor={theme.colors.error}
                                onPress={onDelete}
                            />
                        </View>
                    )}
                </View>

            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 14,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    date: {
        fontSize: 15,
        fontWeight: "700",
    },
    offerRow: {
        marginBottom: 5,
    },
    offerTitle: {
        fontSize: 14,
        fontWeight: "600",
    },
    offerTerms: {
        fontSize: 12,
        marginTop: 2,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginLeft: 10,
        gap: 4,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
});
