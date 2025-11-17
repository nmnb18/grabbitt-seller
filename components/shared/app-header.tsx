import { useTheme } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { GradientText } from "../ui/gradient-text";

interface AppHeaderProps {
    showMenu?: boolean;
    showNotifications?: boolean;
    onNotificationsPress?: () => void;
    backgroundColor?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    showMenu = true,
    showNotifications = true,
    onNotificationsPress,
    backgroundColor,
}) => {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const bg = backgroundColor || theme.colors.background;
    const iconColor = theme.colors.onSurface;

    return (
        <View style={[styles.headerContainer, { backgroundColor: bg }]}>
            {/* Menu */}
            {showMenu ? (
                <TouchableOpacity
                    onPress={() =>
                        navigation.dispatch(DrawerActions.openDrawer())
                    }
                    style={styles.iconButton}
                >
                    <Ionicons name="menu" size={26} color={iconColor} />
                </TouchableOpacity>
            ) : (
                <View style={styles.iconButton} />
            )}

            {/* Logo */}
            <GradientText
                style={{
                    fontFamily: "JostMedium",
                    fontSize: 40,
                }}
            >
                grabbitt
            </GradientText>

            {/* Notifications */}
            {showNotifications ? (
                <TouchableOpacity
                    onPress={
                        onNotificationsPress ||
                        (() => console.log("Notifications pressed"))
                    }
                    style={styles.iconButton}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={24}
                        color={iconColor}
                    />
                </TouchableOpacity>
            ) : (
                <View style={styles.iconButton} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 60,
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    iconButton: {
        width: 40,
        alignItems: "center",
    },
});
