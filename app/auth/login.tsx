import { FormTextInput } from "@/components/form/form-text-input";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/paper-button";
import AuthScreenWrapper from "@/components/wrappers/authScreenWrapper";
import { useTheme } from "@/hooks/use-theme-color";
import { AppStyles } from "@/utils/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Surface, TextInput } from "react-native-paper";
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

  const router = useRouter();
  const { login } = useAuthStore();
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

  const textInputTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      onSurfaceVariant: theme.colors.onSurfaceDisabled,
    },
  };

  const textInputProps = {
    mode: "outlined" as const,
    autoCapitalize: "none" as const,
    outlineColor: theme.colors.outline,
    activeOutlineColor: theme.colors.onSurface,
    theme: textInputTheme,
    style: [styles.input, { backgroundColor: theme.colors.surface }],
  };

  return (
    <AuthScreenWrapper>
      <Surface
        style={[
          styles.formCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
        elevation={2}
      >
        <GradientText style={styles.gradientTitle}>Login</GradientText>

        <View style={styles.form}>

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
            Don't have an account? Register
          </Button>

          <Button
            onPress={navigateToForgotPassword}
            variant="text"
            size="medium"
            fullWidth
          >
            Forgot Password?
          </Button>
        </View>
      </Surface>
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
  formCard: {
    borderRadius: 12,
    padding: AppStyles.spacing.lg,
    borderWidth: 1,
  },
  form: {
    gap: AppStyles.spacing.md,
  },
  input: {},
  passwordInput: {
    marginBottom: 20,
  },
});