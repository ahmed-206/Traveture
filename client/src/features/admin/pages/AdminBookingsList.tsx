import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaTicketSimple, FaXmark } from "react-icons/fa6";
import {
  useAdminBookings,
  useAdminUpdateBooking,
  useAdminCancelBooking,
} from "../hooks/useAdminBookings";
import { StatusBadge } from "../components/BookingStatus";
import { InlineStatusEditor } from "../components/InlineStatusEditor.tsx";
import type { InlineEdit } from "../components/InlineStatusEditor.tsx";
import { CancelBookingModal } from "../../bookings/components/CancelBookingModal";
import { Pagination } from "../../../components/ui/Pagination";
import { formatCurrency, formatDate } from "../utils/formatters";
import type { Booking } from "../../bookings/types";

const PAGE_SIZE = 10;

const BOOKING_STATUSES: Booking["status"][] = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];
const PAYMENT_STATUSES: Booking["paymentStatus"][] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];



const HEADERS = [
  "Tour",
  "Customer",
  "Guests",
  "Total",
  "Date",
  "Status",
  "Payment",
  "Actions",
];


const AdminBookingsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Math.floor(Number(searchParams.get("page"))) || 1);
  const filterStatus = searchParams.get("status") ?? "";
  const filterPayment = searchParams.get("paymentStatus") ?? "";

  const { data, isPending, isError, isPlaceholderData } = useAdminBookings(
    page,
    PAGE_SIZE,
    {
      status: filterStatus || undefined,
      paymentStatus: filterPayment || undefined,
    },
  );

  const bookings = data?.bookings ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const goToPage = (next: number) =>
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(next));
      return p;
    });

  const setFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (value) p.set(key, value);
      else p.delete(key);
      p.set("page", "1");
      return p;
    });
  };

  // Clamp page if data shrinks
  useEffect(() => {
    if (data && totalPages > 0 && page > totalPages) {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("page", String(totalPages));
          return p;
        },
        { replace: true },
      );
    }
  }, [data, page, totalPages, setSearchParams]);

  // Mutations
  const updateMutation = useAdminUpdateBooking();
  const cancelMutation = useAdminCancelBooking();

  // Inline editing state
  const [activeEdit, setActiveEdit] = useState<InlineEdit | null>(null);

  const handleSaveEdit = (value: string) => {
    if (!activeEdit) return;
    updateMutation.mutate(
      {
        id: activeEdit.bookingId,
        data:
          activeEdit.field === "status"
            ? { status: value as Booking["status"] }
            : { paymentStatus: value as Booking["paymentStatus"] },
      },
      { onSuccess: () => setActiveEdit(null) },
    );
  };

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const handleConfirmCancel = () => {
    if (!cancelTarget || cancelMutation.isPending) return;
    cancelMutation.mutate(cancelTarget._id, {
      onSuccess: () => setCancelTarget(null),
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-body">
            Manage all bookings
            {totalCount > 0 && ` (${totalCount} total)`}
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-body uppercase tracking-wide">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilter("status", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:outline-none focus:border-sky-500 capitalize cursor-pointer"
            aria-label="Filter by booking status"
          >
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-body uppercase tracking-wide">
            Payment
          </label>
          <select
            value={filterPayment}
            onChange={(e) => setFilter("paymentStatus", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:outline-none focus:border-sky-500 capitalize cursor-pointer"
            aria-label="Filter by payment status"
          >
            <option value="">All payments</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          Failed to load bookings. Please try again.
        </div>
      )}

      {/* Empty state */}
      {!isPending && !isError && totalCount === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
            <FaTicketSimple />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-heading">
            No bookings found
          </h2>
          <p className="mt-1 text-sm text-body">
            {filterStatus || filterPayment
              ? "Try clearing the filters."
              : "No bookings have been made yet."}
          </p>
        </div>
      )}

      {/* Table */}
      {!isPending && !isError && bookings.length > 0 && (
        <div>
          <div
            className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto ${isPlaceholderData ? "opacity-60 transition-opacity" : ""}`}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {HEADERS.map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="whitespace-nowrap px-6 py-3 font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      {booking.tour?.name ?? "Deleted tour"}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {booking.user?.name ?? "Deleted user"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.user?.email}
                      </p>
                    </td>

                    <td className="px-6 py-4">{booking.guests}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(booking.price)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(booking.startDate)}
                    </td>

                    {/* Status — click to edit inline */}
                    <td className="px-6 py-4">
                      {activeEdit?.bookingId === booking._id &&
                      activeEdit.field === "status" ? (
                        <InlineStatusEditor
                          edit={activeEdit}
                          options={BOOKING_STATUSES}
                          isPending={updateMutation.isPending}
                          onSave={handleSaveEdit}
                          onClose={() => setActiveEdit(null)}
                        />
                      ) : (
                        <button
                          type="button"
                          title="Click to edit status"
                          onClick={() =>
                            setActiveEdit({
                              bookingId: booking._id,
                              field: "status",
                              current: booking.status,
                            })
                          }
                          className="cursor-pointer hover:opacity-75 transition-opacity"
                        >
                          <StatusBadge status={booking.status} />
                        </button>
                      )}
                    </td>

                    {/* Payment status — click to edit inline */}
                    <td className="px-6 py-4">
                      {activeEdit?.bookingId === booking._id &&
                      activeEdit.field === "paymentStatus" ? (
                        <InlineStatusEditor
                          edit={activeEdit}
                          options={PAYMENT_STATUSES}
                          isPending={updateMutation.isPending}
                          onSave={handleSaveEdit}
                          onClose={() => setActiveEdit(null)}
                        />
                      ) : (
                        <button
                          type="button"
                          title="Click to edit payment status"
                          onClick={() =>
                            setActiveEdit({
                              bookingId: booking._id,
                              field: "paymentStatus",
                              current: booking.paymentStatus,
                            })
                          }
                          className="cursor-pointer hover:opacity-75 transition-opacity"
                        >
                          <StatusBadge status={booking.paymentStatus} />
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {booking.status !== "cancelled" &&
                        booking.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(booking)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer whitespace-nowrap"
                          >
                            <FaXmark size={11} />
                            Cancel
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            disabled={isPlaceholderData}
          />
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          isPending={cancelMutation.isPending}
          detail={
            <p className="text-sm text-body mb-6">
              Customer:{" "}
              <span className="font-semibold text-heading">
                {cancelTarget.user?.name ?? "Unknown"}
              </span>
            </p>
          }
          onConfirm={handleConfirmCancel}
          onClose={() => {
            if (!cancelMutation.isPending) setCancelTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminBookingsList;
