import {
  FaCalendarDays,
  FaLocationDot,
  FaRoute,
  FaUsers,
  FaRegHeart,
  FaHeart,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import { type Tour } from "../../types/index";
import { useAddFavorite } from "../../../favorites/hooks/useAddFavorite";
import { useDeleteFavorite } from "../../../favorites/hooks/useDeleteFavorite";
import { getTourImageUrl } from "../../../../utils/getImageUrl";

interface TourCardProps {
  tour: Tour;
  isFavorite: boolean;
}
const TourCard = ({ tour, isFavorite }: TourCardProps) => {
  const startDate = tour.startDates?.[0]
    ? new Date(tour.startDates[0]).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "N/A";
  const locationName = tour.startLocation?.description || "Global";
  const stopsCount = tour.locations?.length || 0;


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
    <article className="w-87.5 overflow-hidden rounded-card bg-white shadow-[0_12px_30px_rgba(0,0,0,.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,.12)]">
      {/* Image */}
      <div className="relative h-55 overflow-hidden">
        <img
          src={getTourImageUrl(tour.imageCover)}
          alt={tour.name}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-0 right-0 flex h-14 w-14 items-center justify-center rounded-bl-card bg-white/80 backdrop-blur-xs transition-all duration-200 hover:bg-white cursor-pointer z-10"
        >
          {isFavorite ? (
            <FaHeart className="text-secondary" size={18}/>
          ) : (
            <FaRegHeart className="text-secondary" size={18}/>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-headings text-title font-bold leading-tight text-primary">
          {tour.name}
        </h3>

        <p className="mt-1 font-body text-body-lg font-medium text-body">
          {tour.duration}-day tour
        </p>

        <p className="mt-6 line-clamp-2 font-body text-regular leading-7 text-body">
          {tour.description}
        </p>

        <div className="mt-7 grid grid-cols-2 gap-y-5 text-regular">
          <div className="flex items-center gap-2">
            <FaLocationDot size={18} className="text-primary shrink-0" />
            <span className="text-small text-body">{locationName}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarDays size={18} className="text-primary shrink-0" />
            <span className="text-small text-body">{startDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaRoute size={18} className="text-primary shrink-0" />
            <span className="text-small text-body">{stopsCount}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaUsers size={18} className="text-primary shrink-0" />
            <span className="text-small text-body">{tour.maxGroupSize}</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-9 flex items-end justify-between">
          <div>
            <p className="font-headings text-body-lg font-bold text-secondary">
              ${tour.price}
            </p>

            <p className="mt-1 text-small text-body">
              {tour.ratingsAverage} rating ({tour.ratingsQuantity})
            </p>
          </div>

          <Link
            to={`/tours/${tour._id}`}
            className="cursor-pointer rounded-input bg-primary px-6 py-3 font-body text-[17px] font-semibold text-white transition-all duration-300 hover:bg-primary-700"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default TourCard;
