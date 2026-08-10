import { useQuery } from "@tanstack/react-query";
import { getFavoriteIds } from "../api/favorites";
import { favoriteKeys } from "../favoriteKeys";
import { useMe } from "../../auth/hooks/useMe";

export const useFavoriteIds = () => {
  const { data: user } = useMe();
  return useQuery({
    queryKey: favoriteKeys.ids,
    queryFn: getFavoriteIds,
    enabled: !!user,
    staleTime: 60 * 1000,
  });
};