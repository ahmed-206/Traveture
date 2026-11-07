import { Link } from "react-router-dom";

const Cta = () => {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-bg flex flex-col justify-center items-center text-center">
      <div className="w-full max-w-4xl rounded-2xl sm:rounded-card border border-border/70 bg-white/70 backdrop-blur-md px-6 sm:px-12 py-10 sm:py-16 shadow-card">
        <h2 className="font-headings mb-6 sm:mb-8 text-2xl sm:text-4xl md:text-5xl font-bold text-primary">
          Ready to Explore <span className="text-secondary">Egypt?</span>
        </h2>
        <p className="font-body text-body text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 sm:mb-10">
          Book your dream adventure today and discover the wonders of ancient history and breathtaking landscapes.
        </p>
        <Link
          to="/tours"
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-input bg-primary px-8 sm:px-10 py-3.5 sm:py-4 font-body text-base sm:text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-primary-700 hover:shadow-xl shadow-sm"
        >
          Explore All Tours
        </Link>
      </div>
    </section>
  );
};

export default Cta;
