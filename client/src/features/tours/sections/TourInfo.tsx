import { FaCalendarDays, FaUsers, FaStar, FaMountain } from "react-icons/fa6";
import { type Tour } from "../types";
import { getUserImageUrl } from "../../../utils/getImageUrl";

interface TourInfoProps {
  tour: Tour;
}
const TourInfo = ({ tour }: TourInfoProps) => {
  const nextDate = tour.startDates?.[0]
    ? new Date(tour.startDates[0]).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const facts = [
    {
      id: 1,
      title: "Next Date",
      value: nextDate,
      icon: FaCalendarDays,
    },
    {
      id: 2,
      title: "Participants",
      value: `${tour.maxGroupSize} People`,
      icon: FaUsers,
    },
    {
      id: 3,
      title: "Rating",
      value: `${tour.ratingsAverage} / 5`,
      icon: FaStar,
    },
    {
      id: 4,
      title: "Difficulty",
      value: tour.difficulty,
      icon: FaMountain,
    },
  ];
  return (
    <section className="mt-6 pb-12 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-y-6 gap-x-4 lg:grid-cols-4">
        {facts.map((fact) => {
          const Icon = fact.icon;

          return (
            <div
              key={fact.id}
              className="group flex items-center gap-3 justify-start w-full"
            >
              {/* Icon */}
              <div className="shrink-0">
                <Icon
                  size={28}
                  className="text-primary transition-all duration-300"
                />
              </div>

              {/* Text Grouped */}
              <div className="flex flex-col">
                <p className="text-xs uppercase tracking-wider text-body/70">
                  {fact.title}
                </p>
                <h3 className="text-body text-base sm:text-lg font-bold leading-tight">
                  {fact.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 sm:mt-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold bg-linear-to-r from-primary to-primary-light bg-clip-text text-transparent mb-3">
          {tour.name}
        </h2>
        <p className="text-body text-sm md:text-base leading-relaxed">
          {tour.description}
        </p>
      </div>

      <div className="py-12 bg-white text-center mt-16">
        <h2 className="text-2xl font-extrabold uppercase tracking-wider bg-linear-to-r from-primary to-primary-light bg-clip-text text-transparent mb-8">
          YOUR TOUR GUIDES
        </h2>

        {/* Guides Container */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 px-4">
          {tour.guides && tour.guides.length > 0 ? (
            tour.guides.map((guide) => (
              <div
                key={guide._id}
                className="flex items-center gap-3 text-left"
              >
                <img
                  src={getUserImageUrl(guide.photo)}
                  alt={guide.name}
                  className="w-12 h-12 rounded-full object-cover bg-gray-200"
                />

                {/* Info */}
                <div>
                  <h3 className="font-bold text-heading leading-tight">
                    {guide.role === "lead-guide" ? "Lead guide" : "Tour guide"}
                  </h3>
                  <p className="text-sm text-body">{guide.name}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-body">No guides assigned to this tour yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default TourInfo;
