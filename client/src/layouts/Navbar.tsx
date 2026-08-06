import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMe } from "../features/auth/hooks/useMe";
import { useLogout } from "../features/auth/hooks/useLogout";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: user } = useMe();
  const { mutate: logout, isPending } = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <nav
      className={`fixed top-0 left-0 w-full z-20 transition-all duration-300 ${
        isScrolled
          ? "py-2 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100 text-primary" // 👈 تحويل النص للـ primary
          : "pt-2 pb-4 text-white"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between pt-4">
        {/* logo */}
        <div>
          <Link to="/" className="tracking-wide font-headings cursor-pointer">
            {isScrolled ? (
              <img
                src="img/logov1.png"
                alt="traveture logo"
                width={100}
                height={100}
              />
            ) : (
              <img
                src="img/logo-white.png"
                alt="traveture logo"
                width={100}
                height={100}
              />
            )}
          </Link>
        </div>

        {/* links */}
        <div className="hidden md:flex items-center gap-6 font-body font-bold">
          <Link
            to="/"
            className={`border-b-2 border-transparent pb-1 transition-all ${
              isScrolled
                ? "hover:border-primary hover:text-primary-700"
                : "hover:border-white"
            }`}
          >
            Home
          </Link>
          <a
            href="#destinations"
            className={`border-b-2 border-transparent pb-1 transition-all ${
              isScrolled
                ? "hover:border-primary hover:text-primary-700"
                : "hover:border-white"
            }`}
          >
            Destinations
          </a>
          <Link
            to="tours"
            className={`border-b-2 border-transparent pb-1 transition-all ${
              isScrolled
                ? "hover:border-primary hover:text-primary-700"
                : "hover:border-white"
            }`}
          >
            Tours
          </Link>
          <a
            href="#about"
            className={`border-b-2 border-transparent pb-1 transition-all ${
              isScrolled
                ? "hover:border-primary hover:text-primary-700"
                : "hover:border-white"
            }`}
          >
            About Us
          </a>
        </div>

        {/* buttons */}
        {user ? (
          <div className="flex items-center gap-4 font-body font-semibold">
            <Link to="profile">
              <img
                src={`http://localhost:3000/img/users/${user.photo}`}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
              />
            </Link>

            <button
              onClick={() => logout()}
              disabled={isPending}
              className={`px-4 py-1.5 border rounded-input transition-all cursor-pointer ${
                isScrolled
                  ? "border-primary text-primary hover:bg-error hover:border-error hover:text-white"
                  : "border-white text-white hover:bg-error hover:border-error"
              }`}
            >
              {isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 font-body font-semibold">
            <Link
              to="/login"
              className={`cursor-pointer transition-colors ${
                isScrolled ? "hover:text-primary-700" : "hover:text-white/80"
              }`}
            >
              Login
            </Link>

            <Link
              to="/signup"
              className={`px-4 py-1.5 border rounded-input transition-all cursor-pointer ${
                isScrolled
                  ? "border-primary bg-primary text-white hover:bg-primary-700 hover:border-primary-700"
                  : "border-white text-white hover:bg-white hover:text-primary"
              }`}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
