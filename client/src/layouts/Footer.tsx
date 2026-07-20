import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
  FaPhone,
  FaEnvelope
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="mt-0">
      {/* Main Footer */}
      <div className="bg-primary-dark text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_auto_1fr_auto_1fr] gap-12 py-14">
            {/* Logo */}
            <div>
            <img src="img/logo-white.png" alt="traveture logo" width={148} height={148}/>

              <div className="flex items-center gap-4 mt-8">
                {[FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn].map(
                  (Icon, index) => (
                    <a
                      key={index}
                      href="#"
                      className="w-6 h-6 rounded-input bg-white/20 hover:bg-white hover:text-primary transition-all duration-300 flex items-center justify-center"
                    >
                      <Icon size={14} />
                    </a>
                  ),
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-44 bg-white/30" />

            {/* Links */}
            <div>
              <h3 className="font-headings text-2xl font-bold mb-6">
                Quick links
              </h3>

              <ul className="space-y-3  font-medium">
                <li className="hover:translate-x-1 transition-all duration-300">
                  <a href="#">
                    Home
                  </a>
                </li>

                <li className="hover:translate-x-1 transition-all duration-300">
                  <a href="#" >
                    Destinations
                  </a>
                </li>

                <li className="hover:translate-x-1 transition-all duration-300">
                  <a href="#">
                    Tours
                  </a>
                </li>

                <li className="hover:translate-x-1 transition-all duration-300">
                  <a href="#">
                    About
                  </a>
                </li>
              </ul>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-44 bg-white/30" />

            {/* Contact */}
            <div>
              <h3 className="font-headings text-2xl font-bold mb-6">
                Need help?
              </h3>

              <div className="space-y-3 text-lg font-medium">
                <div className="flex items-center gap-2 mt-8 hover:translate-x-1 transition-all duration-300">
                <FaPhone size={14} className="text-white"/>
                <p>01200025102</p>
                </div>
                <div className="flex items-center gap-2 mt-8 hover:translate-x-1 transition-all duration-300">
                <FaEnvelope size={14} className="text-white"/>
                <p>info@traveture.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-primary py-4 text-center text-white font-semibold">
        © 2026 Traveture.com – All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
