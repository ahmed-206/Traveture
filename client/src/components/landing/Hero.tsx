
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarDays, FaLocationDot } from "react-icons/fa6";
import { FaArrowDown } from "react-icons/fa6";
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
      style={{ backgroundImage: `url('/img/SkySphinx.png')` }}
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
     <div className="absolute bottom-0 -translate-5 rounded-2xl bg-white py-6 px-4 w-full max-w-3xl z-10">
  <form
    onSubmit={handleSearch}
    className="flex items-end gap-3 w-full"
  >
    {/* Location Input Group */}
    <div className="flex-1 flex flex-col gap-1.5">
      <label className="text-body font-semibold text-start text-sm">
        Location
      </label>
      <div className="relative bg-[#DEDEE0]/50 transition-colors rounded-lg px-4 py-2.5 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <FaLocationDot className="text-primary" />
          <span className="text-body/50 text-base font-normal truncate">
            {destination || "Add Location"}
          </span>
        </div>
        <FaArrowDown className="text-primary text-sm" />

        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          <option value="" className="text-body">Select location</option>
          {DESTINATIONS.map((dest) => (
            <option key={dest} value={dest} className="text-body">
              {dest}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* Date Input Group */}
    <div className="flex-1 flex flex-col gap-1.5">
      <label className="text-body text-start font-semibold text-sm">
        Date
      </label>
      <div className="relative bg-[#DEDEE0]/50 transition-colors rounded-lg px-4 py-2.5 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <FaCalendarDays className="text-primary" />
          <span className="text-body/50 text-base font-normal truncate">
            {date
              ? new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Add Date"}
          </span>
        </div>
        <FaArrowDown className="text-primary text-sm" />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>

    {/* Discover Button */}
    <button
      type="submit"
      className="bg-primary text-white font-bold text-lg px-4 py-2 rounded-lg transition-all shadow-sm shrink-0 cursor-pointer"
    >
      Discover
    </button>
  </form>
</div>
    </section>
  );
};

export default Hero;
