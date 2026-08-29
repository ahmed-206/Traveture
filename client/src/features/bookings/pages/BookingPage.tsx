import { useState } from "react";
import { FaRegCalendarAlt, FaUsers } from "react-icons/fa";

interface Tour {
  name: string;
  price: number;
}

export const BookingPage = ({ tour = { name: "Nile Adventure", price: 500 } }: { tour?: Tour }) => {
  const [date, setDate] = useState("2026-09-20");
  const [guests, setGuests] = useState<number>(2);

  const total = tour.price * guests;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        
        {/* Header Title */}
        <h2 className="text-center text-xl font-semibold text-sky-500 mb-8 lowercase tracking-wide">
          let’s book your next adventure
        </h2>

        {/* Inputs Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Date Input */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-900 text-sm">Date</label>
            <div className="relative flex items-center">
              <FaRegCalendarAlt className="absolute left-3 text-sky-500 text-lg pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-500 font-medium focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          {/* Guests Input */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-900 text-sm">Guests</label>
            <div className="relative flex items-center">
              <FaUsers className="absolute left-3 text-sky-500 text-xl pointer-events-none" />
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 my-6" />

        {/* Booking Summary */}
        <div className="space-y-4 mb-8">
          <h3 className="text-center font-bold text-gray-900 text-lg mb-6">
            Booking summary
          </h3>

          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="font-bold text-gray-900">Tour name</span>
            <span className="font-bold text-gray-900">{tour.name}</span>
          </div>

          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="font-bold text-gray-900">Tour price</span>
            <span className="font-bold text-gray-900">${tour.price}</span>
          </div>

          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="font-bold text-gray-900">Guests × {guests}</span>
            <span className="font-bold text-gray-900">${tour.price * guests}</span>
          </div>

          <div className="flex justify-between items-center text-base sm:text-lg pt-2">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-extrabold text-gray-900">${total}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button className="w-full bg-[#008db9] hover:bg-[#007ba2] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-sm active:scale-[0.99] cursor-pointer">
          Continue to Payment
        </button>

      </div>
    </div>
  );
};