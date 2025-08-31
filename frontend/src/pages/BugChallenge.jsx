import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { dummyChallenges } from "../data/dummyChallenges";
import Navbar from "../components/Navbar";
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import Editor from "@monaco-editor/react";

const ALL_BADGES = [
  { name: "Beginner", icon: "🌱", level: 1 },
  { name: "Intermediate", icon: "🔧", level: 10 },
  { name: "Pro Debugger", icon: "⚡", level: 20 },
  { name: "Elite Fixer", icon: "🔥", level: 30 },
  { name: "Grandmaster", icon: "💎", level: 50 },
];
function getBadge(level) {
  if (level >= 50) return ALL_BADGES[4];
  if (level >= 30) return ALL_BADGES[3];
  if (level >= 20) return ALL_BADGES[2];
  if (level >= 10) return ALL_BADGES[1];
  return ALL_BADGES[0];
}

function createRegressionFeedback(testResults, penaltyXP, newLives) {
    let html = `<p class="font-bold text-lg mb-2">🤔 Not Quite! -${penaltyXP} XP. You have ${newLives} ${newLives === 1 ? 'life' : 'lives'} left.</p>`;
    html += '<div class="space-y-4 text-left">';
    const renderTestList = (tests, title) => {
        if (!tests || tests.length === 0) return '';
        let listHtml = `<div><p class="font-semibold text-pink-200">${title}</p><ul class="mt-1 list-disc list-inside pl-4 font-mono text-sm">`;
        tests.forEach(test => {
            if (test.passed) {
                listHtml += `<li class="text-green-400">${test.name}: Passed ✅</li>`;
            } else {
                listHtml += `<li class="text-red-400">${test.name}: Failed ❌`;
                listHtml += `<div class="pl-6 text-gray-300">Expected: <code class="text-green-400">${test.expected}</code></div>`;
                listHtml += `<div class="pl-6 text-gray-300">Yours: <code class="text-red-400">${test.actual || '(No output)'}</code></div>`;
                listHtml += `</li>`;
            }
        });
        listHtml += '</ul></div>';
        return listHtml;
    };
    html += renderTestList(testResults.regression, '📋 Regression Tests (Checking old features)');
    html += renderTestList(testResults.feature, '✨ Feature Tests (Checking the new feature)');
    html += '</div>';
    return html;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" } },
};

