import { Linking, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export const SubscriptionLegalFooter = () => {
    return (
        <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
                Subscriptions auto-renew unless cancelled at least 24 hours before the
                end of the current period. Payment will be charged to your Apple ID
                account.
            </Text>

            <View style={styles.legalLinks}>
                <Text
                    style={styles.link}
                    onPress={() => Linking.openURL("https://grabbitt.in/privacy")}
                >
                    Privacy Policy
                </Text>

                <Text style={styles.separator}> | </Text>

                <Text
                    style={styles.link}
                    onPress={() =>
                        Linking.openURL(
                            "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                        )
                    }
                >
                    Terms of Use
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    legalContainer: {
        marginVertical: 16,
        paddingHorizontal: 12,
    },
    legalText: {
        fontSize: 12,
        color: "#888",
        textAlign: "center",
        marginBottom: 6,
    },
    legalLinks: {
        flexDirection: "row",
        justifyContent: "center",
    },
    link: {
        fontSize: 12,
        color: "#4a90e2",
    },
    separator: {
        fontSize: 12,
        color: "#888",
    },
});
