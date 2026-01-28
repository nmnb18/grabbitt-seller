/**
 * Reward Settings - Redesigned UI
 * Clear, visual, step-by-step reward configuration
 */

import api from "@/services/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  Chip,
  Divider,
  HelperText,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { LockedOverlay } from "../shared/locked-overlay";
import { useTheme } from "@/hooks/use-theme-color";

interface SlabRuleUI {
  max: string;
  points: string;
}

interface Offer {
  reward_points: string;
  reward_name: string;
  reward_description: string;
}

// Reward type options with descriptions
const REWARD_TYPES = [
  {
    id: "default",
    title: "Fixed Points",
    description: "Same points for every scan",
    icon: "star-circle",
    example: "e.g., 10 points per visit",
  },
  {
    id: "percentage",
    title: "Percentage",
    description: "Points based on bill amount",
    icon: "percent-circle",
    example: "e.g., 2% of ₹500 = 10 points",
  },
  {
    id: "slab",
    title: "Tiered Rewards",
    description: "Different points for spending ranges",
    icon: "chart-timeline-variant",
    example: "e.g., ₹0-500: 5pts, ₹501-1000: 15pts",
  },
];

export default function RewardsSettings() {
  const theme = useTheme();
  const { user, fetchUserDetails } = useAuthStore();

  const uid = user?.uid;
  const rewards = user?.user?.seller_profile?.rewards;
  const upiFromProfile: string[] = rewards?.upi_ids || [];

  const subscriptionTier = user?.user?.seller_profile?.subscription?.tier || "free";
  const canEdit = subscriptionTier !== "free";

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [rewardType, setRewardType] = useState(rewards?.reward_type || "default");
  const [pointsPerVisit, setPointsPerVisit] = useState(
    rewards?.default_points_value ? String(rewards.default_points_value) : "10"
  );
  const [percentageValue, setPercentageValue] = useState(
    rewards?.percentage_value != null ? String(rewards.percentage_value) : "2"
  );

  const initialSlabRules: SlabRuleUI[] =
    Array.isArray(rewards?.slab_rules) && rewards!.slab_rules.length > 0
      ? rewards!.slab_rules.map((r: any) => ({
          max: String(r.max),
          points: String(r.points),
        }))
      : [{ max: "500", points: "5" }, { max: "1000", points: "15" }];

  const [slabRules, setSlabRules] = useState<SlabRuleUI[]>(initialSlabRules);

  const initialOffers: Offer[] =
    Array.isArray(rewards?.offers) && rewards!.offers.length > 0
      ? rewards!.offers.map((r: any) => ({
          reward_points: String(r.reward_points),
          reward_name: r.reward_name,
          reward_description: r.reward_description,
        }))
      : [{ reward_points: "100", reward_name: "Free Coffee", reward_description: "Redeem 100 points for a free coffee" }];

  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [upiIds, setUpiIds] = useState<string[]>(upiFromProfile);
  const [newUpi, setNewUpi] = useState("");

  // Get the currently selected reward type config
  const selectedType = REWARD_TYPES.find((t) => t.id === rewardType);

  const handleCancel = () => {
    setRewardType(rewards?.reward_type || "default");
    setPointsPerVisit(rewards?.default_points_value ? String(rewards.default_points_value) : "10");
    setPercentageValue(rewards?.percentage_value != null ? String(rewards.percentage_value) : "2");
    setSlabRules(initialSlabRules);
    setOffers(initialOffers);
    setUpiIds(upiFromProfile);
    setIsEditing(false);
  };

  const buildNumericSlabs = (): { min: number; max: number; points: number }[] => {
    const numericSlabs: { min: number; max: number; points: number }[] = [];
    let lastMax = -1;

    for (let i = 0; i < slabRules.length; i++) {
      const s = slabRules[i];
      const max = Number(s.max);
      const pts = Number(s.points);

      if (!max || max <= 0 || !pts || pts <= 0) {
        throw new Error("Please fill valid max amount and points for all tiers.");
      }
      if (max <= lastMax) {
        throw new Error("Each tier's max amount must be greater than the previous tier.");
      }

      const min = lastMax + 1;
      numericSlabs.push({ min, max, points: pts });
      lastMax = max;
    }

    return numericSlabs;
  };

  const handleSave = async () => {
    // Validate based on reward type
    if (rewardType === "percentage") {
      const pct = Number(percentageValue);
      if (!percentageValue || isNaN(pct) || pct <= 0 || pct > 100) {
        return Alert.alert("Invalid Percentage", "Enter a value between 1 and 100.");
      }
    }

    if (rewardType === "default") {
      const pts = Number(pointsPerVisit);
      if (!pointsPerVisit || isNaN(pts) || pts <= 0) {
        return Alert.alert("Invalid Points", "Enter points greater than 0.");
      }
    }

    let numericSlabs: { min: number; max: number; points: number }[] = [];
    if (rewardType === "slab") {
      try {
        numericSlabs = buildNumericSlabs();
      } catch (e: any) {
        return Alert.alert("Invalid Tiers", e.message);
      }
    }

    try {
      setSaving(true);

      await api.patch("/updateSellerProfile", {
        section: "rewards",
        data: {
          default_points_value: Number(pointsPerVisit),
          offers: offers,
          reward_type: rewardType,
          percentage_value: percentageValue ? Number(percentageValue) : 0,
          slab_rules: numericSlabs,
          upi_ids: upiIds,
          payment_reward_enabled: upiIds?.length > 0,
        },
      });

      if (uid) await fetchUserDetails(uid, "seller");
      setIsEditing(false);
      Alert.alert("✓ Saved", "Reward settings updated successfully.");
    } catch (err: any) {
      console.error("Save Error:", err?.response || err);
      Alert.alert("Error", err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Slab helpers
  const updateSlab = (index: number, field: "max" | "points", value: string) => {
    const updated = [...slabRules];
    updated[index][field] = value;
    setSlabRules(updated);
  };

  const addSlab = () => setSlabRules([...slabRules, { max: "", points: "" }]);
  const removeSlab = (index: number) => setSlabRules(slabRules.filter((_, i) => i !== index));

  // Offer helpers
  const updateOffer = (index: number, field: keyof Offer, value: string) => {
    const updated = [...offers];
    updated[index][field] = value;
    setOffers(updated);
  };

  const addOffer = () => setOffers([...offers, { reward_points: "", reward_name: "", reward_description: "" }]);
  const removeOffer = (index: number) => setOffers(offers.filter((_, i) => i !== index));

  // UPI helpers
  const validateUpi = (value: string): string | null => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return "UPI ID cannot be empty.";
    const upiRegex = /^[a-zA-Z0-9.\-]{3,}@[a-zA-Z0-9.\-]+$/;
    if (!upiRegex.test(trimmed)) return "Invalid format (e.g. shop@upi)";
    if (upiIds.includes(trimmed)) return "Already added.";
    return null;
  };

  const handleAddUpi = () => {
    const err = validateUpi(newUpi);
    if (err) return Alert.alert("Invalid UPI", err);
    setUpiIds([...upiIds, newUpi.trim().toLowerCase()]);
    setNewUpi("");
  };

  // Calculate preview points
  const getPreviewPoints = (amount: number): number => {
    if (rewardType === "default") return Number(pointsPerVisit) || 0;
    if (rewardType === "percentage") return Math.floor((amount * (Number(percentageValue) || 0)) / 100);
    if (rewardType === "slab") {
      let lastMax = -1;
      for (const slab of slabRules) {
        const min = lastMax + 1;
        const max = Number(slab.max);
        if (amount >= min && amount <= max) return Number(slab.points) || 0;
        lastMax = max;
      }
    }
    return 0;
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={{ position: "relative" }}>
        <Card.Content>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="gift" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                Reward Settings
              </Text>
            </View>

            {!isEditing ? (
              <Button mode="text" icon="pencil" compact onPress={() => canEdit && setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <View style={styles.headerButtons}>
                <Button mode="text" icon="close" compact onPress={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button mode="contained" compact onPress={handleSave} loading={saving} disabled={saving}>
                  Save
                </Button>
              </View>
            )}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

          {/* VIEW MODE */}
          {!isEditing ? (
            <View>
              {/* Current Reward Type */}
              <Surface style={[styles.typePreview, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons
                  name={selectedType?.icon as any}
                  size={40}
                  color={theme.colors.primary}
                />
                <View style={styles.typePreviewText}>
                  <Text style={[styles.typePreviewTitle, { color: theme.colors.onPrimaryContainer }]}>
                    {selectedType?.title}
                  </Text>
                  <Text style={[styles.typePreviewDesc, { color: theme.colors.onPrimaryContainer }]}>
                    {rewardType === "default" && `${pointsPerVisit} points per scan`}
                    {rewardType === "percentage" && `${percentageValue}% of bill amount`}
                    {rewardType === "slab" && `${slabRules.length} reward tiers`}
                  </Text>
                </View>
              </Surface>

              {/* Slab preview */}
              {rewardType === "slab" && (
                <View style={styles.slabPreview}>
                  <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceDisabled }]}>
                    Reward Tiers
                  </Text>
                  {slabRules.map((slab, index) => {
                    const prevMax = Number(slabRules[index - 1]?.max || -1);
                    const min = index === 0 ? 0 : prevMax + 1;
                    return (
                      <View key={index} style={[styles.slabPreviewItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={{ color: theme.colors.onSurface }}>
                          ₹{min} - ₹{slab.max || "∞"}
                        </Text>
                        <Chip compact style={{ backgroundColor: theme.colors.primary }}>
                          <Text style={{ color: "#fff", fontWeight: "600" }}>{slab.points} pts</Text>
                        </Chip>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Offers preview */}
              <View style={styles.offersPreview}>
                <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceDisabled }]}>
                  Redemption Offers ({offers.length})
                </Text>
                {offers.slice(0, 3).map((offer, index) => (
                  <View key={index} style={[styles.offerItem, { borderColor: theme.colors.outline }]}>
                    <View style={styles.offerItemLeft}>
                      <MaterialCommunityIcons name="tag" size={18} color={theme.colors.primary} />
                      <Text style={{ color: theme.colors.onSurface, fontWeight: "500" }}>
                        {offer.reward_name || "Unnamed Offer"}
                      </Text>
                    </View>
                    <Chip compact>{offer.reward_points} pts</Chip>
                  </View>
                ))}
              </View>

              {/* UPI preview */}
              {upiIds.length > 0 && (
                <View style={styles.upiPreview}>
                  <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceDisabled }]}>
                    Linked UPI IDs
                  </Text>
                  <View style={styles.chipRow}>
                    {upiIds.map((id) => (
                      <Chip key={id} icon="bank" compact style={styles.upiChip}>
                        {id}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              {subscriptionTier === "free" && (
                <HelperText type="error" style={{ marginTop: 12 }}>
                  Rewards are locked on the Free plan. Upgrade to customize.
                </HelperText>
              )}
            </View>
          ) : (
            /* EDIT MODE */
            <View>
              {/* Step 1: Choose Reward Type */}
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Step 1: Choose how customers earn points
              </Text>

              <View style={styles.typeCards}>
                {REWARD_TYPES.map((type) => {
                  const isSelected = rewardType === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setRewardType(type.id)}
                      activeOpacity={0.8}
                    >
                      <Surface
                        style={[
                          styles.typeCard,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.primaryContainer
                              : theme.colors.surfaceVariant,
                            borderColor: isSelected ? theme.colors.primary : "transparent",
                            borderWidth: isSelected ? 2 : 0,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={type.icon as any}
                          size={32}
                          color={isSelected ? theme.colors.primary : theme.colors.onSurfaceDisabled}
                        />
                        <Text
                          style={[
                            styles.typeCardTitle,
                            { color: isSelected ? theme.colors.primary : theme.colors.onSurface },
                          ]}
                        >
                          {type.title}
                        </Text>
                        <Text style={[styles.typeCardDesc, { color: theme.colors.onSurfaceDisabled }]}>
                          {type.description}
                        </Text>
                        {isSelected && (
                          <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary }]}>
                            <MaterialCommunityIcons name="check" size={14} color="#fff" />
                          </View>
                        )}
                      </Surface>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Step 2: Configure based on type */}
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface, marginTop: 24 }]}>
                Step 2: Configure your {selectedType?.title?.toLowerCase()} rewards
              </Text>

              {rewardType === "default" && (
                <View style={styles.configSection}>
                  <TextInput
                    label="Points per scan"
                    value={pointsPerVisit}
                    onChangeText={setPointsPerVisit}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="star" />}
                  />
                  <HelperText type="info">
                    Every customer scan earns {pointsPerVisit || "0"} points
                  </HelperText>
                </View>
              )}

              {rewardType === "percentage" && (
                <View style={styles.configSection}>
                  <TextInput
                    label="Percentage of bill (%)"
                    value={percentageValue}
                    onChangeText={setPercentageValue}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="percent" />}
                  />
                  <Surface style={[styles.previewBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={{ color: theme.colors.onSurfaceDisabled }}>Preview:</Text>
                    <Text style={{ color: theme.colors.onSurface, fontWeight: "600" }}>
                      ₹500 bill → {getPreviewPoints(500)} points
                    </Text>
                  </Surface>
                </View>
              )}

              {rewardType === "slab" && (
                <View style={styles.configSection}>
                  {slabRules.map((rule, index) => {
                    const prevMax = Number(slabRules[index - 1]?.max || -1);
                    const min = index === 0 ? 0 : prevMax + 1;
                    return (
                      <Surface
                        key={index}
                        style={[styles.slabCard, { backgroundColor: theme.colors.surfaceVariant }]}
                      >
                        <View style={styles.slabHeader}>
                          <Text style={[styles.slabLabel, { color: theme.colors.primary }]}>
                            Tier {index + 1}
                          </Text>
                          {slabRules.length > 1 && (
                            <TouchableOpacity onPress={() => removeSlab(index)}>
                              <MaterialCommunityIcons name="close-circle" size={22} color={theme.colors.error} />
                            </TouchableOpacity>
                          )}
                        </View>

                        <View style={styles.slabInputRow}>
                          <View style={styles.slabInputHalf}>
                            <Text style={[styles.slabInputLabel, { color: theme.colors.onSurfaceDisabled }]}>
                              From ₹
                            </Text>
                            <TextInput
                              value={String(min)}
                              mode="outlined"
                              editable={false}
                              dense
                              style={styles.slabInput}
                            />
                          </View>
                          <View style={styles.slabInputHalf}>
                            <Text style={[styles.slabInputLabel, { color: theme.colors.onSurfaceDisabled }]}>
                              To ₹
                            </Text>
                            <TextInput
                              value={rule.max}
                              onChangeText={(v) => updateSlab(index, "max", v)}
                              mode="outlined"
                              keyboardType="numeric"
                              dense
                              style={styles.slabInput}
                            />
                          </View>
                          <View style={styles.slabInputHalf}>
                            <Text style={[styles.slabInputLabel, { color: theme.colors.onSurfaceDisabled }]}>
                              Points
                            </Text>
                            <TextInput
                              value={rule.points}
                              onChangeText={(v) => updateSlab(index, "points", v)}
                              mode="outlined"
                              keyboardType="numeric"
                              dense
                              style={styles.slabInput}
                            />
                          </View>
                        </View>
                      </Surface>
                    );
                  })}

                  <Button mode="outlined" icon="plus" onPress={addSlab} style={styles.addButton}>
                    Add Tier
                  </Button>
                </View>
              )}

              {/* Step 3: Redemption Offers */}
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface, marginTop: 24 }]}>
                Step 3: Set up redemption offers
              </Text>

              <View style={styles.configSection}>
                {offers.map((offer, index) => (
                  <Surface
                    key={index}
                    style={[styles.offerCard, { backgroundColor: theme.colors.surfaceVariant }]}
                  >
                    <View style={styles.offerCardHeader}>
                      <Text style={[styles.offerCardLabel, { color: theme.colors.primary }]}>
                        Offer {index + 1}
                      </Text>
                      {offers.length > 1 && (
                        <TouchableOpacity onPress={() => removeOffer(index)}>
                          <MaterialCommunityIcons name="close-circle" size={22} color={theme.colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>

                    <TextInput
                      label="Offer Name"
                      value={offer.reward_name}
                      onChangeText={(v) => updateOffer(index, "reward_name", v)}
                      mode="outlined"
                      dense
                      style={styles.offerInput}
                      left={<TextInput.Icon icon="tag" />}
                    />
                    <TextInput
                      label="Points Required"
                      value={offer.reward_points}
                      onChangeText={(v) => updateOffer(index, "reward_points", v)}
                      mode="outlined"
                      keyboardType="numeric"
                      dense
                      style={styles.offerInput}
                      left={<TextInput.Icon icon="star" />}
                    />
                    <TextInput
                      label="Description (optional)"
                      value={offer.reward_description}
                      onChangeText={(v) => updateOffer(index, "reward_description", v)}
                      mode="outlined"
                      dense
                      multiline
                      style={styles.offerInput}
                    />
                  </Surface>
                ))}

                <Button mode="outlined" icon="plus" onPress={addOffer} style={styles.addButton}>
                  Add Offer
                </Button>
              </View>

              {/* Optional: UPI IDs */}
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface, marginTop: 24 }]}>
                Optional: Link UPI IDs
              </Text>

              <View style={styles.configSection}>
                <View style={styles.upiInputRow}>
                  <TextInput
                    label="UPI ID"
                    value={newUpi}
                    onChangeText={setNewUpi}
                    mode="outlined"
                    dense
                    style={styles.upiInput}
                    placeholder="shop@upi"
                  />
                  <Button mode="contained" onPress={handleAddUpi} style={styles.upiAddBtn}>
                    Add
                  </Button>
                </View>

                {upiIds.length > 0 && (
                  <View style={styles.chipRow}>
                    {upiIds.map((id) => (
                      <Chip key={id} onClose={() => setUpiIds(upiIds.filter((u) => u !== id))}>
                        {id}
                      </Chip>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </Card.Content>

        {/* Saving Overlay */}
        {saving && (
          <View style={[styles.overlay, { backgroundColor: theme.dark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)" }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: 8, color: theme.colors.onSurface }}>Saving...</Text>
          </View>
        )}

        {/* Locked for Free Plan */}
        {!canEdit && <LockedOverlay message="Upgrade to customize rewards" />}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  title: {
    fontWeight: "700",
  },
  divider: {
    marginVertical: 16,
  },

  // View mode
  typePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 12,
  },
  typePreviewText: {
    flex: 1,
  },
  typePreviewTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  typePreviewDesc: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  slabPreview: {
    marginTop: 8,
  },
  slabPreviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  offersPreview: {
    marginTop: 8,
  },
  offerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  offerItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  upiPreview: {
    marginTop: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  upiChip: {
    marginRight: 4,
  },

  // Edit mode
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  typeCards: {
    gap: 12,
  },
  typeCard: {
    padding: 16,
    borderRadius: 12,
    position: "relative",
  },
  typeCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  typeCardDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  selectedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  configSection: {
    marginTop: 8,
  },
  input: {
    marginBottom: 8,
  },
  previewBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },

  // Slab edit
  slabCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  slabHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  slabLabel: {
    fontWeight: "600",
  },
  slabInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  slabInputHalf: {
    flex: 1,
  },
  slabInputLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  slabInput: {
    fontSize: 14,
  },
  addButton: {
    marginTop: 8,
  },

  // Offer edit
  offerCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  offerCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  offerCardLabel: {
    fontWeight: "600",
  },
  offerInput: {
    marginBottom: 8,
  },

  // UPI edit
  upiInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  upiInput: {
    flex: 1,
  },
  upiAddBtn: {
    marginTop: 6,
  },

  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    zIndex: 100,
  },
});
