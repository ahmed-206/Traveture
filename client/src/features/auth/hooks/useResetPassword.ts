import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetPassword } from "../api/authApi";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";
import { authKeys } from "../authKeys";

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetPassword,

    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: authKeys.me
      })
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data.message ?? "Something went wrong.");
    },
  });
};
