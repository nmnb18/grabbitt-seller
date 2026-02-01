import api from "./axiosInstance";

export const getUnreadNotificationCount = async () => {
  const res = await api.get("/getUnreadNotificationCount");
  return res.data.count;
};

export const getNotifications = async () => {
  const res = await api.get("/getNotifications");
  return res.data.notifications;
};

export const markNotificationsRead = async (ids: string[]) => {
  await api.post("/markNotificationsRead", { notificationIds: ids });
};
