import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../api/authApi";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data.message ?? "Something went wrong.");
    },
  });
};
