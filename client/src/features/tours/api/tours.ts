import api from "../../../api/axios";
import type { ApiSuccessResponse } from "../../../api/api.types";
import type { Tour, ToursQuery, ToursResponse } from "../types/index";

export const getAllTours = async (params?: ToursQuery): Promise<ToursResponse> => {
  const response = await api.get<ApiSuccessResponse<Tour[]>>("/tours", {
    params,
  });
 
  return {
    tours: response.data.data,
    totalCount: response.data.totalCount ?? 0,
  };
};
export const getTour = async (tourId: string): Promise<Tour> => {
  if (!tourId || tourId.trim() === "") {
    throw new Error("Tour ID is required to fetch details");
  }
  const response = await api.get<ApiSuccessResponse<Tour>>(`/tours/${tourId}`);
  return response.data.data;
};
