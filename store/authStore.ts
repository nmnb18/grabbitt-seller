import { User, UserPayload } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { create } from "zustand";

const API_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL;

interface AuthStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  register: (payload: UserPayload) => Promise<void>;
  login: (email: string, password: string, role: "seller" | "user") => Promise<void>;
  fetchUserDetails: (uid: string, role: "seller" | "user") => Promise<void>;
  logout: (uid: string) => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,

  setUser: (user) => set({ user }),

  register: async (payload: UserPayload) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        ...payload
      });

      const { uid } = response.data;
      const user = { uid, ...payload };
      await AsyncStorage.setItem("user", JSON.stringify(user));
      set({ user });
    } catch (err: any) {
      console.error("Register error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  },

  login: async (email, password, role) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
        role
      });

      const user = response.data;
      await AsyncStorage.setItem("user", JSON.stringify(user));
      set({ user });
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Login failed");
    }
  },

  fetchUserDetails: async (uid) => {
    try {
      const response = await axios.get(`${API_URL}/getuserdetails?uid=${uid}`);
      const user = response.data;
      set({ user });
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (err: any) {
      console.error("Fetch user error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Failed to fetch user details");
    }
  },

  logout: async (uid: string) => {
    try {
      await axios.post(`${API_URL}/logout`, {
        uid
      });
      await AsyncStorage.removeItem("user");
      set({ user: null });
    } catch (err) {
      console.error("Logout error:", err);
    }
  },

  loadUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        set({ user });
      }
    } catch (error) {
      console.error("Load user error:", error);
    }
  },
}));
