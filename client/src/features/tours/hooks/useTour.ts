import { useQuery } from "@tanstack/react-query";
import { getTour } from "../api/tours";

export const useTour = (tourId: string) => {
  return useQuery({
    queryKey: ["tour", tourId],
    queryFn: () => getTour(tourId),
    enabled: Boolean(tourId),
  });
};
