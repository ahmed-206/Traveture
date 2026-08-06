
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
      className="relative py-28 px-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/img/cover.png')` }}
    >
      {/* Overlay خفيف لإبراز النص فوق الصورة */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30 backdrop-blur-[1px]" />

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold font-headings text-white text-center mb-20 tracking-tight">
          Why travel with Traveture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map((item) => (
            <div
              key={item.id}
              className="flex flex-col border-l-6 border-secondary pl-4 text-left justify-start transition-all duration-300 hover:translate-x-2"
            >
              <h3 className="font-headings text-2xl font-bold text-white tracking-wide">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80 font-light">
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