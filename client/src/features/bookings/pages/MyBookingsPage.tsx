import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSuitcaseRolling,
  FaCalendarDays,
  FaUsers,
  FaBan,
  FaArrowRight,
} from "react-icons/fa6";
import { useMyBookings } from "../hooks/useMyBookings";
import { useCancelMyBooking } from "../hooks/useCancelMyBooking";
import { StatusBadge } from "../../admin/components/BookingStatus";
import { CancelBookingModal } from "../components/CancelBookingModal";
import { formatCurrency, formatDate } from "../../admin/utils/formatters";
import type { Booking } from "../types";

// ─── Booking Card ─────────────────────────────────────────────────────────────

const BookingCard = ({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: (b: Booking) => void;
}) => {
  const canCancel =
    booking.status !== "cancelled" && booking.status !== "completed";

  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Tour image strip */}
      <div className="relative h-36 w-full bg-gray-100">
        {booking.tour?.imageCover ? (
          <img
            src={booking.tour.imageCover}
            alt={booking.tour.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <FaSuitcaseRolling size={40} />
          </div>
        )}
        {/* Status pill overlay */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <StatusBadge status={booking.status} />
          <StatusBadge status={booking.paymentStatus} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-3">
        <h3 className="font-bold text-heading text-base line-clamp-1">
          {booking.tour?.name ?? "Deleted tour"}
        </h3>

        <div className="flex flex-wrap gap-4 text-sm text-body">
          <span className="flex items-center gap-1.5">
            <FaCalendarDays className="text-primary" size={13} />
            {formatDate(booking.startDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <FaUsers className="text-primary" size={13} />
            {booking.guests} guest{booking.guests !== 1 && "s"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-bold text-heading">
            {formatCurrency(booking.price)}
          </span>

          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel(booking)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
            >
              <FaBan size={11} />
              Cancel
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const MyBookingsPage = () => {
  const { data: bookings, isPending, isError } = useMyBookings();
  const cancelMutation = useCancelMyBooking();
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const handleConfirmCancel = () => {
    if (!cancelTarget || cancelMutation.isPending) return;
    cancelMutation.mutate(cancelTarget._id, {
      onSuccess: () => setCancelTarget(null),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-heading">
          My Bookings
        </h1>
        <p className="mt-1 text-sm text-body">
          View and manage all your tour reservations
        </p>
      </header>

      {/* Loading */}
      {isPending && (
        <div
          className="flex justify-center py-16"
          role="status"
          aria-label="Loading bookings"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        </div>
      )}

      {/* Error */}
      {!isPending && isError && (
        <div
          className="rounded-xl border border-error/50 bg-red-50 p-5 text-sm text-error"
          role="alert"
        >
          Failed to load your bookings. Please try again.
        </div>
      )}

      {/* Empty state */}
      {!isPending && !isError && bookings?.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
            <FaSuitcaseRolling />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-heading">
            No bookings yet
          </h2>
          <p className="mt-1 text-sm text-body">
            Explore our tours and start your next adventure!
          </p>
          <Link
            to="/tours"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
          >
            Browse tours
            <FaArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Grid of booking cards */}
      {!isPending && !isError && bookings && bookings.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {bookings.map((b) => (
            <BookingCard key={b._id} booking={b} onCancel={setCancelTarget} />
          ))}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          isPending={cancelMutation.isPending}
          onConfirm={handleConfirmCancel}
          onClose={() => {
            if (!cancelMutation.isPending) setCancelTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default MyBookingsPage;
