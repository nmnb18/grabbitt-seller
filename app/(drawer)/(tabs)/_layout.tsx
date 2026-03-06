import { useTheme, useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { AppStyles } from "@/utils";
import { SUBSCRIPTION_PLANS } from "@/utils/constant";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Chip, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const { width } = Dimensions.get("window");
const LOGO_WIDTH = width * 0.4;


const TABS_CONFIG = [
  {
    name: "dashboard" as const,
    title: "Dashboard",
    icon: "view-dashboard" as const,
    headerShown: true,
  },
  {
    name: "scan-customer" as const,
    title: "Scan QR",
    icon: "qrcode-scan" as const,
    headerShown: false,
  },
  {
    name: "ai-insights" as const,
    title: "Insights",
    icon: "chart-line" as const,
    headerShown: true,
  },
];

export default function SellerLayout() {
  const sellerTheme = useTheme();
  const user = useAuthStore((state) => state.user);
  const sellerProfile = user?.user.seller_profile;
  const { unreadCount } = useNotificationStore();
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, "background");
  const navigation = useNavigation<any>();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: sellerTheme.colors.secondary,
        tabBarInactiveTintColor: sellerTheme.colors.onSurface,

        // Fix overlapping tabs on Android with proper padding and sceneContainerStyle
        tabBarStyle: {
          backgroundColor,
          borderTopColor: "transparent",
          borderTopWidth: 1,
          paddingBottom: Math.max(bottom, 20),
          paddingTop: 8,
          height: 60 + Math.max(bottom, 0),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        header: ({ }) => (
          <LinearGradient
            colors={AppStyles.gradients.headerDark}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: Platform.OS === "ios" ? 60 : 40,
              paddingBottom: 20,
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 5
              }}
            >
              {/* LEFT SIDE — LOGO + GREETING */}
              <View style={{ flexDirection: "column", gap: 8 }}>


                <Text
                  style={{
                    color: sellerTheme.colors.onSurface,
                    fontSize: 15,
                    marginTop: 2,
                    opacity: 0.9,
                  }}
                >
                  Hello, {sellerProfile?.business?.shop_name} 👋
                </Text>
                <Chip
                  mode="flat"
                  icon="crown"
                  style={styles.heroChip}
                  textStyle={styles.heroChipText}
                >
                  {SUBSCRIPTION_PLANS[sellerProfile?.subscription?.tier ?? "free"].name}
                </Chip>

              </View>

              {/* RIGHT SIDE — ICONS */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                {/* Notifications */}
                <TouchableOpacity
                  onPress={() => router.push("/(drawer)/notifications")}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={26}
                    color={sellerTheme.colors.onSurface}
                  />
                  {unreadCount > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -6,
                        backgroundColor: sellerTheme.colors.primary,
                        borderRadius: 10,
                        minWidth: 18,
                        height: 18,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 11, fontWeight: "bold" }}>
                        {unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Menu */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(DrawerActions.openDrawer())
                  }
                >
                  <Ionicons
                    name="menu"
                    size={28}
                    color={sellerTheme.colors.onSurface}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        ),
      }}
    >
      {TABS_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            headerShown: tab.headerShown,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
const styles = StyleSheet.create({
  heroChip: { backgroundColor: "rgba(255,255,255,0.8)", marginBottom: 8 },
  heroChipText: { fontWeight: "600" },
})