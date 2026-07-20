import { FaCalendarDays, FaLocationDot, FaRoute, FaUsers } from "react-icons/fa6";

interface TourCardProps {
  image: string;
  title: string;
  duration: string;
  description: string;
  location: string;
  date: string;
  stops: string;
  people: string;
  price: number;
  rating: number;
  reviews: number;
}

const TourCard = ({
  image,
  title,
  duration,
  description,
  location,
  date,
  stops,
  people,
  price,
  rating,
  reviews,
}: TourCardProps) => {
  return (
    <article className="w-87.5 overflow-hidden rounded-card bg-white shadow-[0_12px_30px_rgba(0,0,0,.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,.12)]">
      {/* Image */}
      <div className="h-55 overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-headings text-title font-bold leading-tight text-primary">
          {title}
        </h3>

        
        <p className="mt-1 font-body text-body-lg font-medium text-body">
          {duration}
        </p>

       
        <p className="mt-6 line-clamp-2 font-body text-regular leading-7 text-body">
          {description}
        </p>

        
        <div className="mt-7 grid grid-cols-2 gap-y-5 text-regular">
        <div className="flex items-center gap-2">
            <FaLocationDot
              size={18}
              className="text-primary shrink-0"
            />
            <span className="text-small text-body">
              {location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarDays
              size={18}
              className="text-primary shrink-0"
            />
            <span className="text-small text-body">
              {date}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FaRoute
              size={18}
              className="text-primary shrink-0"
            />
            <span className="text-small text-body">
              {stops}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FaUsers
              size={18}
              className="text-primary shrink-0"
            />
            <span className="text-small text-body">
              {people}
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-9 flex items-end justify-between">
          <div>
            <p className="font-headings text-body-lg font-bold text-body">
              ${price}
            </p>

            <p className="mt-1 text-small text-body">
              {rating} rating ({reviews})
            </p>
          </div>

          <button className="cursor-pointer rounded-input bg-primary px-6 py-3 font-body text-[17px] font-semibold text-white transition-all duration-300 hover:bg-primary-700">
            View details
          </button>
        </div>
      </div>
    </article>
  );
};

export default TourCard;
