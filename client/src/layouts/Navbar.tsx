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
      className={`fixed top-0 left-0 w-full z-20  text-white transition-all duration-300 ${
        isScrolled
          ? "py-2 bg-primary backdrop-blur-md shadow-md border-b border-white/5 text-white"
          : "pt-2  pb-4  text-white"
      }}`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between pt-4">
        {/* logo */}
        <div>
          <div className=" tracking-wide font-headings cursor-pointer">
            <img
              src="img/logo-white.png"
              alt="traveture logo"
              width={100}
              height={100}
            />
          </div>
        </div>
        {/* links */}
        <div className="hidden md:flex items-center gap-6 font-body font-bold">
          <Link
            to="/"
            className="border-b-2 border-transparent hover:border-white pb-1 transition-all"
          >
            Home
          </Link>
          <a
            href="#destinations"
            className="border-b-2 border-transparent hover:border-white pb-1 transition-all"
          >
            Destinations
          </a>
          <Link
            to="tours"
            className="border-b-2 border-transparent hover:border-white pb-1 transition-all"
          >
            Tours
          </Link>
          <a
            href="#about"
            className="border-b-2 border-transparent hover:border-white pb-1 transition-all"
          >
            About
          </a>
        </div>
        {/* buttons */}
        {user ? (
          <div className="flex items-center gap-4 font-body font-semibold">
            <img
              src={`http://localhost:3000/img/users/${user.photo}`}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />

            <button onClick={() => logout()}
            className="px-4 py-1.5  backdrop-blur-md border rounded-input hover:bg-error hover:text-white transition-all cursor-pointer">
              {isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 font-body font-semibold">
            <Link to="/login" className=" cursor-pointer">
              Login
            </Link>

            <Link to='/signup' className="px-4 py-1.5  backdrop-blur-md border rounded-input hover:bg-white hover:text-primary transition-all cursor-pointer">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
