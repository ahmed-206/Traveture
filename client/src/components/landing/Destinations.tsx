import DestinationCard from "../ui/DestinationCard";
const Destinations = () => {
  const destinationsData = [
    {
      id: 1,
      title: "Aswan",
      imageSrc:
        "img/city/aswan.jpg",
      desc: "Experience the serene majesty of the Nile.",
    },
    {
      id: 2,
      title: "Giza",
      imageSrc:
        "img/city/giza.jpeg",
      desc: "Marvel at the ultimate ancient world wonders.",
    },
    {
      id: 3,
      title: "Alexandria",
      imageSrc:
        "img/city/alex.jpg",
      desc: "Gaze upon historical beautiful seaside ports.",
    },
    {
      id: 4,
      title: "Sharm el Sheikh",
      imageSrc:
        "img/city/sharm.jpg",
      desc: "Discover majestic temples and royal tombs.",
    },
    {
      id: 5,
      title: "Dahab",
      imageSrc:
        "img/city/dahab.jpg",
      desc: "Immerse yourself in bustling historic streets.",
    },
    {
      id: 6,
      title: "Luxor",
      imageSrc:
        "img/city/luxor.jpg",
      desc: "Dive into turquoise waters and red sea bays.",
    },
  ];
  return (
    <section className="pt-36 pb-24 px-6 bg-neutral-bg">
      <div className="max-w-300 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <h2 className="text-4xl font-bold font-headings text-heading mt-3 tracking-tight">
            Popular Destinations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinationsData.map((destination) => (
            <DestinationCard
              key={destination.id}
              title={destination.title}
              imageSrc={destination.imageSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
