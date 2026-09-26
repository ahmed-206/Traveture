import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "../api/bookingsApi";
import { toast } from "react-hot-toast";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(
        error.response?.data.message || "Failed to create checkout session",
      );
    },
  });
};
