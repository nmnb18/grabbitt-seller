import { useAuthStore } from "@/store/authStore";
import { isValidEmail, isValidPassword, isValidPhone } from "@/utils/helper";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useMultiStepForm } from "./useMultiStepForm";

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

// Step-based validators
const stepValidators = {
  1: (values: SellerFormData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!values.email || !values.password || !values.confirmPassword || !values.name) {
      errors.push("Please fill all required fields");
    }
    if (values.password !== values.confirmPassword) {
      errors.push("Passwords do not match");
    }
    if (!isValidPassword(values.password)) {
      errors.push(
        "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special character."
      );
    }
    if (!isValidEmail(values.email)) {
      errors.push("Please enter a valid email");
    }
    if (values.phone && !isValidPhone(values.phone)) {
      errors.push("Please enter a valid 10 digit phone number");
    }

    return { valid: errors.length === 0, errors };
  },

  2: (values: SellerFormData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!values.shopName || !values.businessType || !values.category || !values.description) {
      errors.push("Please fill all business information");
    }

    return { valid: errors.length === 0, errors };
  },

  3: (values: SellerFormData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!values.street || !values.city || !values.state || !values.pincode) {
      errors.push("Please fill all address fields");
    }

    if (!values.latitude || !values.longitude) {
      errors.push(
        "Location is required. Please enable location and save your coordinates."
      );
    }

    return { valid: errors.length === 0, errors };
  },

  4: (values: SellerFormData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!values.panNumber) {
      errors.push("PAN number is required");
    }

    return { valid: errors.length === 0, errors };
  },

  5: (values: SellerFormData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!values.acceptTerms) {
      errors.push("You must accept the terms and conditions");
    }

    return { valid: errors.length === 0, errors };
  },
};

export const useSellerRegistration = () => {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [loading, setLoading] = useState(false)

  const form = useMultiStepForm<SellerFormData>({
    initialValues: initialFormData,
    stepValidators,
    totalSteps: 5,
    alertHandler: (title, message) => Alert.alert(title, message),
  });

  // Shorthand for formData and updateFormData for backward compatibility
  const formData = form.values;
  const updateFormData = (field: FormField, value: any) => {
    form.setValue(field, value);
  };

  // Slab management helpers
  const updateSlab = useCallback(
    (index: number, field: "max" | "points", value: string) => {
      const updated = formData.slabRules.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      );
      updateFormData("slabRules", updated);
    },
    [formData.slabRules, updateFormData]
  );

  const addSlab = useCallback(() => {
    const last = formData.slabRules[formData.slabRules.length - 1];
    if (!last.max || !last.points) {
      Alert.alert("Incomplete", "Please fill max amount & points first");
      return;
    }
    const newSlab = { min: parseFloat(last.max), max: "", points: "" };
    updateFormData("slabRules", [...formData.slabRules, newSlab]);
  }, [formData.slabRules, updateFormData]);

  const removeSlab = useCallback(
    (index: number) => {
      const updated = formData.slabRules.filter((_, i) => i !== index);
      updateFormData("slabRules", updated);
    },
    [formData.slabRules, updateFormData]
  );

  // Register handler
  const handleRegister = useCallback(async () => {
    if (!form.validateStep(5)) return;

    try {
      form.setError("_form" as any, ""); // Clear form errors
      setLoading(true);
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
        businessRegistrationNumber: formData.businessRegistrationNumber || undefined,
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
            ? formData.slabRules
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
        "Please verify you email and wait for yoPERKS Team approval."
      );
      setLoading(false)
      router.push("/auth/login");
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Registration failed";

      form.setError("_form" as any, message);
      Alert.alert("Registration Error", message);

    }
  }, [formData, register, router, form]);

  return {
    // Form data and updates
    formData,
    updateFormData,

    // Step navigation
    currentStep: form.currentStep,
    isFirstStep: form.isFirstStep,
    isLastStep: form.isLastStep,
    handleNext: form.handleNext,
    handlePrevious: form.handlePrevious,
    goToStep: form.goToStep,

    // Validation
    validateStep: form.validateStep,
    validateForm: form.validateForm,

    // Submission
    handleRegister,

    // Field management
    setValue: form.setValue,
    setError: form.setError,

    // Slab management (backward compatible)
    slabRules: formData.slabRules,
    updateSlab,
    addSlab,
    removeSlab,
    loading
  };
};
