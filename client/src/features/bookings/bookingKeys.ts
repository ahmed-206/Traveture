export const bookingKeys = {
  myBookings: ["my-bookings"] as const,
  myBooking: (id: string) => ["my-booking", id] as const,
};
