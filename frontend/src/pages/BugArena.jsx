import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

// Animation variants for a cool staggered load-in effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function BugArena() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 z-0">
            <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 via-indigo-950 to-black"
                animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                    duration: 20,
                    ease: "linear",
                    repeat: Infinity,
                }}
                style={{ backgroundSize: '200% 200%' }}
            />
        </div>

        <motion.div
          className="relative z-10 max-w-3xl w-full mx-auto p-10 rounded-3xl shadow-2xl bg-black/40 border border-fuchsia-700/50 flex flex-col items-center gap-10 backdrop-blur-xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-black tracking-widest text-center text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]"
            variants={itemVariants}
          >
            Welcome to the
            <br />
            <span className="text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]">
              Double Trouble Arena
            </span>
          </motion.h1>

          <motion.blockquote
            className="text-lg text-cyan-300 text-center font-mono leading-relaxed"
            variants={itemVariants}
          >
            <p>Your terminal awaits.</p>
            <p>Two gauntlets: Legacy Code & New Deployments.</p>
            <p className="font-bold text-orange-400">Prove your worth.</p>
          </motion.blockquote>

          <motion.button
            className="mt-4 px-14 py-4 rounded-full bg-gradient-to-r from-pink-600 via-orange-500 to-purple-700 text-white font-extrabold text-2xl shadow-lg shadow-pink-500/30 ring-2 ring-pink-500/80 transition-all duration-300"
            onClick={() => navigate("/modes")}
            variants={itemVariants}
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(236, 72, 153, 0.7)" }}
            whileTap={{ scale: 0.95 }}
          >
            Enter Arena
          </motion.button>
          
          <motion.div 
            className="text-xs text-green-400/70 mt-4 font-mono text-left w-full max-w-xs"
            variants={itemVariants}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <p>&gt; Optimizer_Mode.exe initializing...</p>
            <p>&gt; Triple_Threat_Protocol: COMING_SOON</p>
          </motion.div>

        </motion.div>
      </div>
    </>
  );
}