import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "../api/favorites";
import { favoriteKeys } from "../favoriteKeys";
import { useMe } from "../../auth/hooks/useMe";

export const useFavorites = () => {
  const { data: user } = useMe();
  return useQuery({
    queryKey: favoriteKeys.list,
    queryFn: getFavorites,
    enabled: !!user,
  });
};
