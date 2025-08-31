import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const PodiumItem = ({ player, rank, scoreUnit }) => {
    const podiumStyles = [
        { glow: 'shadow-yellow-400/40', border: 'border-yellow-400', emoji: '🥇', order: 'md:order-2', height: 'md:mt-0' }, // 1st
        { glow: 'shadow-gray-400/40', border: 'border-gray-400', emoji: '🥈', order: 'md:order-1', height: 'md:mt-8' }, // 2nd
        { glow: 'shadow-orange-500/40', border: 'border-orange-500', emoji: '🥉', order: 'md:order-3', height: 'md:mt-8' }, // 3rd
    ];
    const style = podiumStyles[rank - 1];

    return (
        <motion.div 
            variants={itemVariants} 
            className={`flex flex-col items-center gap-2 p-4 bg-black/40 rounded-xl border-2 w-full ${style.border} shadow-lg ${style.glow} ${style.order} ${style.height}`}
        >
            <span className="text-4xl">{style.emoji}</span>
            <span className="text-5xl">{player.avatar}</span>
            <div className="text-center">
                <p className="font-bold text-lg text-white truncate">{player.name}</p>
                <p className="font-mono text-sm text-yellow-300">{player.score.toLocaleString()} {scoreUnit}</p>
            </div>
            <div className="text-5xl font-black text-white/30">#{rank}</div>
        </motion.div>
    );
};

const RankItem = ({ player, rank, scoreUnit }) => {
    return (
        <motion.div 
            variants={itemVariants} 
            className="flex items-center gap-4 p-3 bg-black/20 rounded-lg border border-white/10 hover:bg-white/20 transition-colors"
        >
            <div className="text-lg font-bold text-white/50 w-8 text-center flex-shrink-0">#{rank}</div>
            <span className="text-3xl">{player.avatar}</span>
            <div className="flex-grow min-w-0">
                <p className="font-semibold text-white/90 truncate">{player.name}</p>
            </div>
            <div className="font-mono text-cyan-300 flex-shrink-0">{player.score.toLocaleString()} {scoreUnit}</div>
        </motion.div>
    );
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('overall');
  const [leaderboards, setLeaderboards] = useState({
    overall: [],
    classic: [],
    regression: [],
    quiz: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        
        const overallQuery = query(usersRef, orderBy("xp", "desc"), limit(10));
        const classicQuery = query(usersRef, orderBy("xpPerMode.classic", "desc"), limit(10));
        const regressionQuery = query(usersRef, orderBy("xpPerMode.regression", "desc"), limit(10));
        const quizQuery = query(usersRef, orderBy("totalKnowledgePoints", "desc"), limit(10));

        const [overallSnap, classicSnap, regressionSnap, quizSnap] = await Promise.all([
          getDocs(overallQuery),
          getDocs(classicQuery),
          getDocs(regressionQuery),
          getDocs(quizQuery),
        ]);

        const overallData = overallSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, score: doc.data().xp || 0 }));
        const classicData = classicSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, score: doc.data().xpPerMode?.classic || 0 }));
        const regressionData = regressionSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, score: doc.data().xpPerMode?.regression || 0 }));
        const quizData = quizSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, score: doc.data().totalKnowledgePoints || 0 }));

        setLeaderboards({
          overall: overallData,
          classic: classicData,
          regression: regressionData,
          quiz: quizData,
        });

      } catch (error) {
        console.error("Error fetching leaderboards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  const currentBoard = leaderboards[activeTab] || [];
  const scoreUnit = activeTab === 'quiz' ? 'KP' : 'XP';

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
          className="relative z-10 w-full max-w-4xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">
              🏆 Hall of Heroes
            </h1>
            <p className="text-pink-300 text-lg mt-2 font-mono">
              &gt; See where you rank among the top debuggers
            </p>
          </div>
          
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex justify-center border-b border-fuchsia-500/30 mb-8 flex-wrap">
              <button onClick={() => setActiveTab('overall')} className={`px-4 py-3 font-semibold transition-colors duration-300 ${activeTab === 'overall' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}>
                Overall (XP)
              </button>
              <button onClick={() => setActiveTab('classic')} className={`px-4 py-3 font-semibold transition-colors duration-300 ${activeTab === 'classic' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}>
                Classic Mode (XP)
              </button>
              <button onClick={() => setActiveTab('regression')} className={`px-4 py-3 font-semibold transition-colors duration-300 ${activeTab === 'regression' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                Regression Mode (XP)
              </button>
              <button onClick={() => setActiveTab('quiz')} className={`px-4 py-3 font-semibold transition-colors duration-300 ${activeTab === 'quiz' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}>
                Quiz Masters (KP)
              </button>
            </div>

            {loading ? (
                <p className="text-center animate-pulse text-lg py-10">Loading rankings...</p>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <div className="flex flex-col md:flex-row justify-center items-end gap-4 mb-10 min-h-[250px]">
                        {currentBoard.length >= 2 && <PodiumItem player={currentBoard[1]} rank={2} scoreUnit={scoreUnit} />}
                        {currentBoard.length >= 1 && <PodiumItem player={currentBoard[0]} rank={1} scoreUnit={scoreUnit} />}
                        {currentBoard.length >= 3 && <PodiumItem player={currentBoard[2]} rank={3} scoreUnit={scoreUnit} />}
                    </div>

                    <div className="space-y-2">
                        {currentBoard.slice(3).map((player, index) => (
                            <RankItem key={player.id} player={player} rank={index + 4} scoreUnit={scoreUnit} />
                        ))}
                    </div>
                </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Leaderboard;