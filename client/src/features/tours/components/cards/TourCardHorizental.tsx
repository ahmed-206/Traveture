import {
  FaStar,
  FaLocationDot,
  FaCalendarDays,
  FaUsers,
  FaClock,
  FaStarHalfStroke,
  FaRegStar,
  FaRegHeart,
  FaHeart,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import { type Tour } from "../../types/index";
import { useAddFavorite } from "../../../favorites/hooks/useAddFavorite";
import { useDeleteFavorite } from "../../../favorites/hooks/useDeleteFavorite";

interface TourCardProps {
  tour: Tour;
  isFavorite: boolean;
}

const TourCard = ({ tour, isFavorite }: TourCardProps) => {
  const locationName = tour.startLocation?.description || "Global";
  const startDate = tour.startDates?.[0]
    ? new Date(tour.startDates[0]).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const { mutate: addFav, isPending: isAdding } = useAddFavorite();
  const { mutate: removeFav, isPending: isRemoving } = useDeleteFavorite();

  const handleToggleFavorite = () => {
    if (isAdding || isRemoving) return;
    if (isFavorite) {
      removeFav(tour._id);
    } else {
      addFav(tour._id);
    }
  };

  return (
    <div className="bg-white rounded-card shadow-sm hover:shadow-md transition-shadow duration-300 p-3 sm:p-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
      <div className="relative w-full sm:w-5/12 h-48 sm:h-auto min-h-40 rounded-card flex items-center justify-center text-white text-2xl font-semibold shrink-0">
        <img
          src={`http://localhost:3000/img/tours/${tour.imageCover}`}
          alt={tour.name}
          className="h-full w-full object-cover rounded-card"
        />
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-bl-card bg-white/80 backdrop-blur-xs transition-all duration-200 hover:bg-white cursor-pointer z-10"
        >
          {isFavorite ? (
            <FaHeart className="text-secondary" size={18}/>
          ) : (
            <FaRegHeart className="text-secondary" size={18}/>
          )}
        </button>
      </div>

      {/* Container */}
      <div className="w-full sm:w-7/12 flex flex-col gap-3 py-1">
       
        <div className="flex justify-between">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-primary font-bold text-lg sm:text-xl leading-snug">
              {tour.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-secondary text-xs">
              {[...Array(Math.floor(tour.ratingsAverage || 0))].map((_, i) => (
                <FaStar key={`full-${i}`} />
              ))}

              {tour.ratingsAverage % 1 >= 0.5 && <FaStarHalfStroke />}

              {[...Array(5 - Math.ceil(tour.ratingsAverage || 0))].map(
                (_, i) => (
                  <FaRegStar key={`empty-${i}`} className="text-body" />
                ),
              )}
            </div>
          </div>

          <span className="text-primary font-extrabold text-lg sm:text-xl shrink-0">
            ${tour.price}
          </span>
        </div>

        {/* Tour Details */}
        <div className="flex justify-between">
          <div className="space-y-3 my-3 text-xs sm:text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <FaLocationDot className="text-primary shrink-0" />
              <span>{locationName}</span>
            </div>

            <div className="flex items-center gap-2">
              <FaCalendarDays className="text-primary shrink-0" />
              <span>{startDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <FaUsers className="text-primary shrink-0" />
              <span>{tour.maxGroupSize} Persons</span>
            </div>

            <div className="flex items-center gap-2">
              <FaClock className="text-primary shrink-0" />
              <span>{tour.duration} Days</span>
            </div>
          </div>

         
          <div className="flex justify-end items-end self-end  mt-2 sm:mt-0">
            <Link to={`/tours/${tour._id}`} className=" bg-primary hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold px-5 py-2 rounded-lg transition-colors duration-200">
              See Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
