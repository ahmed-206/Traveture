import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/authApi";
import { authKeys } from "../authKeys";

export const useMe = () => {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    retry: false,
  });
};
