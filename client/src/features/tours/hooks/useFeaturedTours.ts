import { useQuery } from "@tanstack/react-query";
import { getAllTours } from "../api/tours";
import { tourKeys } from "../tourKeys";

export const useFeaturedTours = () => {
  return useQuery({
    queryKey: tourKeys.featuredTours,
    queryFn: () => getAllTours({ limit: 6 }),
  });
};
