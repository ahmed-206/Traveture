import TourCard from "./TourCard";
import { TourSkeleton } from "./TourSkeleton";
import { TourErrorState } from "./TourErrorState";
import { useFeaturedTours } from "../hooks/useFeaturedTours";

export const TourGrid = () => {
  const { data, error, isError, isLoading, refetch } = useFeaturedTours();

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

  if (!data || data.tours.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No tours available at the moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {data.tours.map((tour) => (
        <TourCard key={tour._id} tour={tour} />
      ))}
    </div>
  );
};
