import api from '../../../api/axios';
import type { ApiSuccessResponse, ApiMessageResponse } from '../../../api/api.types';
import type { Notification } from '../types';

interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}

export const getMyNotifications = async (): Promise<NotificationsData> => {
  const response = await api.get<ApiSuccessResponse<Notification[]> & { unreadCount: number }>(
    '/notifications/my-notifications',
  );
  return {
    notifications: response.data.data,
    unreadCount: response.data.unreadCount,
  };
};

export const markNotificationRead = async (id: string): Promise<Notification> => {
  const response = await api.patch<ApiSuccessResponse<Notification>>(
    `/notifications/my-notifications/${id}/read`,
  );
  return response.data.data;
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch<ApiMessageResponse>('/notifications/my-notifications/read-all');
};
