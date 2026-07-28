import { useQueryClient, useMutation } from "@tanstack/react-query";
import { login } from "../api/authApi";
import { toast } from "react-hot-toast";

import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";
import { authKeys } from "../authKeys";

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      toast.success("Logged in successfully.");
      queryClient.setQueryData(authKeys.me, user);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data.message || "Something went wrong");
    },
  });
};
