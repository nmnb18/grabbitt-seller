import { AppHeader } from "@/components/shared/app-header";
import { Button } from "@/components/ui/paper-button";
import { useTheme } from "@/hooks/use-theme-color";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";

export default function PaymentSuccess() {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const router = useRouter();
    const { orderId, plan, expiresAt } = useLocalSearchParams();

    const expiresAtValue = Array.isArray(expiresAt) ? expiresAt[0] : expiresAt;

    const formattedDate = new Date(expiresAtValue).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]} >
            <AppHeader />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                <Animated.View entering={ZoomIn.duration(600)}>
                    <Image
                        source={require("@/assets/images/success-check.png")}
                        style={styles.checkImage}
                    />
                </Animated.View>

                <Animated.Text entering={FadeInUp.delay(200).duration(400)} style={styles.title}>
                    🎉 Hurray! Payment Successful
                </Animated.Text>

                <Animated.Text entering={FadeInUp.delay(300).duration(400)} style={styles.orderId}>
                    Order ID:{" "}
                    <Text style={styles.orderIdHighlight}>{orderId}</Text>
                </Animated.Text>

                <Animated.Text entering={FadeInUp.delay(350).duration(400)} style={styles.orderId}>
                    Expires At:{" "}
                    <Text style={styles.orderIdHighlight}>{formattedDate}</Text>
                </Animated.Text>

                <Animated.Text entering={FadeInUp.delay(400).duration(400)} style={styles.plan}>
                    Your{" "}
                    <Text style={styles.planHighlight}>{String(plan).toUpperCase()}</Text>{" "}
                    plan is now active!
                </Animated.Text>

                <Animated.Text entering={FadeInUp.delay(500).duration(400)} style={styles.subtext}>
                    Enjoy advanced analytics, unlimited QR codes and more 🚀
                </Animated.Text>

                <Animated.View entering={FadeInUp.delay(600).duration(400)}>
                    <Button
                        variant="contained"
                        onPress={() => router.replace("/(drawer)")}
                    >
                        Go to Dashboard
                    </Button>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },

        scrollContainer: {
            paddingHorizontal: 28,
            paddingTop: 40,
            paddingBottom: 60,
            alignItems: "center",
            backgroundColor: theme.colors.background,
        },

        checkImage: {
            width: 140,
            height: 140,
            marginBottom: 20,
        },

        title: {
            fontSize: 24,
            fontWeight: "700",
            color: theme.colors.onBackground,
            textAlign: "center",
            marginBottom: 10,
        },

        orderId: {
            fontSize: 18,
            color: theme.colors.onBackground,
            marginBottom: 6,
            textAlign: "center",
        },

        orderIdHighlight: {
            fontWeight: "700",
            color: theme.colors.success,
        },

        plan: {
            fontSize: 18,
            color: theme.colors.onBackground,
            marginBottom: 10,
            textAlign: "center",
        },

        planHighlight: {
            fontWeight: "700",
            color: theme.colors.primary,
        },

        subtext: {
            fontSize: 14,
            color: theme.colors.onSurfaceDisabled,
            textAlign: "center",
            width: "90%",
            marginBottom: 28,
            marginTop: 4,
        },
    });
