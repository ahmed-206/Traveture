import type { RecentBooking } from "../api/adminStats";
import { StatusBadge } from "./BookingStatus";
import { formatCurrency, formatDate } from "../utils/formatters";

const headers = ["Tour", "Customer", "Guests", "Total", "Status", "Payment", "Date"];

export const RecentBookings = ({ bookings }: { bookings: RecentBooking[] }) => (
  <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
    <h2 className="px-6 pt-6 text-lg font-semibold text-heading">
      Recent bookings
    </h2>

    {bookings.length === 0 ? (
      <p className="px-6 py-10 text-center text-sm text-body">
        No bookings yet.
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="mt-4 w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="whitespace-nowrap px-6 py-3 font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {booking.tour?.name ?? "Deleted tour"}
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">
                    {booking.user?.name ?? "Deleted user"}
                  </p>
                  <p className="text-xs text-gray-500">{booking.user?.email}</p>
                </td>
                <td className="px-6 py-4">{booking.guests}</td>
                <td className="px-6 py-4">{formatCurrency(booking.price)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={booking.paymentStatus} />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {formatDate(booking.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);
