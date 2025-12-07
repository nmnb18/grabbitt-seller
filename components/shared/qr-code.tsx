import { useTheme } from "@/hooks/use-theme-color";
import { SellerRewards } from "@/types/auth";
import { AppStyles, Colors } from "@/utils/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import { Card, Chip, Text } from "react-native-paper";
interface QrCodeProps {
  qrMode: string;
  qrData: any;
  rewards: SellerRewards | undefined
}
export function QrCode({ qrMode, qrData, rewards }: QrCodeProps) {
  const theme = useTheme();
  return (
    <Card style={[styles.qrCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.qrCardContent]}>
        <View style={styles.qrContainer}>
          <Image
            source={{ uri: qrData.qr_code_base64 }}
            style={styles.qrImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.qrInfo}>
          <Chip icon="check-circle" style={styles.qrChip}>
            Active
          </Chip>
          <Text variant="bodySmall">
            QR Code ID: {qrData?.qr_id?.substring(0, 8)}...
          </Text>
          {rewards?.reward_type === 'default' && <Text variant="bodySmall" >
            Points per scan: {rewards?.default_points_value}
          </Text>}
          {rewards?.reward_type === 'percentage' && <Text variant="bodySmall" >
            Customer will earn {rewards?.percentage_value}% of order amount.
          </Text>}
          {rewards?.reward_type === 'slab' &&
            rewards?.slab_rules?.map((s, index) => {

              const isLast = rewards?.slab_rules?.length && index === rewards?.slab_rules?.length - 1;
              return (
                <Text
                  key={index}
                  style={{
                    fontSize: 14,
                    color: theme.colors.onSurface,
                  }}
                >
                  <MaterialCommunityIcons name="hand-pointing-right" /> {isLast ? `Customer will earn ${s.points || "…"} pts for order value more than ₹${s.max}` : `Customer will earn ${s.points || "…"} pts for order value smaller than ₹${s.max}`}
                </Text>
              );
            })}
          {qrMode === "dynamic" && qrData?.expires_at && (
            <Text variant="bodySmall">
              Expires:{" "}
              {new Date(
                qrData.expires_at._seconds
                  ? qrData.expires_at._seconds * 1000
                  : qrData.expires_at
              ).toLocaleString()}
            </Text>
          )}
          {qrMode === "static_with_code" && (
            <View style={styles.codeContainer}>
              <MaterialCommunityIcons
                name="key"
                size={16}
                color={Colors.light.onPrimary}
              />
              <Text variant="bodySmall">Code: {qrData.hiddenCode}</Text>
            </View>
          )}
        </View>
      </View>
      {/* 
            <Card.Actions style={styles.cardActions}>
                <Button
                    onPress={handleShare}
                    icon="share-variant"
                >
                    Share
                </Button>
                <Button
                    onPress={() => {
                        setQrImage(null);
                        setQrData(null);
                    }}
                    icon="refresh"
                >
                    New QR
                </Button>
            </Card.Actions> */}
    </Card>
  );
}
const styles = StyleSheet.create({
  qrCard: {
    marginBottom: AppStyles.spacing.md,
    borderRadius: AppStyles.card.borderRadius,
    overflow: "hidden",
  },
  qrCardContent: {
    padding: AppStyles.spacing.lg,
    alignItems: "center",
  },
  qrContainer: {
    padding: AppStyles.spacing.md,
    borderRadius: AppStyles.card.borderRadius,
    marginBottom: AppStyles.spacing.md,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrInfo: {
    alignItems: "center",
    gap: AppStyles.spacing.sm,
  },
  qrChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppStyles.spacing.sm,
  },
});
