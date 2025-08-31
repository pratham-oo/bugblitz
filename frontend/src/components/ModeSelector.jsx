import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar"; // Assuming Navbar is in the same components folder

const MODES = [
  {
    key: "classic",
    icon: "🪓",
    title: "Classic Arena",
    desc: "A pure test of debugging. Find the bug, fix the code, claim victory.",
    color: "green",
  },
  {
    key: "regression",
    icon: "🛡️",
    title: "Regression Guard",
    desc: "A test of precision. Add a new feature without breaking the old ones.",
    color: "blue",
  },
  {
    key: "optimizer",
    icon: "⚡",
    title: "Optimizer Arena",
    desc: "Refactor & tune for speed/memory.",
    color: "purple",
  },
];

// Animation variants for the staggered load-in effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" },
  },
};

export default function ModeSelector() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6 overflow-hidden">
        {/* Animated background to match the Arena Welcome */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 via-indigo-950 to-black"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          />
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-5xl font-black text-orange-300 mb-12 drop-shadow-[0_0_10px_rgba(253,186,116,0.4)] text-center tracking-wide"
            variants={itemVariants}
          >
            Select Your Gauntlet
          </motion.h2>

          <motion.div
            className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center"
            variants={containerVariants}
          >
            {MODES.map((mode) => {
              if (mode.key === "optimizer") {
                // --- THE NEW "COMING SOON" CARD ---
                return (
                  <motion.div
                    key={mode.key}
                    className="relative flex flex-col gap-3 px-10 py-10 rounded-3xl shadow-xl bg-black/40 border-2 border-dashed border-fuchsia-500/50 flex flex-col items-center w-full md:w-96 text-center"
                    variants={itemVariants}
                  >
                    <span className="text-6xl select-none opacity-50">🔒</span>
                    <h3 className="font-extrabold text-2xl text-fuchsia-300/50">{mode.title}</h3>
                    <p className="text-fuchsia-200/50 text-base">{mode.desc}</p>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/70 px-6 py-2 rounded-lg border border-fuchsia-400">
                        <p className="text-xl font-bold text-fuchsia-300 animate-pulse">Coming Soon</p>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // --- THE PLAYABLE CARDS ---
              return (
                <motion.div
                  key={mode.key}
                  className={`relative flex flex-col gap-3 px-10 py-10 rounded-3xl shadow-xl bg-black/40 border-2 border-transparent hover:border-${mode.color}-500 cursor-pointer items-center w-full md:w-96 text-center transition-all duration-300`}
                  onClick={() => navigate(`/arena/${mode.key}`)}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -10, boxShadow: `0px 10px 30px rgba(${mode.color === 'green' ? '74, 222, 128' : '96, 165, 250'}, 0.2)` }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-6xl select-none">{mode.icon}</span>
                  <h3 className="font-extrabold text-2xl text-orange-300">{mode.title}</h3>
                  <p className="text-fuchsia-200 text-base">{mode.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}