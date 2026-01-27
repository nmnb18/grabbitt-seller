import { useAuthStore } from "@/store/authStore";
import { isValidEmail, isValidPassword, isValidPhone } from "@/utils/helper";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

// Define a more flexible form data interface
export interface SellerFormData {
  // Step 1: Account & Basic Info
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;

  // Step 2: Business Info
  shopName: string;
  businessType: string;
  category: string;
  description: string;
  establishedYear: string;

  // Step 3: Location
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  enableLocation: boolean;
  locationRadius: string;
  latitude: number | null;
  longitude: number | null;

  // Step 4: Verification (Optional)
  gstNumber: string;
  panNumber: string;
  businessRegistrationNumber: string;

  // Step 5: Preferences
  qrCodeType: string;
  defaultPoints: string;
  subscriptionTier: string;
  acceptTerms: boolean;
  rewardType: string;
  percentageValue: string;
  slabRules: { min: number; max: string; points: string }[];
  upiIds: string[];
  newUpiId: string;
}

export type FormField = keyof SellerFormData;

const initialFormData: SellerFormData = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  phone: "",
  shopName: "",
  businessType: "",
  category: "",
  description: "",
  establishedYear: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  enableLocation: false,
  locationRadius: "100",
  latitude: null,
  longitude: null,
  gstNumber: "",
  panNumber: "",
  businessRegistrationNumber: "",
  qrCodeType: "static",
  defaultPoints: "100",
  subscriptionTier: "free",
  acceptTerms: false,
  rewardType: "default",
  percentageValue: "",
  slabRules: [{ min: 0, max: "", points: "" }],
  upiIds: [],
  newUpiId: "",
};

export const useSellerRegistration = () => {
  const [formData, setFormData] = useState<SellerFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [slabRules, setSlabRules] = useState<
    { min: number; max: string; points: string }[]
  >([{ min: 0, max: "", points: "" }]);

  const router = useRouter();
  const { register } = useAuthStore();

  const updateFormData = (field: FormField, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword ||
          !formData.name
        ) {
          Alert.alert("Error", "Please fill all required fields");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          Alert.alert("Error", "Passwords do not match");
          return false;
        }
        if (!isValidPassword(formData.password)) {
          Alert.alert(
            "Weak Password",
            "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special character."
          );
          return false;
        }
        if (!isValidEmail(formData.email)) {
          Alert.alert("Error", "Please enter valid email.");
          return false;
        }
        if (formData.phone && !isValidPhone(formData.phone)) {
          Alert.alert("Error", "Please enter valid 10 digit phone number.");
          return false;
        }
        return true;

      case 2:
        if (
          !formData.shopName ||
          !formData.businessType ||
          !formData.category ||
          !formData.description
        ) {
          Alert.alert("Error", "Please fill all business information");
          return false;
        }
        return true;

      case 3:
        if (
          !formData.street ||
          !formData.city ||
          !formData.state ||
          !formData.pincode
        ) {
          Alert.alert("Error", "Please fill all address fields");
          return false;
        }
        // Location is now mandatory
        if (!formData.latitude || !formData.longitude) {
          Alert.alert(
            "Location Required",
            "Please enable location and save your coordinates. This helps customers find your store."
          );
          return false;
        }
        return true;

      case 5:
        if (!formData.acceptTerms) {
          Alert.alert("Error", "You must accept the terms and conditions");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const updateSlab = (
    index: number,
    field: "max" | "points",
    value: string
  ) => {
    setSlabRules((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addSlab = () => {
    const last = slabRules[slabRules.length - 1];
    if (!last.max || !last.points) {
      Alert.alert("Incomplete", "Please fill max amount & points first");
      return;
    }
    setSlabRules((prev) => [
      ...prev,
      { min: parseFloat(last.max), max: "", points: "" },
    ]);
  };

  const removeSlab = (index: number) => {
    setSlabRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRegister = async () => {
    if (!validateStep(5)) return;
    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        shopName: formData.shopName,
        phone: formData.phone,
        businessType: formData.businessType,
        category: formData.category,
        description: formData.description,
        establishedYear: formData.establishedYear
          ? parseInt(formData.establishedYear)
          : undefined,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        enableLocation: formData.enableLocation,
        locationRadius: formData.enableLocation
          ? parseInt(formData.locationRadius)
          : undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        gstNumber: formData.gstNumber || undefined,
        panNumber: formData.panNumber || undefined,
        businessRegistrationNumber:
          formData.businessRegistrationNumber || undefined,
        qrCodeType: formData.qrCodeType,
        defaultPoints: parseInt(formData.defaultPoints),
        subscriptionTier: formData.subscriptionTier,
        acceptTerms: formData.acceptTerms,
        rewardType: formData.rewardType,
        percentageValue:
          formData.rewardType === "percentage"
            ? Number(formData.percentageValue)
            : undefined,
        slabRules:
          formData.rewardType === "slab"
            ? slabRules
              .filter((r) => r.max !== "" && r.points !== "")
              .map((r) => ({
                min: r.min,
                max: r.max === "" ? null : Number(r.max),
                points: Number(r.points),
              }))
            : [],
        upiIds: formData.upiIds || [],
      };

      await register(payload);
      Alert.alert(
        "Registration Success",
        "Please login with registered email id and password to continue."
      );
      router.push("/auth/login");
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    updateFormData,
    validateStep,
    handleRegister,
    loading,
    slabRules,
    updateSlab,
    addSlab,
    removeSlab,
  };
};
