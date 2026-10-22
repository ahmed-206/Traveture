import { formatDate } from "../../admin/utils/formatters";
import type { Booking } from "../types";

interface CancelBookingModalProps {
  booking: Booking;
  isPending: boolean;
  detail?: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

export const CancelBookingModal = ({
  booking,
  isPending,
  detail,
  onConfirm,
  onClose,
}: CancelBookingModalProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cancel-booking-modal-title"
  >
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <h2
        id="cancel-booking-modal-title"
        className="text-lg font-bold text-heading mb-2"
      >
        Cancel booking?
      </h2>

      <p className="text-sm text-body mb-1">
        Tour:{" "}
        <span className="font-semibold text-heading">
          {booking.tour?.name ?? "Unknown tour"}
        </span>
      </p>

      {detail ?? (
        <p className="text-sm text-body mb-6">
          Date:{" "}
          <span className="font-semibold text-heading">
            {formatDate(booking.startDate)}
          </span>
        </p>
      )}

      <div className="flex gap-3 justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-body transition-colors hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
        >
          Keep booking
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? "Cancelling…" : "Yes, cancel"}
        </button>
      </div>
    </div>
  </div>
);
