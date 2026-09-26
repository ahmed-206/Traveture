import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { FaRegCalendarAlt, FaUsers } from "react-icons/fa";
import { useTour } from "../../tours/hooks/useTour";
import { useCreateCheckoutSession } from "../hooks/useCreateCheckoutSession";
import { BookingPageSkeleton } from "../components/BookingPageSkeleton";
import { BookingError } from "../components/BookingError";
import { BookingSummary } from "../components/BookingSummary";
import { useBookingCooldown } from "../hooks/useBookingCooldown";

export const BookingPage = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const { data: tour, isLoading, isError, error } = useTour(tourId || "");
  const checkoutMutation = useCreateCheckoutSession();
  const { isCooldown, startCooldown } = useBookingCooldown();

  const [date, setDate] = useState("");
  const [guests, setGuests] = useState<number>(1);

  // Filter to only future start dates
  const availableDates = useMemo(
  () => (tour?.startDates ?? []).filter((d) => new Date(d) > new Date()),
  [tour?.startDates],
);

  // Auto-select the first available date
  useEffect(() => {
    if (availableDates.length > 0 && !date) {
      setDate(availableDates[0]);
    }
  }, [availableDates, date]);

  const handleCheckout = useCallback(() => {
    if (!tourId || !date || isCooldown || checkoutMutation.isPending) return;

    checkoutMutation.mutate(
      { tourId, guests, startDate: date },
      {
        onSettled: startCooldown,
      },
    );
  }, [tourId, date, guests, isCooldown, startCooldown, checkoutMutation]);

  const isButtonDisabled =
    checkoutMutation.isPending || isCooldown || !date || !tourId;

  const buttonText = checkoutMutation.isPending
    ? "Processing..."
    : isCooldown
      ? "Please wait..."
      : "Continue to Payment";

  if (isLoading) {
    return <BookingPageSkeleton />;
  }

  if (isError || !tour) {
    return <BookingError message={error?.message} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
     
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <h2 className="text-center text-xl font-bold bg-primary text-white py-4 px-6 mb-8 lowercase tracking-wide">
          let's book your next adventure
        </h2>

       
        <div className="p-8 pt-0">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Date Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-heading text-sm">Date</label>
              <div className="relative flex items-center">
                <FaRegCalendarAlt className="absolute left-3 text-primary text-lg pointer-events-none" />
                <select
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-border rounded-xl text-body font-medium focus:outline-none focus:border-sky-500 transition-colors appearance-none bg-white cursor-pointer"
                >
                  {availableDates.length === 0 ? (
                    <option value="">No dates available</option>
                  ) : (
                    availableDates.map((d) => (
                      <option key={d} value={d}>
                        {new Date(d).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Guests Input */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-heading text-sm">Guests</label>
              <div className="relative flex items-center">
                <FaUsers className="absolute left-3 text-primary text-xl pointer-events-none" />
                <input
                  type="number"
                  min={1}
                  max={tour.maxGroupSize}
                  value={guests}
                  onChange={(e) =>
                    setGuests(
                      Math.max(
                        1,
                        Math.min(
                          tour.maxGroupSize,
                          parseInt(e.target.value) || 0,
                        ),
                      ),
                    )
                  }
                  className="w-full pl-10 pr-3 py-2.5 border border-border rounded-xl text-gray-900 font-medium focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200 my-6" />

          {/* Booking Summary */}
          <BookingSummary tour={tour} guests={guests} />

          {/* Submit Button — rate-limited */}
          <button
            onClick={handleCheckout}
            disabled={isButtonDisabled}
            className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-sm cursor-pointer
              ${
                isButtonDisabled
                  ? "bg-body text-white cursor-not-allowed"
                  : "bg-primary hover:bg-primary-700 text-white active:scale-[0.99]"
              }`}
          >
            {checkoutMutation.isPending && (
              <svg
                className="inline-block w-5 h-5 mr-2 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
