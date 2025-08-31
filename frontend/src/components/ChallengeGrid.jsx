import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { dummyChallenges } from "../data/dummyChallenges";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" } },
};

const diffColors = {
  easy: "text-green-400 border-green-400",
  medium: "text-yellow-400 border-yellow-400",
  hard: "text-red-400 border-red-400",
};

export default function ChallengeGrid({ mode }) {
  const navigate = useNavigate();
  const [unlockedLevels, setUnlockedLevels] = useState({ classic: 1, regression: 1 });
  // THE FIX: New state to hold the list of completed challenge IDs
  const [completedChallengeIds, setCompletedChallengeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLangs, setSelectedLangs] = useState({});

  const challenges = useMemo(() => dummyChallenges.filter((c) => c.mode === mode), [mode]);

  useEffect(() => {
    if (challenges.length) {
      const initialLangs = {};
      challenges.forEach((challenge) => {
        const langs = challenge.variants
          ? Object.keys(challenge.variants)
          : Object.keys(challenge.starterCode || { python: "" });
        initialLangs[challenge.id] = langs[0];
      });
      setSelectedLangs(initialLangs);
    }
  }, [mode, challenges]);

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUnlockedLevels(data.unlockedLevels || { classic: 1, regression: 1 });
          // THE FIX: Also fetch the completed challenges list
          setCompletedChallengeIds(data.completedChallengeIds || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [mode]);

  function handleLangSwitch(challengeId, lang) {
    setSelectedLangs((prev) => ({
      ...prev,
      [challengeId]: lang,
    }));
  }
  
  const modeDisplayName = mode.charAt(0).toUpperCase() + mode.slice(1) + " Arena";

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full bg-gray-900 p-6 sm:p-12 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 via-indigo-950 to-black"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Link
                to="/modes"
                className="inline-block mb-8 bg-pink-600/50 hover:bg-pink-600 px-5 py-2 rounded-full text-white font-semibold shadow-lg transition-colors duration-300"
              >
                ← Back to Mode Select
              </Link>
              <h1 className="text-4xl sm:text-6xl font-extrabold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">
                {modeDisplayName}
              </h1>
              <p className="text-pink-300 text-lg mt-2 font-mono">
                Select a challenge to begin.
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center items-center text-xl font-semibold text-orange-200 min-h-[300px] animate-pulse">
                Loading Your Progress...
              </div>
            ) : (
              <motion.div
                className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {challenges.map((challenge, index) => {
                  const challengeLevel = index + 1;
                  const maxUnlockedLevel = unlockedLevels[mode] || 1;
                  const isLocked = challengeLevel > maxUnlockedLevel;
                  const selectedLang = selectedLangs[challenge.id] || "python";
                  // THE FIX: Check if this challenge's ID is in our completed list
                  const isCompleted = completedChallengeIds.includes(challenge.id);

                  let codeSample = "";
                  if (challenge.mode === "regression") {
                    codeSample = challenge.starterCode?.[selectedLang] || "";
                  } else {
                    codeSample = challenge.variants?.[selectedLang]?.[0] || "";
                  }
                  const codeLines = codeSample.split("\n");
                  const halfCodePreview =
                    codeLines.length > 6
                      ? codeLines.slice(0, 4).join("\n") + "\n//..."
                      : codeSample;

                  return (
                    <motion.div
                      key={challenge.id}
                      variants={itemVariants}
                      onClick={() => {
                        // THE FIX: Cannot click if locked OR completed
                        if (!isLocked && !isCompleted) navigate(`/challenge/${challenge.id}?lang=${selectedLang}`);
                      }}
                      className={`relative rounded-2xl bg-black/40 backdrop-blur-md shadow-lg border border-white/10 p-6 flex flex-col transition-all duration-300 ${isLocked || isCompleted ? "cursor-not-allowed" : "hover:border-pink-500/80 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/10"}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold truncate">
                          Level {challengeLevel}: {challenge.title}
                        </h3>
                        <div className={`text-xs font-bold rounded-full px-3 py-1 border ${diffColors[challenge.difficulty]}`}>
                          {challenge.difficulty}
                        </div>
                      </div>

                      <p className="text-pink-200/80 text-sm mb-4">{challenge.description}</p>
                      
                      <div className="flex gap-2 mb-3">
                        {(challenge.variants
                            ? Object.keys(challenge.variants)
                            : Object.keys(challenge.starterCode || { python: "" })
                        ).map((lang) => (
                          <button
                            key={lang}
                            onClick={(e) => {
                              if (isLocked || isCompleted) return;
                              e.stopPropagation();
                              handleLangSwitch(challenge.id, lang);
                            }}
                            className={`text-xs rounded-full px-3 py-1 font-semibold border-2 transition-colors 
                              ${ selectedLang === lang
                                ? "bg-pink-600 border-pink-600 text-white"
                                : "bg-gray-700/50 border-gray-600 text-pink-300 hover:bg-pink-600 hover:text-white"
                              }
                              ${ isLocked || isCompleted ? "opacity-50" : "" }
                            `}
                          >
                            {lang === "python" ? "🐍 Python" : "🟨 JS"}
                          </button>
                        ))}
                      </div>

                      <div className="border border-pink-800/50 rounded-lg overflow-hidden shadow-inner flex-grow flex flex-col">
                        <Editor
                          height="120px"
                          language={selectedLang}
                          theme="vs-dark"
                          value={halfCodePreview}
                          options={{ readOnly: true, minimap: { enabled: false }, lineNumbers: "off", folding: false, fontSize: 14, wordWrap: "on", renderLineHighlight: "none", scrollBeyondLastLine: false, }}
                        />
                      </div>

                      <div className="mt-4 flex justify-end text-cyan-300 font-mono font-semibold text-sm">
                        XP Reward: +{challenge.xpReward}
                      </div>

                      {isLocked && (
                        <div className="absolute inset-0 bg-black/80 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                          <span className="text-5xl animate-pulse">🔒</span>
                          <p className="mt-2 font-bold text-xl text-pink-400">LOCKED</p>
                          <p className="text-xs text-white/70">Complete previous levels to unlock</p>
                        </div>
                      )}
                      
                      {/* THE FIX: New overlay for completed challenges */}
                      {isCompleted && (
                        <div className="absolute inset-0 bg-green-900/80 rounded-2xl flex flex-col items-center justify-center text-center p-4 border-2 border-green-400">
                          <span className="text-5xl">✅</span>
                          <p className="mt-2 font-bold text-xl text-green-300">COMPLETED</p>
                          <p className="text-xs text-white/70">You have already conquered this challenge.</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}