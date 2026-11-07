import { Link } from "react-router-dom";
import DestinationCard from "../ui/DestinationCard";

const destinationsData = [
  {
    id: 1,
    title: "Aswan",
    imageSrc: "img/city/aswan.png",
    desc: "Experience the serene majesty of the Nile.",
  },
  {
    id: 2,
    title: "Giza",
    imageSrc: "img/city/giza.png",
    desc: "Marvel at the ultimate ancient world wonders.",
  },
  {
    id: 3,
    title: "Alexandria",
    imageSrc: "img/city/alex.png",
    desc: "Gaze upon historical beautiful seaside ports.",
  },
  {
    id: 4,
    title: "Sharm el Sheikh",
    imageSrc: "img/city/sharm.png",
    desc: "Discover majestic temples and royal tombs.",
  },
  {
    id: 5,
    title: "Dahab",
    imageSrc: "img/city/dahab.png",
    desc: "Immerse yourself in bustling historic streets.",
  },
  {
    id: 6,
    title: "Luxor",
    imageSrc: "img/city/luxor.png",
    desc: "Dive into turquoise waters and red sea bays.",
  },
];

const Destinations = () => {
  return (
    <section id="destinations" className="pt-12 md:pt-28 pb-16 md:pb-24 px-4 sm:px-6 bg-neutral-bg">
      <div className="max-w-300 mx-auto">
        <div className="mb-8 md:mb-12 text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headings text-heading tracking-tight">
            Popular Destinations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {destinationsData.map((destination) => (
            <Link
              key={destination.id}
              to={`/tours?destination=${encodeURIComponent(destination.title)}`}
              className="block"
            >
              <DestinationCard
                title={destination.title}
                imageSrc={destination.imageSrc}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
