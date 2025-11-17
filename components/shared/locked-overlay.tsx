import { useTheme } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Button } from "../ui/paper-button";

export function LockedOverlay({
    message = "Editing is disabled on the Free plan.",
}: {
    message?: string;
}) {
    const router = useRouter();
    const theme = useTheme();

    const surface = theme.colors.surface;
    const onSurface = theme.colors.onSurface;

    // Transparent overlay that adapts to dark mode
    const overlayColor =
        theme.dark
            ? "rgba(0,0,0,0.55)"
            : "rgba(255,255,255,0.85)";

    return (
        <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
            <View style={styles.box}>
                <Text style={[styles.lockIcon, { color: onSurface }]}>🔒</Text>

                <Text style={[styles.title, { color: onSurface }]}>
                    Upgrade Required
                </Text>

                <Text style={[styles.message, { color: onSurface + "AA" }]}>
                    {message}
                </Text>

                <Button
                    variant="contained"
                    onPress={() => router.push('/(drawer)/subscription')}
                >
                    Upgrade Plan
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    box: {
        alignItems: "center",
        paddingHorizontal: 16,
    },
    lockIcon: {
        fontSize: 42,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6,
        textAlign: "center",
    },
    message: {
        textAlign: "center",
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
});
