/**
 * Scan Success Screen
 * Shows after successfully awarding points to customer
 */

import { Button } from "@/components/ui/paper-button";
import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScanSuccessProps {
  customerName?: string;
  pointsAwarded: number;
  onDone: () => void;
  onScanAnother: () => void;
}

export function ScanSuccess({
  customerName,
  pointsAwarded,
  onDone,
  onScanAnother,
}: ScanSuccessProps) {
  const theme = useTheme();

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    opacity.value = withDelay(200, withSpring(1));

    // Prevent back button from going back
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      onDone();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.iconGradient}
          >
            <MaterialCommunityIcons name="check" size={64} color="#fff" />
          </LinearGradient>
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={[styles.messageContainer, contentStyle]}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Points Awarded!
          </Text>

          {customerName && (
            <Text style={[styles.customerName, { color: theme.colors.onSurfaceDisabled }]}>
              to {customerName}
            </Text>
          )}

          {/* Points Badge */}
          <Surface style={[styles.pointsBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="star"
              size={32}
              color={theme.colors.primary}
            />
            <Text style={[styles.pointsValue, { color: theme.colors.primary }]}>
              +{pointsAwarded}
            </Text>
            <Text style={[styles.pointsLabel, { color: theme.colors.onPrimaryContainer }]}>
              points
            </Text>
          </Surface>
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actions, contentStyle]}>
          <Button
            variant="contained"
            onPress={onScanAnother}
            icon="qrcode-scan"
            style={styles.primaryButton}
          >
            Scan Another
          </Button>

          <Button
            variant="outlined"
            onPress={onDone}
            style={styles.secondaryButton}
          >
            Done
          </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    marginBottom: 24,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 2,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: "700",
  },
  pointsLabel: {
    fontSize: 18,
    fontWeight: "500",
  },
  transactionId: {
    marginTop: 16,
    fontSize: 12,
    fontFamily: "monospace",
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
});

export default ScanSuccess;
