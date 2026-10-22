import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelMyBooking } from "../api/bookingsApi";
import { bookingKeys } from "../bookingKeys";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";

export const useCancelMyBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelMyBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.myBookings });
      toast.success("Booking cancelled successfully.");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message ?? "Failed to cancel booking.");
    },
  });
};
