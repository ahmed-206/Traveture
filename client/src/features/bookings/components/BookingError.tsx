type BookingErrorProps = {
  message?: string;
};

export const BookingError = ({ message }: BookingErrorProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 border border-gray-100 text-center">
        <p className="text-error font-semibold text-lg mb-2">
          {message || "Tour not found"}
        </p>

        <p className="text-body">
          We couldn't load the tour details. Please try again.
        </p>
      </div>
    </div>
  );
};