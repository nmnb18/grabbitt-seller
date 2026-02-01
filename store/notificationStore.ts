import { create } from "zustand";

interface NotificationState {
    unreadCount: number;
    setUnreadCount: (c: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    unreadCount: 0,
    setUnreadCount: (c) => set({ unreadCount: c }),
}));
