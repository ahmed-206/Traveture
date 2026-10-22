import api from "../../../api/axios";
import type { ApiSuccessResponse } from "../../../api/api.types";
import type { Booking } from "../../bookings/types";

export interface AdminBookingsPage {
  bookings: Booking[];
  totalCount: number;
}

export interface AdminBookingsParams {
  page: number;
  limit: number;
  status?: string;
  paymentStatus?: string;
}

export interface UpdateBookingPayload {
  status?: Booking["status"];
  paymentStatus?: Booking["paymentStatus"];
}

export interface PaginatedBookingsResponse extends ApiSuccessResponse<Booking[]> {
  results: number;
  totalCount: number;
}

export const adminGetBookings = async ({
  page,
  limit,
  status,
  paymentStatus,
}: AdminBookingsParams): Promise<AdminBookingsPage> => {
  const params: Record<string, unknown> = { page, limit, sort: "-createdAt" };
  if (status) params.status = status;
  if (paymentStatus) params.paymentStatus = paymentStatus;

  const response = await api.get<PaginatedBookingsResponse>("/bookings", {
    params,
  });
  return {
    bookings: response.data.data,
    totalCount: response.data.totalCount ?? 0,
  };
};

export const adminGetBooking = async (id: string): Promise<Booking> => {
  const response = await api.get<ApiSuccessResponse<Booking>>(`/bookings/${id}`);
  return response.data.data;
};

export const adminUpdateBooking = async (
  id: string,
  data: UpdateBookingPayload,
): Promise<Booking> => {
  const response = await api.patch<ApiSuccessResponse<Booking>>(
    `/bookings/${id}`,
    data,
  );
  return response.data.data;
};

export const adminCancelBooking = async (id: string): Promise<Booking> => {
  const response = await api.patch<ApiSuccessResponse<Booking>>(
    `/bookings/${id}/cancel`,
  );
  return response.data.data;
};
