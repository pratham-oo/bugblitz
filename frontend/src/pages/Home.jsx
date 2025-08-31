import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";

// Animation variants for the text content
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// A self-contained component for the cool flipping card
const FlippingCodeCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const flipInterval = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 4000); // Flip every 4 seconds
    return () => clearInterval(flipInterval);
  }, []);

  const buggyCode = `def find_max(numbers):\n    # Bug: Fails for negative numbers\n    max_num = 0\n    for num in numbers:\n        if num > max_num:\n            max_num = num\n    return max_num`;
  
  const fixedCode = `def find_max(numbers):\n    if not numbers:\n        return None\n    max_num = numbers[0]\n    for num in numbers[1:]:\n        if num > max_num:\n            max_num = num\n    return max_num`;

  return (
    <motion.div
      className="w-full h-[350px] [transform-style:preserve-3d] [perspective:1000px]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [-8, 8, -8] // Floating effect
      }}
      transition={{ 
        opacity: { duration: 0.8, delay: 0.5 },
        scale: { duration: 0.8, delay: 0.5 },
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of the card (Buggy Code) */}
        <div className="absolute w-full h-full p-6 bg-black/40 rounded-2xl border border-red-500/50 shadow-2xl shadow-red-500/10 [backface-visibility:hidden]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <p className="font-mono text-sm text-red-400">STATUS: BUG DETECTED</p>
          </div>
          <Editor
            height="85%"
            language="python"
            theme="vs-dark"
            value={buggyCode}
            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 15, wordWrap: 'on' }}
          />
        </div>

        {/* Back of the card (Fixed Code) */}
        <div className="absolute w-full h-full p-6 bg-black/40 rounded-2xl border border-green-500/50 shadow-2xl shadow-green-500/10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <p className="font-mono text-sm text-green-400">STATUS: OPTIMIZED</p>
          </div>
          <Editor
            height="85%"
            language="python"
            theme="vs-dark"
            value={fixedCode}
            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 15, wordWrap: 'on' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};


const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900 flex items-center justify-center px-4">
      {/* Animated background to match the rest of the app */}
      <div className="absolute inset-0 z-0">
          <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 via-indigo-950 to-black"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
          />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: The Pitch */}
        <motion.div
          className="text-center lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-5xl lg:text-7xl font-black text-white leading-tight"
            variants={itemVariants}
          >
            Stop Learning.
            <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              Start Hacking.
            </span>
          </motion.h1>
          <motion.p
            className="mt-6 max-w-lg mx-auto lg:mx-0 text-lg sm:text-xl text-cyan-200/80 font-medium"
            variants={itemVariants}
          >
            BugBlitz.AI turns debugging into a game. Enter the arena, fix real-world bugs, and forge your skills in the fires of failing code.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(236, 72, 153, 0.7)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => navigate("/login")}
            className="mt-10 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-10 py-4 rounded-lg font-semibold text-xl shadow-lg hover:shadow-pink-500/50"
            variants={itemVariants}
          >
            Enter the Arena
          </motion.button>
        </motion.div>

        {/* Right Column: The Showcase */}
        <div className="w-full max-w-lg mx-auto lg:max-w-none">
          <FlippingCodeCard />
        </div>
      </div>
    </div>
  );
};

export default Home;