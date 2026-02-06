/**
 * Firebase Configuration for React Native
 * Uses Firebase SDK v9+ with modular pattern
 */

import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDeFOLg1_ikeUAa7b4p3pRyvQgSymUh3Vc',
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'grabbitt-app.firebaseapp.com',
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'grabbitt-app',
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'grabbitt-app.firebasestorage.app',
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '698651226206',
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:698651226206:web:4040349932fb32e72444cf',
  measurementId: Constants.expoConfig?.extra?.FIREBASE_MEASUREMENT_ID || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-LWEGF6C2VD',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = firebaseAuth.getAuth(app);
// Provide an async getter for Functions to avoid static import/typing issues
export const getFunctionsInstance = async () => {
  const mod: any = await import('firebase/functions');
  return mod.getFunctions(app, 'asia-south1');
};

// Connect to emulator in development if needed
const isDev = process.env.NODE_ENV === 'development';
if (isDev && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    firebaseAuth.connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true } as any);
    // Try to connect to functions emulator if available
    import('firebase/functions')
      .then((mod: any) =>
        getFunctionsInstance()
          .then((functionsInstance) => {
            mod.connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
          })
          .catch(() => {
            // ignore if functions not available in this environment
          })
      )
      .catch(() => {
        // ignore if functions not available in this environment
      });
  } catch (err) {
    // Emulator already connected or not available
    console.warn('Firebase Emulator connection:', err);
  }
}

export default app;
