import { FaArrowRight } from "react-icons/fa6";
import { TourGrid } from "../../features/tours/components/TourGrid";

const Tours = () => {
  return (
    <section className="pt-12 pb-24 px-6 bg-bg">
      <div className="max-w-300 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <h2 className="text-4xl font-bold font-headings text-heading mt-3 tracking-tight">
            Featured Tours
          </h2>
        </div>

          <TourGrid />
      </div>

      <div className="flex items-center gap-2 pt-12 text-center justify-center text-body hover:text-primary hover:translate-x-1 transition-all">
        <a href="#">View All Tours</a>
        <FaArrowRight />
      </div>
    </section>
  );
};

export default Tours;
