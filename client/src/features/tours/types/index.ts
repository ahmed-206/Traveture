export type TourDifficulty = "easy" | "medium" | "difficult";

export interface Location {
  _id: string;
  id?: string;
  type?: string; //  'Point'
  coordinates?: [number, number]; // [longitude, latitude]
  address?: string;
  description?: string;
  day?: number;
}

export interface UserGuide {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "lead-guide" | "guide";
}

export interface ReviewUser {
  _id: string;
  name: string;
  photo?: string;
}

export interface Review {
  _id: string;
  id?: string;
  review: string;
  rating: number;
  user: ReviewUser;
  createdAt?: string;
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
  guides?: UserGuide[]; // أو ممكن تكون User[] لو بتعمل populate للـ guides
  reviews?:Review[];
  __v?: number;
}

export interface ApiResponse<T> {
  status: string;
  requestedAt?: string;
  results?: number;
  data: {
    data?: T;
    doc?: T;
  };
}
