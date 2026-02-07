import { ButtonRow, FormCard, FormRow } from "@/components/common";
import { FormTextInput } from "@/components/form/form-text-input";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/paper-button";
import AuthScreenWrapper from "@/components/wrappers/authScreenWrapper";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/hooks/use-theme-color";
import { AppStyles } from "@/utils/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Platform, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { useAuthStore } from "../../store/authStore";

export default function SellerLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [uiState, setUiState] = useState({
    loading: false,
    showPassword: false
  });

  const {
    requestPermission,
    registerToken,
  } = useNotifications();

  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const theme = useTheme();

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = () => {
    setUiState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setUiState(prev => ({ ...prev, loading: true }));

    try {
      await login(email, password, "seller");
      router.replace("/(drawer)");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  const navigateToRegister = () => router.push("/auth/register");
  const navigateToForgotPassword = () => router.push("/auth/forgot-password");


  const handlePermissionRequest = async () => {
    const granted = await requestPermission();

    if (!granted) {
      Alert.alert(
        "Permission Required",
        "To receive notifications, please enable them in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    } else {
      await registerToken();
    }
  };

  useEffect(() => {
    handlePermissionRequest();
  }, [])

  return (
    <AuthScreenWrapper>
      <FormCard>
        <GradientText style={styles.gradientTitle}>Login</GradientText>

        <FormRow>
          <FormTextInput
            label="Email *"
            value={formData.email}
            onChangeText={handleInputChange("email")}
            autoCapitalize="words"
            leftIcon="account"
          />

          <FormTextInput
            label="Password *"
            value={formData.password}
            onChangeText={handleInputChange("password")}
            secureTextEntry={!uiState.showPassword}
            leftIcon="lock"
            right={
              <TextInput.Icon
                icon={uiState.showPassword ? "eye-off" : "eye"}
                color={theme.colors.onSurface}
                onPress={togglePasswordVisibility}
              />
            }
          />
        </FormRow>

        <ButtonRow vertical>
          <Button
            onPress={handleLogin}
            loading={uiState.loading}
            disabled={uiState.loading}
            variant="contained"
            size="medium"
            fullWidth
          >
            Login
          </Button>

          <Button
            onPress={navigateToRegister}
            variant="text"
            size="medium"
            fullWidth
          >
            Don&apos;t have an account? Register
          </Button>

          <Button
            onPress={navigateToForgotPassword}
            variant="text"
            size="medium"
            fullWidth
          >
            Forgot Password?
          </Button>
        </ButtonRow>
      </FormCard>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  gradientTitle: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: AppStyles.spacing.lg,
  },
});