export default function BugChallenge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const challenge = dummyChallenges.find((c) => c.id === id);
  const mode = challenge?.mode;
  const allThisMode = dummyChallenges.filter((c) => c.mode === mode);
  const idxThis = allThisMode.findIndex((c) => c.id === id);
  const currentChallengeLevel = idxThis + 1;

  const [msg, setMsg] = useState("");
  const [feedback, setFeedback] = useState({ type: null, content: "" });
  const [userCode, setUserCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [lives, setLives] = useState(() => {
    const savedLives = sessionStorage.getItem(`bugblitz-lives-${id}`);
    return savedLives !== null ? parseInt(savedLives, 10) : 2;
  });
  
  const [unlockedLevels, setUnlockedLevels] = useState({ classic: 1, regression: 1 });
  const [xpPerMode, setXpPerMode] = useState({ classic: 0, regression: 0 });
  const [challengesCompleted, setChallengesCompleted] = useState(0);

  const query = new URLSearchParams(location.search);
  const urlLang = query.get("lang");
  const languages =
    challenge?.mode === "regression"
      ? Object.keys(challenge.starterCode ?? { python: "" })
      : Object.keys(challenge.variants ?? { python: [""] });
  const [selectedLang, setSelectedLang] = useState(
    languages.includes(urlLang) ? urlLang : languages[0]
  );
  
  useEffect(() => {
    async function loadStats() {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUnlockedLevels(data.unlockedLevels ?? { classic: 1, regression: 1 });
          setXpPerMode(data.xpPerMode ?? { classic: 0, regression: 0 });
          setChallengesCompleted(data.challengesCompleted ?? 0);
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    }
    loadStats();
  }, []);
  
  useEffect(() => {
    if (!challenge) return;
    const savedLives = sessionStorage.getItem(`bugblitz-lives-${id}`);
    setLives(savedLives !== null ? parseInt(savedLives, 10) : 2);
    setFeedback({ type: null, content: "" });
    setMsg("");
    setAttempted(false);
    setIsSuccess(false);
  }, [challenge?.id]);

  useEffect(() => {
    if (!challenge) return;
    const newCode =
      challenge.mode === "regression"
        ? challenge.starterCode?.[selectedLang] ?? ""
        : challenge.variants?.[selectedLang]?.[0] ?? "";
    setUserCode(newCode);
  }, [challenge, selectedLang]);

  useEffect(() => {
    sessionStorage.setItem(`bugblitz-lives-${id}`, lives);
  }, [lives, id]);


  async function handleSubmit() {
    if (lives <= 0 || isSuccess) return;

    setLoading(true);
    setFeedback({ type: null, content: "" });
    setMsg("");
    setAttempted(true);

    try {
      const res = await fetch("http://localhost:3001/submit-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: challenge.id,
          fixedCode: userCode,
          language: selectedLang,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);

      const data = await res.json();
      
      if (data.allPassed) {
        setIsSuccess(true);
        setFeedback({ type: 'success', content: data.feedback });
        setMsg(`✅ Success! +${data.xpAwarded} XP earned.`);
        sessionStorage.removeItem(`bugblitz-lives-${id}`);
        
        const user = auth.currentUser;
        if (user) {
            const ref = doc(db, "users", user.uid);
            
            const newModeXP = (xpPerMode[mode] ?? 0) + data.xpAwarded;
            const updatedXpPerMode = { ...xpPerMode, [mode]: newModeXP };
            
            const newClassicXP = updatedXpPerMode.classic || 0;
            const newRegressionXP = updatedXpPerMode.regression || 0;
            const newTotalXP = newClassicXP + (2 * newRegressionXP);
            
            const newChallengesCompleted = (challengesCompleted ?? 0) + 1;
            const nextLevelNum = idxThis + 2;
            const newUnlockedLevels = { ...unlockedLevels };
            if (nextLevelNum > (unlockedLevels[mode] ?? 1) && nextLevelNum <= allThisMode.length) {
                newUnlockedLevels[mode] = nextLevelNum;
            }

            await updateDoc(ref, { 
              xp: newTotalXP, 
              xpPerMode: updatedXpPerMode, 
              unlockedLevels: newUnlockedLevels, 
              challengesCompleted: newChallengesCompleted,
              completedChallengeIds: arrayUnion(challenge.id)
            });

            setXpPerMode(updatedXpPerMode);
            setUnlockedLevels(newUnlockedLevels);
            setChallengesCompleted(newChallengesCompleted);
        }

      } else {
        const newLives = lives - 1;
        setLives(newLives);
        const penaltyXP = 50;
        
        const user = auth.currentUser;
        if (user) {
            const ref = doc(db, "users", user.uid);
            let newModeXP = (xpPerMode[mode] ?? 0) - penaltyXP;
            if (newModeXP < 0) newModeXP = 0;
            const updatedXpPerMode = { ...xpPerMode, [mode]: newModeXP };

            const newClassicXP = updatedXpPerMode.classic || 0;
            const newRegressionXP = updatedXpPerMode.regression || 0;
            const newTotalXP = newClassicXP + (2 * newRegressionXP);
            
            setXpPerMode(updatedXpPerMode);
            await updateDoc(ref, { 
                xp: newTotalXP, 
                xpPerMode: updatedXpPerMode 
            });
        }
        
        setMsg(`❌ Incorrect! You have ${newLives} ${newLives === 1 ? 'life' : 'lives'} left.`);
        let failureHtml = '';
        if (mode === 'regression' && data.testResults) {
            failureHtml = createRegressionFeedback(data.testResults, penaltyXP, newLives);
        } else if (data.feedback) {
            failureHtml = `<p class="font-bold text-lg mb-2">🤔 Not Quite! -${penaltyXP} XP. You have ${newLives} ${newLives === 1 ? 'life' : 'lives'} left.</p><p>${data.feedback}</p>`;
        } else if (data.failedTest) {
            const { failedTest } = data;
            failureHtml = `
              <div class="text-left">
                <p class="font-bold text-lg mb-2">🤔 Not Quite! -${penaltyXP} XP. You have ${newLives} ${newLives === 1 ? 'life' : 'lives'} left.</p>
                <p>Your code failed on a specific test case. Here are the details:</p>
                <div class="mt-3 text-left bg-gray-800/50 p-3 rounded-md font-mono text-sm space-y-1">
                  <p><span class="text-gray-400">Input:</span> <span class="text-orange-300">${failedTest.input}</span></p>
                  <p><span class="text-gray-400">Expected Output:</span> <span class="text-green-400">${failedTest.expected}</span></p>
                  <p><span class="text-gray-400">Your Output:</span> <span class="text-red-400">${failedTest.yours || '(No output produced)'}</span></p>
                  ${failedTest.error ? `<p><span class="text-gray-400">Runtime Error:</span> <span class="text-red-400">${failedTest.error}</span></p>` : ''}
                </div>
              </div>`;
        }
        setFeedback({ type: 'error', content: failureHtml });
      }

    } catch (error) {
      setFeedback({ type: 'error', content: `❌ Server error: ${error.message}. Try again later.` });
      setMsg("❌ Network or Server Error!");
    } finally {
      setLoading(false);
    }
  }

  const restartLevel = () => {
    setLives(2);
    setFeedback({ type: null, content: "" });
    setMsg("");
    setAttempted(false);
    setIsSuccess(false);
  };

  const hasNext = idxThis !== -1 && idxThis + 1 < allThisMode.length;
  const navigateNext = () => {
    if (hasNext) {
      const next = allThisMode[idxThis + 1];
      navigate(`/challenge/${next.id}?lang=${selectedLang}`);
    }
  };
  
  if (!challenge) return <div className="p-10 text-center text-red-600">❌ Challenge not found</div>;

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <motion.div variants={itemVariants} className="space-y-6">
                <Link
                  to={`/arena/${mode}`}
                  className="inline-block mb-4 bg-pink-600/50 hover:bg-pink-600 px-5 py-2 rounded-full text-white font-semibold shadow-lg transition-colors duration-300"
                >
                  ← Back to Challenge Grid
                </Link>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">
                  Level {currentChallengeLevel}: {challenge.title}
                </h1>
                <p className="text-pink-200/90 text-lg">{challenge.description}</p>
                {msg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center font-bold p-3 rounded-lg text-lg ${
                      msg.startsWith("✅")
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {msg}
                  </motion.div>
                )}
                <div className="grid grid-cols-3 gap-4 bg-black/40 border border-white/10 rounded-xl p-4 text-center">
                  <div>
                    <p className="font-mono text-xs text-cyan-300">LIVES</p>
                    <p className="text-3xl font-bold text-red-500 tracking-widest">
                      {'❤️'.repeat(lives)}
                      {'🖤'.repeat(2 - lives)}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-cyan-300">DIFFICULTY</p>
                    <p className={`text-xl font-bold ${challenge.difficulty === 'easy' ? 'text-green-400' : challenge.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {challenge.difficulty.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-cyan-300">XP REWARD</p>
                    <p className="text-2xl font-bold text-yellow-400">+{challenge.xpReward}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="font-mono text-sm text-pink-300 mb-3">Select Language:</p>
                  <div className="flex gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLang(lang)}
                        className={`px-5 py-2 rounded-lg font-semibold text-lg transition-all duration-300 border-2 ${lang === selectedLang ? `bg-orange-500 border-orange-400 text-white scale-105 shadow-lg` : `bg-black/30 border-fuchsia-800 text-fuchsia-300 hover:bg-fuchsia-900 hover:border-fuchsia-600`}`}
                      >
                        {lang === 'python' ? '🐍 Python' : '🟨 JavaScript'}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="flex flex-col">
                <div className="flex-grow rounded-xl border-2 border-pink-700 overflow-hidden bg-gray-900/50 shadow-2xl shadow-pink-500/10">
                  <Editor
                    height="450px"
                    language={selectedLang}
                    theme="vs-dark"
                    value={userCode}
                    onChange={setUserCode}
                    options={{ minimap: { enabled: false }, fontSize: 16, wordWrap: 'on', automaticLayout: true }}
                  />
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    className={`w-full py-4 rounded-xl font-extrabold text-xl text-white transition-all duration-300 ${loading || lives <= 0 || isSuccess ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-700 hover:scale-105"}`}
                    onClick={handleSubmit}
                    disabled={loading || lives <= 0 || isSuccess}
                  >
                    {loading ? "⏳ Running..." : "Submit Fix"}
                  </button>
                  {isSuccess && hasNext && (
                    <button onClick={navigateNext} className="w-full py-4 rounded-xl font-extrabold text-xl text-white bg-gradient-to-r from-green-500 to-teal-500 hover:scale-105 transition-all duration-300">
                      Next Level 🎉
                    </button>
                  )}
                   {lives <= 0 && !isSuccess && (
                    <button onClick={restartLevel} className="py-4 px-8 rounded-xl font-extrabold text-xl text-white bg-gray-700 hover:bg-gray-600">
                      Restart
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
            {feedback.content && (
              <motion.div 
                variants={itemVariants}
                className={`mt-8 rounded-xl p-6 border-l-4 ${feedback.type === 'success' ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'}`}
              >
                <div dangerouslySetInnerHTML={{ __html: feedback.content }} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}