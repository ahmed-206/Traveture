import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";
import { bookingKeys } from "../../bookings/bookingKeys";
import {
  adminGetBookings,
  adminUpdateBooking,
  adminCancelBooking,
} from "../api/adminBookings";
import type { AdminBookingsParams, UpdateBookingPayload } from "../api/adminBookings";


export const useAdminBookings = (
  page: number,
  limit = 10,
  filters?: { status?: string; paymentStatus?: string },
) => {
  const filterRecord = filters as Record<string, string> | undefined;
  return useQuery({
    queryKey: bookingKeys.adminList(page, limit, filterRecord),
    queryFn: () =>
      adminGetBookings({ page, limit, ...filters } as AdminBookingsParams),
    placeholderData: keepPreviousData,
  });
};


const useInvalidateAdminBookings = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: bookingKeys.adminAll });
};

export const useAdminUpdateBooking = () => {
  const invalidate = useInvalidateAdminBookings();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingPayload }) =>
      adminUpdateBooking(id, data),
    onSuccess: async () => {
      await invalidate();
      toast.success("Booking updated successfully.");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message ?? "Failed to update booking.");
    },
  });
};

export const useAdminCancelBooking = () => {
  const invalidate = useInvalidateAdminBookings();
  return useMutation({
    mutationFn: adminCancelBooking,
    onSuccess: async () => {
      await invalidate();
      toast.success("Booking cancelled.");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message ?? "Failed to cancel booking.");
    },
  });
};
