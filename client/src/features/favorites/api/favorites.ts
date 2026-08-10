import type { ApiSuccessResponse } from "../../../api/api.types";
import api from "../../../api/axios";
import type { Tour } from "../../tours/types";
import type { FavoriteResponse } from "../types";

export const getFavoriteIds = async (): Promise<string[]> => {
  const response = await api.get<ApiSuccessResponse<string[]>>("/favorites/ids");
  return response.data.data;
};

export const getFavorites = async (): Promise<Tour[]> => {
  const response = await api.get<ApiSuccessResponse<Tour[]>>("/favorites");
  return response.data.data;
};

export const addFavorite = async (
  tourId: string,
): Promise<FavoriteResponse> => {
  const response = await api.post<ApiSuccessResponse<FavoriteResponse>>(
    `/favorites/${tourId}`,
  );
  return response.data.data;
};

export const deleteFavorite = async (
  tourId: string,
): Promise<FavoriteResponse> => {
  const response = await api.delete<ApiSuccessResponse<FavoriteResponse>>(
    `/favorites/${tourId}`,
  );
  return response.data.data;
};
