/**
 * Add/Edit Offer Screen - Redesigned
 * Interactive UX with proper validations
 * - Min 2, Max 10 offers
 * - Future dates only (today+1)
 * - Single date or date range
 */

import { AppHeader } from "@/components/shared/app-header";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import { AppStyles } from "@/utils/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Card,
  Chip,
  Divider,
  IconButton,
  Surface,
  Text,
  TextInput,
  HelperText,
} from "react-native-paper";
import DatePicker from "react-native-ui-datepicker";
import { Button } from "@/components/ui/paper-button";

type Offer = {
  id: string;
  title: string;
  min_spend: string;
  terms: string;
};

const MIN_OFFERS = 2;
const MAX_OFFERS = 10;

export default function AddOfferScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ editDate?: string }>();

  const isEditMode = !!params.editDate;
  const editDate = params.editDate;

  // Date state
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [startDate, setStartDate] = useState(dayjs().add(1, "day"));
  const [endDate, setEndDate] = useState(dayjs().add(1, "day"));
  const [showDatePicker, setShowDatePicker] = useState(true);

  // Offers state
  const [offers, setOffers] = useState<Offer[]>([
    { id: Date.now().toString(), title: "", min_spend: "", terms: "" },
    { id: (Date.now() + 1).toString(), title: "", min_spend: "", terms: "" },
  ]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => setKeyboardHeight(event.endCoordinates.height + 20)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Load existing offer for edit mode
  useEffect(() => {
    if (isEditMode && editDate) {
      loadExistingOffer(editDate);
    }
  }, [isEditMode, editDate]);

  const loadExistingOffer = async (date: string) => {
    try {
      setLoading(true);
      const resp = await api.get("/getSellerOffers");

      if (resp.data.success) {
        const allOffers = [
          ...(resp.data.active || []),
          ...(resp.data.upcoming || []),
        ];

        const existingOffer = allOffers.find((o: any) => o.date === date);

        if (existingOffer) {
          setStartDate(dayjs(date));
          setEndDate(dayjs(date));
          setDateMode("single");
          setOffers(
            existingOffer.offers.map((o: any) => ({
              id: o.id || Date.now().toString(),
              title: o.title,
              min_spend: String(o.min_spend),
              terms: o.terms || "",
            }))
          );
        }
      }
    } catch (err) {
      console.error("Load offer error:", err);
      Alert.alert("Error", "Failed to load offer details");
    } finally {
      setLoading(false);
    }
  };

  // Check if date is editable
  const isDateEditable = useCallback((date: string): boolean => {
    const today = dayjs().format("YYYY-MM-DD");
    return date > today;
  }, []);

  // Validate offers
  const validateOffers = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate date
    const today = dayjs().format("YYYY-MM-DD");
    const formattedStart = startDate.format("YYYY-MM-DD");

    if (formattedStart <= today) {
      newErrors.date = "Please select a future date (tomorrow or later)";
      isValid = false;
    }

    if (dateMode === "range") {
      const formattedEnd = endDate.format("YYYY-MM-DD");
      if (formattedEnd <= today) {
        newErrors.date = "End date must be in the future";
        isValid = false;
      }
      if (endDate.isBefore(startDate)) {
        newErrors.date = "End date must be after start date";
        isValid = false;
      }
    }

    // Validate each offer
    offers.forEach((offer, index) => {
      if (!offer.title.trim()) {
        newErrors[`offer_${index}_title`] = "Title is required";
        isValid = false;
      }
      if (!offer.min_spend || Number(offer.min_spend) <= 0) {
        newErrors[`offer_${index}_min_spend`] = "Valid minimum spend is required";
        isValid = false;
      }
    });

    // Check for duplicate min_spend values
    const minSpends = offers.map((o) => Number(o.min_spend)).filter((v) => v > 0);
    const uniqueMinSpends = new Set(minSpends);
    if (minSpends.length !== uniqueMinSpends.size) {
      newErrors.duplicate = "Each offer must have a unique minimum spend value";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Update offer field
  const updateOffer = (index: number, field: keyof Offer, value: string) => {
    const updated = [...offers];
    updated[index] = { ...updated[index], [field]: value };
    setOffers(updated);

    // Clear error for this field
    const errorKey = `offer_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  // Add new offer
  const addOffer = () => {
    if (offers.length >= MAX_OFFERS) {
      Alert.alert("Limit Reached", `Maximum ${MAX_OFFERS} offers allowed per day`);
      return;
    }
    setOffers([
      ...offers,
      { id: Date.now().toString(), title: "", min_spend: "", terms: "" },
    ]);
  };

  // Remove offer
  const removeOffer = (index: number) => {
    if (offers.length <= MIN_OFFERS) {
      Alert.alert("Minimum Required", `At least ${MIN_OFFERS} offers are required`);
      return;
    }
    setOffers(offers.filter((_, i) => i !== index));
  };

  // Handle date change
  const handleDateChange = (params: any) => {
    // Clear date error
    if (errors.date) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.date;
        return next;
      });
    }

    if (dateMode === "range") {
      if (params?.startDate) setStartDate(dayjs(params.startDate));
      if (params?.endDate) setEndDate(dayjs(params.endDate));
    } else {
      if (params?.date) {
        setStartDate(dayjs(params.date));
        setEndDate(dayjs(params.date));
      }
    }
  };

  // Save offer
  const saveOffer = async () => {
    if (!validateOffers()) {
      Alert.alert("Validation Error", "Please fix the errors before saving");
      return;
    }

    // Sort offers by min_spend
    const sortedOffers = [...offers].sort(
      (a, b) => Number(a.min_spend) - Number(b.min_spend)
    );

    try {
      setSaving(true);

      const today = dayjs().format("YYYY-MM-DD");

      if (dateMode === "range") {
        // Save for each date in range
        const dates: string[] = [];
        let current = startDate;

        while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
          const dateStr = current.format("YYYY-MM-DD");
          if (dateStr > today) {
            dates.push(dateStr);
          }
          current = current.add(1, "day");
        }

        if (dates.length === 0) {
          Alert.alert("Error", "No valid future dates in the selected range");
          return;
        }

        // Save for each date
        for (const date of dates) {
          await api.post("/saveSellerOffer", {
            date,
            offers: sortedOffers.map((o) => ({
              id: o.id,
              title: o.title.trim(),
              min_spend: Number(o.min_spend),
              terms: o.terms.trim(),
            })),
          });
        }

        Alert.alert(
          "Success!",
          `Offers saved for ${dates.length} day${dates.length > 1 ? "s" : ""}`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        // Single date
        await api.post("/saveSellerOffer", {
          date: startDate.format("YYYY-MM-DD"),
          offers: sortedOffers.map((o) => ({
            id: o.id,
            title: o.title.trim(),
            min_spend: Number(o.min_spend),
            terms: o.terms.trim(),
          })),
        });

        Alert.alert("Success!", "Offer saved successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || "Failed to save offer");
    } finally {
      setSaving(false);
    }
  };

  // Get date display text
  const getDateDisplayText = () => {
    if (dateMode === "range" && !startDate.isSame(endDate, "day")) {
      return `${startDate.format("DD MMM")} - ${endDate.format("DD MMM YYYY")}`;
    }
    return startDate.format("ddd, DD MMM YYYY");
  };

  // Calculate date count for range
  const getDateCount = () => {
    if (dateMode !== "range" || startDate.isSame(endDate, "day")) return 1;
    return endDate.diff(startDate, "day") + 1;
  };

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <AppHeader />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 12, color: theme.colors.onSurface }}>
            Loading offer...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardHeight || 40 },
          ]}
        >
          {/* Title */}
          <View style={styles.titleRow}>
            <MaterialCommunityIcons
              name={isEditMode ? "calendar-edit" : "calendar-plus"}
              size={28}
              color={theme.colors.primary}
            />
            <Text style={[styles.screenTitle, { color: theme.colors.onSurface }]}>
              {isEditMode ? "Edit Offer" : "Create New Offer"}
            </Text>
          </View>

          {/* Date Section */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="calendar" size={22} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Select Date
                </Text>
              </View>

              {/* Date Mode Toggle - disabled in edit mode */}
              {!isEditMode && (
                <View style={styles.dateModeRow}>
                  <TouchableOpacity
                    style={[
                      styles.modeOption,
                      dateMode === "single" && { backgroundColor: theme.colors.primary },
                      dateMode !== "single" && { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                    onPress={() => setDateMode("single")}
                  >
                    <MaterialCommunityIcons
                      name="calendar"
                      size={18}
                      color={dateMode === "single" ? "#fff" : theme.colors.onSurface}
                    />
                    <Text
                      style={[
                        styles.modeOptionText,
                        { color: dateMode === "single" ? "#fff" : theme.colors.onSurface },
                      ]}
                    >
                      Single Day
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeOption,
                      dateMode === "range" && { backgroundColor: theme.colors.primary },
                      dateMode !== "range" && { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                    onPress={() => setDateMode("range")}
                  >
                    <MaterialCommunityIcons
                      name="calendar-range"
                      size={18}
                      color={dateMode === "range" ? "#fff" : theme.colors.onSurface}
                    />
                    <Text
                      style={[
                        styles.modeOptionText,
                        { color: dateMode === "range" ? "#fff" : theme.colors.onSurface },
                      ]}
                    >
                      Date Range
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Date Picker Toggle */}
              <TouchableOpacity
                style={[
                  styles.dateDisplayButton,
                  { borderColor: errors.date ? theme.colors.error : theme.colors.primary },
                ]}
                onPress={() => setShowDatePicker(!showDatePicker)}
                disabled={isEditMode}
              >
                <View style={styles.dateDisplayContent}>
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={22}
                    color={errors.date ? theme.colors.error : theme.colors.primary}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.dateDisplayText, { color: theme.colors.onSurface }]}>
                      {getDateDisplayText()}
                    </Text>
                    {dateMode === "range" && getDateCount() > 1 && (
                      <Text style={[styles.dateCountText, { color: theme.colors.primary }]}>
                        {getDateCount()} days selected
                      </Text>
                    )}
                  </View>
                  {!isEditMode && (
                    <MaterialCommunityIcons
                      name={showDatePicker ? "chevron-up" : "chevron-down"}
                      size={24}
                      color={theme.colors.onSurfaceDisabled}
                    />
                  )}
                </View>
              </TouchableOpacity>

              {errors.date && (
                <HelperText type="error" visible>
                  {errors.date}
                </HelperText>
              )}

              {/* Date Picker */}
              {showDatePicker && !isEditMode && (
                <DatePicker
                  mode={dateMode}
                  date={dateMode === "single" ? startDate : undefined}
                  startDate={dateMode === "range" ? startDate : undefined}
                  endDate={dateMode === "range" ? endDate : undefined}
                  onChange={handleDateChange}
                  minDate={dayjs().add(1, "day")}
                  style={[styles.datePicker, { backgroundColor: theme.colors.surfaceVariant }]}
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
              )}

              {/* Future date info */}
              <View style={[styles.infoBox, { backgroundColor: theme.colors.primaryContainer + "40" }]}>
                <MaterialCommunityIcons name="information" size={18} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.primary }]}>
                  You can only create offers for future dates (tomorrow onwards)
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Offers Section */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="gift" size={22} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Configure Offers
                </Text>
                <Chip compact style={{ marginLeft: "auto" }}>
                  {offers.length}/{MAX_OFFERS}
                </Chip>
              </View>

              <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceDisabled }]}>
                Add {MIN_OFFERS}-{MAX_OFFERS} offers with different minimum spend amounts
              </Text>

              {errors.duplicate && (
                <HelperText type="error" visible style={{ marginBottom: 8 }}>
                  {errors.duplicate}
                </HelperText>
              )}

              {/* Offer List */}
              {offers.map((offer, index) => (
                <Surface
                  key={offer.id}
                  style={[styles.offerCard, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  <View style={styles.offerCardHeader}>
                    <View style={[styles.offerNumber, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.offerNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.offerCardTitle, { color: theme.colors.onSurface }]}>
                      Offer {index + 1}
                    </Text>
                    {offers.length > MIN_OFFERS && (
                      <IconButton
                        icon="close-circle"
                        size={22}
                        iconColor={theme.colors.error}
                        onPress={() => removeOffer(index)}
                        style={{ margin: 0 }}
                      />
                    )}
                  </View>

                  <TextInput
                    label="Offer Title *"
                    placeholder="e.g., Free Coffee"
                    value={offer.title}
                    onChangeText={(v) => updateOffer(index, "title", v)}
                    mode="outlined"
                    dense
                    error={!!errors[`offer_${index}_title`]}
                    left={<TextInput.Icon icon="gift" />}
                    style={styles.input}
                  />
                  {errors[`offer_${index}_title`] && (
                    <HelperText type="error" visible>
                      {errors[`offer_${index}_title`]}
                    </HelperText>
                  )}

                  <TextInput
                    label="Minimum Spend (₹) *"
                    placeholder="e.g., 300"
                    value={offer.min_spend}
                    onChangeText={(v) => updateOffer(index, "min_spend", v.replace(/[^0-9]/g, ""))}
                    mode="outlined"
                    dense
                    keyboardType="numeric"
                    error={!!errors[`offer_${index}_min_spend`]}
                    left={<TextInput.Icon icon="currency-inr" />}
                    style={styles.input}
                  />
                  {errors[`offer_${index}_min_spend`] && (
                    <HelperText type="error" visible>
                      {errors[`offer_${index}_min_spend`]}
                    </HelperText>
                  )}

                  <TextInput
                    label="Terms & Conditions (Optional)"
                    placeholder="e.g., Valid on dine-in only"
                    value={offer.terms}
                    onChangeText={(v) => updateOffer(index, "terms", v)}
                    mode="outlined"
                    dense
                    multiline
                    numberOfLines={2}
                    left={<TextInput.Icon icon="text" />}
                    style={styles.input}
                  />
                </Surface>
              ))}

              {/* Add Offer Button */}
              {offers.length < MAX_OFFERS && (
                <TouchableOpacity
                  style={[styles.addOfferButton, { borderColor: theme.colors.primary }]}
                  onPress={addOffer}
                >
                  <MaterialCommunityIcons name="plus-circle" size={22} color={theme.colors.primary} />
                  <Text style={[styles.addOfferText, { color: theme.colors.primary }]}>
                    Add Another Offer
                  </Text>
                </TouchableOpacity>
              )}
            </Card.Content>
          </Card>

          {/* Preview Section */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="eye" size={22} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Preview
                </Text>
              </View>

              <View style={[styles.previewBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.previewDate, { color: theme.colors.onSurface }]}>
                  {getDateDisplayText()}
                </Text>
                <Divider style={{ marginVertical: 12 }} />

                {offers
                  .filter((o) => o.title && o.min_spend)
                  .sort((a, b) => Number(a.min_spend) - Number(b.min_spend))
                  .map((offer, index) => (
                    <View
                      key={offer.id}
                      style={[
                        styles.previewOffer,
                        { borderLeftColor: theme.colors.primary },
                      ]}
                    >
                      <View style={styles.previewOfferRow}>
                        <Text style={[styles.previewOfferTitle, { color: theme.colors.onSurface }]}>
                          {offer.title || "Untitled Offer"}
                        </Text>
                        <View style={[styles.previewBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                          <Text style={[styles.previewBadgeText, { color: theme.colors.primary }]}>
                            ₹{offer.min_spend || "0"}+
                          </Text>
                        </View>
                      </View>
                      {offer.terms && (
                        <Text style={[styles.previewTerms, { color: theme.colors.onSurfaceDisabled }]}>
                          {offer.terms}
                        </Text>
                      )}
                    </View>
                  ))}

                {offers.filter((o) => o.title && o.min_spend).length === 0 && (
                  <Text style={[styles.previewEmpty, { color: theme.colors.onSurfaceDisabled }]}>
                    Fill in the offers above to see preview
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Button
              variant="outlined"
              onPress={() => router.back()}
              style={{ flex: 1 }}
              disabled={saving}
            >
              Cancel
            </Button>
            <View style={{ width: 12 }} />
            <Button
              variant="contained"
              onPress={saveOffer}
              loading={saving}
              disabled={saving}
              icon="check"
              style={{ flex: 1 }}
            >
              {isEditMode ? "Update" : "Save"}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Saving Overlay */}
      {saving && (
        <View style={[styles.savingOverlay, { backgroundColor: theme.colors.background + "E0" }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.savingText, { color: theme.colors.onSurface }]}>
            Saving offers...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
  },

  // Title
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  // Card
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    marginTop: -4,
  },

  // Date Mode
  dateModeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  modeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modeOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Date Display
  dateDisplayButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  dateDisplayContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateCountText: {
    fontSize: 12,
    marginTop: 2,
  },

  // Date Picker
  datePicker: {
    borderRadius: 12,
    marginVertical: 12,
  },

  // Info Box
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },

  // Offer Card
  offerCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  offerCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  offerNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  offerNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  offerCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
  },
  input: {
    marginBottom: 4,
    backgroundColor: "transparent",
  },

  // Add Offer Button
  addOfferButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  addOfferText: {
    fontSize: 15,
    fontWeight: "600",
  },

  // Preview
  previewBox: {
    padding: 16,
    borderRadius: 12,
  },
  previewDate: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  previewOffer: {
    paddingLeft: 12,
    paddingVertical: 10,
    borderLeftWidth: 3,
    marginBottom: 8,
  },
  previewOfferRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewOfferTitle: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  previewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 10,
  },
  previewBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  previewTerms: {
    fontSize: 12,
    marginTop: 4,
  },
  previewEmpty: {
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },

  // Action Row
  actionRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 20,
  },

  // Saving Overlay
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  savingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
