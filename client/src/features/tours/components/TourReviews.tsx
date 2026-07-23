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
    return <div className="text-center py-10 text-body">No reviews yet for this tour</div>
  }

  return (
    <section className="w-full bg-bg py-16">
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
              <div className="bg-surface rounded-input p-8 flex flex-col items-center text-center h-full min-h-65 justify-between shadow-xl border border-body/15 transition-shadow">
                
                {/* User Avatar */}
                <div className="-mt-3 mb-2">
                  <img
                    src={getUserImageUrl(review.user?.photo)}
                    alt={review.user?.name || "User"}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>

                {/* User Name */}
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  {review.user?.name || "Anonymous User"}
                </h4>

                {/* Review Text */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {review.review}
                </p>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={18}
                      className={
                        star <= (review.rating || 5)
                          ? "text-amber-400"
                          : "text-gray-400"
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