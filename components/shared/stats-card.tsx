import { StyleSheet, View } from "react-native";
import { Card } from "react-native-paper";
import { GradientIcon } from "../ui/gradient-icon";
import { GradientText } from "../ui/gradient-text";

interface StatCardProps {
    icon: string;
    value: number;
    label: string;
    gradientColors?: [string, string];
    backgroundColor: string;
}

export const StatCard = ({
    icon,
    value,
    label,
    gradientColors,
    backgroundColor,
}: StatCardProps) => (
    <Card style={[styles.statCard, { backgroundColor }]} elevation={2}>
        <View style={styles.statContent}>
            <GradientIcon size={32} name={icon as any} />
            <GradientText colors={gradientColors} style={styles.statValue}>
                {value}
            </GradientText>
            <GradientText colors={gradientColors} style={styles.statLabel}>
                {label}
            </GradientText>
        </View>
    </Card>
);

const styles = StyleSheet.create({

    statCard: {
        flex: 1,
        borderRadius: 16,
        overflow: "hidden",
    },
    statContent: {
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
    },
    statValue: { fontSize: 24, fontWeight: "700", marginTop: 6 },
    statLabel: { fontSize: 16, opacity: 0.9, marginTop: 4, textAlign: "center" },
})