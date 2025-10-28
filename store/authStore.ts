import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { create } from 'zustand';
import {
  auth,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword
} from '../config/firebase';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: 'seller' | 'user';
  firebaseUid: string;
  token?: string; // Firebase ID token for API calls
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  verificationId: string | null;
  setUser: (user: User | null) => void;
  setVerificationId: (id: string | null) => void;
  loginWithEmail: (email: string, password: string, role: 'seller' | 'user') => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string, role: 'seller' | 'user') => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<string>;
  verifyOTP: (verificationId: string, code: string, role: 'seller' | 'user', name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  verificationId: null,

  setUser: (user) => set({ user }),
  setVerificationId: (id) => set({ verificationId: id }),

  loginWithEmail: async (email, password, role) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Verify with backend and get user data
      const response = await axios.post(`${API_URL}/api/auth/firebase-login`, {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        role
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      const user: User = {
        id: response.data.user_id,
        email: firebaseUser.email,
        phone: firebaseUser.phoneNumber,
        name: response.data.name,
        role,
        firebaseUid: firebaseUser.uid,
        token: idToken
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  registerWithEmail: async (email, password, name, role) => {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Register with backend
      const response = await axios.post(`${API_URL}/api/auth/firebase-register`, {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        name,
        role
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      const user: User = {
        id: response.data.user_id,
        email: firebaseUser.email,
        phone: firebaseUser.phoneNumber,
        name,
        role,
        firebaseUid: firebaseUser.uid,
        token: idToken
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  sendOTP: async (phoneNumber: string) => {
    try {
      // Format phone number (must include country code)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      // Note: In React Native, you'll need to use a different approach
      // This is a web-based example. For React Native, use Firebase phone auth differently
      throw new Error('Phone auth requires native Firebase implementation. Use email/password for now.');

    } catch (error: any) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },

  verifyOTP: async (verificationId, code, role, name = 'User') => {
    try {
      // Verify OTP with Firebase
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Check if user exists in backend, if not register
      try {
        const response = await axios.post(`${API_URL}/api/auth/firebase-login`, {
          firebase_uid: firebaseUser.uid,
          phone: firebaseUser.phoneNumber,
          role
        }, {
          headers: { Authorization: `Bearer ${idToken}` }
        });

        const user: User = {
          id: response.data.user_id,
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber,
          name: response.data.name,
          role,
          firebaseUid: firebaseUser.uid
        };

        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ user });
      } catch (error: any) {
        if (error.response?.status === 404) {
          // User doesn't exist, register
          const response = await axios.post(`${API_URL}/api/auth/firebase-register`, {
            firebase_uid: firebaseUser.uid,
            phone: firebaseUser.phoneNumber,
            name,
            role
          }, {
            headers: { Authorization: `Bearer ${idToken}` }
          });

          const user: User = {
            id: response.data.user_id,
            email: firebaseUser.email,
            phone: firebaseUser.phoneNumber,
            name,
            role,
            firebaseUid: firebaseUser.uid
          };

          await AsyncStorage.setItem('user', JSON.stringify(user));
          set({ user });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      throw new Error(error.message || 'OTP verification failed');
    }
  },

  logout: async () => {
    await firebaseSignOut(auth);
    await AsyncStorage.removeItem('user');
    set({ user: null });
  },

  loadUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        set({ user, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Load user error:', error);
      set({ loading: false });
    }
  }
}));