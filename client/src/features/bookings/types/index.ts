export interface Booking {
  _id: string;
  tour: {
    _id: string;
    name: string;
    imageCover: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    photo: string;
  };
  price: number;
  guests: number;
  startDate: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckoutPayload {
  tourId: string;
  guests: number;
  startDate: string;
}

export interface CheckoutSessionResponse {
  url: string;
}
