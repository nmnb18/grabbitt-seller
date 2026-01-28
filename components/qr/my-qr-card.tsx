import React from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Dimensions,
} from "react-native";
import { Card, Text, Surface, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { LinearGradient } from "expo-linear-gradient";

interface MyQRCardProps {
  size?: "small" | "large";
  showActions?: boolean;
  style?: any;
}

export default function MyQRCard({
  size = "large",
  showActions = true,
  style,
}: MyQRCardProps) {
  const theme = useTheme();
  const { user, loading } = useAuthStore();

  // Try seller_profile first, then fall back to customer_profile for user app compatibility
  const sellerProfile = user?.user?.seller_profile;
  const qrData = sellerProfile?.qr_settings;
  const qrBase64 = (qrData as any)?.qr_code_base64;
  const qrId = (qrData as any)?.qr_id;
  const userName = sellerProfile?.account?.name || user?.user?.name || "User";

  const isSmall = size === "small";
  const qrSize = isSmall ? 100 : Math.min(Dimensions.get("window").width - 120, 280);

  const handleShare = async () => {
    if (!qrId) return;
    try {
      await Share.share({
        message: `Scan my Grabbitt QR to earn rewards! My ID: ${qrId}`,
        title: "My Grabbitt QR",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface },
          isSmall && styles.cardSmall,
          style,
        ]}
      >
        <Card.Content style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceDisabled }]}>
            Loading your QR code...
          </Text>
        </Card.Content>
      </Card>
    );
  }

  // No QR state - show placeholder
  if (!qrBase64) {
    return (
      <Card
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface },
          isSmall && styles.cardSmall,
          style,
        ]}
      >
        <Card.Content style={styles.placeholderContent}>
          <View style={[styles.placeholderIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons
              name="qrcode"
              size={isSmall ? 40 : 64}
              color={theme.colors.onSurfaceDisabled}
            />
          </View>
          {!isSmall && (
            <>
              <Text style={[styles.placeholderTitle, { color: theme.colors.onSurface }]}>
                QR Code Pending
              </Text>
              <Text style={[styles.placeholderText, { color: theme.colors.onSurfaceDisabled }]}>
                Your unique QR code will appear here once generated
              </Text>
            </>
          )}
          {isSmall && (
            <View style={styles.smallInfo}>
              <Text style={[styles.smallTitle, { color: theme.colors.onSurface }]}>
                My QR Code
              </Text>
              <Text style={[styles.smallSubtitle, { color: theme.colors.onSurfaceDisabled }]}>
                Pending generation...
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  }

  // Small card variant
  if (isSmall) {
    return (
      <TouchableOpacity activeOpacity={0.9} style={style}>
        <Card
          style={[styles.cardSmall, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content style={styles.smallContent}>
            <View style={styles.smallQRWrapper}>
              <Surface style={[styles.qrSurface, styles.qrSurfaceSmall]}>
                <Image
                  source={{ uri: `data:image/png;base64,${qrBase64}` }}
                  style={{ width: qrSize, height: qrSize }}
                  resizeMode="contain"
                />
              </Surface>
            </View>
            <View style={styles.smallInfo}>
              <Text
                style={[styles.smallTitle, { color: theme.colors.onSurface }]}
              >
                My QR Code
              </Text>
              <Text
                style={[
                  styles.smallSubtitle,
                  { color: theme.colors.onSurfaceDisabled },
                ]}
                numberOfLines={1}
              >
                Show this at checkout
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceDisabled}
            />
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>
      <LinearGradient
        colors={[theme.colors.primary + "20", theme.colors.tertiary + "20"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <MaterialCommunityIcons
          name="qrcode"
          size={28}
          color={theme.colors.primary}
        />
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          My Grabbitt QR
        </Text>
      </LinearGradient>

      <Card.Content style={styles.content}>
        {/* User Name */}
        <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
          {userName}
        </Text>

        {/* QR Code */}
        <Surface style={[styles.qrSurface, { backgroundColor: "#FFFFFF" }]}>
          <Image
            source={{ uri: `data:image/png;base64,${qrBase64}` }}
            style={{ width: qrSize, height: qrSize }}
            resizeMode="contain"
          />
        </Surface>

        {/* QR ID */}
        <View style={styles.qrIdContainer}>
          <Text
            style={[styles.qrIdLabel, { color: theme.colors.onSurfaceDisabled }]}
          >
            QR ID
          </Text>
          <Text
            style={[styles.qrId, { color: theme.colors.onSurface }]}
            selectable
          >
            {qrId}
          </Text>
        </View>

        {/* Instructions */}
        <View
          style={[
            styles.instructionBox,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.instructionText, { color: theme.colors.onSurface }]}
          >
            Show this QR code at checkout to earn reward points
          </Text>
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleShare}
            >
              <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Share QR</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  cardSmall: {
    borderRadius: 16,
  },
  gradientHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  qrSurface: {
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  qrSurfaceSmall: {
    padding: 8,
    borderRadius: 12,
  },
  qrIdContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  qrIdLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  qrId: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  instructionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  // Small card styles
  smallContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 4,
  },
  smallQRWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  smallInfo: {
    flex: 1,
  },
  smallTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  smallSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  // Loading/placeholder styles
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  placeholderContent: {
    alignItems: "center",
    paddingVertical: 40,
    flexDirection: "row",
    gap: 16,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
