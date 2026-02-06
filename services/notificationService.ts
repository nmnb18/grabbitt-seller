import { notificationApi } from './firebaseFunctions';

export const getUnreadNotificationCount = async () => {
  const res = await notificationApi.getUnreadCount();
  return res?.count ?? res?.data?.count ?? 0;
};

export const getNotifications = async () => {
  const res = await notificationApi.getNotifications();
  return res?.notifications ?? res?.data?.notifications ?? [];
};

export const markNotificationsRead = async (ids: string[]) => {
  await notificationApi.markNotificationsRead(ids);
};
