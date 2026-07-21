import api from "../../../api/axios";
import type { Tour, ApiResponse } from "../types/index";

export const getTours = async (): Promise<Tour[]> => {
  const response = await api.get<ApiResponse<Tour[]>>("/tours");
  return response.data.data.data;
};
