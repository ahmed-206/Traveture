export const TourDetailSkeleton = () => {
    return (
      <div className="animate-pulse space-y-8 container mx-auto p-6">
        
        <div className="h-96 w-full rounded-2xl bg-gray-200" />
  
     
        <div className="space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200" />
          <div className="h-4 w-1/4 rounded bg-gray-200" />
        </div>
  
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 rounded-xl bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  };