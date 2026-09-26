import api from "../../../api/axios";
import type { ApiSuccessResponse } from "../../../api/api.types";
import type {
  Booking,
  CreateCheckoutPayload,
  CheckoutSessionResponse,
} from "../types";

export const createCheckoutSession = async (
  payload: CreateCheckoutPayload,
): Promise<CheckoutSessionResponse> => {
  const response = await api.post<
    ApiSuccessResponse<CheckoutSessionResponse>
  >("/bookings/checkout-session", payload);
  return response.data.data;
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const response = await api.get<ApiSuccessResponse<Booking[]>>(
    "/bookings/my-bookings",
  );
  return response.data.data;
};

export const cancelMyBooking = async (id: string): Promise<Booking> => {
  const response = await api.patch<ApiSuccessResponse<Booking>>(
    `/bookings/my-bookings/${id}`,
  );
  return response.data.data;
};
