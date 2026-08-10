import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFavorite } from "../api/favorites";
import { favoriteKeys } from "../favoriteKeys";
import { toast } from "react-hot-toast";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";

export const useDeleteFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFavorite,
    onMutate: async (tourId) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.ids });
      const previous = queryClient.getQueryData<string[]>(
        favoriteKeys.ids,
      );
      queryClient.setQueryData<string[]>(favoriteKeys.ids, (old = []) =>
        old.filter((id) => id !== tourId),
      );
      return { previous };
    },
    onError: (error: AxiosError<ApiErrorResponse>, _tourId, context) => {
      queryClient.setQueryData(favoriteKeys.ids, context?.previous);
      toast.error(error.response?.data.message || "Failed to remove favorite");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.ids });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list });
    },
  });
};
