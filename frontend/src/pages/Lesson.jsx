import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { javascriptCourse } from "../data/javascriptCourse";
import Editor from "@monaco-editor/react";

// This is a small, self-contained component for the interactive code snippets in the article
const InteractiveCodeBlock = ({ code: initialCode }) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    try {
      let capturedOutput = '';
      const originalLog = console.log;
      console.log = (...args) => {
        capturedOutput += args.join(' ') + '\n';
      };
      // eslint-disable-next-line no-eval
      eval(code);
      console.log = originalLog;
      setOutput(capturedOutput.trim() || '(No output)');
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    }
    setIsRunning(false);
  };

  return (
    <div className="my-4 bg-black/40 border border-fuchsia-500/30 rounded-xl overflow-hidden">
      <Editor
        height="150px"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={setCode}
        options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on' }}
      />
      <div className="p-2 flex justify-between items-center bg-gray-900/50">
        <button onClick={handleRun} className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded-md font-semibold">
          {isRunning ? 'Running...' : '▶ Run'}
        </button>
        {output !== null && (
          <pre className="text-xs text-cyan-300 whitespace-pre-wrap">{output}</pre>
        )}
      </div>
    </div>
  );
};


const Lesson = ({ chapterId }) => {
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [view, setView] = useState('article'); // article, challenge, quiz, results
  
  const [challengeCode, setChallengeCode] = useState('');
  const [challengeResult, setChallengeResult] = useState({ status: null, message: '' });

  // --- NEW INTERACTIVE QUIZ STATE ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionStatus, setQuestionStatus] = useState(null); // null, 'correct', 'incorrect'
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    const foundChapter = javascriptCourse.find(c => c.id === chapterId);
    if (foundChapter) {
      setChapter(foundChapter);
      setChallengeCode(foundChapter.challenge.buggyCode);
    }
  }, [chapterId]);

  const handleChallengeSubmit = async () => {
    try {
      const res = await fetch("https://bugblitz.onrender.com/run-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceCode: challengeCode, language: 'javascript' }),
      });
      const data = await res.json();
      const actualOutput = (data.stdout || "").trim();
      const expectedOutput = chapter.challenge.tests[0].expected_output.trim();

      if (data.status === 'Accepted' && actualOutput === expectedOutput) {
        setChallengeResult({ status: 'success', message: '✅ Correct! Challenge passed. Time for the final test!' });
      } else {
        setChallengeResult({ status: 'error', message: `❌ Not quite. Keep trying! Your output was: "${actualOutput}"` });
      }
    } catch (err) {
      setChallengeResult({ status: 'error', message: '⚠️ Network error. Please try again.' });
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    const currentQuestion = chapter.quiz[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setQuestionStatus('correct');
      setQuizScore(prev => prev + 5);
    } else {
      setQuestionStatus('incorrect');
    }
  };
  
  const handleNextQuestion = async () => {
    const isLastQuestion = currentQuestionIndex === chapter.quiz.length - 1;
    if (isLastQuestion) {
      // Save progress to Firestore
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          completedChapters: arrayUnion(chapter.id),
          totalKnowledgePoints: increment(quizScore)
        });
      }
      setView('results');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setQuestionStatus(null);
    }
  };


  if (!chapter) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-500 bg-gray-900">Loading lesson...</div>;
  
  const currentQuestion = chapter.quiz[currentQuestionIndex];

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full bg-gray-900 p-6 sm:p-12 text-white">
        <div className="absolute inset-0 z-0">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 via-indigo-950 to-black"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            
            {view === 'article' && (
              <motion.div key="article" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">{chapter.title}</h1>
                <p className="text-pink-300 text-lg mt-2 font-mono mb-8">{chapter.description}</p>
                <div className="prose prose-invert max-w-none prose-p:text-cyan-200/90 prose-h2:text-cyan-300 prose-strong:text-yellow-300">
                  {chapter.article.map((item, index) => {
                    if (item.type === 'heading') return <h2 key={index}>{item.content}</h2>;
                    if (item.type === 'paragraph') return <p key={index}>{item.content}</p>;
                    if (item.type === 'code') return <InteractiveCodeBlock key={index} code={item.content} />;
                    return null;
                  })}
                </div>
                <button onClick={() => setView('challenge')} className="mt-10 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold px-6 py-4 rounded-lg shadow-lg hover:scale-105 transition-transform text-xl">
                  Proceed to Challenge ➔
                </button>
              </motion.div>
            )}

            {view === 'challenge' && (
              <motion.div key="challenge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <h2 className="text-3xl font-bold text-cyan-300 mb-2">End-of-Chapter Challenge</h2>
                 <h3 className="text-xl font-semibold text-orange-400 mb-2">{chapter.challenge.title}</h3>
                 <p className="text-pink-200/90 mb-6">{chapter.challenge.description}</p>
                 <div className="border-2 border-red-700/80 rounded-lg overflow-hidden shadow-lg">
                    <Editor height="200px" language="javascript" theme="vs-dark" value={challengeCode} onChange={setChallengeCode} options={{ minimap: { enabled: false }, fontSize: 16, wordWrap: 'on' }} />
                 </div>
                 <button onClick={handleChallengeSubmit} className="mt-6 w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform text-lg">
                    Submit Fix
                 </button>
                 {challengeResult.status && (
                    <p className={`mt-4 text-center font-bold p-3 rounded-lg ${challengeResult.status === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-400'}`}>
                        {challengeResult.message}
                    </p>
                 )}
                 {challengeResult.status === 'success' && (
                    <button onClick={() => setView('quiz')} className="mt-4 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform text-lg">
                        Take the Quiz ➔
                    </button>
                 )}
              </motion.div>
            )}
            
            {view === 'quiz' && (
               <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <h2 className="text-3xl font-bold text-cyan-300 mb-2 text-center">{chapter.title}</h2>
                 <p className="text-center text-pink-300 mb-8 font-mono">Question {currentQuestionIndex + 1} of {chapter.quiz.length}</p>
                 
                 <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                    <p className="font-semibold text-xl text-pink-300">{currentQuestion.question}</p>
                    <div className="mt-6 space-y-4">
                        {currentQuestion.options.map((option, oIndex) => {
                            const isSelected = selectedAnswer === oIndex;
                            const isCorrect = currentQuestion.correctAnswer === oIndex;
                            let buttonClass = 'border-fuchsia-800 hover:bg-fuchsia-900/50';
                            if(questionStatus && isSelected && !isCorrect) buttonClass = 'border-red-500 bg-red-900/50 scale-105';
                            if(questionStatus && isCorrect) buttonClass = 'border-green-500 bg-green-900/50 scale-105';
                            
                            return (
                                <button 
                                    key={oIndex} 
                                    onClick={() => !questionStatus && setSelectedAnswer(oIndex)}
                                    disabled={questionStatus !== null}
                                    className={`block w-full text-left p-4 rounded-md border-2 transition-all duration-300 ${buttonClass}`}
                                >
                                    <span className="font-mono text-cyan-200">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                 </div>

                <AnimatePresence>
                {questionStatus === 'incorrect' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                        <h4 className="font-bold text-red-300">Explanation:</h4>
                        <p className="text-red-200/90 mt-1">{currentQuestion.explanation}</p>
                    </motion.div>
                )}
                </AnimatePresence>

                 {questionStatus === null ? (
                    <button onClick={handleCheckAnswer} disabled={selectedAnswer === null} className="mt-8 w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold px-6 py-4 rounded-lg shadow-lg hover:scale-105 transition-transform text-xl disabled:opacity-50 disabled:scale-100">
                        Check Answer
                    </button>
                 ) : (
                    <button onClick={handleNextQuestion} className="mt-8 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold px-6 py-4 rounded-lg shadow-lg hover:scale-105 transition-transform text-xl">
                        {currentQuestionIndex === chapter.quiz.length - 1 ? "Finish & See Results" : "Next Question ➔"}
                    </button>
                 )}
              </motion.div>
            )}

            {view === 'results' && (
                <motion.div key="results" className="text-center flex flex-col items-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                    <h2 className="text-5xl font-extrabold text-yellow-400">Chapter Conquered!</h2>
                    <p className="text-2xl mt-4 text-cyan-300">You scored {quizScore} out of {chapter.quiz.length * 5} Knowledge Points!</p>
                    <div className="text-8xl my-8 animate-bounce">⭐</div>
                    <Link to="/learn-javascript" className="mt-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:scale-105 transition-transform text-xl">
                        Back to Academy Hub
                    </Link>
                </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Lesson;