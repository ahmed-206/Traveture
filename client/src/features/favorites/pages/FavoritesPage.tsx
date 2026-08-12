import TourCard from "../../tours/components/cards/TourCardHorizental";
import { EmptyFavorites } from "../components/EmptyFavorites";
import { useFavorites } from "../hooks/useFavorites";

export const Favorites = () => {
  const { data: tours = [],  } = useFavorites();

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto min-h-[60vh]">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-5xl font-bold text-heading tracking-tight">
          Your Favorite Tours
        </h2>
        <p className="mt-2 text-body/70 text-sm sm:text-base font-medium">
          All your saved adventures in one place
        </p>
      </div>
      {tours.length > 0 ? (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto items-center">
          {tours.map((tour) => (
            <div key={tour._id} className="w-full transform transition-all duration-200 hover:scale-[1.01]">
              <TourCard tour={tour} isFavorite={true} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyFavorites />
      )}
    </section>
  );
};