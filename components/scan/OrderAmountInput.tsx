/**
 * Order Amount Input Screen
 * Shown when seller needs to enter order amount for percentage/slab rewards
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, TextInput, Card, Divider, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme-color";
import { Button } from "@/components/ui/paper-button";
import { GradientHeader } from "@/components/shared/app-header";
import { SlabRule } from "@/hooks/useCustomerScan";

interface OrderAmountInputProps {
  customerName?: string;
  rewardType: "percentage" | "slab";
  percentageValue?: number;
  slabRules?: SlabRule[];
  onSubmit: (amount: number) => void;
  onCancel: () => void;
  calculating?: boolean;
}

export function OrderAmountInput({
  customerName,
  rewardType,
  percentageValue = 0,
  slabRules = [],
  onSubmit,
  onCancel,
  calculating = false,
}: OrderAmountInputProps) {
  const theme = useTheme();
  const [amount, setAmount] = useState("");
  const [calculatedPoints, setCalculatedPoints] = useState<number | null>(null);

  // Calculate points preview as user types
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) {
      setCalculatedPoints(null);
      return;
    }

    if (rewardType === "percentage") {
      setCalculatedPoints(Math.floor((numAmount * percentageValue) / 100));
    } else if (rewardType === "slab") {
      const matchingSlab = slabRules.find(
        (slab) => numAmount >= slab.min && numAmount <= slab.max
      );
      setCalculatedPoints(matchingSlab?.points || 0);
    }
  }, [amount, rewardType, percentageValue, slabRules]);

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onSubmit(numAmount);
    }
  };

  const isValid = parseFloat(amount) > 0 && calculatedPoints !== null && calculatedPoints > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GradientHeader title="Enter Order Amount" onBackPress={onCancel} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Customer Info */}
          {customerName && (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.customerInfo}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={48}
                  color={theme.colors.primary}
                />
                <View style={styles.customerDetails}>
                  <Text style={[styles.customerLabel, { color: theme.colors.onSurfaceDisabled }]}>
                    Customer
                  </Text>
                  <Text style={[styles.customerName, { color: theme.colors.onSurface }]}>
                    {customerName}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Amount Input */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Order Amount
              </Text>
              <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

              <TextInput
                label="Enter amount (₹)"
                value={amount}
                onChangeText={setAmount}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Icon icon="currency-inr" />}
                autoFocus
              />

              {/* Points Preview */}
              {calculatedPoints !== null && (
                <View style={[styles.previewBox, { backgroundColor: theme.colors.primaryContainer }]}>
                  <MaterialCommunityIcons
                    name="star"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <View style={styles.previewText}>
                    <Text style={[styles.previewLabel, { color: theme.colors.onPrimaryContainer }]}>
                      Points to be awarded
                    </Text>
                    <Text style={[styles.previewValue, { color: theme.colors.primary }]}>
                      {calculatedPoints} points
                    </Text>
                  </View>
                </View>
              )}

              {calculatedPoints === 0 && amount && (
                <View style={[styles.warningBox, { backgroundColor: theme.colors.errorContainer }]}>
                  <MaterialCommunityIcons
                    name="alert"
                    size={20}
                    color={theme.colors.error}
                  />
                  <Text style={[styles.warningText, { color: theme.colors.error }]}>
                    Order amount doesn't match any reward tier
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Reward Info */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Reward Configuration
              </Text>
              <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

              {rewardType === "percentage" && (
                <View style={styles.rewardInfo}>
                  <Chip icon="percent" mode="outlined">
                    {percentageValue}% of order amount
                  </Chip>
                  <Text style={[styles.helperText, { color: theme.colors.onSurfaceDisabled }]}>
                    Customer earns {percentageValue}% of their order value as reward points
                  </Text>
                </View>
              )}

              {rewardType === "slab" && slabRules.length > 0 && (
                <View style={styles.slabList}>
                  <Text style={[styles.slabTitle, { color: theme.colors.onSurface }]}>
                    Point Tiers:
                  </Text>
                  {slabRules.map((slab, index) => (
                    <View
                      key={index}
                      style={[
                        styles.slabItem,
                        { backgroundColor: theme.colors.surfaceVariant },
                      ]}
                    >
                      <Text style={{ color: theme.colors.onSurface }}>
                        ₹{slab.min} - ₹{slab.max}
                      </Text>
                      <Chip compact mode="flat" style={{ backgroundColor: theme.colors.primary }}>
                        <Text style={{ color: "#fff" }}>{slab.points} pts</Text>
                      </Chip>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              variant="outlined"
              onPress={onCancel}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onPress={handleSubmit}
              disabled={!isValid || calculating}
              loading={calculating}
              icon="check"
              style={styles.submitButton}
            >
              {`Award ${calculatedPoints || 0} Points`}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  customerDetails: {
    flex: 1,
  },
  customerLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  previewText: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  previewValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
  },
  rewardInfo: {
    gap: 8,
  },
  helperText: {
    fontSize: 13,
    marginTop: 8,
  },
  slabList: {
    gap: 8,
  },
  slabTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  slabItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default OrderAmountInput;
