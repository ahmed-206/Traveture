export type TourDifficulty = "easy" | "medium" | "difficult";

export interface Location {
  type?: string; // e.g. 'Point'
  coordinates?: [number, number]; // [longitude, latitude]
  address?: string;
  description?: string;
  day?: number;
}

export interface Tour {
  _id: string;
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: TourDifficulty;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  summary: string;
  description?: string;
  imageCover: string;
  images?: string[];
  createdAt?: string; // أو Date لو بتعمل parse للتواريخ
  startDates?: string[];
  secretTour?: boolean;
  startLocation?: Location;
  locations?: Location[];
  guides?: string[]; // أو ممكن تكون User[] لو بتعمل populate للـ guides
  __v?: number;
}

export interface ApiResponse<T> {
  status: string;
  requestedAt?: string;
  results?: number;
  data: {
    data: T;
  };
}
