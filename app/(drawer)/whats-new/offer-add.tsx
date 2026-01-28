import { FormTextInput } from "@/components/form/form-text-input";
import { AppHeader } from "@/components/shared/app-header";
import { GradientText } from "@/components/ui/gradient-text";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import { AppStyles } from "@/utils/theme";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Chip, Divider, Text } from "react-native-paper";
import DatePicker from "react-native-ui-datepicker";

type Offer = {
  id: number;
  title: string;
  min_spend: string;
  terms: string;
};

export default function SellerAddOfferScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [startDate, setStartDate] = useState(dayjs().add(1, "day"));
  const [endDate, setEndDate] = useState(dayjs().add(1, "day"));
  const [dateMode, setDateMode] = useState<"single" | "range">("single");

  const [showPicker, setShowPicker] = useState(false);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height + 20);
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [offers, setOffers] = useState<Offer[]>([
    { id: Date.now(), title: "", min_spend: "", terms: "" },
    { id: Date.now() + 1, title: "", min_spend: "", terms: "" },
  ]);

  const [saving, setSaving] = useState(false);

  const onChangeOffer = (
    index: number,
    key: string,
    value: Offer[keyof Offer]
  ) => {
    const updated = [...offers];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setOffers(updated);
  };

  const addOffer = () => {
    if (offers.length >= 15)
      return Alert.alert("Limit", "You can add max 15 offers.");
    setOffers([
      ...offers,
      { id: Date.now(), title: "", min_spend: "", terms: "" },
    ]);
  };

  const removeOffer = (index: number) => {
    if (offers.length <= 2)
      return Alert.alert("Minimum", "At least 2 offers are required.");
    const updated = offers.filter((_, i) => i !== index);
    setOffers(updated);
  };

  const saveOffer = async () => {
    if (!startDate) return Alert.alert("Error", "Select a date");

    const today = dayjs().format("YYYY-MM-DD");
    const formattedStart = startDate.format("YYYY-MM-DD");

    if (formattedStart <= today)
      return Alert.alert("Validation", "Pick a future date only");

    for (let o of offers) {
      if (!o.title) return Alert.alert("Validation", "Offer title missing");
      if (!o.min_spend) return Alert.alert("Validation", "Min spend required");
    }

    try {
      setSaving(true);

      // If range mode, save for each date in range
      if (dateMode === "range" && endDate) {
        const dates: string[] = [];
        let current = startDate;
        while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
          if (current.format("YYYY-MM-DD") > today) {
            dates.push(current.format("YYYY-MM-DD"));
          }
          current = current.add(1, "day");
        }

        // Save for each date
        for (const date of dates) {
          await api.post("/saveSellerOffer", {
            date: date,
            offers: offers.map((o) => ({
              id: o.id.toString(),
              title: o.title,
              min_spend: Number(o.min_spend),
              terms: o.terms,
            })),
          });
        }

        Alert.alert("Success", `Saved offers for ${dates.length} days!`, [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        // Single date mode
        await api.post("/saveSellerOffer", {
          date: formattedStart,
          offers: offers.map((o) => ({
            id: o.id.toString(),
            title: o.title,
            min_spend: Number(o.min_spend),
            terms: o.terms,
          })),
        });

        Alert.alert("Success", "Saved!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Failed to save offer");
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (params: any) => {
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

  const getDateButtonText = () => {
    if (dateMode === "range" && startDate && endDate && !startDate.isSame(endDate, "day")) {
      return `${startDate.format("DD MMM")} - ${endDate.format("DD MMM YYYY")}`;
    }
    return startDate ? startDate.format("DD MMM YYYY") : "Select a future date";
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
            { paddingBottom: keyboardHeight || AppStyles.spacing.xl },
          ]}
        >
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <GradientText style={styles.title}>Add Offers</GradientText>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                📅 Select Offer Date
              </Text>

              {/* Date Mode Toggle */}
              <View style={styles.dateModeRow}>
                <Chip
                  selected={dateMode === "single"}
                  onPress={() => setDateMode("single")}
                  style={[
                    styles.modeChip,
                    {
                      backgroundColor: dateMode === "single"
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                    },
                  ]}
                  textStyle={{ color: theme.colors.onPrimary }}
                  selectedColor={theme.colors.onPrimary}
                >
                  Single Day
                </Chip>
                <Chip
                  selected={dateMode === "range"}
                  onPress={() => setDateMode("range")}
                  style={[
                    styles.modeChip,
                    {
                      backgroundColor: dateMode === "range"
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                    },
                  ]}
                  textStyle={{ color: theme.colors.onPrimary }}
                  selectedColor={theme.colors.onPrimary}
                >
                  Date Range
                </Chip>
              </View>

              <Button
                mode="outlined"
                onPress={() => setShowPicker(!showPicker)}
                style={{ marginTop: 5 }}
              >
                {getDateButtonText()}
              </Button>

              {showPicker && (
                <DatePicker
                  mode={dateMode}
                  date={dateMode === "single" ? startDate : undefined}
                  startDate={dateMode === "range" ? startDate : undefined}
                  endDate={dateMode === "range" ? endDate : undefined}
                  onChange={handleDateChange}
                  minDate={dayjs().add(1, "day")}
                  style={{
                    backgroundColor: theme.colors.backdrop,
                    marginTop: 10,
                    borderRadius: 15,
                  }}
                  styles={{
                    day_label: {
                      color: theme.colors.onBackground,
                    },
                    weekday_label: {
                      fontWeight: "600",
                      color: theme.colors.onBackground,
                    },
                    year_selector_label: {
                      fontWeight: "600",
                      color: theme.colors.onBackground,
                    },
                    month_selector_label: {
                      fontWeight: "600",
                      color: theme.colors.onBackground,
                    },
                    disabled_label: {
                      color: theme.colors.onSurfaceDisabled,
                    },
                    selected: {
                      color: "#fff",
                      backgroundColor: theme.colors.primary,
                      borderRadius: 10,
                    },
                    selected_label: {
                      color: "#fff",
                    },
                  }}
                />
              )}

              <Divider
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.outline },
                ]}
              />

              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                📝 Offer List (2–15)
              </Text>
              {offers.map((offer, index) => (
                <View key={offer.id} style={styles.offerBlock}>
                  <FormTextInput
                    label="Offer Title *"
                    value={offer.title}
                    onChangeText={(v) => onChangeOffer(index, "title", v)}
                    autoCapitalize="words"
                    leftIcon="gift"
                  />
                  <FormTextInput
                    label="Minimum Spend (₹)"
                    value={offer.min_spend}
                    onChangeText={(v) => onChangeOffer(index, "min_spend", v)}
                    keyboardType="numeric"
                    leftIcon="currency-inr"
                  />
                  <FormTextInput
                    label="Terms & Conditions"
                    value={offer.terms}
                    multiline
                    onChangeText={(v) => onChangeOffer(index, "terms", v)}
                    numberOfLines={3}
                    leftIcon="note-text"
                  />

                  {offers.length > 2 && (
                    <Button
                      icon="delete"
                      textColor={theme.colors.error}
                      onPress={() => removeOffer(index)}
                    >
                      Remove
                    </Button>
                  )}

                  <Divider style={{ marginVertical: 14 }} />
                </View>
              ))}

              <Button
                mode="text"
                icon="plus"
                onPress={addOffer}
                disabled={offers.length >= 15}
              >
                Add Offer
              </Button>

              <View style={styles.saveRow}>
                <Button mode="outlined" onPress={() => router.back()}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={saveOffer} loading={saving}>
                  Save
                </Button>
              </View>
            </Card.Content>

            {/* Saving Overlay */}
            {saving && (
              <View
                style={[
                  styles.overlay,
                  {
                    backgroundColor: theme.dark
                      ? "rgba(0,0,0,0.4)"
                      : "rgba(255,255,255,0.7)",
                  },
                ]}
              >
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 8 }}>Saving…</Text>
              </View>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    borderRadius: 16,
  },
  title: {
    fontWeight: "500",
    fontSize: 18,
    marginBottom: 20,
  },
  divider: {
    marginVertical: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: AppStyles.spacing.md,
    paddingTop: AppStyles.spacing.md,
  },
  offerBlock: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 12,
  },
  saveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  dateModeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  modeChip: {
    flex: 1,
  },
});
