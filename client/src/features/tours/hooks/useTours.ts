import { useQuery } from "@tanstack/react-query";
import { getTours } from "../api/tours";

export const useTours = () => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: getTours,
  });
};
