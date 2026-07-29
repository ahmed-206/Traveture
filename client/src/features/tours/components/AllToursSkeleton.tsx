

export const AllToursSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Left */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="h-6 bg-gray-300 rounded-md w-1/2 mx-auto lg:mx-0" />
            

            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="space-y-3">
                <div className="h-4 bg-gray-300 rounded-md w-1/3" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 bg-gray-200 rounded shrink-0" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>


        <div className="lg:col-span-3 space-y-4">
          

          <div className="bg-white rounded-xl p-4 shadow-sm h-14 flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-40" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>


          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-card shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row gap-4 sm:gap-6"
            >
              <div className="w-full sm:w-5/12 h-48 sm:h-auto min-h-40 rounded-card bg-gray-300 shrink-0" />
              <div className="w-full sm:w-7/12 flex flex-col gap-3 py-1 justify-between">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="h-6 bg-gray-300 rounded-md w-3/4" />
                    <div className="h-3 bg-gray-200 rounded-md w-24 mt-1" />
                  </div>
                  <div className="h-6 bg-gray-300 rounded-md w-16 shrink-0" />
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-3 my-3 w-1/2">
                    <div className="h-4 bg-gray-200 rounded-md w-full" />
                    <div className="h-4 bg-gray-200 rounded-md w-4/5" />
                    <div className="h-4 bg-gray-200 rounded-md w-2/3" />
                  </div>
                  <div className="h-9 w-28 bg-gray-300 rounded-lg shrink-0" />
                </div>
              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
};