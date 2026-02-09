import { GradientText } from "@/components/ui/gradient-text";
import { useTheme, useThemeColor } from "@/hooks/use-theme-color";
import { useNotificationStore } from "@/store/notificationStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Dimensions, Platform, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
const { width } = Dimensions.get("window");
const LOGO_WIDTH = width * 0.4;

function HeaderTitle() {
  return (
    <GradientText
      style={{
        fontFamily: "JostMedium",
        fontSize: 40,
        textAlignVertical: "center",
        includeFontPadding: false,
      }}
    >
      grabbitt
    </GradientText>
  );
}

function HeaderMenuButton({ sellerTheme }: { sellerTheme: any }) {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={{ marginLeft: 16 }}
    >
      <Ionicons
        name="menu"
        size={26}
        color={sellerTheme.colors.onSurface}
      />
    </TouchableOpacity>
  );
}

function NotificationBadge({
  unreadCount,
  sellerTheme,
  router,
}: {
  unreadCount: number;
  sellerTheme: any;
  router: any;
}) {
  return (
    <TouchableOpacity
      onPress={() => router.push("/(drawer)/notifications")}
      style={{ marginRight: 16 }}
    >
      <Ionicons
        name="notifications-outline"
        size={24}
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
  );
}

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
  const { unreadCount } = useNotificationStore();
  const router = useRouter();

  const backgroundColor = useThemeColor({}, "background");
  const navigation = useNavigation<any>();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: sellerTheme.colors.secondary,
        tabBarInactiveTintColor: sellerTheme.colors.onSurface,
        headerTitleAlign: "center",

        tabBarStyle: {
          backgroundColor,
          borderTopColor: "transparent",
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          height: Platform.OS === "ios" ? 120 : 90,
          backgroundColor,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },

        headerTitle: () => <HeaderTitle />,
        headerLeft: () => <HeaderMenuButton sellerTheme={sellerTheme} />,
        headerRight: () => (
          <NotificationBadge
            unreadCount={unreadCount}
            sellerTheme={sellerTheme}
            router={router}
          />
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
