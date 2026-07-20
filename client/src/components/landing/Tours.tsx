import { FaArrowRight } from "react-icons/fa6";
import TourCard from "../ui/TourCard";

const Tours = () => {
  return (
    <section className="pt-12 pb-24 px-6 bg-bg">
      <div className="max-w-300 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <h2 className="text-4xl font-bold font-headings text-heading mt-3 tracking-tight">
            Featured Tours
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TourCard
            image="/img/city/luxor.jpg"
            title="The Pharaohs' Journey"
            duration="10-day tour"
            description="Breathing in Nature in Egypt most spectacular National Parks"
            location="Cairo, Egypt"
            date="August 2026"
            stops="4 Stops"
            people="15 People"
            price={1550}
            rating={4.7}
            reviews={7}
          />
          <TourCard
            image="/img/city/luxor.jpg"
            title="The Pharaohs' Journey"
            duration="10-day tour"
            description="Breathing in Nature in Egypt most spectacular National Parks"
            location="Cairo, Egypt"
            date="August 2026"
            stops="4 Stops"
            people="15 People"
            price={1550}
            rating={4.7}
            reviews={7}
          />
          <TourCard
            image="/img/city/luxor.jpg"
            title="The Pharaohs' Journey"
            duration="10-day tour"
            description="Breathing in Nature in Egypt most spectacular National Parks"
            location="Cairo, Egypt"
            date="August 2026"
            stops="4 Stops"
            people="15 People"
            price={1550}
            rating={4.7}
            reviews={7}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-12 text-center justify-center text-body hover:text-primary hover:translate-x-1 transition-all">
        <a href="#">View All Tours</a>
        <FaArrowRight />
      </div>
    </section>
  );
};

export default Tours;
