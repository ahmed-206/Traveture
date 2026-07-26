import { useQueryClient, useMutation } from "@tanstack/react-query";
import { logout } from "../api/authApi";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);

      toast.success("Logged out successfully.");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data.message || "Logout failed");
    },
  });
};
