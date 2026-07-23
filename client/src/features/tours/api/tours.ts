import api from "../../../api/axios";
import type { Tour, ApiResponse } from "../types/index";

export const getAllTours = async (): Promise<Tour[]> => {
  const response = await api.get<ApiResponse<Tour[]>>("/tours");
  const tours = response.data.data.doc || response.data.data.data;
  if (!tours) {
    throw new Error('Failed to fetch tours');
  }
  return tours;
};

export const getTour = async (tourId: string): Promise<Tour> => {
  if (!tourId || tourId.trim() === "") {
    throw new Error("Tour ID is required to fetch details");
  }
  const response = await api.get<ApiResponse<Tour>>(`/tours/${tourId}`);
  const tour = response.data.data.doc || response.data.data.data;
  if (!tour) {
    throw new Error(`No tour found with ID: ${tourId}`);
  }
  return tour;
};
