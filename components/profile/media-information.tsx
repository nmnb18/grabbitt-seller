import api from "@/services/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { SellerMedia } from "@/types/auth";
import { uriToBase64 } from "@/utils/helper";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Divider, Text, useTheme } from "react-native-paper";

export default function MediaInformation() {
  const theme = useTheme();
  const { user, fetchUserDetails } = useAuthStore();

  const uid = user?.uid;
  const idToken = user?.idToken;

  const media = user?.user?.seller_profile?.media || ({} as SellerMedia);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [logo, setLogo] = useState<string | null>(media?.logo_url || null);
  const [banner, setBanner] = useState<string | null>(
    media?.banner_url || null
  );

  const [initial, setInitial] = useState({
    logo: media?.logo_url || null,
    banner: media?.banner_url || null,
  });

  const isDirty = useMemo(
    () => logo !== initial.logo || banner !== initial.banner,
    [logo, banner, initial]
  );

  const pickImage = async (type: "logo" | "banner") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Denied", "Media access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: false,
      aspect: type === "logo" ? [1, 1] : [16, 9],
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === "logo") setLogo(uri);
      if (type === "banner") setBanner(uri);
    }
  };

  const handleCancel = () => {
    setLogo(initial.logo);
    setBanner(initial.banner);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload: any = {};

      if (logo && logo !== initial.logo) {
        payload.logo = await uriToBase64(logo);
      }

      if (banner && banner !== initial.banner) {
        payload.banner = await uriToBase64(banner);
      }

      await api.post("/updateSellerMedia", payload);

      if (uid) await fetchUserDetails(uid, "seller");

      setInitial({ logo, banner });
      setIsEditing(false);

      Alert.alert("Success", "Media updated successfully.");
    } catch (err: any) {
      console.error("Update Media Error:", err.response || err);
      Alert.alert(
        "Error",
        err.response?.data?.error || "Failed to update media."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={{ position: "relative" }}>
        <Card.Content>
          {/* HEADER */}
          <View style={styles.sectionHeader}>
            <Text
              variant="titleMedium"
              style={[styles.cardTitle, { color: theme.colors.onSurface }]}
            >
              🖼️ Media Information
            </Text>

            {!isEditing ? (
              <Button
                mode="text"
                onPress={() => setIsEditing(true)}
                icon="pencil"
                compact
              >
                Edit
              </Button>
            ) : (
              <View style={styles.editButtons}>
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
                  disabled={!isDirty || saving}
                  loading={saving}
                  compact
                >
                  Save
                </Button>
              </View>
            )}
          </View>

          <Divider
            style={[styles.divider, { backgroundColor: theme.colors.outline }]}
          />

          {/* DISPLAY MODE */}
          {!isEditing ? (
            <View>
              {/* LOGO */}
              <View style={styles.mediaRow}>
                <Text style={styles.label}>Shop Logo</Text>
                <Image
                  source={
                    logo
                      ? { uri: logo }
                      : require("../../assets/images/shop_logo.png")
                  }
                  style={styles.logo}
                />
              </View>

              {/* BANNER */}
              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>Shop Banner</Text>
                <Image
                  source={
                    banner
                      ? { uri: banner }
                      : require("../../assets/images/shop_banner.png")
                  }
                  style={styles.banner}
                />
              </View>
            </View>
          ) : (
            /* EDIT MODE */
            <View>
              <View style={styles.editRow}>
                <Image
                  source={
                    logo
                      ? { uri: logo }
                      : require("../../assets/images/shop_logo.png")
                  }
                  style={styles.logo}
                />

                <Button
                  mode="outlined"
                  icon="image"
                  onPress={() => pickImage("logo")}
                >
                  Change Logo
                </Button>
              </View>

              <View style={{ marginTop: 20 }}>
                <Image
                  source={
                    banner
                      ? { uri: banner }
                      : require("../../assets/images/shop_banner.png")
                  }
                  style={styles.banner}
                />

                <Button
                  mode="outlined"
                  icon="image"
                  onPress={() => pickImage("banner")}
                  style={{ marginTop: 8 }}
                >
                  Change Banner
                </Button>
              </View>
            </View>
          )}
        </Card.Content>

        {/* SAVING OVERLAY */}
        {saving && (
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: theme.dark
                  ? "rgba(0,0,0,0.5)"
                  : "rgba(255,255,255,0.7)",
              },
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              style={[styles.overlayText, { color: theme.colors.onSurface }]}
            >
              Saving…
            </Text>
          </View>
        )}
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

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },

  editButtons: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  cardTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },

  divider: {
    marginBottom: 16,
    height: 1,
  },

  label: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 6,
  },

  mediaRow: {
    alignItems: "flex-start",
  },

  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EEE",
  },

  banner: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    backgroundColor: "#EEE",
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

  overlayText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
