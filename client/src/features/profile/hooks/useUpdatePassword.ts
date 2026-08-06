import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePassword } from "../api/profile";
import toast from "react-hot-toast";
import { authKeys } from "../../auth/authKeys";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
      queryClient.invalidateQueries({
        queryKey: authKeys.me,
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data.message ?? "Something went wrong.");
    },
  });
};
