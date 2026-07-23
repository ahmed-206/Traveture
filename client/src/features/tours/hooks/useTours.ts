import { useQuery } from "@tanstack/react-query";
import { getAllTours} from "../api/tours";

export const useTours = () => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: getAllTours,
  });
};

