import { FaStar } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import type { Tour, Review } from "../types";
import { getUserImageUrl } from "../../../utils/getImageUrl";

import "swiper/css";
import "swiper/css/pagination";

interface TourReviewProps {
  tour: Tour;
}

export const TourReviews = ({ tour }: TourReviewProps) => {
  const hasReviews = tour.reviews && tour.reviews.length > 0;
  if (!hasReviews) {
    return (
      <div className="text-center py-10 text-body">
        No reviews yet for this tour
      </div>
    );
  }

  return (
    <section className="w-full bg-primary py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-14 px-2!"
        >
          {tour.reviews?.map((review: Review) => (
            <SwiperSlide key={review._id}>
              <div className="relative group bg-white/10 backdrop-blur-md rounded-input p-8 flex flex-col items-center text-center h-full min-h-65 justify-between shadow-lg border border-white/30 transition-all duration-300  overflow-hidden">
                
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

                
                <div className="-mt-3 mb-2 relative z-10">
                  <img
                    src={getUserImageUrl(review.user?.photo)}
                    alt={review.user?.name || "User"}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white/60 shadow-md"
                  />
                </div>

               
                <h4 className="font-bold text-white text-lg mb-2 relative z-10 drop-shadow-sm">
                  {review.user?.name || "Anonymous User"}
                </h4>

                
                <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-3 relative z-10 font-light">
                  {review.review}
                </p>

                
                <div className="flex items-center gap-1 relative z-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={18}
                      className={
                        star <= (review.rating || 5)
                          ? "text-secondary"
                          : "text-white/30"
                      }
                    />
                  ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
