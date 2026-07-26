import api from "../../../api/axios";
import type { ApiSuccessResponse } from "../../../api/api.types";
import type { Tour } from "../types/index";

export const getAllTours = async (): Promise<Tour[]> => {
  const response = await api.get<ApiSuccessResponse<Tour[]>>("/tours");
  return response.data.data;
};

export const getTour = async (tourId: string): Promise<Tour> => {
  if (!tourId || tourId.trim() === "") {
    throw new Error("Tour ID is required to fetch details");
  }
  const response = await api.get<ApiSuccessResponse<Tour>>(`/tours/${tourId}`);
  return response.data.data;
};
