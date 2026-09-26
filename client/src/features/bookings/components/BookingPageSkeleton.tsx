export const BookingPageSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-8" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-px bg-gray-200 my-6" />
        <div className="space-y-3 mb-8">
          <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
        </div>
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
};
