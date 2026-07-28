import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/authApi";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";
import { authKeys } from "../authKeys";

export const useSignup = () => {
    const navigate = useNavigate();
     const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
        queryClient.invalidateQueries({
        queryKey: authKeys.me,
      });
      toast.success("Account created successfully");
      navigate("/");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data.message || "Something went wrong");
    },
  });
};
