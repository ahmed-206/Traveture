import api from "../../../api/axios";
import type { ApiSuccessResponse } from "../../../api/api.types";
import type { User, AuthUserData } from "../types/user.types";
import type { LoginData } from "../types/auth.types";
import type { SignupData } from "../validation/authSchema";

export const login = async (data: LoginData): Promise<User> => {
  const response = await api.post<ApiSuccessResponse<AuthUserData>>(
    "/users/login",
    data,
  );
  return response.data.data.user;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<ApiSuccessResponse<User>>("/users/me");
  return response.data.data;
};

export const logout =  async () => {
  await api.get("/users/logout");
}

export const signup = async(data: SignupData) : Promise<User> => {
  const response = await api.post<ApiSuccessResponse<AuthUserData>>("/users/signup",data);
  return response.data.data.user;
}
