import { useQuery } from "@tanstack/react-query";
import { getAllTours } from "../api/tours";
import { tourKeys } from "../tourKeys";
import { type ToursQuery } from "../types";
export const useTours = (page: number, filters: Partial<ToursQuery> = {}) => {
  return useQuery({
    queryKey: [tourKeys.tours, page, filters],
    queryFn: ()=> getAllTours({ page, limit: 9, ...filters }),
  });
};
