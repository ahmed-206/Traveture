
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarDays, FaLocationDot } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { DESTINATIONS } from "../../features/tours/constants/filters";

const Hero = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);

    navigate(`/tours?${params.toString()}`);
  };

  return (
    <section
      className="relative  ml-[calc(-50vw+50%)] min-h-screen bg-cover bg-center flex flex-col justify-center items-center text-center px-6 text-white  z-10"
      style={{ backgroundImage: `url('/img/cover.png')` }}
    >
      {/* Content */}
      <div className="relative z-10 max-w-225 px-4">
        <img
          src="/img/logoWhite1.png"
          alt="Traveture Logo"
          className="w-48 md:w-164 h-auto object-contain"
        />
        <p className="mt-4 font-body text-lg md:text-3xl font-medium opacity-90 tracking-wide text-white">
          Travel and Adventure
        </p>
      </div>

      {/* Search */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-3xl px-6 z-10">
        <form
          onSubmit={handleSearch}
          className="w-full bg-white  pl-6 rounded-input shadow-xl flex items-stretch justify-between overflow-hidden"
        >
          {/* Destination Dropdown */}
          <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors">
            <FaLocationDot className="text-body mb-1" size={24} />
            <span className="text-body font-bold text-sm md:text-sm leading-tight">
              Destination
            </span>
            <span className="text-body text-xs md:text-sm font-light leading-tight mt-0.5 truncate max-w-35">
              {destination || "add destination"}
            </span>

            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-gray-800"
            >
              <option value="">
                Select destination
              </option>
              {DESTINATIONS.map((dest) => (
                <option key={dest} value={dest}>
                  {dest}
                </option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-gray-300 shrink-0 mx-1 my-auto" />

          {/* Date Picker */}
          <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors">
            <FaCalendarDays className="text-body mb-1" size={24} />
            <span className="text-body font-bold text-sm md:text-sm leading-tight">
              Date
            </span>
            <span className="text-body text-xs md:text-sm font-light leading-tight mt-0.5">
              {date
                ? new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "add date"}
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="shrink-0 p-6 bg-primary hover:bg-primary-700 text-white  transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer ml-2 hover:scale-105"
            aria-label="Search"
          >
            <FaSearch size={24} />
          </button>
        </form>
      </div>
    </section>
  );
};

export default Hero;
