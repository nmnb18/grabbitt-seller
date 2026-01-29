import BlurLoader from "@/components/ui/blur-loader";
import { GradientIcon } from "@/components/ui/gradient-icon";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { EXTERNAL_LINKS } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  const theme = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: theme.colors.primary,
          drawerLabelStyle: { fontSize: 16, color: theme.colors.onBackground },
          swipeEnabled: true,
          swipeEdgeWidth: 50,
        }}
        drawerContent={() => <CustomDrawerContent />}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Dashboard",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

function CustomDrawerContent() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const router = useRouter();
  const { logout, user, loading } = useAuthStore();
  const version = Constants.expoConfig?.version || "1.0.0";

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout(user?.uid ?? "");
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const MenuItem = ({ label, icon, onPress, testID }: { label: string; icon: string; onPress: () => void; testID?: string }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      data-testid={testID}
      activeOpacity={0.7}
    >
      <GradientIcon name={icon} size={22} />
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {loading && <BlurLoader />}

      <View style={styles.container}>
        <ScrollView 
          style={styles.menuContainer}
          showsVerticalScrollIndicator={false}
        >
          <MenuItem
            label="Home"
            icon="home"
            testID="drawer-home"
            onPress={() => router.push("/(drawer)/(tabs)/home")}
          />
          
          <MenuItem
            label="My QR Code"
            icon="qrcode"
            testID="drawer-my-qr"
            onPress={() => router.push("/(drawer)/(tabs)/my-qr")}
          />
          
          <MenuItem 
            label="Redemptions" 
            icon="history" 
            testID="drawer-redemptions"
            onPress={() => router.push("/(drawer)/redeem/redemption-history")} 
          />

          <MenuItem 
            label="Perks" 
            icon="gift" 
            testID="drawer-perks"
            onPress={() => router.push("/(drawer)/perks-history")} 
          />

          <MenuItem 
            label="Profile" 
            icon="account" 
            testID="drawer-profile"
            onPress={() => router.push("/(drawer)/profile")} 
          />

          <MenuItem 
            label="Contact Us" 
            icon="mail" 
            testID="drawer-contact"
            onPress={() => Linking.openURL(`mailto:${EXTERNAL_LINKS.SUPPORT_EMAIL}`)} 
          />

          <MenuItem 
            label="Privacy Policy" 
            icon="lock" 
            testID="drawer-privacy"
            onPress={() => Linking.openURL(EXTERNAL_LINKS.PRIVACY_POLICY)} 
          />

          <MenuItem 
            label="Terms & Conditions" 
            icon="file" 
            testID="drawer-terms"
            onPress={() => Linking.openURL(EXTERNAL_LINKS.TERMS_CONDITIONS)} 
          />
        </ScrollView>

        <View style={styles.logoutContainer}>
          <MenuItem 
            label="Logout" 
            icon="logout" 
            testID="drawer-logout"
            onPress={handleLogout} 
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version {version}
            {"\n"}
            Maintained & Developed by{" "}
            <Text style={styles.footerHighlight}>Grabbitt Team</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}


const createStyles = (theme: any) =>
  StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: theme.colors.background },
    container: { flex: 1, justifyContent: "space-between" },
    menuContainer: { padding: 16 },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomColor: theme.colors.outline,
      borderBottomWidth: 1,
      gap: 16,
    },

    menuLabel: {
      fontSize: 16,
      color: theme.colors.onBackground,
      fontWeight: "500",
    },

    logoutContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 4,
    },

    footer: {
      padding: 10,
      paddingBottom: 20,
    },

    footerText: {
      textAlign: "center",
      fontSize: 12,
      color: theme.colors.onSurfaceDisabled,
    },

    footerHighlight: {
      fontWeight: "600",
      color: theme.colors.primary,
    },
  });
