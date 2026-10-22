import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMe } from "../features/auth/hooks/useMe";
import { useLogout } from "../features/auth/hooks/useLogout";
import {
  FaHeart,
  FaArrowRightFromBracket,
  FaBars,
  FaXmark,
  FaHouse,
  FaLocationDot,
  FaCompass,
  FaCircleInfo,
} from "react-icons/fa6";
import { getUserImageUrl } from "../utils/getImageUrl";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: user } = useMe();
  const { mutate: logout, isPending } = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // دالة الفتح والإغلاق
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-30 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100 text-primary"
          : "py-4 bg-transparent text-white"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="tracking-wide font-headings cursor-pointer">
          <img
            src={isScrolled ? "/img/logov1.png" : "/img/logo-white.png"}
            alt="traveture logo"
            className="w-24 sm:w-28 h-auto object-contain transition-all"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 font-body font-bold text-sm lg:text-base">
          <Link
            to="/"
            className={`border-b-2 border-transparent pb-1 transition-all ${
              isScrolled ? "hover:border-primary hover:text-primary-700" : "hover:border-white"
            }`}
          >
            Home
          </Link>
          <a
            href="#destinations"
            className={`border-b-2 border-transparent pb-1 transition-all ${
              isScrolled ? "hover:border-primary hover:text-primary-700" : "hover:border-white"
            }`}
          >
            Destinations
          </a>
          <Link
            to="tours"
            className={`border-b-2 border-transparent pb-1 transition-all ${
              isScrolled ? "hover:border-primary hover:text-primary-700" : "hover:border-white"
            }`}
          >
            Tours
          </Link>
          <a
            href="#about"
            className={`border-b-2 border-transparent pb-1 transition-all ${
              isScrolled ? "hover:border-primary hover:text-primary-700" : "hover:border-white"
            }`}
          >
            About Us
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 font-body font-semibold">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/favorites" aria-label="Favorites">
                <div className="p-2 rounded-full bg-body/20 backdrop-blur-md hover:scale-105 transition-transform">
                  <FaHeart size={18} className={isScrolled ? "text-primary" : "text-white"} />
                </div>
              </Link>
              <Link to="/profile">
                <img
                  src={getUserImageUrl(user.photo)}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-primary/20 hover:scale-105 transition-transform"
                />
              </Link>
              <button
                onClick={() => logout()}
                disabled={isPending}
                className="cursor-pointer transition-transform hover:scale-105"
                title="Logout"
              >
                <div className="p-2 rounded-full bg-body/20 backdrop-blur-md">
                  <FaArrowRightFromBracket size={18} className={isScrolled ? "text-primary" : "text-white"} />
                </div>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={`transition-colors ${
                  isScrolled ? "hover:text-primary-700" : "hover:text-white/80"
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`px-4 py-1.5 border rounded-input transition-all ${
                  isScrolled
                    ? "border-primary bg-primary text-white hover:bg-primary-700"
                    : "border-white text-white hover:bg-white hover:text-primary"
                }`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger / Close Button */}
        <button
          onClick={toggleMobileMenu}
          className={`md:hidden p-2 rounded-lg focus:outline-none transition-transform active:scale-95 ${
            isScrolled ? "text-primary" : "text-white"
          }`}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaXmark size={26} /> : <FaBars size={26} />}
        </button>
      </div>

      {/* Mobile Menu Overlay/List */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white text-body shadow-2xl border-b border-gray-100 px-6 py-5 flex flex-col gap-4 font-body font-semibold transition-all">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 text-body hover:text-primary py-1 transition-colors"
          >
            <FaHouse size={20} className="text-body shrink-0" />
            <span>Home</span>
          </Link>

          <a
            href="#destinations"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 text-body hover:text-primary py-1 transition-colors"
          >
            <FaLocationDot size={20} className="text-body shrink-0" />
            <span>Destinations</span>
          </a>

          <Link
            to="tours"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 text-body hover:text-primary py-1 transition-colors"
          >
            <FaCompass size={20} className="text-body shrink-0" />
            <span>Tours</span>
          </Link>

          <a
            href="#about"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 text-body hover:text-primary py-1 transition-colors"
          >
            <FaCircleInfo size={20} className="text-body shrink-0" />
            <span>About us</span>
          </a>

          {user ? (
            <>
              <Link
                to="/favorites"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 text-body hover:text-primary py-1 transition-colors"
              >
                <FaHeart size={20} className="text-body shrink-0" />
                <span>Favourites</span>
              </Link>

              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 text-body hover:text-primary py-1 transition-colors"
              >
                <img
                  src={getUserImageUrl(user.photo)}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-300 shrink-0"
                />
                <span className="truncate">{user.name}</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                disabled={isPending}
                className="flex items-center gap-3 text-body hover:text-error py-1 transition-colors text-left w-full cursor-pointer"
              >
                <FaArrowRightFromBracket size={20} className="text-body shrink-0" />
                <span>{isPending ? "Logging out..." : "Logout"}</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="text-center py-2 border border-primary text-primary rounded-input font-bold"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={closeMobileMenu}
                className="text-center py-2 bg-primary text-white rounded-input font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;