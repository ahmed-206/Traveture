import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export const BookingSuccessPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-10 border border-gray-100 text-center">
        <FaCheckCircle className="text-success text-6xl mx-auto mb-6" />

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Payment Received Successfully!
        </h2>

        <p className="text-gray-600 text-base mb-2">
          Your booking confirmation is being processed.
        </p>

        <p className="text-gray-400 text-sm mb-8">
          You'll receive a confirmation shortly. This usually takes just a few
          moments.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Back to Home
          </Link>

          <Link
            to="/profile"
            className="px-6 py-3 bg-[#008db9] hover:bg-[#007ba2] text-white font-semibold rounded-xl transition-colors"
          >
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};
