import { TourDetailSkeleton } from "../components/TourDetailSkeleton";
import { TourErrorState } from "../components/TourErrorState";
import TourHero from "../sections/TourHero";
import TourInfo from "../sections/TourInfo";
import { TourPreview } from "../sections/TourPreview";
import { useTour } from "../hooks/useTour";
import { useParams } from "react-router-dom";

const ToursDetails = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const {
    data: tour,
    isError,
    error,
    isLoading,
    refetch,
  } = useTour(tourId || "");
  if (isLoading) return <TourDetailSkeleton />;

  if (isError)
    return <TourErrorState message={error?.message} onRetry={refetch} />;

  if (!tour) return <TourErrorState message="Tour not found!" />;
  return (
    <>
      <TourHero tour={tour} />
      <TourInfo tour={tour} />
      <TourPreview tour={tour} />
    </>
  );
};

export default ToursDetails;
