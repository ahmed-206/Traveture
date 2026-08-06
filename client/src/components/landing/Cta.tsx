import { Link } from "react-router-dom";

const Cta = () => {
    return (
      <section  className="relative  min-h-30  bg-primary-light flex flex-col justify-center items-center text-center px-6 text-white"
      >
        <div className="container mx-auto bg-primary-light/50 border border-primary-light rounded-card backdrop-blur-m
    ">
       
          <div className="px-8 py-20 text-center">
  
            
            <h2 className="font-headings mb-10 text-4xl font-bold text-white md:text-5xl">
              Ready to Explore Egypt?
            </h2>
            <Link to="/tours" className="mt-10 rounded-input bg-primary px-10 py-4 font-body text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-primary-700 over:shadow-xl">
              Explore All Tours
            </Link>
  
          </div>
        </div>
      </section>
    );
  };
  
  export default Cta;