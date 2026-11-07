import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarDays, FaLocationDot, FaArrowDown } from "react-icons/fa6";
import { DESTINATIONS } from "../../features/tours/constants/filters";
import { Button } from "../ui/Button";

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
      className="relative w-full min-h-[90vh] md:min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center text-center px-4 sm:px-6 text-white z-10 pt-24 pb-12 md:py-0"
      style={{ backgroundImage: `url('/img/SkySphinx.png')` }}
    >
      {/* Background overlay for mobile readability */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-225 px-2 sm:px-4 flex flex-col items-center">
        <img
          src="/img/logoWhite1.png"
          alt="Traveture Logo"
          className="w-48 sm:w-64 md:w-164 max-w-full h-auto object-contain drop-shadow-md"
        />
        <p className="mt-3 sm:mt-4 font-body text-base sm:text-2xl md:text-3xl font-medium opacity-90 tracking-wide text-white drop-shadow-sm">
          Travel and Adventure
        </p>
      </div>

      {/* Responsive Search Box */}
      <div className="relative z-10 mt-8 sm:mt-10 md:mt-0 md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:translate-y-1/2 rounded-2xl bg-white p-4 sm:p-5 md:p-6 w-full max-w-md sm:max-w-xl md:max-w-3xl shadow-card border border-border">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row items-stretch md:items-end gap-3 sm:gap-4 w-full"
        >
          {/* Location Input Group */}
          <div className="flex-1 flex flex-col gap-1.5 text-left">
            <label className="text-body font-semibold text-xs sm:text-sm">
              Location
            </label>
            <div className="relative bg-[#DEDEE0]/50 hover:bg-[#DEDEE0]/70 transition-colors rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <FaLocationDot className="text-primary shrink-0 text-base" />
                <span className="text-body text-sm sm:text-base font-normal truncate">
                  {destination || "Add Location"}
                </span>
              </div>
              <FaArrowDown className="text-primary text-xs sm:text-sm shrink-0" />

              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Select location"
              >
                <option value="" className="text-body">
                  Select location
                </option>
                {DESTINATIONS.map((dest) => (
                  <option key={dest} value={dest} className="text-body">
                    {dest}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Input Group */}
          <div className="flex-1 flex flex-col gap-1.5 text-left">
            <label className="text-body font-semibold text-xs sm:text-sm">
              Date
            </label>
            <div className="relative bg-[#DEDEE0]/50 hover:bg-[#DEDEE0]/70 transition-colors rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <FaCalendarDays className="text-primary shrink-0 text-base" />
                <span className="text-body text-sm sm:text-base font-normal truncate">
                  {date
                    ? new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Add Date"}
                </span>
              </div>
              <FaArrowDown className="text-primary text-xs sm:text-sm shrink-0" />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Select date"
              />
            </div>
          </div>

          {/* Discover Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidthOnMobile
            className="shrink-0 text-base sm:text-lg font-bold shadow-sm "
          >
            Discover
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Hero;
