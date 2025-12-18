import { useTheme } from "@/hooks/use-theme-color";
import dayjs from "dayjs";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

export default function OfferCard({ item, state, onEdit, onDelete }: any) {
    const theme = useTheme();


    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={[styles.date, { color: theme.colors.onSurface }]}>
                        {dayjs(item.date).format('DD MMM YYYY').toString()}
                    </Text>

                    {state === "upcoming" && (
                        <View style={styles.actions}>
                            <IconButton
                                icon="pencil"
                                size={22}
                                iconColor={theme.colors.onBackground}
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

                {/* BODY */}
                <View style={styles.footer}>
                    <View style={{ flex: 1 }}>
                        {item.offers.map((offer: any) => (
                            <View key={offer.id} style={[styles.offerContent, { borderBottomColor: theme.colors.accent }]}>
                                <View style={styles.offerRow}>
                                    <Text
                                        style={[
                                            styles.offerTitle,
                                        ]}
                                    >
                                        • {offer.title}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.offerTerms,

                                        ]}
                                    >
                                        Min Spend: ₹{offer.min_spend}
                                    </Text>
                                </View>
                                <Text>{offer.terms}</Text>
                            </View>

                        ))}
                    </View>

                    {/* ACTIONS only for UPCOMING */}

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
    offerContent: {
        paddingBlock: 15,
        borderBottomWidth: 1
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
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    offerTitle: {
        fontSize: 16,
    },
    offerTerms: {
        fontSize: 16,
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
