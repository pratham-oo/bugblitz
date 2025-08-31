import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const ALL_BADGES = [
  { name: "Beginner", icon: "🌱", xpRequired: 0 },
  { name: "Intermediate", icon: "🔧", xpRequired: 1000 },
  { name: "Pro Debugger", icon: "⚡", xpRequired: 2500 },
  { name: "Elite Fixer", icon: "🔥", xpRequired: 5000 },
  { name: "Grandmaster", icon: "💎", xpRequired: 10000 },
];

function getBadgeForXp(totalXP) {
  let badge = ALL_BADGES[0];
  for (const b of ALL_BADGES) {
    if (totalXP >= b.xpRequired) badge = b;
  }
  return badge;
}

function formatXP(xp) {
  return xp ? xp.toLocaleString() : '0';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

// --- NEW: Data for our feature cards ---
const moduleCards = [
    {
        icon: "🎮",
        title: "The Bug Arena",
        description: "The core of your training. Dive into real-world bug-fixing scenarios in our Classic and Regression modes. Earn XP, unlock levels, and prove your skill.",
        link: "/bug-arena",
        color: "from-yellow-500 via-orange-500 to-red-500"
    },
    {
        icon: "🎓",
        title: "BugBlitz Academy",
        description: "Learn JavaScript from the ground up, the BugBlitz way. Read interactive lessons, solve hands-on challenges, and test your knowledge with quizzes to earn Knowledge Points (KP).",
        link: "/learn-javascript",
        color: "from-teal-500 to-cyan-500"
    },
    {
        icon: "🧪",
        title: "TestGenie",
        description: "Your AI-powered test case generator. Paste a function or describe a feature, select an intensity level, and get a comprehensive suite of test cases in seconds.",
        link: "/testgenie",
        color: "from-purple-600 to-indigo-600"
    },
    {
        icon: "🐞",
        title: "AutoBug",
        description: "The ultimate AI debugging partner. Paste buggy code to get a pro-level analysis, including severity, root cause, and a suggested fix that you can test in the interactive sandbox.",
        link: "/autobug",
        color: "from-red-500 to-rose-500"
    },
    {
        icon: "🔍",
        title: "GitHub Analyzer",
        description: "Our 'mic drop' feature. Paste any public GitHub repo URL to get an AI-powered project briefing and explore its structure with a stunning, interactive file map.",
        link: "/github-analyzer",
        color: "from-indigo-500 to-fuchsia-500"
    }
];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    async function fetchUserProfile() {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserProfile();
  }, [user?.uid]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl font-bold text-purple-400 animate-pulse">
          Loading BugBlitz Profile...
        </div>
      </div>
    );
    
  if (!user || !role)
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-semibold text-red-500">🚫 Access Denied</h2>
        <p>Please log in to continue.</p>
      </div>
    );
    
  const avatar = profile?.avatar || user.photoURL || "🧑‍💻";
  const arenaName = profile?.name || user.displayName || "Debugger";
  const totalXP = profile?.xp || 0;
  const mainBadge = getBadgeForXp(totalXP);
  const nextBadge = ALL_BADGES.find((b) => b.xpRequired > totalXP);
  const prevBadgeXP = ALL_BADGES.slice().reverse().find(b => b.xpRequired <= totalXP)?.xpRequired ?? 0;
  const progressPercent = nextBadge ? Math.min(100, Math.round(((totalXP - prevBadgeXP) / (nextBadge.xpRequired - prevBadgeXP)) * 100)) : 100;

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 sm:p-12 bg-gray-900 text-white flex flex-col items-center">
        <div className="w-full max-w-5xl">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="w-full bg-black/40 backdrop-blur-lg rounded-3xl p-8 shadow-2xl shadow-purple-500/10 border border-white/10 mb-12"
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="text-8xl drop-shadow-lg">{avatar}</div>
                  <div>
                    <div className="text-3xl font-extrabold text-pink-300">{arenaName}</div>
                    <div className="text-5xl font-black text-yellow-400 mt-1">{formatXP(totalXP)} XP</div>
                  </div>
                </div>
                <div className="text-center sm:text-right select-none w-full sm:w-auto">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl drop-shadow transition-transform transform hover:scale-110 cursor-default">
                      {mainBadge.icon}
                    </div>
                    <div>
                        <div className="font-extrabold text-yellow-300 text-xl">{mainBadge.name}</div>
                        <div className="mt-1 w-full sm:w-60 relative h-5 bg-pink-900/50 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1.2, type: "spring" }}
                                className="absolute h-5 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-700 shadow-lg"
                            />
                            <span className="absolute right-2 top-0 text-yellow-400 font-mono text-xs leading-5">
                                {progressPercent}%
                            </span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {moduleCards.map((card) => (
                    <motion.div
                        key={card.title}
                        variants={itemVariants}
                        className="bg-black/20 p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-8"
                    >
                        <div className="text-8xl flex-shrink-0">{card.icon}</div>
                        <div className="flex-grow text-center md:text-left">
                            <h2 className="text-3xl font-bold text-cyan-300">{card.title}</h2>
                            <p className="mt-2 text-cyan-200/80">{card.description}</p>
                        </div>
                        <Link to={card.link} className={`mt-4 md:mt-0 flex-shrink-0 px-8 py-4 rounded-lg font-bold text-lg text-white bg-gradient-to-r ${card.color} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20`}>
                            Launch
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;