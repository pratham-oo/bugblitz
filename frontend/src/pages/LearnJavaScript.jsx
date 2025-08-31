import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { javascriptCourse } from "../data/javascriptCourse"; // Importing our new curriculum

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const LearnJavaScript = () => {
  const [loading, setLoading] = useState(true);
  const [completedChapters, setCompletedChapters] = useState([]);

  useEffect(() => {
    const fetchUserProgress = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          // We will store completed chapters in a 'completedChapters' array in Firestore
          setCompletedChapters(docSnap.data().completedChapters || []);
        }
      }
      setLoading(false);
    };
    fetchUserProgress();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full bg-gray-900 p-6 sm:p-12 text-white flex flex-col items-center">
        <div className="absolute inset-0 z-0">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 via-indigo-950 to-black"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          />
        </div>

        <motion.div
          className="relative z-10 w-full max-w-5xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">
              🎓 BugBlitz Academy
            </h1>
            <p className="text-pink-300 text-lg mt-2 font-mono">
              &gt; Your JavaScript Learning Path
            </p>
          </div>
          
          {loading ? (
            <p className="text-center animate-pulse">Loading your progress...</p>
          ) : (
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {javascriptCourse.map((chapter, index) => {
                const isCompleted = completedChapters.includes(chapter.id);
                // A chapter is locked if it's not the first one AND the previous chapter isn't completed.
                const isLocked = index > 0 && !completedChapters.includes(javascriptCourse[index - 1].id);

                return (
                  <motion.div key={chapter.id} variants={itemVariants}>
                    <Link 
                      to={!isLocked ? `/lesson/${chapter.id}` : '#'}
                      className={`block p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-300 
                        ${isLocked 
                          ? 'opacity-50 cursor-not-allowed' 
                          : isCompleted
                          ? 'border-green-500/80 hover:bg-green-500/20'
                          : 'hover:border-pink-500/80 hover:bg-pink-500/10'
                        }`
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className={`text-4xl font-black ${isCompleted ? 'text-green-400' : 'text-fuchsia-400'}`}>
                            {isLocked ? '🔒' : isCompleted ? '✅' : `0${index + 1}`}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-orange-300">{chapter.title}</h2>
                            <p className="text-cyan-200/80">{chapter.description}</p>
                          </div>
                        </div>
                        {!isLocked && (
                          <div className="text-3xl">➔</div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default LearnJavaScript;