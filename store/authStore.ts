import { userApi as fbUserApi } from "@/services/firebaseFunctions";
import { LoginResponse as User, UserPayload } from "@/types/auth";
import { startSubscriptionWatcher } from "@/utils/subscription-watcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface AuthStore {
  user: User | null;
  loading: boolean;
  isLoggingOut: boolean,
  setUser: (user: User | null) => void;
  register: (payload: UserPayload) => Promise<void>;
  login: (
    email: string,
    password: string,
    role: "seller" | "user"
  ) => Promise<void>;
  fetchUserDetails: (uid: string, role: "seller" | "user") => Promise<void>;
  logout: (uid: string) => Promise<void>;
  loadUser: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,
  isLoggingOut: false,
  setUser: (user) => set({ user }),

  register: async (payload: UserPayload) => {
    try {
      set({ loading: true });

      const response = await fbUserApi.registerUser(payload as any);

      if (!response?.success) {
        throw new Error(response?.error || "Registration failed");
      }

    } catch (err: any) {
      set({ loading: false });
      console.error("Register error:", err?.message || err);
      throw new Error(err?.message || "Registration failed");
    }
  },

  login: async (email, password, role) => {
    try {
      set({ loading: true });

      const response = await fbUserApi.loginUser({ email, password, role });

      if (!response?.success) {
        throw new Error(response?.error || "Login failed");
      }

      const fullUser: User = response.user as any;

      await AsyncStorage.setItem("user", JSON.stringify(fullUser));

      set({ user: fullUser, loading: false });
    } catch (err: any) {
      set({ loading: false });
      console.error("Login error:", err?.message || err);
      throw new Error(err?.message || "Login failed");
    }
  },

  fetchUserDetails: async (uid) => {
    try {
      const { user } = get();
      set({ loading: true });
      const response = await fbUserApi.getDetails(uid);
      const updatedUser: User = {
        ...user!,
        success: true,
        user: response.user || response,
      } as any;
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser });
      // Restart watcher with new expiry
      const expiry = updatedUser?.user?.seller_profile?.subscription?.expires_at
        ? updatedUser.user.seller_profile.subscription.expires_at._seconds *
        1000
        : null;

      startSubscriptionWatcher(expiry, () => {
        get().fetchUserDetails(uid, "seller");
      });
    } catch (err: any) {
      console.error("Fetch user error:", err.response?.data || err.message);
      throw new Error(
        err.response?.data?.message || "Failed to fetch user details"
      );
    } finally {
      set({ loading: false });
    }
  },

  logout: async (uid: string) => {
    try {
      set({ isLoggingOut: true });
      await fbUserApi.logout(uid);
      await AsyncStorage.removeItem("user");
      set({ user: null, isLoggingOut: false });
    } catch (err) {
      set({ isLoggingOut: false });
      console.error("Logout error:", err);
    }
  },

  loadUser: async () => {
    try {
      set({ loading: true });
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        set({ user });
        const expiry = user?.user?.seller_profile?.subscription?.expires_at
          ? user.user.seller_profile.subscription.expires_at._seconds * 1000
          : null;
        if (expiry) {
          startSubscriptionWatcher(expiry, () => {
            get().fetchUserDetails(user.uid, "seller");
          });
        }
      }
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      console.error("Load user error:", error);
    }
  },

  refreshToken: async () => {
    try {
      const { user } = get();
      const token = user?.idToken || null;
      return token;
    } catch (error) {
      console.error("Refresh token error:", error);
      return null;
    }
  },
}));
