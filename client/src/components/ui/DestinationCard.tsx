interface DestinationCardProps {
  title: string;
  imageSrc?: string;
}

const DestinationCard = ({ title, imageSrc }: DestinationCardProps) => {
  return (
   
      <>
    <div className="group relative overflow-hidden bg-white rounded-card   shadow-light hover:-translate-y-2 transition-all duration-300">
      <div className="absolute inset-0 bg-primary/30 z-10" />
      
      <div className="relative h-48 md:h-64 w-full overflow-hidden bg-primary-light flex items-center justify-center">
        
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          // هذا يطابق تماماً الصورة السلكية الرمادية التي أرسلتها مع كلمة Image بالمنتصف
          <div className="absolute inset-0 bg-[#D8DBDE] flex items-center justify-center">
            <span className="text-2xl font-bold text-body/60 font-headings">Image</span>
          </div>
        )}

       
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-90" />

        
        <div className="absolute bottom-6 left-6 z-10">
          <h3 className="text-xl font-bold font-headings text-white">
            {title}
          </h3>
        </div>
      </div>
    </div>
    </>
  );
};

export default DestinationCard;