import { FaMoneyBillWave , FaCar,FaUserTie, FaHeadset } from "react-icons/fa6";


const ChooseUs = () => {
    
  return (
    <section className="pt-12 pb-24 px-6 bg-bg ">
      <div className="max-w-300 mx-auto ">
        <h2 className="text-4xl font-bold font-headings text-heading mt-3 tracking-tight text-center">
          Why travel with us
        </h2>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* card 1 */}
          <div className="group flex h-64 w-full flex-col items-center justify-center rounded-card bg-surface p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-2">
            <div className="mb-8 rounded-full p-5 transition-all duration-300 ">
              <FaMoneyBillWave
                size={42}
                className="text-primary "
              />
            </div>
            <div>

            <h3 className="font-headings text-xl font-semibold text-color-heading transition-colors duration-300 ">
              Best price
            </h3>
            <p className="mt-3 text-sm leading-6 text-body transition-colors duration-300 ">We guarantee the lowest prices for unforgettable trips.</p>
            </div>
          </div>
          {/* card 2 */}
          <div className="group flex h-64 w-full flex-col items-center justify-center rounded-card bg-surface p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-2">
            <div className="mb-8 rounded-full p-5 transition-all duration-300 ">
              <FaCar 
                size={42}
                className="text-primary "
              />
            </div>
            <div>

            <h3 className="font-headings text-xl font-semibold text-color-heading transition-colors duration-300 ">
            Safe Trip
            </h3>
            <p className="mt-3 text-sm leading-6 text-body transition-colors duration-300 ">Travel with certified guides and trusted partners.</p>
            </div>
          </div>
          {/* card 3 */}
          <div className="group flex h-64 w-full flex-col items-center justify-center rounded-card bg-surface p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-2">
            <div className="mb-8 rounded-full p-5 transition-all duration-300 ">
              <FaUserTie
                size={42}
                className="text-primary "
              />
            </div>
            <div>

            <h3 className="font-headings text-xl font-semibold text-color-heading transition-colors duration-300 ">
            Top Guides
            </h3>
            <p className="mt-3 text-sm leading-6 text-body transition-colors duration-300 ">Experienced local guides for every destination.</p>
            </div>
          </div>
          {/* card 4 */}
          <div className="group flex h-64 w-full flex-col items-center justify-center rounded-card bg-surface p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-2">
            <div className="mb-8 rounded-full p-5 transition-all duration-300 ">
              <FaHeadset
                size={42}
                className="text-primary "
              />
            </div>
            <div>

            <h3 className="font-headings text-xl font-semibold text-color-heading transition-colors duration-300 ">
            24/7 Support
            </h3>
            <p className="mt-3 text-sm leading-6 text-body transition-colors duration-300 ">We're here anytime before and during your journey.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChooseUs;
