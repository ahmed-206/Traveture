import { type Tour } from "../types";
import { getTourImageUrl } from "../../../utils/getImageUrl";
import { TourMap } from "../components/TourMap";
import { TourReviews } from "../components/TourReviews";
import { FaMapPin } from "react-icons/fa6";
import { Link } from "react-router-dom";

interface TourPreviewProps {
  tour: Tour;
  onBookTour?: () => void;
}



export const TourPreview = ({ tour, onBookTour }: TourPreviewProps) => {
  return (
    <section className="w-full">
      {/* IMAGES  */}
      <div className="py-12 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto items-start">
          {tour.images && tour.images.length > 0
            ? tour.images.slice(0, 3).map((img, index) => (
                <div
                  key={index}
                  className="relative group transition-all duration-300 hover:-translate-y-2 hover:rotate-1"
                >
                  {/* الدبوس - مثبت في منتصف الأعلى */}
                  <FaMapPin className="text-secondary absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 z-10 drop-shadow-md" />

                  {/* فريم الصورة الأبيض والظل */}
                  <div className="p-3 bg-white shadow-xl rounded-sm border border-gray-100">
                    <div className="h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-gray-50">
                      <img
                        src={getTourImageUrl(img)}
                        alt={`Tour image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              ))
            : // Fallback skeleton in same style
              [1, 2, 3].map((i) => (
                <div key={i} className="relative group">
                  <FaMapPin className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 z-10 opacity-60" />
                  <div className="p-3 bg-white shadow-lg rounded-sm border border-gray-100 opacity-70">
                    <div className="h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-500">
                      Image Placeholder
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/*  MAP  */}
      <TourMap tour={tour} />
      <TourReviews tour={tour}/>
      <div className="bg-surface py-16 px-4">
        <div className="relative p-8 sm:p-14 text-center max-w-5xl mx-auto rounded-card overflow-hidden shadow-2xl">
          
         
          <div 
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url('/img/cta.png')` }}
          />

          
          <div className="absolute inset-0 bg-primary-dark/50" />

         
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl md:text-3xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
              What are you waiting for?
            </h2>

            <p className="text-white/90 text-base sm:text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto drop-shadow-sm">
              {tour.duration ?? 0} days. 1 adventure. Infinite memories. Make it yours today!
            </p>

            <Link
              to="/booking"
              onClick={onBookTour}
              className="bg-primary text-white font-bold text-lg px-8 py-3.5 rounded-input shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Book Tour Now
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};
