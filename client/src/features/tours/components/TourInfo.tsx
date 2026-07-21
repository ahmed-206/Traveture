import {
    FaCalendarDays,
    FaUsers,
    FaStar,
    FaMountain,
  } from "react-icons/fa6";
  
  const facts = [
    { id: 1, title: "Next Date", value: "April 2026", icon: FaCalendarDays },
    { id: 2, title: "Participants", value: "25 People", icon: FaUsers },
    { id: 3, title: "Rating", value: "4.9 / 5", icon: FaStar },
    { id: 4, title: "Difficulty", value: "Easy", icon: FaMountain },
  ];
  
  const TourInfo = () => {
    return (
      <section className="mt-6 pb-12 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 lg:grid-cols-4">
          {facts.map((fact) => {
            const Icon = fact.icon;
  
            return (
              <div
                key={fact.id}
                className="group flex items-center gap-3 justify-start w-full"
              >
                {/* Icon */}
                <div className="shrink-0">
                  <Icon
                    size={28}
                    className="text-primary transition-all duration-300"
                  />
                </div>
  
                {/* Text Grouped */}
                <div className="flex flex-col">
                  <p className="text-xs uppercase tracking-wider text-body/70">
                    {fact.title}
                  </p>
                  <h3 className="text-body text-base sm:text-lg font-bold leading-tight">
                    {fact.value}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
  
       
        <div className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-linear-to-r from-primary to-primary-light bg-clip-text text-transparent mb-3">
            The Pyramids Journey
          </h2>
          <p className="text-body text-sm md:text-base leading-relaxed">
            Ut enim ad minim veniam, quis nostruexercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
            in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>
      </section>
    );
  };
  
  export default TourInfo;