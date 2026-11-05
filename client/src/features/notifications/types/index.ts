export interface Notification {
  _id: string;
  type: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_COMPLETED' | 'REFUND_SUCCEEDED';
  title: string;
  message: string;
  params: Record<string, unknown>;
  resource: { kind: 'booking'; id: string };
  occurredAt: string;
  isRead: boolean;
  readAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}
