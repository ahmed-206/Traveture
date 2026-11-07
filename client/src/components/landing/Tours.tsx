import { FaArrowRight } from "react-icons/fa6";
import { TourGrid } from "../../features/tours/components/TourGrid";
import { Link } from "react-router-dom";

const Tours = () => {
  return (
    <section className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 bg-bg">
      <div className="max-w-300 mx-auto">
        <div className="mb-8 md:mb-12 text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headings text-heading tracking-tight">
            Featured Tours
          </h2>
        </div>

        <TourGrid />
      </div>

      <div className="flex items-center gap-2 pt-10 sm:pt-12 text-center justify-center">
        <Link
          to="/tours"
          className="inline-flex items-center gap-2 font-body font-semibold text-sm sm:text-base text-body hover:text-primary transition-colors group"
        >
          <span>View All Tours</span>
          <FaArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default Tours;
