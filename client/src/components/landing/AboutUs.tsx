import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";

const AboutUs = () => {
  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-white overflow-hidden">
      <div className="max-w-300 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 flex flex-col items-start text-left">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-headings text-heading tracking-tight leading-tight mb-4 sm:mb-6">
              Crafting Unforgettable Journeys Across{" "}
              <span className="text-secondary">Egypt</span>
            </h2>

            <p className="font-body text-body text-sm sm:text-base lg:text-lg leading-relaxed mb-4">
              At Traveture, we believe travel is more than simply visiting new
              places—it is about feeling the spirit of the land, discovering
              timeless stories, and forging connections that endure for a
              lifetime.
            </p>

            <p className="font-body text-body/80 text-xs sm:text-sm lg:text-base leading-relaxed mb-6 sm:mb-8">
              From the majestic Pyramids of Giza and the tranquil sunsets of the
              Nile in Aswan to the turquoise coral reefs of Dahab and Sharm el
              Sheikh, we design immersive travel experiences led by certified
              local guides dedicated to making every moment authentic,
              inspiring, and worry-free.
            </p>

            {/* CTA Button */}
            <Link
              to="/tours"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-700 text-white font-body font-semibold text-sm sm:text-base px-6 sm:px-7 py-3 sm:py-3.5 rounded-input transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Explore All Tours</span>
              <FaArrowRight size={14} />
            </Link>
          </div>

          {/* Photo Column: (first on small devices, right column on large screens) */}
          <div className="order-1 lg:order-2 relative w-full max-w-lg lg:max-w-none mx-auto">
            <div
              className="absolute -top-6 -right-6 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-8 -left-8 w-44 sm:w-60 h-44 sm:h-60 bg-secondary/10 rounded-full blur-2xl -z-10 pointer-events-none"
              aria-hidden="true"
            />

            {/* Main Image Container */}
            <div className="relative rounded-card overflow-hidden shadow-card border border-border group bg-neutral-bg">
              <img
                src="/img/imgC.jpg"
                alt="Traveture Adventure Experience in Egypt"
                className="w-full h-64 sm:h-96 md:h-110 lg:h-125 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div
                className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
