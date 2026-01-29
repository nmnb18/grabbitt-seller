/**
 * Offer Card Component - Redesigned
 * Clean, modern card for displaying offers
 */

import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Chip, IconButton, Text, ActivityIndicator } from "react-native-paper";

type Offer = {
  id: string;
  title: string;
  min_spend: number;
  terms?: string;
};

type OfferCardProps = {
  item: {
    id: string;
    date: string;
    offers: Offer[];
  };
  state: "active" | "upcoming" | "expired";
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  isDeleting?: boolean;
};

export default function OfferCard({
  item,
  state,
  onEdit,
  onDelete,
  onCopy,
  isDeleting = false,
}: OfferCardProps) {
  const theme = useTheme();

  const isActive = state === "active";
  const isUpcoming = state === "upcoming";
  const isExpired = state === "expired";

  // Check if offer can be edited (only future dates)
  const canEdit = isUpcoming && dayjs(item.date).isAfter(dayjs(), "day");

  // Format date nicely
  const formattedDate = dayjs(item.date).format("ddd, DD MMM YYYY");

  // Sort offers by min_spend
  const sortedOffers = [...item.offers].sort((a, b) => a.min_spend - b.min_spend);

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface },
        isExpired && styles.expiredCard,
      ]}
    >
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dateRow}>
            <View
              style={[
                styles.dateIcon,
                {
                  backgroundColor: isActive
                    ? theme.colors.success + "20"
                    : isExpired
                    ? theme.colors.outline + "20"
                    : theme.colors.primary + "20",
                },
              ]}
            >
              <MaterialCommunityIcons
                name={isActive ? "calendar-check" : isExpired ? "calendar-remove" : "calendar-clock"}
                size={20}
                color={
                  isActive
                    ? theme.colors.success
                    : isExpired
                    ? theme.colors.outline
                    : theme.colors.primary
                }
              />
            </View>
            <View>
              <Text style={[styles.dateText, { color: theme.colors.onSurface }]}>
                {formattedDate}
              </Text>
              {isActive && (
                <Chip
                  compact
                  style={[styles.liveChip, { backgroundColor: theme.colors.success + "20" }]}
                  textStyle={{ color: theme.colors.success, fontSize: 10, fontWeight: "700" }}
                >
                  LIVE NOW
                </Chip>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {canEdit && onEdit && (
              <IconButton
                icon="pencil"
                size={20}
                iconColor={theme.colors.primary}
                onPress={onEdit}
                disabled={isDeleting}
              />
            )}
            {canEdit && onDelete && (
              <IconButton
                icon="delete"
                size={20}
                iconColor={theme.colors.error}
                onPress={onDelete}
                disabled={isDeleting}
              />
            )}
            {isExpired && onCopy && (
              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: theme.colors.primary + "15" }]}
                onPress={onCopy}
              >
                <MaterialCommunityIcons
                  name="content-copy"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={[styles.copyText, { color: theme.colors.primary }]}>
                  Copy
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Offers List */}
        <View style={styles.offersList}>
          {sortedOffers.map((offer, index) => (
            <View
              key={offer.id}
              style={[
                styles.offerItem,
                {
                  borderLeftColor: isExpired ? theme.colors.outline : theme.colors.primary,
                  borderBottomColor: theme.colors.outline + "30",
                },
                index < sortedOffers.length - 1 && styles.offerItemBorder,
              ]}
            >
              <View style={styles.offerMain}>
                <Text
                  style={[
                    styles.offerTitle,
                    { color: theme.colors.onSurface },
                    isExpired && { opacity: 0.7 },
                  ]}
                >
                  {offer.title}
                </Text>
                <View
                  style={[
                    styles.minSpendBadge,
                    {
                      backgroundColor: isExpired
                        ? theme.colors.surfaceVariant
                        : theme.colors.primaryContainer,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.minSpendText,
                      { color: isExpired ? theme.colors.onSurfaceDisabled : theme.colors.primary },
                    ]}
                  >
                    ₹{offer.min_spend}+
                  </Text>
                </View>
              </View>
              {offer.terms && (
                <Text style={[styles.offerTerms, { color: theme.colors.onSurfaceDisabled }]}>
                  {offer.terms}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Offer Count */}
        <View style={styles.footer}>
          <Text style={[styles.offerCount, { color: theme.colors.onSurfaceDisabled }]}>
            {sortedOffers.length} offer{sortedOffers.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Deleting Overlay */}
        {isDeleting && (
          <View style={[styles.overlay, { backgroundColor: theme.colors.background + "E0" }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={{ marginLeft: 10, color: theme.colors.onSurface }}>
              Deleting...
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  expiredCard: {
    opacity: 0.85,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
  },
  liveChip: {
    marginTop: 4,
    height: 22,
  },

  // Actions
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Offers List
  offersList: {
    borderRadius: 10,
    overflow: "hidden",
  },
  offerItem: {
    paddingVertical: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
  },
  offerItemBorder: {
    borderBottomWidth: 1,
  },
  offerMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  minSpendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 10,
  },
  minSpendText: {
    fontSize: 13,
    fontWeight: "700",
  },
  offerTerms: {
    fontSize: 12,
    marginTop: 4,
  },

  // Footer
  footer: {
    marginTop: 12,
    alignItems: "center",
  },
  offerCount: {
    fontSize: 12,
  },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
});
