import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  adminGetAllTours,
  adminCreateTour,
  adminUpdateTour,
  adminDeleteTour,adminGetTours
} from "../api/adminTours";
import { getTour } from "../../tours/api/tours";
import { tourKeys } from "../../tours/tourKeys";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../api/api.types";


export const adminTourKeys = {
  all: ["admin-tours"] as const,
  list: (page: number, limit: number) =>
    ["admin-tours", "list", page, limit] as const,
  stats: ["admin-tours", "stats"] as const,
  detail: (id: string) => ["admin-tour", id] as const,
};


const useInvalidateTours = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminTourKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["admin-tour"] }),
      queryClient.invalidateQueries({ queryKey: tourKeys.tours }),
    ]);
};

export const useAdminTour = (tourId?: string) =>
  useQuery({
    queryKey: adminTourKeys.detail(tourId ?? ""),
    queryFn: () => getTour(tourId!),
    enabled: Boolean(tourId),
    refetchOnWindowFocus: false,
  });

export const useAdminTours = (page: number, limit = 10) =>
  useQuery({
    queryKey: adminTourKeys.list(page, limit),
    queryFn: () => adminGetTours({ page, limit }),
    placeholderData: keepPreviousData,
  });

  export const useAdminToursForStats = () =>
  useQuery({
    queryKey: adminTourKeys.stats,
    queryFn: adminGetAllTours,
  });


export const useCreateTour = () => {
  const invalidateTours = useInvalidateTours();
  return useMutation({
    mutationFn: adminCreateTour,
    onSuccess: async () => {
      await invalidateTours();
      toast.success("Tour created successfully!");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message|| "Failed to create tour");
    },
  });
};

export const useUpdateTour = () => {
  const invalidateTours = useInvalidateTours();
  return useMutation({
    mutationFn: adminUpdateTour,
    onSuccess: async () => {
      await invalidateTours();
      toast.success("Tour updated successfully!");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message|| "Failed to update tour");
    },
  });
};

export const useDeleteTour = () => {
  const invalidateTours = useInvalidateTours();
  return useMutation({
    mutationFn: adminDeleteTour,
    onSuccess: async () => {
      await invalidateTours();
      toast.success("Tour deleted successfully!");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message|| "Failed to delete tour");
    },
  });
};