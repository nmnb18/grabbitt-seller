import { useTheme } from "@/hooks/use-theme-color";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { Stack, useRouter, usePathname, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect, useRef, useCallback } from "react";
import { BackHandler, Platform, ToastAndroid } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Root screens where double-back exits the app
const ROOT_SCREENS = [
  "/(drawer)/(tabs)/home",
  "/(drawer)/(tabs)",
  "/(drawer)",
  "/auth/login",
  "/auth",
];

export default function RootLayout() {
  const [loaded] = useFonts({
    JostRegular: require("../assets/fonts/Jost-Regular.ttf"),
    JostMedium: require("../assets/fonts/Jost-Medium.ttf"),
    JostBold: require("../assets/fonts/Jost-Bold.ttf"),
  });

  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  const exitPressedRef = useRef(false);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if we're on a root screen
  const isRootScreen = useCallback(() => {
    // Check if current path matches any root screen
    if (ROOT_SCREENS.some(screen => pathname === screen || pathname.startsWith(screen + "/"))) {
      // If we're in tabs and on home, it's root
      if (segments.includes("(tabs)")) {
        const tabIndex = segments.indexOf("(tabs)");
        const nextSegment = segments[tabIndex + 1];
        // Home or no next segment means we're on root tab
        return !nextSegment || nextSegment === "home";
      }
      return true;
    }
    
    // Also check for auth screens as root
    if (pathname === "/auth/login" || pathname === "/auth") {
      return true;
    }

    return false;
  }, [pathname, segments]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const backAction = () => {
      // If we can navigate back (not on root screen), do normal back navigation
      if (!isRootScreen()) {
        if (router.canGoBack()) {
          router.back();
          return true;
        }
      }

      // On root screen - implement double press to exit
      if (exitPressedRef.current) {
        // Clear timeout
        if (exitTimeoutRef.current) {
          clearTimeout(exitTimeoutRef.current);
          exitTimeoutRef.current = null;
        }
        BackHandler.exitApp();
        return true;
      }

      // First press - show toast and wait for second press
      exitPressedRef.current = true;
      ToastAndroid.show("Swipe back again to exit", ToastAndroid.SHORT);

      // Reset after 2 seconds
      exitTimeoutRef.current = setTimeout(() => {
        exitPressedRef.current = false;
      }, 2000);

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => {
      backHandler.remove();
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [isRootScreen, router]);

  // deep link handler
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      const parsed = Linking.parse(event.url);

      if (parsed?.queryParams?.oobCode) {
        router.push(
          `/auth/reset-password?oobCode=${parsed.queryParams.oobCode}`
        );
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // enables transparent status bar on Android
    SystemUI.setBackgroundColorAsync("transparent");
  }, []);

  if (!loaded) return null;

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NotificationProvider>
            {/* FIXED STATUS BAR */}
            <StatusBar translucent backgroundColor="transparent" />
            <Stack screenOptions={{ headerShown: false }} />
          </NotificationProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
