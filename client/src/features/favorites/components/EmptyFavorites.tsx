import { FaCompass, FaHeart } from "react-icons/fa6"
import { Link } from "react-router-dom"

export const EmptyFavorites = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-card max-w-xl mx-auto">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <FaHeart className="w-10 h-10 text-secondary" />
          </div>
          
          <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">
            No favorite tours yet
          </h3>
          
          <p className="text-body/70 text-sm sm:text-base mb-6 max-w-md">
            You haven't added any tours to your favorites list. Start exploring and save your dream destinations!
          </p>

          <Link
            to="/tours"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-input shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <FaCompass size={18} />
            <span>Explore Tours</span>
          </Link>
        </div>
    )
}