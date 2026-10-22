export const bookingKeys = {
  myBookings: ["my-bookings"] as const,
  myBooking: (id: string) => ["my-booking", id] as const,

  // admin
  adminAll: ["admin-bookings"] as const,
  adminList: (page: number, limit: number, filters?: Record<string, string>) =>
    ["admin-bookings", "list", page, limit, filters ?? {}] as const,
  adminDetail: (id: string) => ["admin-bookings", id] as const,
};
