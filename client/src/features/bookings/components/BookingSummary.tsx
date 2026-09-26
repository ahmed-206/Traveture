import type { Tour } from "../../tours/types";

interface BookingSummaryProps {
  tour: Tour;
  guests: number;
}

export const BookingSummary = ({ tour, guests }: BookingSummaryProps) => {
  const total = tour.price * guests;

  return (
    <div className="space-y-4 mb-8">
          <h3 className="text-center font-bold text-heading text-lg mb-6">
            Booking summary
          </h3>

          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="font-bold text-heading">Tour name</span>
            <span className="font-bold text-heading">{tour.name}</span>
          </div>

          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="font-bold text-heading">Tour price</span>
            <span className="font-bold text-heading">${tour.price}</span>
          </div>

          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="font-bold text-heading">Guests × {guests}</span>
            <span className="font-bold text-heading">
              ${tour.price * guests}
            </span>
          </div>

          <div className="flex justify-between items-center text-base sm:text-lg pt-2">
            <span className="font-bold text-heading">Total</span>
            <span className="font-extrabold text-heading">${total}</span>
          </div>
        </div>
  );
};