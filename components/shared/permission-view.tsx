import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Button } from "../ui/paper-button";

export const PermissionView = ({
    onRequestPermission,
    primary,
    onPrimary,
    isDenied,
}: {
    onRequestPermission: () => void;
    primary: string;
    onPrimary: string;
    isDenied: boolean;
}) => {
    return (
        <View style={styles.center}>
            <MaterialCommunityIcons name="camera-off" size={80} color={onPrimary} />

            <Text variant="headlineSmall" style={[styles.permissionTitle, { color: onPrimary }]}>
                Camera Access Needed
            </Text>

            <Text variant="bodyMedium" style={[styles.permissionText, { color: primary }]}>
                We use your camera to scan QR codes for quick check-in.
            </Text>

            {isDenied ? (
                <Button variant="contained" onPress={() => Linking.openSettings()}>
                    Open Settings
                </Button>
            ) : (
                <Button variant="contained" onPress={onRequestPermission}>
                    Continue
                </Button>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    permissionTitle: { marginTop: 18, marginBottom: 6, fontWeight: "700", textAlign: "center" },
    permissionText: { textAlign: "center", opacity: 0.9, marginBottom: 20 },
});
