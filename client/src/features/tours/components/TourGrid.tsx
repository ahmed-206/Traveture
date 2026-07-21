import TourCard from "./TourCard";
import { TourSkeleton } from "./TourSkeleton";
import { TourErrorState } from "./TourErrorState";
import { useTours } from "../hooks/useTours";

export const TourGrid = () => {
  const { data: tours, error, isError, isLoading, refetch } = useTours();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TourSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <TourErrorState message={error?.message} onRetry={refetch} />;
  }

  if (!tours || tours.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No tours available at the moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour) => (
        <TourCard key={tour._id} tour={tour} />
      ))}
    </div>
  );
};
