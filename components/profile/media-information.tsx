import { EditableSection } from "@/components/common";
import { mediaApi } from '@/services/firebaseFunctions';
import { useAuthStore } from "@/store/authStore";
import { SellerMedia } from "@/types/auth";
import { uriToBase64 } from "@/utils/helper";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import { Alert, Image, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

export default function MediaInformation() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const fetchUserDetails = useAuthStore((state) => state.fetchUserDetails);

  const uid = user?.uid;

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

      await mediaApi.updateSellerMedia(payload);

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
    <EditableSection
      title="🖼️ Media Information"
      isEditing={isEditing}
      onEditToggle={setIsEditing}
      isDirty={isDirty}
      isSaving={saving}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      {/* DISPLAY MODE */}
      {!isEditing ? (
        <>
          <View style={{ alignItems: "flex-start" }}>
            <Text style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>Shop Logo</Text>
            <Image
              source={
                logo
                  ? { uri: logo }
                  : require("../../assets/images/shop_logo.png")
              }
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: "#EEE",
              }}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>Shop Banner</Text>
            <Image
              source={
                banner
                  ? { uri: banner }
                  : require("../../assets/images/shop_banner.png")
              }
              style={{
                width: "100%",
                height: 150,
                borderRadius: 12,
                backgroundColor: "#EEE",
              }}
            />
          </View>
        </>
      ) : (
        /* EDIT MODE */
        <>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <Image
              source={
                logo
                  ? { uri: logo }
                  : require("../../assets/images/shop_logo.png")
              }
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: "#EEE",
              }}
            />

            <Button
              mode="outlined"
              icon="image"
              onPress={() => pickImage("logo")}
            >
              Change Logo
            </Button>
          </View>

          <View>
            <Image
              source={
                banner
                  ? { uri: banner }
                  : require("../../assets/images/shop_banner.png")
              }
              style={{
                width: "100%",
                height: 150,
                borderRadius: 12,
                backgroundColor: "#EEE",
              }}
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
        </>
      )}
    </EditableSection>
  );
}
