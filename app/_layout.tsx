import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { sellerTheme } from '../constants/sellerTheme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={sellerTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
