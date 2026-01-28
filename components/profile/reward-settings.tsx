/**
 * Reward Settings - Clean, Intuitive UI
 * Focused on simplicity and clear visual hierarchy
 */

import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import {
  Button,
  Card,
  Chip,
  Divider,
  Surface,
  Text,
  TextInput
} from "react-native-paper";

interface SlabRuleUI {
  max: string;
  points: string;
}

interface Offer {
  reward_points: string;
  reward_name: string;
  reward_description: string;
}

// Simplified reward types with clearer descriptions
const REWARD_TYPES = [
  {
    id: "default",
    title: "Fixed Points",
    shortDesc: "Same points every visit",
    icon: "star-circle",
    color: "#10B981", // Green
  },
  {
    id: "percentage",
    title: "Percentage",
    shortDesc: "Based on bill amount",
    icon: "percent-circle",
    color: "#F59E0B", // Amber
  },
  {
    id: "slab",
    title: "Tiered",
    shortDesc: "Spend more, earn more",
    icon: "chart-timeline-variant",
    color: "#8B5CF6", // Purple
  },
];

export default function RewardsSettings() {
  const theme = useTheme();
  const { user, fetchUserDetails } = useAuthStore();

  const uid = user?.uid;
  const rewards = user?.user?.seller_profile?.rewards;
  const upiFromProfile: string[] = rewards?.upi_ids || [];

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const selectedType = REWARD_TYPES.find((t) => t.id === rewardType);

  // Sync state when rewards data changes from parent/store
  useEffect(() => {
    if (!isEditing && rewards) {
      setRewardType(rewards.reward_type || "default");
      setPointsPerVisit(rewards.default_points_value ? String(rewards.default_points_value) : "10");
      setPercentageValue(rewards.percentage_value != null ? String(rewards.percentage_value) : "2");

      if (Array.isArray(rewards.slab_rules) && rewards.slab_rules.length > 0) {
        setSlabRules(rewards.slab_rules.map((r: any) => ({
          max: String(r.max),
          points: String(r.points),
        })));
      }

      if (Array.isArray(rewards.offers) && rewards.offers.length > 0) {
        setOffers(rewards.offers.map((r: any) => ({
          reward_points: String(r.reward_points),
          reward_name: r.reward_name,
          reward_description: r.reward_description,
        })));
      }

      setUpiIds(rewards.upi_ids || []);
    }
  }, [rewards, isEditing]);

  const handleCancel = () => {
    setRewardType(rewards?.reward_type || "default");
    setPointsPerVisit(rewards?.default_points_value ? String(rewards.default_points_value) : "10");
    setPercentageValue(rewards?.percentage_value != null ? String(rewards.percentage_value) : "2");
    setSlabRules(initialSlabRules);
    setOffers(initialOffers);
    setUpiIds(upiFromProfile);
    setIsEditing(false);
    setShowAdvanced(false);
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
      setShowAdvanced(false);
      Alert.alert("Saved", "Reward settings updated successfully.");
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

  // Get current value display
  const getCurrentValueDisplay = () => {
    if (rewardType === "default") return `${pointsPerVisit} pts/scan`;
    if (rewardType === "percentage") return `${percentageValue}% of bill`;
    if (rewardType === "slab") return `${slabRules.length} tiers`;
    return "";
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} testID="reward-settings-card">
      <View style={{ position: "relative" }}>
        <Card.Content>
          {/* Header */}
          <View style={styles.sectionHeader}>
            <Text
              variant="titleMedium"
              style={[styles.cardTitle, { color: theme.colors.onSurface }]}
            >
              🎁 Rewards
            </Text>

            {!isEditing ? (
              <Button
                mode="text"
                icon="pencil"
                compact
                onPress={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <View style={styles.headerButtons}>
                <Button
                  mode="text"
                  onPress={handleCancel}
                  icon="close"
                  disabled={saving}
                  compact
                >
                  Cancel
                </Button>
                <Button
                  mode="text"
                  onPress={handleSave}
                  icon="content-save-outline"
                  disabled={saving}
                  loading={saving}
                  compact
                >
                  Save
                </Button>
              </View>
            )}
          </View>

          {/* VIEW MODE - Clean Summary */}
          {!isEditing ? (
            <View style={styles.viewMode}>
              {/* Active Reward Type Card */}
              <Surface
                style={[
                  styles.activeTypeCard,
                  {
                    backgroundColor: selectedType?.color + "15",
                    borderColor: selectedType?.color + "40",
                  }
                ]}
              >
                <View style={[styles.activeTypeIcon, { backgroundColor: selectedType?.color + "25" }]}>
                  <MaterialCommunityIcons
                    name={selectedType?.icon as any}
                    size={28}
                    color={selectedType?.color}
                  />
                </View>
                <View style={styles.activeTypeInfo}>
                  <Text style={[styles.activeTypeTitle, { color: theme.colors.onSurface }]}>
                    {selectedType?.title}
                  </Text>
                  <Text style={[styles.activeTypeValue, { color: selectedType?.color }]}>
                    {getCurrentValueDisplay()}
                  </Text>
                </View>
                <Chip
                  compact
                  style={{ backgroundColor: theme.colors.success + "20" }}
                  textStyle={{ color: theme.colors.success, fontWeight: "600", fontSize: 11 }}
                >
                  Active
                </Chip>
              </Surface>

              {/* Slab Tiers Preview */}
              {rewardType === "slab" && (
                <View style={styles.tiersPreview}>
                  {slabRules.map((slab, index) => {
                    const prevMax = Number(slabRules[index - 1]?.max || -1);
                    const min = index === 0 ? 0 : prevMax + 1;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.tierRow,
                          { backgroundColor: theme.colors.surfaceVariant }
                        ]}
                      >
                        <Text style={[styles.tierRange, { color: theme.colors.onSurface }]}>
                          ₹{min} - ₹{slab.max}
                        </Text>
                        <View style={[styles.tierPoints, { backgroundColor: theme.colors.primary }]}>
                          <Text style={styles.tierPointsText}>{slab.points}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Quick Stats */}
              <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <MaterialCommunityIcons name="tag-multiple" size={18} color={theme.colors.primary} />
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{offers.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceDisabled }]}>Offers</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <MaterialCommunityIcons name="bank" size={18} color={theme.colors.primary} />
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{upiIds.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceDisabled }]}>UPI IDs</Text>
                </View>
              </View>


            </View>
          ) : (
            /* EDIT MODE - Simplified */
            <View style={styles.editMode}>
              {/* Reward Type Selector - Horizontal Pills */}
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Reward Type
              </Text>

              <View style={styles.typeSelector}>
                {REWARD_TYPES.map((type) => {
                  const isSelected = rewardType === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setRewardType(type.id)}
                      style={[
                        styles.typePill,
                        {
                          backgroundColor: isSelected ? type.color : theme.colors.surfaceVariant,
                          borderColor: isSelected ? type.color : theme.colors.outline,
                        },
                      ]}
                      testID={`reward-type-${type.id}`}
                    >
                      <MaterialCommunityIcons
                        name={type.icon as any}
                        size={20}
                        color={isSelected ? "#fff" : theme.colors.onSurfaceDisabled}
                      />
                      <Text
                        style={[
                          styles.typePillText,
                          { color: isSelected ? "#fff" : theme.colors.onSurface },
                        ]}
                      >
                        {type.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Configuration Based on Type */}
              <Surface style={[styles.configCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                {rewardType === "default" && (
                  <View>
                    <Text style={[styles.configLabel, { color: theme.colors.onSurfaceDisabled }]}>
                      Points awarded per scan
                    </Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        value={pointsPerVisit}
                        onChangeText={setPointsPerVisit}
                        keyboardType="numeric"
                        mode="outlined"
                        style={[styles.configInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        testID="points-input"
                      />
                      <Text style={[styles.inputSuffix, { color: theme.colors.onSurfaceDisabled }]}>points</Text>
                    </View>
                    <Text style={[styles.configHint, { color: theme.colors.onSurfaceDisabled }]}>
                      Customer scans your QR → Gets {pointsPerVisit || "0"} points instantly
                    </Text>
                  </View>
                )}

                {rewardType === "percentage" && (
                  <View>
                    <Text style={[styles.configLabel, { color: theme.colors.onSurfaceDisabled }]}>
                      Percentage of bill as points
                    </Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        value={percentageValue}
                        onChangeText={setPercentageValue}
                        keyboardType="numeric"
                        mode="outlined"
                        style={[styles.configInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        testID="percentage-input"

                      />
                      <Text style={[styles.inputSuffix, { color: theme.colors.onSurfaceDisabled }]}>%</Text>
                    </View>
                    <View style={[styles.exampleBox, { backgroundColor: theme.colors.surface }]}>
                      <Text style={[styles.exampleText, { color: theme.colors.onSurface }]}>
                        Example: ₹500 bill → {Math.floor(500 * (Number(percentageValue) || 0) / 100)} points
                      </Text>
                    </View>
                  </View>
                )}

                {rewardType === "slab" && (
                  <View>
                    <Text style={[styles.configLabel, { color: theme.colors.onSurfaceDisabled }]}>
                      Set spending tiers
                    </Text>

                    {slabRules.map((rule, index) => {
                      const prevMax = Number(slabRules[index - 1]?.max || -1);
                      const min = index === 0 ? 0 : prevMax + 1;
                      return (
                        <View key={index} style={styles.slabRow}>
                          <View style={styles.slabRangeCol}>
                            <Text style={[styles.slabFieldLabel, { color: theme.colors.onSurfaceDisabled }]}>
                              ₹{min} to
                            </Text>
                            <TextInput
                              value={rule.max}
                              onChangeText={(v) => updateSlab(index, "max", v)}
                              keyboardType="numeric"
                              mode="outlined"
                              dense
                              placeholder="Max"
                              style={[styles.slabInput, { backgroundColor: theme.colors.surface }]}
                              outlineColor={theme.colors.outline}
                            />
                          </View>
                          <View style={styles.slabPointsCol}>
                            <Text style={[styles.slabFieldLabel, { color: theme.colors.onSurfaceDisabled }]}>
                              Points
                            </Text>
                            <TextInput
                              value={rule.points}
                              onChangeText={(v) => updateSlab(index, "points", v)}
                              keyboardType="numeric"
                              mode="outlined"
                              dense
                              placeholder="Pts"
                              style={[styles.slabInput, { backgroundColor: theme.colors.surface }]}
                              outlineColor={theme.colors.outline}
                            />
                          </View>
                          {slabRules.length > 1 && (
                            <TouchableOpacity
                              onPress={() => removeSlab(index)}
                              style={styles.removeBtn}
                            >
                              <MaterialCommunityIcons name="close-circle" size={24} color={theme.colors.error} />
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}

                    <TouchableOpacity
                      onPress={addSlab}
                      style={[styles.addTierBtn, { borderColor: theme.colors.primary }]}
                    >
                      <MaterialCommunityIcons name="plus" size={18} color={theme.colors.primary} />
                      <Text style={{ color: theme.colors.primary, fontWeight: "500" }}>Add Tier</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Surface>

              {/* Collapsible Advanced Section */}
              <TouchableOpacity
                onPress={() => setShowAdvanced(!showAdvanced)}
                style={styles.advancedToggle}
              >
                <Text style={[styles.advancedToggleText, { color: theme.colors.primary }]}>
                  {showAdvanced ? "Hide" : "Show"} Advanced Options
                </Text>
                <MaterialCommunityIcons
                  name={showAdvanced ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>

              {showAdvanced && (
                <View style={styles.advancedSection}>
                  {/* Redemption Offers */}
                  <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 8 }]}>
                    Redemption Offers
                  </Text>
                  <Text style={[styles.sectionHint, { color: theme.colors.onSurfaceDisabled }]}>
                    What can customers redeem points for?
                  </Text>

                  {offers.map((offer, index) => (
                    <Surface
                      key={index}
                      style={[styles.offerCard, { backgroundColor: theme.colors.surfaceVariant }]}
                    >
                      <View style={styles.offerHeader}>
                        <Chip compact style={{ backgroundColor: theme.colors.primary + "90" }}>
                          <Text style={{ color: theme.colors.onPrimary, fontSize: 12 }}>Offer {index + 1}</Text>
                        </Chip>
                        {offers.length > 1 && (
                          <TouchableOpacity onPress={() => removeOffer(index)}>
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.error} />
                          </TouchableOpacity>
                        )}
                      </View>

                      <TextInput
                        label="Offer Name"
                        value={offer.reward_name}
                        onChangeText={(v) => updateOffer(index, "reward_name", v)}
                        mode="outlined"
                        style={[styles.offerInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        theme={{
                          colors: {
                            primary: theme.colors.primary,      // focused label color
                            onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                          },
                        }}
                        placeholder="e.g., Free Coffee"
                      />
                      <TextInput
                        label="Points Required"
                        value={offer.reward_points}
                        onChangeText={(v) => updateOffer(index, "reward_points", v)}
                        mode="outlined"
                        keyboardType="numeric"
                        style={[styles.offerInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        theme={{
                          colors: {
                            primary: theme.colors.primary,      // focused label color
                            onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                          },
                        }}
                      />
                    </Surface>
                  ))}

                  <Button
                    mode="outlined"
                    icon="plus"
                    onPress={addOffer}
                    style={styles.addBtn}
                    compact
                  >
                    Add Offer
                  </Button>

                  <Divider style={[styles.sectionDivider, { backgroundColor: theme.colors.outline }]} />

                  {/* UPI IDs */}
                  <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Linked UPI IDs
                  </Text>
                  <Text style={[styles.sectionHint, { color: theme.colors.onSurfaceDisabled }]}>
                    Optional: For payment-based rewards
                  </Text>

                  <View style={styles.upiInputRow}>
                    <TextInput
                      value={newUpi}
                      onChangeText={setNewUpi}
                      mode="outlined"
                      dense
                      style={[styles.upiInput, { backgroundColor: theme.colors.surface }]}
                      placeholder="yourshop@upi"
                    />
                    <Button mode="contained" onPress={handleAddUpi} compact style={styles.upiAddBtn}>
                      Add
                    </Button>
                  </View>

                  {upiIds.length > 0 && (
                    <View style={styles.upiChips}>
                      {upiIds.map((id) => (
                        <Chip
                          key={id}
                          onClose={() => setUpiIds(upiIds.filter((u) => u !== id))}
                          style={{ marginRight: 8, marginBottom: 8 }}
                        >
                          {id}
                        </Chip>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  // View Mode
  viewMode: {
    marginTop: 16,
  },
  activeTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeTypeIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTypeInfo: {
    flex: 1,
    marginLeft: 14,
  },
  activeTypeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeTypeValue: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  tiersPreview: {
    marginTop: 12,
    gap: 6,
  },
  tierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tierRange: {
    fontSize: 14,
  },
  tierPoints: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierPointsText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  upgradeHint: {
    marginTop: 12,
    textAlign: "center",
  },

  // Edit Mode
  editMode: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  sectionHint: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: -6,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  typePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  configCard: {
    padding: 16,
    borderRadius: 12,
  },
  configLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  configInput: {
    flex: 1,
    maxWidth: 120,
  },
  inputSuffix: {
    fontSize: 14,
  },
  configHint: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: "italic",
  },
  exampleBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  exampleText: {
    fontSize: 13,
  },
  slabRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  slabRangeCol: {
    flex: 2,
  },
  slabPointsCol: {
    flex: 1,
  },
  slabFieldLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  slabInput: {
    fontSize: 14,
  },
  removeBtn: {
    paddingBottom: 8,
  },
  addTierBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 4,
  },

  // Advanced Section
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 8,
  },
  advancedToggleText: {
    fontSize: 13,
    fontWeight: "500",
  },
  advancedSection: {
    marginTop: 4,
  },
  sectionDivider: {
    marginVertical: 20,
  },
  offerCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  offerInput: {
    marginBottom: 20,
  },
  addBtn: {
    marginTop: 4,
  },
  upiInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  upiInput: {
    flex: 1,
  },
  upiAddBtn: {
    marginTop: 0,
  },
  upiChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
});
