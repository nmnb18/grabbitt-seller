import { Stack } from "expo-router";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Status bar FOR ALL AUTH SCREENS */}
      {/* <StatusBar style="light" /> */}

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}
