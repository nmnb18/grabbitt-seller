import { userApi } from "@/services/api";
import { LoginResponse as User, UserPayload } from "@/types/auth";
import { startSubscriptionWatcher } from "@/utils/subscription-watcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface AuthStore {
  user: User | null;
  idToken: string | null;
  refreshTokenValue: string | null;
  loading: boolean;
  isLoggingOut: boolean;
  setUser: (user: User | null) => void;
  setTokens: (idToken: string | null, refreshToken: string | null) => void;
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
  idToken: null,
  refreshTokenValue: null,
  loading: false,
  isLoggingOut: false,

  setUser: (user) => set({ user }),

  setTokens: (idToken, refreshToken) => {
    set({ idToken, refreshTokenValue: refreshToken });
    if (idToken) {
      AsyncStorage.setItem("idToken", idToken).catch(console.error);
    }
    if (refreshToken) {
      AsyncStorage.setItem("refreshToken", refreshToken).catch(console.error);
    }
  },

  register: async (payload: UserPayload) => {
    try {
      set({ loading: true });

      const response = await userApi.registerSeller(payload as any);

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

      const response = await userApi.loginSeller({ email, password, role });

      if (!response?.success) {
        throw new Error(response?.error || "Login failed");
      }

      const fullUser: User = response.user as any;
      const token = response.idToken || response.user?.idToken;
      const refreshToken = response.refreshToken || response.user?.refreshToken;

      await get().fetchUserDetails(fullUser.uid, "seller");

      // Save tokens
      if (token) await AsyncStorage.setItem("idToken", token);
      if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);

      set({
        idToken: token || null,
        refreshTokenValue: refreshToken || null,
      });
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
      const response = await userApi.getDetails(uid);
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
      await userApi.logout(uid);
      await AsyncStorage.multiRemove(["user", "idToken", "refreshToken"]);
      set({ user: null, idToken: null, refreshTokenValue: null, isLoggingOut: false });
    } catch (err) {
      set({ isLoggingOut: false });
      console.error("Logout error:", err);
    }
  },

  loadUser: async () => {
    try {
      set({ loading: true });
      const [userStr, idToken, refreshToken] = await AsyncStorage.multiGet([
        "user",
        "idToken",
        "refreshToken",
      ]);

      if (userStr[1]) {
        const user = JSON.parse(userStr[1]);
        set({
          user,
          idToken: idToken[1] || null,
          refreshTokenValue: refreshToken[1] || null,
        });

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
      const { idToken, refreshTokenValue } = get();

      // If we have a refresh token, try to refresh
      if (refreshTokenValue) {
        const response = await userApi.refreshToken(refreshTokenValue);
        if (response?.idToken) {
          const newToken = response.idToken;
          get().setTokens(newToken, refreshTokenValue);
          return newToken;
        }
      }

      return idToken || null;
    } catch (error) {
      console.error("Refresh token error:", error);
      return null;
    }
  },
}));
