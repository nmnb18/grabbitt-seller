import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Card, Chip, IconButton, Text } from "react-native-paper";

type Offer = {
  id: string;
  title: string;
  min_spend: number;
  terms?: string;
};

type OfferDoc = {
  id: string;
  date: string;
  offers: Offer[];
  created_at?: any;
};

type TabType = "active" | "upcoming" | "expired";

interface OfferCardProps {
  offerDoc: OfferDoc;
  state: TabType;
  isDeleting: boolean;
  onEdit: (date: string) => void;
  onDelete: (date: string) => void;
  onCopy: (offerDoc: OfferDoc) => void;
}

export function OfferCard({
  offerDoc,
  state,
  isDeleting,
  onEdit,
  onDelete,
  onCopy,
}: OfferCardProps) {
  const theme = useTheme();
  const isEditable = state === "upcoming" && dayjs(offerDoc.date).isAfter(dayjs());
  const isExpired = state === "expired";
  const isActive = state === "active";
  const dateLabel = useMemo(() => dayjs(offerDoc.date).format("ddd, DD MMM YYYY"), [offerDoc.date]);
  const sortedOffers = useMemo(
    () => offerDoc.offers.slice().sort((a, b) => a.min_spend - b.min_spend),
    [offerDoc.offers]
  );

  return (
    <Card
      style={{
        borderRadius: 16,
        marginBottom: 14,
        overflow: "hidden",
        backgroundColor: theme.colors.surface,
        ...(isExpired && { opacity: 0.85 }),
      }}
    >
      <Card.Content>
        {/* Header with date and actions */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={
                isActive
                  ? theme.colors.success
                  : theme.colors.primary
              }
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: theme.colors.onSurface,
              }}
            >
              {dateLabel}
            </Text>
            {isActive && (
              <Chip
                style={{
                  backgroundColor: theme.colors.success + "20",
                }}
                textStyle={{ color: theme.colors.success }}
              >
                LIVE
              </Chip>
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {isEditable && (
              <>
                <IconButton
                  icon="pencil"
                  size={20}
                  iconColor={theme.colors.primary}
                  onPress={() => onEdit(offerDoc.date)}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={theme.colors.error}
                  onPress={() => onDelete(offerDoc.date)}
                  disabled={isDeleting}
                />
              </>
            )}
            {isExpired && (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: theme.colors.primary + "15",
                }}
                onPress={() => onCopy(offerDoc)}
              >
                <MaterialCommunityIcons
                  name="content-copy"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: theme.colors.primary,
                  }}
                >
                  Copy
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Offers list */}
        <View style={{ borderRadius: 10, overflow: "hidden" }}>
          {sortedOffers.map((offer, index) => (
            <View
              key={offer.id}
              style={{
                paddingVertical: 12,
                paddingLeft: 12,
                borderLeftWidth: 3,
                borderLeftColor: theme.colors.primary,
                ...(index < sortedOffers.length - 1 && {
                  borderBottomColor:
                    theme.colors.outline + "50",
                  borderBottomWidth: 1,
                  paddingBottom: 16,
                  marginVertical: 4,
                }),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    flex: 1,
                    color: theme.colors.onSurface,
                  }}
                >
                  {offer.title}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginLeft: 8,
                    backgroundColor:
                      theme.colors.primaryContainer,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: theme.colors.onPrimary,
                    }}
                  >
                    ₹ {offer.min_spend}+
                  </Text>
                </View>
              </View>
              {offer.terms && (
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    color: theme.colors
                      .onSurfaceDisabled,
                  }}
                >
                  {offer.terms}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Deleting overlay */}
        {isDeleting && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 16,
              backgroundColor: theme.colors.background + "E0",
            }}
          >
            <Text style={{ color: theme.colors.onSurface }}>
              Deleting...
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}
