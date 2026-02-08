import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Swords } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  const landingLinks = [
    { name: "Features", href: "#features" },
    { name: "Leaderboard", href: "#leaderboard" },
    { name: "Stats", href: "#stats" },
  ];

  const appLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Problems", href: "/problems" },
    { name: "Leaderboard", href: "/leaderboard" },
  ];

  const navLinks = isLandingPage ? landingLinks : appLinks;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-12 h-12 flex items-center justify-center">
                <Swords className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm text-accent tracking-[0.2em] leading-none">
                CODE
              </span>
              <span className="font-display font-bold text-xs text-white/60 tracking-[0.15em] leading-none mt-0.5">
                ARENA
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            link.href.startsWith("#") ? (
              <motion.a
                key={link.name}
                href={link.href}
                whileHover={{ scale: 1.05 }}
                className="text-white/70 hover:text-white transition-colors font-sans text-sm tracking-wider"
              >
                {link.name}
              </motion.a>
            ) : (
              <Link key={link.name} to={link.href}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="text-white/70 hover:text-white transition-colors font-sans text-sm tracking-wider"
                >
                  {link.name}
                </motion.span>
              </Link>
            )
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2 text-white/70 hover:text-white font-display text-sm tracking-wider transition-colors"
            >
              LOGIN
            </motion.button>
          </Link>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/40 text-white font-display text-sm tracking-wider rounded-sm hover:border-accent/60 transition-all"
            >
              SIGN UP
            </motion.button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-accent/10 p-6"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              link.href.startsWith("#") ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-white/70 hover:text-white transition-colors py-2 font-sans tracking-wider"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-white/70 hover:text-white transition-colors py-2 font-sans tracking-wider"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              )
            ))}
            <div className="flex gap-3 pt-4 border-t border-accent/10">
              <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                <button className="w-full py-2 text-white/70 hover:text-white font-display text-sm tracking-wider transition-colors border border-accent/20 rounded-sm">
                  LOGIN
                </button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setIsOpen(false)}>
                <button className="w-full py-2 bg-accent/20 border border-accent/40 text-white font-display text-sm tracking-wider rounded-sm">
                  SIGN UP
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
