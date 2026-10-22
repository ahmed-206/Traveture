import type { Tour } from "../../tours/types";
import type { TourFormValues } from "../types";

const datesForForm = (dates?: string[]): string => {
  if (!dates?.length) return "";

  return dates.map((date) => date.slice(0, 10)).join(", ");
};

export const mapTourToFormValues = (tour: Tour): TourFormValues => ({
  name: tour.name,
  duration: tour.duration,
  maxGroupSize: tour.maxGroupSize,
  difficulty: tour.difficulty,
  price: tour.price,
  priceDiscount: tour.priceDiscount,
  summary: tour.summary,
  description: tour.description ?? "",
  imageCover: tour.imageCover,
  images: tour.images?.join(", ") ?? "",
  startDates: datesForForm(tour.startDates),
  startLocationAddress: tour.startLocation?.address ?? "",
  startLocationDescription: tour.startLocation?.description ?? "",
  startLocationLng: tour.startLocation?.coordinates?.[0],
  startLocationLat: tour.startLocation?.coordinates?.[1],
});
