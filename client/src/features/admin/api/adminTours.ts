import api from "../../../api/axios";
import type { ApiSuccessResponse } from "../../../api/api.types";
import type { Tour, Location as TourLocation } from "../../tours/types";

// Omit بتنشئ نوعًا جديدًا من النوع الأصلي بعد حذف خصائص معينة.
export type LocationInput = Omit<TourLocation, "_id" | "id">;


// Pick اختيار خصائص محددة من نوع موجود.
// Partial تجعل الخصائص المختارة اختيارية.
export type CreateTourPayload = Pick<
  Tour,
  | "name"
  | "duration"
  | "maxGroupSize"
  | "difficulty"
  | "price"
  | "summary"
  | "imageCover"
> &
  Partial<Pick<Tour, "description" | "images" | "startDates">> & {
    priceDiscount?: number;
    startLocation?: LocationInput;
    locations?: LocationInput[];
  };

  // فمعناه إن كل خصائص الـ payload تصبح اختيارية في عملية التعديل.
export type UpdateTourPayload = Partial<CreateTourPayload>;

export interface UpdateTourArgs {
  id: string;
  data: UpdateTourPayload;
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<T> {
  results: number;
  totalCount: number;
}

export interface AdminToursPage {
  tours: Tour[];
  totalCount: number;
}

export const adminGetTours = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<AdminToursPage> => {
  const response = await api.get<PaginatedResponse<Tour[]>>("/tours", {
    params: { page, limit, sort: "-createdAt" },
  });
  return { tours: response.data.data, totalCount: response.data.totalCount };
};

export const adminGetAllTours = async (): Promise<Tour[]> => {
  const response = await api.get<ApiSuccessResponse<Tour[]>>("/tours", {
    params: { limit: 100, sort: "-createdAt" },
  });
  return response.data.data;
};

export const adminCreateTour = async (
  data: CreateTourPayload,
): Promise<Tour> => {
  const response = await api.post<ApiSuccessResponse<Tour>>("/tours", data);
  return response.data.data;
};

export const adminUpdateTour = async ({
  id,
  data,
}: UpdateTourArgs): Promise<Tour> => {
  const response = await api.patch<ApiSuccessResponse<Tour>>(
    `/tours/${id}`,
    data,
  );
  return response.data.data;
};

export const adminDeleteTour = async (id: string): Promise<void> => {
  await api.delete(`/tours/${id}`);
};