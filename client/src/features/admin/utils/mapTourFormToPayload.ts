import type { CreateTourPayload } from "../api/adminTours";
import type { TourFormValues } from "../types";
import { parseCommaSeparated } from "./parseCommaSeparated";
import { toOptionalNumber } from "./toOptionalNumber";

export const mapTourFormToPayload = (
  data: TourFormValues,
): CreateTourPayload => {
  const payload: CreateTourPayload = {
    name: data.name.trim(),
    duration: Number(data.duration),
    maxGroupSize: Number(data.maxGroupSize),
    difficulty: data.difficulty,
    price: Number(data.price),
    summary: data.summary.trim(),
    imageCover: data.imageCover.trim(),
    images: parseCommaSeparated(data.images),
    startDates: parseCommaSeparated(data.startDates),
  };

  if (data.description?.trim()) {
    payload.description = data.description.trim();
  }

  const priceDiscount = toOptionalNumber(data.priceDiscount);
  if (priceDiscount !== undefined) {
    payload.priceDiscount = priceDiscount;
  }

  const lng = toOptionalNumber(data.startLocationLng);
  const lat = toOptionalNumber(data.startLocationLat);

  if (lng !== undefined && lat !== undefined) {
    payload.startLocation = {
      type: "Point",
      coordinates: [lng, lat],
      address: data.startLocationAddress?.trim() || undefined,
      description: data.startLocationDescription?.trim() || undefined,
    };
  }

  return payload;
};
