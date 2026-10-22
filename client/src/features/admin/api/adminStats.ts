import api from "../../../api/axios";
import type { ApiSuccessResponse } from "../../../api/api.types";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface RecentBooking {
  _id: string;
  guests: number;
  price: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  user: { _id: string; name: string; email: string; photo?: string };
  tour: { _id: string; name: string; imageCover: string };
}

export interface DashboardStats {
  tours: {
    totalTours: number;
    avgPrice: number;
    avgRating: number | null; // null when no tour has reviews yet
  };
  bookings: {
    total: number;
    byStatus: Record<BookingStatus, number>;
    byPaymentStatus: Record<PaymentStatus, number>;
    revenue: number;
  };
  recentBookings: RecentBooking[];
}

export const adminGetDashboardStats = async (): Promise<DashboardStats> => {
  const response =
    await api.get<ApiSuccessResponse<DashboardStats>>("/stats/dashboard");
  return response.data.data;
};
