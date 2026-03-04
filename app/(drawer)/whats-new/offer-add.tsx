/**
 * Add/Edit Offer Screen - Refactored
 * Uses custom hooks and reusable components for:
 * - Date selection (single/range)
 * - Offer form management
 * - Offer preview
 * - State management via useOffers hook
 */

import { LoadingOverlay } from "@/components/common/loading-overlay";
import { GradientHeader } from "@/components/shared/app-header";
import { Button } from "@/components/ui/paper-button";
import { DateSelector } from "@/components/whats-new/date-selector";
import { Offer, OfferForm } from "@/components/whats-new/offer-form";
import { OfferPreview } from "@/components/whats-new/offer-preview";
import { useOffers, useOfferState, useOfferValidation, useSaveOffer } from "@/hooks";
import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { Text } from "react-native-paper";

export default function AddOfferScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ editDate?: string }>();
  const { loadExistingOffer, fetchOffers } = useOffers();

  const isEditMode = !!params.editDate;
  const editDate = params.editDate;

  // Use custom hooks for state and validation
  const {
    dateMode,
    setDateMode,
    startDate,
    endDate,
    offers,
    setOffers,
    setStartDate,
    setEndDate,
    updateOffer,
    addOffer,
    removeOffer,
    handleDateChange,
  } = useOfferState();

  const { errors, setErrors, validateOffers, clearFieldError, clearDateError, checkOfferLimit, MAX_OFFERS, MIN_OFFERS } =
    useOfferValidation();

  const { saveOffer: saveOfferAPI } = useSaveOffer();

  // UI state
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollContentStyle = useMemo(
    () => ({
      padding: 16,
      paddingBottom: keyboardHeight || 40,
    }),
    [keyboardHeight]
  );

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
  const loadExistingOfferData = useCallback(
    async (date: string) => {
      try {
        setLoading(true);

        const parsedDate = dayjs(date);
        if (parsedDate.isValid()) {
          setDateMode("single");
          setStartDate(parsedDate);
          setEndDate(parsedDate);
        }

        const existingOffer = await loadExistingOffer(date);

        if (existingOffer) {
          setOffers(
            existingOffer.offers.map((o: any) => ({
              id: o.id || Date.now().toString(),
              title: o.title,
              min_spend: String(o.min_spend),
              terms: o.terms || "",
            }))
          );
        }
      } catch (err) {
        console.error("Load offer error:", err);
        Alert.alert("Error", "Failed to load offer details");
      } finally {
        setLoading(false);
      }
    },
    [loadExistingOffer, setDateMode, setEndDate, setOffers, setStartDate]
  );

  useEffect(() => {
    if (isEditMode && editDate) {
      loadExistingOfferData(editDate);
    }
  }, [isEditMode, editDate, loadExistingOfferData]);

  // Update offer with error clearing
  const handleUpdateOffer = useCallback(
    (index: number, field: keyof Offer, value: string) => {
      updateOffer(index, field, value);
      clearFieldError(`offer_${index}_${field}`);
    },
    [updateOffer, clearFieldError]
  );

  // Add offer with limit check
  const handleAddOffer = useCallback(() => {
    if (checkOfferLimit(offers.length, true)) {
      addOffer();
    }
  }, [offers.length, checkOfferLimit, addOffer]);

  // Remove offer with minimum check
  const handleRemoveOffer = useCallback(
    (index: number) => {
      if (checkOfferLimit(offers.length, false)) {
        removeOffer(index);
      }
    },
    [offers.length, checkOfferLimit, removeOffer]
  );

  // Handle date change with error clearing
  const handleDateChangeWithErrorClear = useCallback(
    (params: any) => {
      clearDateError();
      handleDateChange(params);
    },
    [handleDateChange, clearDateError]
  );

  // Save offer
  const saveOffer = useCallback(async () => {
    if (!validateOffers(offers, startDate, endDate, dateMode)) {
      Alert.alert("Validation Error", "Please fix the errors before saving");
      return;
    }

    try {
      setSaving(true);
      const result = await saveOfferAPI(dateMode, startDate, endDate, offers, isEditMode);

      Alert.alert("Success!", result.message, [
        {
          text: "OK",
          onPress: () => {
            fetchOffers();
            router.back();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save offer");
    } finally {
      setSaving(false);
    }
  }, [validateOffers, offers, startDate, endDate, dateMode, saveOfferAPI, isEditMode, fetchOffers, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <GradientHeader title="Offers" />
        <LoadingOverlay visible={loading} message="Loading offer..." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <GradientHeader title="Offers" />
      {saving && <LoadingOverlay visible={saving} message="Saving offers..." />}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollContentStyle}
        >
          {/* Title */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <MaterialCommunityIcons
              name={isEditMode ? "calendar-edit" : "calendar-plus"}
              size={28}
              color={theme.colors.primary}
            />
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: theme.colors.onSurface,
              }}
            >
              {isEditMode ? "Edit Offer" : "Create New Offer"}
            </Text>
          </View>

          {/* Date Selector Component */}
          <DateSelector
            dateMode={dateMode}
            startDate={startDate}
            endDate={endDate}
            onDateModeChange={setDateMode}
            onDateChange={handleDateChangeWithErrorClear}
            error={errors.date}
            isEditMode={isEditMode}
            readOnly={isEditMode}
          />

          {/* Offer Form Component */}
          <OfferForm
            offers={offers}
            errors={errors}
            onUpdateOffer={handleUpdateOffer}
            onAddOffer={handleAddOffer}
            onRemoveOffer={handleRemoveOffer}
            maxOffers={MAX_OFFERS}
            minOffers={MIN_OFFERS}
          />

          {/* Preview Component */}
          <OfferPreview date={startDate} offers={offers} />

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", marginTop: 8, marginBottom: 20 }}>
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
    </View>
  );
}