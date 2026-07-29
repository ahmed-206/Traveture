import { useState } from "react";
import TourCard from "../components/TourCardHorizental";
import { FaFilter, FaSortAmountDown } from "react-icons/fa";
import heroCover from "/img/toursHero.jpg";
import { useTours } from "../hooks/useTours";
import { AllToursSkeleton } from "../components/AllToursSkeleton";
import { DURATION_MAP, DESTINATIONS, PRICE_MAP, SORT_MAP} from "../constants/filters";

const LIMIT = 5;

const AllTours = () => {
  const [page, setPage] = useState(1);
  const [destination, setDestination] = useState(null);
  const [duration, setDuration] = useState(null);
  const [price, setPrice] = useState(null);
  const [rating, setRating] = useState(null);
  const [sortLabel, setSortLabel] = useState("Most Popular");

  const filters = {
    ...(destination && {
      "startLocation.description[regex]": destination,
      "startLocation.description[options]": "i",
    }),
    ...(duration && DURATION_MAP[duration]),
    ...(price && PRICE_MAP[price]),
    ...(rating && { "ratingsAverage[gte]": rating }),
    sort: SORT_MAP[sortLabel],
  };

  const { data, isPending } = useTours(page, {
    ...filters,
    limit: LIMIT,
  });
  const tours = data?.tours ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / LIMIT);

  if (isPending) return <AllToursSkeleton />;

  return (
    <div className="bg-gray-200 min-h-screen pb-12 font-sans">
      {/* Hero Banner */}
      <div
        className="relative h-64 sm:h-80 bg-cover bg-center flex flex-col items-center justify-center text-white px-4 text-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(${heroCover})`,
        }}
      >
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-wide mb-3">
          Discover Egypt's Best Adventures
        </h1>
        <p className="text-xl sm:text-md font-light text-white">
          Search tours, compare prices and book your next trip.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-bold text-heading mb-6 text-center lg:text-left flex items-center justify-center lg:justify-start gap-2">
                <FaFilter className="text-primary text-base lg:hidden" />
                Filter by
              </h2>

              {/* Destination Filter */}
              <div className="mb-6">
                <h3 className="font-bold text-heading mb-3 text-sm">
                  Destination
                </h3>
                <div className="space-y-2 text-xs text-heading font-semibold">
                  {DESTINATIONS.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2.5 cursor-pointer hover:text-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={destination === item}
                        onChange={() => {
                          setPage(1);
                          setDestination((prev) =>
                            prev === item ? null : item,
                          );
                        }}
                        className="rounded text-primary focus:ring-0 border-gray-300"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-body/20 my-4" />

              {/* Duration Filter */}
              <div className="mb-6">
                <h3 className="font-bold text-heading mb-3 text-sm">
                  Duration
                </h3>
                <div className="space-y-2 text-xs text-heading font-semibold">
                  {Object.keys(DURATION_MAP).map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2.5 cursor-pointer hover:text-primary transition-colors"
                    >
                      <input
                        type="radio"
                        name="duration"
                        checked={duration === item}
                        onChange={() => {
                          setPage(1);
                          setDuration(item);
                        }}
                        className="text-primary focus:ring-0 border-body"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-body/20 my-4" />

              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="font-bold text-heading mb-3 text-sm">Price</h3>
                <div className="space-y-2 text-xs text-heading font-semibold">
                  {Object.keys(PRICE_MAP).map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2.5 cursor-pointer hover:text-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={price === item}
                        onChange={() => {
                          setPage(1);
                          setPrice((prev) => (prev === item ? null : item));
                        }}
                        className="rounded text-primary focus:ring-0 border-body"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-body/20 my-4" />

              {/* Rating Filter */}
              <div>
                <h3 className="font-bold text-heading mb-3 text-sm">Rating</h3>
                <div className="space-y-2 text-xs text-heading">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <label
                      key={stars}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={rating === stars}
                        onChange={() => {
                          setPage(1);
                          setRating((prev) => (prev === stars ? null : stars));
                        }}
                        className="rounded text-primary focus:ring-0 border-body"
                      />
                      <div className="flex">
                        {[...Array(stars)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-semibold text-gray-600">
                Showing{" "}
                <span className="text-primary font-bold">{tours.length} of {totalCount}</span>{" "}
                tours available
              </p>

              <div className="flex items-center gap-2">
                <FaSortAmountDown className="text-body text-xs" />
                <span className="text-xs font-semibold text-body">
                  Sort by:
                </span>
                <select
                  value={sortLabel}
                  onChange={(e) => {
                    setPage(1);
                    setSortLabel(e.target.value);
                  }}
                  className="bg-gray-50 border border-body text-body text-xs rounded-lg p-2 focus:outline-none focus:border-primary font-medium"
                >
                  {Object.keys(SORT_MAP).map((label) => (
                    <option key={label}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {tours.map((tour) => (
                <TourCard key={tour._id} tour={tour} />
              ))}
            </div>

            <div className="pt-6 flex justify-center">
              <div className="flex items-center gap-1 bg-white p-1 rounded-md shadow-xs text-xs font-semibold text-gray-600">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                <button className="px-3 py-1.5 bg-primary text-white rounded font-bold">
                  {page}
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTours;
