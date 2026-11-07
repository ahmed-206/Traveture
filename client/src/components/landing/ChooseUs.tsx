const featuresData = [
  {
    id: 1,
    title: "Best price",
    description: "We guarantee the lowest prices for unforgettable trips.",
  },
  {
    id: 2,
    title: "Safe Trip",
    description: "Travel with certified guides and trusted partners.",
  },
  {
    id: 3,
    title: "Top Guides",
    description: "Experienced local guides for every destination.",
  },
  {
    id: 4,
    title: "24/7 Support",
    description: "We're here anytime before and during your journey.",
  },
];

const ChooseUs = () => {
  return (
    <section
      className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/img/cover.png')` }}
    >
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/60 to-black/40 backdrop-blur-[1px]" />

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-headings text-white text-center mb-10 sm:mb-16 md:mb-20 tracking-tight">
          Why travel with Traveture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuresData.map((item) => (
            <div
              key={item.id}
              className="flex flex-col border-l-4 sm:border-l-6 border-secondary pl-3.5 sm:pl-4 text-left justify-start transition-all duration-300 hover:translate-x-1 sm:hover:translate-x-2"
            >
              <h3 className="font-headings text-xl sm:text-2xl font-bold text-white tracking-wide">
                {item.title}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-white/85 font-light">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChooseUs;
