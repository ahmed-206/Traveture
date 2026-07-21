
export const TourSkeleton = () => {
    return (
      <div className="w-full animate-pulse overflow-hidden rounded-card bg-white p-6 shadow-md">
        <div className="-mx-6 -mt-6 h-55 bg-gray-200" />
        <div className="mt-6 h-6 w-3/4 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-1/4 rounded bg-gray-200" />
        <div className="mt-6 h-12 w-full rounded bg-gray-200" />
        <div className="mt-7 grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
        </div>
        <div className="mt-9 flex items-center justify-between">
          <div className="h-8 w-20 bg-gray-200 rounded" />
          <div className="h-10 w-28 bg-gray-200 rounded" />
        </div>
      </div>
    );
  };