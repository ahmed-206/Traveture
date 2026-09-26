import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "../api/bookingsApi";
import { bookingKeys } from "../bookingKeys";

export const useMyBookings = () => {
  return useQuery({
    queryKey: bookingKeys.myBookings,
    queryFn: getMyBookings,
  });
};
