import React, { useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { Surface, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme-color";
import { Button } from "@/components/ui/paper-button";
import { GradientText } from "@/components/ui/gradient-text";
import AuthScreenWrapper from "@/components/wrappers/authScreenWrapper";
import { AppStyles } from "@/utils/theme";

// NOTE: Phone OTP authentication is not yet implemented
// This screen is a placeholder for future phone auth functionality

export default function UserVerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const router = useRouter();

  const submitOTP = async () => {
    Alert.alert(
      "Not Implemented",
      "Phone OTP authentication is not yet available. Please use email login."
    );
    router.replace("/auth/login");
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
        <GradientText style={styles.gradientTitle}>Verify OTP</GradientText>
        <View style={{ gap: 20 }}>
          <TextInput
            label="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            mode="outlined"
            keyboardType="phone-pad"
            autoCapitalize="none"
            style={[{ backgroundColor: theme.colors.surface }]}
            left={<TextInput.Icon icon="eye" color={theme.colors.onSurface} />}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.onSurface}
            theme={{
              ...theme,
              colors: {
                ...theme.colors,
                onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
              },
            }}
          />
          <Button variant="contained" loading={loading} onPress={submitOTP}>
            Verify & Login
          </Button>

          <Button variant="text" onPress={() => router.push("/auth/login")}>
            Back to Login
          </Button>
        </View>
      </Surface>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  formCard: {
    borderRadius: 12,
    padding: AppStyles.spacing.lg,
    borderWidth: 1,
  },
  gradientTitle: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: AppStyles.spacing.lg,
  },
});
