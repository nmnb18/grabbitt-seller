/**
 * What's New - Redesigned Offer Management
 * Interactive UX with proper validations
 */

import { AppHeader } from "@/components/shared/app-header";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import { Button } from "@/components/ui/paper-button";
import { useAuthStore } from "@/store/authStore";
import { AppStyles } from "@/utils/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
} from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  FAB,
  IconButton,
  Surface,
  Text,
  TextInput,
  Portal,
  Divider,
} from "react-native-paper";
import DatePicker from "react-native-ui-datepicker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

export default function WhatsNewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const [tab, setTab] = useState<TabType>("upcoming");
  const [active, setActive] = useState<OfferDoc[]>([]);
  const [upcoming, setUpcoming] = useState<OfferDoc[]>([]);
  const [expired, setExpired] = useState<OfferDoc[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(false);

  // Copy Modal State
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [copyingOffer, setCopyingOffer] = useState<OfferDoc | null>(null);
  const [copyDateMode, setCopyDateMode] = useState<"single" | "range">("single");
  const [copyStartDate, setCopyStartDate] = useState(dayjs().add(1, "day"));
  const [copyEndDate, setCopyEndDate] = useState(dayjs().add(1, "day"));
  const [copyOffers, setCopyOffers] = useState<Offer[]>([]);
  const [savingCopy, setSavingCopy] = useState(false);

  const fetchOffers = useCallback(async () => {
    if (user?.user.seller_profile?.subscription.tier === "free") {
      setShowSubscriptionBanner(true);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const resp = await api.get("/getSellerOffers");

      if (resp.data.success) {
        setActive(resp.data.active || []);
        setUpcoming(resp.data.upcoming || []);
        setExpired(resp.data.expired || []);
      }
    } catch (err) {
      console.error("getSellerOffers error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [fetchOffers])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  const deleteOffer = async (date: string) => {
    Alert.alert(
      "Delete Offer",
      "Are you sure you want to delete this offer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(date);
              await api.delete(`/deleteSellerOffer?date=${date}`);
              Alert.alert("Deleted", "Offer deleted successfully");
              fetchOffers();
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.error || "Failed to delete");
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  // Check if offer can be edited (only future dates)
  const canEditOffer = (date: string): boolean => {
    const today = dayjs().format("YYYY-MM-DD");
    return date > today;
  };

  // Open copy modal with expired offer
  const openCopyModal = (offerDoc: OfferDoc) => {
    setCopyingOffer(offerDoc);
    setCopyOffers(offerDoc.offers.map(o => ({ ...o })));
    setCopyStartDate(dayjs().add(1, "day"));
    setCopyEndDate(dayjs().add(1, "day"));
    setCopyDateMode("single");
    setCopyModalVisible(true);
  };

  // Update copy offer
  const updateCopyOffer = (index: number, field: keyof Offer, value: string | number) => {
    const updated = [...copyOffers];
    updated[index] = { ...updated[index], [field]: value };
    setCopyOffers(updated);
  };

  // Add offer to copy
  const addCopyOffer = () => {
    if (copyOffers.length >= 10) {
      Alert.alert("Limit", "Maximum 10 offers allowed");
      return;
    }
    setCopyOffers([
      ...copyOffers,
      { id: Date.now().toString(), title: "", min_spend: 0, terms: "" },
    ]);
  };

  // Remove offer from copy
  const removeCopyOffer = (index: number) => {
    if (copyOffers.length <= 2) {
      Alert.alert("Minimum", "At least 2 offers are required");
      return;
    }
    setCopyOffers(copyOffers.filter((_, i) => i !== index));
  };

  // Save copied offer
  const saveCopiedOffer = async () => {
    const today = dayjs().format("YYYY-MM-DD");
    const startFormatted = copyStartDate.format("YYYY-MM-DD");

    if (startFormatted <= today) {
      Alert.alert("Validation", "Please select a future date (tomorrow or later)");
      return;
    }

    // Validate offers
    for (let o of copyOffers) {
      if (!o.title.trim()) {
        Alert.alert("Validation", "All offers must have a title");
        return;
      }
      if (!o.min_spend || o.min_spend <= 0) {
        Alert.alert("Validation", "All offers must have a valid minimum spend");
        return;
      }
    }

    // Sort by min_spend
    const sortedOffers = [...copyOffers].sort((a, b) => a.min_spend - b.min_spend);

    try {
      setSavingCopy(true);

      if (copyDateMode === "range") {
        const endFormatted = copyEndDate.format("YYYY-MM-DD");
        if (endFormatted <= today) {
          Alert.alert("Validation", "End date must be in the future");
          return;
        }

        const dates: string[] = [];
        let current = copyStartDate;
        while (current.isBefore(copyEndDate) || current.isSame(copyEndDate, "day")) {
          if (current.format("YYYY-MM-DD") > today) {
            dates.push(current.format("YYYY-MM-DD"));
          }
          current = current.add(1, "day");
        }

        for (const date of dates) {
          await api.post("/saveSellerOffer", {
            date,
            offers: sortedOffers.map((o) => ({
              id: o.id,
              title: o.title,
              min_spend: Number(o.min_spend),
              terms: o.terms || "",
            })),
          });
        }

        Alert.alert("Success", `Offers copied for ${dates.length} days!`);
      } else {
        await api.post("/saveSellerOffer", {
          date: startFormatted,
          offers: sortedOffers.map((o) => ({
            id: o.id,
            title: o.title,
            min_spend: Number(o.min_spend),
            terms: o.terms || "",
          })),
        });

        Alert.alert("Success", "Offer copied successfully!");
      }

      setCopyModalVisible(false);
      fetchOffers();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to save");
    } finally {
      setSavingCopy(false);
    }
  };

  // Render offer card
  const renderOfferCard = (offerDoc: OfferDoc, state: TabType) => {
    const isEditable = state === "upcoming" && canEditOffer(offerDoc.date);
    const isExpired = state === "expired";
    const isActive = state === "active";
    const isDeleting = deleting === offerDoc.date;

    return (
      <Card
        key={offerDoc.id || offerDoc.date}
        style={[
          styles.offerCard,
          { backgroundColor: theme.colors.surface },
          isExpired && { opacity: 0.85 },
        ]}
      >
        <Card.Content>
          {/* Header with date and actions */}
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={isActive ? theme.colors.success : theme.colors.primary}
              />
              <Text style={[styles.dateText, { color: theme.colors.onSurface }]}>
                {dayjs(offerDoc.date).format("ddd, DD MMM YYYY")}
              </Text>
              {isActive && (
                <Chip
                  compact
                  style={[styles.activeChip, { backgroundColor: theme.colors.success + "20" }]}
                  textStyle={{ color: theme.colors.success, fontSize: 11 }}
                >
                  LIVE
                </Chip>
              )}
            </View>

            <View style={styles.cardActions}>
              {isEditable && (
                <>
                  <IconButton
                    icon="pencil"
                    size={20}
                    iconColor={theme.colors.primary}
                    onPress={() =>
                      router.push({
                        pathname: "/(drawer)/whats-new/offer-add",
                        params: { editDate: offerDoc.date },
                      })
                    }
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor={theme.colors.error}
                    onPress={() => deleteOffer(offerDoc.date)}
                    disabled={isDeleting}
                  />
                </>
              )}
              {isExpired && (
                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: theme.colors.primary + "15" }]}
                  onPress={() => openCopyModal(offerDoc)}
                >
                  <MaterialCommunityIcons name="content-copy" size={18} color={theme.colors.primary} />
                  <Text style={[styles.copyText, { color: theme.colors.primary }]}>Copy</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Offers list */}
          <View style={styles.offersContainer}>
            {offerDoc.offers
              .sort((a, b) => a.min_spend - b.min_spend)
              .map((offer, index) => (
                <View
                  key={offer.id}
                  style={[
                    styles.offerItem,
                    { borderLeftColor: theme.colors.primary },
                    index < offerDoc.offers.length - 1 && {
                      borderBottomColor: theme.colors.outline + "50",
                      borderBottomWidth: 1,
                    },
                  ]}
                >
                  <View style={styles.offerMain}>
                    <Text style={[styles.offerTitle, { color: theme.colors.onSurface }]}>
                      {offer.title}
                    </Text>
                    <View style={[styles.minSpendBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                      <Text style={[styles.minSpendText, { color: theme.colors.primary }]}>
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

          {/* Deleting overlay */}
          {isDeleting && (
            <View style={[styles.deletingOverlay, { backgroundColor: theme.colors.background + "E0" }]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={{ marginLeft: 8, color: theme.colors.onSurface }}>Deleting...</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  // Render empty state
  const renderEmptyState = (state: TabType) => {
    const messages = {
      active: "No active offers today",
      upcoming: "No upcoming offers scheduled",
      expired: "No expired offers yet",
    };

    const icons = {
      active: "calendar-today",
      upcoming: "calendar-plus",
      expired: "calendar-remove",
    };

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name={icons[state] as any}
          size={64}
          color={theme.colors.onSurfaceDisabled}
        />
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceDisabled }]}>
          {messages[state]}
        </Text>
        {state === "upcoming" && (
          <Button
            variant="outlined"
            icon="plus"
            onPress={() => router.push("/(drawer)/whats-new/offer-add")}
            style={{ marginTop: 16 }}
          >
            Create Offer
          </Button>
        )}
      </View>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    const data = tab === "active" ? active : tab === "upcoming" ? upcoming : expired;

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {data.length === 0
          ? renderEmptyState(tab)
          : data.map((offerDoc) => renderOfferCard(offerDoc, tab))}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // Copy modal date handler
  const handleCopyDateChange = (params: any) => {
    if (copyDateMode === "range") {
      if (params?.startDate) setCopyStartDate(dayjs(params.startDate));
      if (params?.endDate) setCopyEndDate(dayjs(params.endDate));
    } else {
      if (params?.date) {
        setCopyStartDate(dayjs(params.date));
        setCopyEndDate(dayjs(params.date));
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <AppHeader />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loaderText, { color: theme.colors.onSurface }]}>
            Loading offers...
          </Text>
        </View>
      </View>
    );
  }

  if (showSubscriptionBanner) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <AppHeader />
        <View style={styles.loaderContainer}>
          <MaterialCommunityIcons name="crown" size={64} color={theme.colors.warning} />
          <Text style={[styles.subscriptionText, { color: theme.colors.onSurface }]}>
            Upgrade to Pro or Premium
          </Text>
          <Text style={[styles.subscriptionSubtext, { color: theme.colors.onSurfaceDisabled }]}>
            Create special offers to attract more customers
          </Text>
          <Button
            variant="contained"
            icon="arrow-right"
            onPress={() => router.push("/(drawer)/subscription")}
            style={{ marginTop: 20 }}
          >
            View Plans
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      {/* Tab Switcher */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.surfaceVariant + "50" }]}>
        {(["active", "upcoming", "expired"] as TabType[]).map((t) => {
          const isSelected = tab === t;
          const count = t === "active" ? active.length : t === "upcoming" ? upcoming.length : expired.length;

          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.tab,
                isSelected && { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => setTab(t)}
              testID={`tab-${t}`}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isSelected ? theme.colors.onSurface : theme.colors.onSurfaceDisabled },
                  isSelected && { fontWeight: "700" },
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.outline,
                    },
                  ]}
                >
                  <Text style={styles.tabBadgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {renderTabContent()}

      {/* FAB for upcoming tab */}
      {tab === "upcoming" && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color="#fff"
          onPress={() => router.push("/(drawer)/whats-new/offer-add")}
          testID="add-offer-fab"
        />
      )}

      {/* Copy Modal */}
      <Portal>
        <Modal
          visible={copyModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setCopyModalVisible(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                    Copy Offer
                  </Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setCopyModalVisible(false)}
                  />
                </View>

                {/* Original Date Info */}
                {copyingOffer && (
                  <View style={[styles.originalDateBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <MaterialCommunityIcons name="calendar-check" size={18} color={theme.colors.onSurfaceDisabled} />
                    <Text style={[styles.originalDateText, { color: theme.colors.onSurfaceDisabled }]}>
                      Original: {dayjs(copyingOffer.date).format("DD MMM YYYY")}
                    </Text>
                  </View>
                )}

                {/* Date Mode Toggle */}
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Select New Date
                </Text>
                <View style={styles.dateModeRow}>
                  <Chip
                    selected={copyDateMode === "single"}
                    onPress={() => setCopyDateMode("single")}
                    style={[
                      styles.modeChip,
                      {
                        backgroundColor:
                          copyDateMode === "single" ? theme.colors.primary : theme.colors.surfaceVariant,
                      },
                    ]}
                    textStyle={{
                      color: copyDateMode === "single" ? "#fff" : theme.colors.onSurface,
                    }}
                  >
                    Single Day
                  </Chip>
                  <Chip
                    selected={copyDateMode === "range"}
                    onPress={() => setCopyDateMode("range")}
                    style={[
                      styles.modeChip,
                      {
                        backgroundColor:
                          copyDateMode === "range" ? theme.colors.primary : theme.colors.surfaceVariant,
                      },
                    ]}
                    textStyle={{
                      color: copyDateMode === "range" ? "#fff" : theme.colors.onSurface,
                    }}
                  >
                    Date Range
                  </Chip>
                </View>

                {/* Date Picker */}
                <DatePicker
                  mode={copyDateMode}
                  date={copyDateMode === "single" ? copyStartDate : undefined}
                  startDate={copyDateMode === "range" ? copyStartDate : undefined}
                  endDate={copyDateMode === "range" ? copyEndDate : undefined}
                  onChange={handleCopyDateChange}
                  minDate={dayjs().add(1, "day")}
                  style={{ ...styles.datePicker, backgroundColor: theme.colors.surfaceVariant }}
                  styles={{
                    day_label: { color: theme.colors.onSurface },
                    weekday_label: { color: theme.colors.onSurface, fontWeight: "600" },
                    year_selector_label: { color: theme.colors.onSurface },
                    month_selector_label: { color: theme.colors.onSurface },
                    disabled_label: { color: theme.colors.onSurfaceDisabled },
                    selected: { backgroundColor: theme.colors.primary, borderRadius: 8 },
                    selected_label: { color: "#fff" },
                  }}
                />

                {/* Selected Date Display */}
                <Surface style={[styles.selectedDateBox, { backgroundColor: theme.colors.primaryContainer }]}>
                  <MaterialCommunityIcons name="calendar-arrow-right" size={20} color={theme.colors.primary} />
                  <Text style={[styles.selectedDateText, { color: theme.colors.primary }]}>
                    {copyDateMode === "range" && !copyStartDate.isSame(copyEndDate, "day")
                      ? `${copyStartDate.format("DD MMM")} - ${copyEndDate.format("DD MMM YYYY")}`
                      : copyStartDate.format("DD MMM YYYY")}
                  </Text>
                </Surface>

                <Divider style={{ marginVertical: 16 }} />

                {/* Editable Offers */}
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Edit Offers (2-10)
                </Text>

                {copyOffers.map((offer, index) => (
                  <Surface
                    key={offer.id}
                    style={[styles.offerEditCard, { backgroundColor: theme.colors.surfaceVariant }]}
                  >
                    <View style={styles.offerEditHeader}>
                      <Text style={[styles.offerEditNumber, { color: theme.colors.primary }]}>
                        Offer {index + 1}
                      </Text>
                      {copyOffers.length > 2 && (
                        <IconButton
                          icon="close-circle"
                          size={20}
                          iconColor={theme.colors.error}
                          onPress={() => removeCopyOffer(index)}
                        />
                      )}
                    </View>
                    <TextInput
                      label="Offer Title *"
                      value={offer.title}
                      onChangeText={(v) => updateCopyOffer(index, "title", v)}
                      mode="outlined"
                      dense
                      style={styles.offerEditInput}
                    />
                    <TextInput
                      label="Min Spend (₹) *"
                      value={offer.min_spend ? String(offer.min_spend) : ""}
                      onChangeText={(v) => updateCopyOffer(index, "min_spend", Number(v) || 0)}
                      mode="outlined"
                      dense
                      keyboardType="numeric"
                      style={styles.offerEditInput}
                    />
                    <TextInput
                      label="Terms (Optional)"
                      value={offer.terms || ""}
                      onChangeText={(v) => updateCopyOffer(index, "terms", v)}
                      mode="outlined"
                      dense
                      multiline
                      style={styles.offerEditInput}
                    />
                  </Surface>
                ))}

                {copyOffers.length < 10 && (
                  <TouchableOpacity
                    style={[styles.addOfferBtn, { borderColor: theme.colors.primary }]}
                    onPress={addCopyOffer}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.primary, fontWeight: "500" }}>Add Offer</Text>
                  </TouchableOpacity>
                )}

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <Button
                    variant="outlined"
                    onPress={() => setCopyModalVisible(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <View style={{ width: 12 }} />
                  <Button
                    variant="contained"
                    onPress={saveCopiedOffer}
                    loading={savingCopy}
                    disabled={savingCopy}
                    style={{ flex: 1 }}
                  >
                    Save Copy
                  </Button>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loaderText: {
    fontSize: 16,
  },
  subscriptionText: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  subscriptionSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 6,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },

  // Offer Card
  offerCard: {
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
  },
  activeChip: {
    height: 24,
  },
  cardActions: {
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

  // Offer Items
  offersContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },
  offerItem: {
    paddingVertical: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
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
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  minSpendText: {
    fontSize: 13,
    fontWeight: "700",
  },
  offerTerms: {
    fontSize: 12,
    marginTop: 4,
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  originalDateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  originalDateText: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  dateModeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  modeChip: {
    flex: 1,
  },
  datePicker: {
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedDateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 10,
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: "600",
  },

  // Offer Edit
  offerEditCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  offerEditHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  offerEditNumber: {
    fontWeight: "600",
  },
  offerEditInput: {
    marginBottom: 8,
  },
  addOfferBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 20,
  },
});
