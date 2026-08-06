import { type ApiSuccessResponse } from "../../../api/api.types";
import api from "../../../api/axios";
import type { User } from "../../auth/types/user.types";
import type { UpdatePasswordData } from "../validation/profileSchema";

export const updateProfile = async (data: FormData): Promise<User> => {
  const response = await api.patch<ApiSuccessResponse<User>>(
    "users/updateMe",
    data,
  );
  return response.data.data;
};

export const updatePassword = async (
  data: UpdatePasswordData,
): Promise<User> => {
  const response = await api.patch<ApiSuccessResponse<User>>(
    "users/updateMyPassword",
    data,
  );
  return response.data.data;
};
