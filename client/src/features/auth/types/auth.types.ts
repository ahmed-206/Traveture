import type { ResetPasswordData } from "../validation/authSchema";

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface ResetPasswordPayload {
  token: string;
  data: ResetPasswordData;
}