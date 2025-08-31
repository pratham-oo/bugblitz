import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../firebase";

const Navbar = () => {
  const user = auth.currentUser;
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const hiddenPaths = ["/", "/login", "/register"];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-cyan-200/80 transition-all duration-300 hover:bg-white/10 hover:text-white";
  const activeLinkClasses = "bg-white/10 text-white shadow-inner";

  const mobileNavLinkClasses = "block px-4 py-3 rounded-md text-base font-medium text-cyan-200/80 hover:bg-white/10 hover:text-white";
  const mobileActiveLinkClasses = "bg-white/10 text-white";

  return (
    <>
      <motion.nav 
        className="sticky top-0 z-50 backdrop-blur-lg bg-black/40 border-b border-fuchsia-500/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/dashboard" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 tracking-tight">
              🧠 BugBlitz<span className="text-pink-400">.AI</span>
            </Link>

            <div className="hidden md:flex items-center space-x-2">
              <NavLink to="/dashboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>Dashboard</NavLink>
              <NavLink to="/bug-arena" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>Bug Arena</NavLink>
              <NavLink to="/leaderboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>🏆 Leaderboard</NavLink>
              {/* --- THE FIX IS HERE --- */}
              <NavLink to="/learn-javascript" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>🎓 Academy</NavLink>
              <NavLink to="/testgenie" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>TestGenie</NavLink>
              <NavLink to="/autobug" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>AutoBug</NavLink>
              <NavLink to="/github-analyzer" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>GitHub Analyzer</NavLink>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {user && (
                  <div className="text-right">
                      <p className="font-semibold text-white text-sm">{user.displayName || "Debugger"}</p>
                      <p className="text-xs text-cyan-300/70">{user.email}</p>
                  </div>
              )}
              <LogoutButton />
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-cyan-200 hover:text-white hover:bg-white/10 focus:outline-none">
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden absolute top-20 left-0 right-0 z-40 bg-black/80 backdrop-blur-lg border-b border-fuchsia-500/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => setIsOpen(false)}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to="/dashboard" className={({ isActive }) => `${mobileNavLinkClasses} ${isActive ? mobileActiveLinkClasses : ''}`}>Dashboard</NavLink>
              <NavLink to="/bug-arena" className={({ isActive }) => `${mobileNavLinkClasses} ${isActive ? mobileActiveLinkClasses : ''}`}>Bug Arena</NavLink>
              <NavLink to="/leaderboard" className={({ isActive }) => `${mobileNavLinkClasses} ${isActive ? mobileActiveLinkClasses : ''}`}>🏆 Leaderboard</NavLink>
              {/* --- THE FIX IS HERE --- */}
              <NavLink to="/learn-javascript" className={({ isActive }) => `${mobileNavLinkClasses} ${isActive ? mobileActiveLinkClasses : ''}`}>🎓 Academy</NavLink>
              <NavLink to="/testgenie" className={({ isActive }) => `${mobileNavLinkClasses} ${isActive ? mobileActiveLinkClasses : ''}`}>TestGenie</NavLink>
              <NavLink to="/autobug" className={({ isActive }) => `${mobileNavLinkClasses} ${isActive ? mobileActiveLinkClasses : ''}`}>AutoBug</NavLink>
              <NavLink to="/github-analyzer" className={({ isActive }) => `${mobileNavLinkClasses} ${isActive ? mobileActiveLinkClasses : ''}`}>GitHub Analyzer</NavLink>
              <div className="pt-4 mt-4 border-t border-white/10">
                {user && (
                    <div className="flex items-center px-4 mb-3">
                        <div className="text-left">
                            <div className="text-base font-medium text-white">{user.displayName || "Debugger"}</div>
                            <div className="text-sm font-medium text-cyan-300/70">{user.email}</div>
                        </div>
                    </div>
                )}
                <div className="px-2">
                    <LogoutButton />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;