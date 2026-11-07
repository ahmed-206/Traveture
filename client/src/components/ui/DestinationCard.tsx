interface DestinationCardProps {
  title: string;
  imageSrc?: string;
}

const DestinationCard = ({ title, imageSrc }: DestinationCardProps) => {
  return (
    <div className="group relative overflow-hidden bg-white rounded-card shadow-light hover:-translate-y-2 transition-all duration-300">
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-primary-light flex items-center justify-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#D8DBDE] flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold text-body/60 font-headings">
              Image
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-90" />

        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
          <h3 className="text-sm sm:text-base bg-white rounded-full px-3.5 sm:px-4 py-1.5 font-medium font-headings text-heading shadow-sm">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
