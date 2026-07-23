import { FaCalendarDays, FaLocationDot } from "react-icons/fa6";
import { getTourImageUrl } from "../../../utils/getImageUrl";
import { type Tour } from "../types";

interface TourHeroProps {
  tour: Tour;
}
const TourHero = ({ tour }: TourHeroProps) => {
  return (
    <section
      className="relative flex h-[60vh] sm:h-[65vh] lg:h-[70vh] items-end overflow-hidden"
      style={{
        backgroundImage: `url(${getTourImageUrl(tour.imageCover)})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-primary/80 to-primary-light/80" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pb-10 sm:pb-16 md:pb-20 text-center">
        <h1 className="mt-4 font-headings text-3xl sm:text-4xl md:text-5xl lg:text-6xl  font-bold text-white">
          {tour?.name}
        </h1>

        <div className="mt-6 flex flex-wrap gap-6 justify-center ">
          <div className="flex items-center gap-2">
            <FaLocationDot size={18} className="text-white" />
            <span className="text-white">
              {tour.startLocation?.description || "Global"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarDays size={18} className="text-white" />

            <span className="text-white">{tour.duration} Days</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourHero;
