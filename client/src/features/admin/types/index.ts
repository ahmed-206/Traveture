import type { Tour } from "../../tours/types";


export type TourFormValues = Pick<
  Tour,
  | "name"
  | "duration"
  | "maxGroupSize"
  | "difficulty"
  | "price"
  | "summary"
  | "imageCover"
> & {
  priceDiscount?: number;
  description?: string;
  images?: string;
  startDates?: string;
  startLocationAddress?: string;
  startLocationDescription?: string;
  startLocationLng?: number;
  startLocationLat?: number;
};
