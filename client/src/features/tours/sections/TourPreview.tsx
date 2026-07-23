import { type Tour } from "../types";
import { getTourImageUrl } from "../../../utils/getImageUrl";
import { TourMap } from "../components/TourMap";
import { TourReviews } from "../components/TourReviews";
interface TourPreviewProps {
  tour: Tour;
  onBookTour?: () => void;
}

export const TourPreview = ({ tour, onBookTour }: TourPreviewProps) => {
  return (
    <section className="w-full">
      {/* IMAGES  */}
      <div className="grid grid-cols-1 md:grid-cols-3 w-full">
        {tour.images && tour.images.length > 0
          ? tour.images.slice(0, 3).map((img, index) => (
              <div
                key={index}
                className="h-64 sm:h-80 md:h-96 w-full overflow-hidden"
              >
                <img
                  src={getTourImageUrl(img)}
                  alt={`Tour image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))
          : // Fallback
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 sm:h-80 md:h-96 bg-gray-300 flex items-center justify-center border-r border-gray-200 text-gray-600 font-medium"
              >
                Image {i}
              </div>
            ))}
      </div>

      {/*  MAP  */}
      <TourMap tour={tour} />
      <TourReviews tour={tour}/>
      <div className="bg-bg py-16 px-4">
        <div className="bg-surface rounded-card p-8 sm:p-14 text-center max-w-5xl mx-auto shadow-sm border border-primary-light/20">
          <h2 className="text-2xl sm:text-4xl md:text-3xl font-extrabold text-primary tracking-tight mb-4">
            What are you waiting for?
          </h2>

          <p className="text-body/50 text-base sm:text-lg md:text-xl font-medium mb-8">
            {tour.duration ?? 0} days. 1 adventure. Infinite memories. Make it yours today!
          </p>

          <button
            onClick={onBookTour}
            className="bg-linear-to-r from-primary  to-primary-light text-white font-bold text-lg px-8 py-3.5 rounded-input shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
          >
            Book Tour Now
          </button>
        </div>
      </div>
    </section>
  );
};
