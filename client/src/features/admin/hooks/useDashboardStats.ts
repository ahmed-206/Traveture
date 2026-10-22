import { useQuery } from "@tanstack/react-query";
import { adminGetDashboardStats } from "../api/adminStats";


export const useDashboardStats = () =>
  useQuery({
    queryKey: ["admin-stats", "dashboard"],
    queryFn: adminGetDashboardStats,
  });
