import apiClient from "@/lib/api/client";

export interface NotificationDTO {
  notificationId: string;
  userId: string;
  title: string;
  description: string;
  isRead: boolean;
  timestamp: string;
}

export const notificationApi = {
  listNotifications: async (): Promise<NotificationDTO[]> => {
    const { data } = await apiClient.get<NotificationDTO[]>("/api/notifications");
    return data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.post(`/api/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post("/api/notifications/read-all");
  },
} as const;
