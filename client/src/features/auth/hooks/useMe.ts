import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/authApi";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });
};
