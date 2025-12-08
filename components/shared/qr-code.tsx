import React, { useState } from "react";
import {
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
  View,
} from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

import { useTheme } from "@/hooks/use-theme-color";
import { SellerRewards } from "@/types/auth";
import { AppStyles } from "@/utils/theme";
import { GradientText } from "../ui/gradient-text";

// ✅ Enable smooth animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface QrCodeProps {
  qrData: any[]; // ✅ multiple QRs
  rewards: SellerRewards | undefined;
}

export function QrCode({ qrData = [], rewards }: QrCodeProps) {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (qrId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === qrId ? null : qrId));
  };

  // ✅ Empty State
  if (!qrData.length) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text>No active QR codes available.</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View>

      <Text style={styles.title}>Active QRs</Text>
      {qrData.map((qr) => {
        const isExpanded = expandedId === qr.qr_id;

        return (
          <Card
            key={qr.qr_id}
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => toggleExpand(qr.qr_id)}
          >
            <Card.Content>

              {/* ✅ HEADER ROW */}
              <View style={styles.headerRow}>
                <View style={styles.chipRow}>


                  <GradientText style={styles.headerLabel}>
                    {qr.qr_type?.toUpperCase()}
                  </GradientText>
                  {qr.amount && <GradientText style={styles.headerLabel}>
                    - {qr.amount}
                  </GradientText>}

                </View>
                <Text
                  style={[

                    { color: theme.colors.success },
                  ]}
                >
                  {qr.status?.toUpperCase() || "active"}
                </Text>
                <IconButton
                  icon={isExpanded ? "chevron-up" : "chevron-down"}
                  size={26}
                  iconColor={theme.colors.onSurface}
                />
              </View>

              {/* ✅ SUB HEADER */}


              {/* ✅ EXPANDED VIEW */}
              {isExpanded && (
                <View style={styles.expandedBox}>

                  {/* ✅ QR IMAGE */}
                  <Image
                    source={{ uri: qr.qr_code_base64 }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text variant="bodySmall" style={styles.qrId}>
                    QR ID: {qr.qr_id?.substring(0, 10)}...
                  </Text>
                  {/* ✅ MULTIPLE MODE = SHOW AMOUNT + POINTS */}
                  {qr.qr_type === "multiple" && (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>
                        💰 Amount: ₹{qr.amount || "--"}
                      </Text>
                      <Text style={styles.infoText}>
                        ⭐ Points: {qr.points_value || "--"}
                      </Text>
                    </View>
                  )}

                  {/* ✅ DYNAMIC / STATIC = SHOW REWARD LOGIC */}
                  {qr.qr_type !== "multiple" && rewards && (
                    <View style={styles.infoBox}>
                      {rewards.reward_type === "default" && (
                        <Text style={styles.infoText}>
                          ⭐ {rewards.default_points_value} points per scan
                        </Text>
                      )}

                      {rewards.reward_type === "percentage" && (
                        <Text style={styles.infoText}>
                          🧾 {rewards.percentage_value}% of order value
                        </Text>
                      )}

                      {rewards.reward_type === "slab" &&
                        rewards.slab_rules?.map((s, index) => {
                          const isLast =
                            rewards?.slab_rules?.length &&
                            index === rewards.slab_rules.length - 1;

                          return (
                            <Text key={index} style={styles.infoText}>
                              {isLast
                                ? `Above ₹${s.max} → ${s.points} pts`
                                : `Below ₹${s.max} → ${s.points} pts`}
                            </Text>
                          );
                        })}
                    </View>
                  )}

                  {/* ✅ EXPIRY */}
                  {qr.qr_type === "dynamic" && qr?.expires_at && (
                    <Text variant="bodySmall" style={styles.expiryText}>
                      Expires:{" "}
                      {new Date(
                        qr.expires_at._seconds
                          ? qr.expires_at._seconds * 1000
                          : qr.expires_at
                      ).toLocaleString()}
                    </Text>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        );
      })}
    </View>
  );
}

// ✅ CLEAN UI STYLES
const styles = StyleSheet.create({
  card: {
    marginBottom: AppStyles.spacing.md,
    borderRadius: AppStyles.card.borderRadius,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: '500', marginBottom: 10, textAlign: 'center' },

  chipRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  headerLabel: {
    fontSize: 18
  },


  qrId: {
    marginTop: 6,
    opacity: 0.7,
    alignSelf: 'center'
  },

  expandedBox: {
    marginTop: 16,
    alignItems: "center",
  },

  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 12,
  },

  infoBox: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 24,
  },

  infoText: {
    fontSize: 14,
    fontWeight: "600",
  },

  expiryText: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.7,
  },
});
