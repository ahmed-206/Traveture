import { FaCalendarDays, FaLocationDot} from "react-icons/fa6";

const TourHero = () => {
  return (
    <section
      className="relative flex lg:h-[70vh] sm:h-[60vh] items-end overflow-hidden"
      style={{
        backgroundImage: "url('/img/cta.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-primary/80 to-primary-light/80" />

      <div className="container relative z-10 pb-20 text-center">
        <h1 className="mt-4 font-headings text-6xl  font-bold text-white">
          The Pyramids Journey
        </h1>

        <div className="mt-6 flex flex-wrap gap-6 justify-center ">
          <div className="flex items-center gap-2">
            <FaLocationDot size={18} className="text-white" />
            <span className="text-white">Giza, Egypt</span>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarDays size={18} className="text-white" />

            <span className="text-white">10 Days</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourHero;
