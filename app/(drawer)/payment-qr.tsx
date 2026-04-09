/**
 * Show Payment QR — Step 20
 *
 * Full-screen QR code for the seller to display to a customer.
 * Encodes a UPI deep link so the customer's Grabbitt app (or any UPI app)
 * can scan and pay. Grabbitt's Scan & Pay flow will automatically award
 * loyalty points when the user's app identifies the seller by VPA.
 */

import { AppHeader } from "@/components/shared/app-header";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
    Image,
    Share,
    StyleSheet,
    View
} from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";

export default function PaymentQRScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const sellerProfile = user?.user?.seller_profile as any;
  const shopName: string = sellerProfile?.business?.shop_name || "My Shop";
  const vpas: string[] = sellerProfile?.rewards?.upi_ids || [];
  const primaryVpa: string | null = vpas.length > 0 ? vpas[0] : null;

  /**
   * UPI deep link: upi://pay?pa={vpa}&pn={name}&cu=INR
   * Standard format recognised by all UPI apps and Grabbitt Scan & Pay.
   */
  const upiDeepLink = useMemo(() => {
    if (!primaryVpa) return null;
    const name = encodeURIComponent(shopName);
    return `upi://pay?pa=${encodeURIComponent(primaryVpa)}&pn=${name}&cu=INR`;
  }, [primaryVpa, shopName]);

  /**
   * QR image via api.qrserver.com (free, no auth, no SDK required).
   * Encoded at 400 × 400 px for sharp display on high-DPI screens.
   */
  const qrUrl = useMemo(() => {
    if (!upiDeepLink) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(upiDeepLink)}`;
  }, [upiDeepLink]);

  const handleShare = async () => {
    if (!primaryVpa) return;
    try {
      await Share.share({
        message: `Pay ${shopName} via UPI: ${primaryVpa}\n\nOr open: ${upiDeepLink}`,
        title: `${shopName} — Payment QR`,
      });
    } catch (_) {
      // user dismissed share sheet — no action needed
    }
  };

  const handleSetupUpi = () => {
    router.push("/(drawer)/profile-setup");
  };

  const surface = theme.colors.surface;
  const onSurface = theme.colors.onSurface;
  const primary = theme.colors.primary;
  const outline = theme.colors.outline;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: surface }]} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Text
              variant="titleLarge"
              style={[styles.title, { color: onSurface }]}
            >
              💳 Payment QR
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.subtitle, { color: outline }]}
            >
              Show this to your customer — they'll scan and pay, and earn points automatically.
            </Text>

            <Divider style={[styles.divider, { backgroundColor: outline + "55" }]} />

            {!primaryVpa ? (
              /* ── No VPA configured ─────────────────────────────────────────────── */
              <View style={styles.emptyState}>
                <Text
                  variant="bodyMedium"
                  style={[styles.emptyText, { color: onSurface }]}
                >
                  You haven't added a UPI address yet.
                </Text>
                <Text
                  variant="bodySmall"
                  style={[styles.emptyHint, { color: outline }]}
                >
                  Go to Profile → UPI Address (Turbo Pay) to add your VPA.
                </Text>
                <Button
                  mode="contained"
                  style={[styles.setupButton, { backgroundColor: primary }]}
                  onPress={handleSetupUpi}
                  icon="account-edit"
                >
                  Set Up UPI Address
                </Button>
              </View>
            ) : (
              /* ── QR display ────────────────────────────────────────────────────── */
              <View style={styles.qrContainer}>
                {/* Shop name */}
                <Text
                  variant="titleMedium"
                  style={[styles.shopName, { color: onSurface }]}
                  numberOfLines={1}
                >
                  {shopName}
                </Text>

                {/* QR image from api.qrserver.com */}
                <View
                  style={[styles.qrWrapper, { borderColor: outline + "33", backgroundColor: "#fff" }]}
                >
                  <Image
                    source={{ uri: qrUrl! }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Masked VPA */}
                <View style={[styles.vpaBadge, { backgroundColor: primary + "15", borderColor: primary + "40" }]}>
                  <Text style={[styles.vpaText, { color: primary }]}>
                    {maskVpa(primaryVpa)}
                  </Text>
                </View>

                {vpas.length > 1 && (
                  <Text style={[styles.moreVpas, { color: outline }]}>
                    +{vpas.length - 1} more UPI address{vpas.length > 2 ? "es" : ""} registered
                  </Text>
                )}

                <Text style={[styles.hint, { color: outline }]}>
                  Scan with Grabbitt or any UPI app to pay
                </Text>

                {/* Share button */}
                <Button
                  mode="outlined"
                  style={styles.shareButton}
                  onPress={handleShare}
                  icon="share-variant"
                  textColor={primary}
                >
                  Share Payment Link
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

/** Shows first 3 chars of the handle, masks rest before @, keeps domain */
function maskVpa(vpa: string): string {
  const at = vpa.indexOf("@");
  if (at < 0) return vpa;
  const handle = vpa.slice(0, at);
  const domain = vpa.slice(at);
  const visible = handle.slice(0, Math.min(3, handle.length));
  const masked = handle.length > 3 ? "****" : "";
  return `${visible}${masked}${domain}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  card: {
    borderRadius: 20,
  },
  cardContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 4,
  },
  divider: {
    width: "100%",
    marginVertical: 16,
    height: 1,
  },
  /* Empty state */
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  emptyText: {
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyHint: {
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  setupButton: {
    borderRadius: 8,
  },
  /* QR display */
  qrContainer: {
    alignItems: "center",
    width: "100%",
  },
  shopName: {
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  qrWrapper: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  qrImage: {
    width: 240,
    height: 240,
  },
  vpaBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 8,
  },
  vpaText: {
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  moreVpas: {
    fontSize: 12,
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  shareButton: {
    width: "100%",
    borderRadius: 8,
  },
});
