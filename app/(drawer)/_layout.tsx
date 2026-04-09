import BlurLoader from "@/components/ui/blur-loader";
import { GradientIcon } from "@/components/ui/gradient-icon";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { EXTERNAL_LINKS } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useMemo } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DrawerLayout() {
  const theme = useTheme();
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isLoggingOut && <BlurLoader />}
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
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen name="payment-qr" options={{ headerShown: false, title: "Payment QR" }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

function DrawerMenuItem({
  label,
  icon,
  onPress,
  testID,
  styles,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  testID?: string;
  styles: any;
}) {
  return (
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
}

function CustomDrawerContent() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const version = Constants.expoConfig?.version || "1.0.0";

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          router.back();
          await logout(user?.user?.uid ?? "");
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const DRAWER_MENU_ITEMS = [
    { label: "Dashboard", icon: "grid", testID: "drawer-dashboard", route: "/(drawer)/(tabs)/dashboard" },
    { label: "Profile", icon: "account", testID: "drawer-profile", route: "/(drawer)/profile-setup" },
    { label: "Payment QR", icon: "qrcode", testID: "drawer-payment-qr", route: "/(drawer)/payment-qr" },
    { label: "Plans", icon: "star", testID: "drawer-plans", route: "/(drawer)/subscription" },
    { label: "Plans History", icon: "history", testID: "drawer-plans-history", route: "/(drawer)/subscription-history" },
    { label: "Redemption", icon: "star-four-points-outline", testID: "drawer-redemption", route: "/(drawer)/redemptions" },
    { label: "What's New", icon: "gift-outline", testID: "drawer-whats-new", route: "/(drawer)/whats-new/whats-new-home" },
    { label: "Contact Us", icon: "mail", testID: "drawer-contact", external: true, url: `mailto:${EXTERNAL_LINKS.SUPPORT_EMAIL}` },
    { label: "Privacy Policy", icon: "lock", testID: "drawer-privacy", external: true, url: EXTERNAL_LINKS.PRIVACY_POLICY },
    { label: "Terms & Conditions", icon: "file", testID: "drawer-terms", external: true, url: EXTERNAL_LINKS.TERMS_CONDITIONS },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {DRAWER_MENU_ITEMS.map((item) => (
            <DrawerMenuItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              testID={item.testID}
              styles={styles}
              onPress={() =>
                item.external ? Linking.openURL((item as any).url) : router.push((item as any).route)
              }
            />
          ))}
        </ScrollView>

        <View style={styles.logoutContainer}>
          <DrawerMenuItem
            label="Logout"
            icon="logout"
            testID="drawer-logout"
            styles={styles}
            onPress={handleLogout}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version {version}
            {"\n"}
            Maintained & Developed by <Text style={styles.footerHighlight}>yoPERKS Team</Text>
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
