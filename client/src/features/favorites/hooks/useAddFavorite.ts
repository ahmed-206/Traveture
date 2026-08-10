import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite } from "../api/favorites";
import { favoriteKeys } from "../favoriteKeys";
import { toast } from "react-hot-toast";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addFavorite,
    // إلغاء أي request قديم
    // استنى، خلينا نوقف الـ query الحالية قبل ما نعدل الـ cache.
    onMutate: async (tourId) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.ids });
      // قبل ما أغير البيانات، خد نسخة من الحالة الحالية.
      const previous = queryClient.getQueryData<string[]>(favoriteKeys.ids);
      // تحديث الـ Cache فورًا
      queryClient.setQueryData<string[]>(favoriteKeys.ids, (old = []) => [
        ...old,
        tourId,
      ]);
      // إرجاع النسخة القديمة
      return { previous };
    },
    onError: (error: AxiosError<ApiErrorResponse>, _tourId, context) => {
      // العملية فشلت، ارجع الـ UI للحالة التي كانت عليها قبل الضغط.
      queryClient.setQueryData(favoriteKeys.ids, context?.previous);
      toast.error(error.response?.data.message || "Failed to add favorite");
    },
    // البيانات الموجودة عندك للـ IDs ممكن تكون قديمة، روح جيبها تاني.
    // ليه رغم إننا عملنا Optimistic Update؟
    // لأن الـ Optimistic Update مجرد توقع.
    // إحنا عايزين في النهاية نتأكد من الحقيقة الموجودة في Backend.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.ids });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list });
    },
  });
};
