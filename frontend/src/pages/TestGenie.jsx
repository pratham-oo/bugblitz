import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Editor from "@monaco-editor/react";

const TestGenie = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  // THE FIX: New state to track the selected intensity
  const [intensity, setIntensity] = useState('standard'); // 'quick', 'standard', or 'deep'

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput("");

    try {
      // THE FIX: Build a smarter prompt based on the selected intensity
      let promptInstruction = 'Generate 5 to 7 detailed test cases for the following, including common edge cases:';
      if (intensity === 'quick') {
        promptInstruction = 'Generate 3 simple, happy-path test cases for the following:';
      } else if (intensity === 'deep') {
        promptInstruction = 'Generate 10+ comprehensive test cases for the following, including edge cases, boundary conditions, and negative (failure) tests:';
      }
      
      const fullPrompt = `${promptInstruction}\n\n${input}`;

      const res = await fetch("http://localhost:3001/generate-testcases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      const data = await res.json();
      if (res.ok) {
        setOutput(data.result);
      } else {
        setOutput("❌ Error: " + data.error);
      }
    } catch (err) {
      setOutput("⚠️ Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const intensityOptions = [
    { key: 'quick', label: 'Quick Check' },
    { key: 'standard', label: 'Standard Audit' },
    { key: 'deep', label: 'Deep Dive' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full bg-gray-900 p-6 sm:p-12 text-white flex flex-col items-center">
        {/* Animated Background */}
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
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">
              🧪 TestGenie
            </h1>
            <p className="text-pink-300 text-lg mt-2 font-mono">
              &gt; AI-powered test case generation protocol
            </p>
          </div>

          {/* Main Tool Container */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-cyan-300">
                Paste your code or function description:
              </label>
              <div className="border-2 border-fuchsia-700 rounded-lg overflow-hidden shadow-lg">
                <Editor
                  height="250px"
                  language="javascript"
                  theme="vs-dark"
                  value={input}
                  onChange={setInput}
                  options={{ minimap: { enabled: false }, fontSize: 16, wordWrap: 'on' }}
                />
              </div>
            </div>

            {/* --- NEW Intensity Selector UI --- */}
            <div>
                <label className="block mb-3 font-semibold text-cyan-300">
                    Select Intensity Level:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    {intensityOptions.map(option => (
                        <button 
                            key={option.key}
                            onClick={() => setIntensity(option.key)}
                            className={`w-full text-center px-4 py-3 rounded-lg font-semibold border-2 transition-all duration-200 ${
                                intensity === option.key 
                                ? 'bg-cyan-500 border-cyan-400 text-white scale-105 shadow-lg' 
                                : 'bg-black/30 border-fuchsia-800 text-fuchsia-300 hover:bg-fuchsia-900 hover:border-fuchsia-600'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold px-6 py-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-xl"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Summoning the Genie...
                </>
              ) : (
                "✨ Generate Test Cases"
              )}
            </button>
          </div>
          
          {/* Results Panel */}
          <AnimatePresence>
            {output && (
              <motion.div
                className="mt-8 bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-2xl font-bold text-cyan-300 mb-4">Generated Test Cases:</h3>
                <div className="border border-cyan-500/30 rounded-lg overflow-hidden">
                    <Editor
                        height="400px"
                        language="markdown"
                        theme="vs-dark"
                        value={output}
                        options={{ readOnly: true, minimap: { enabled: false }, fontSize: 16, wordWrap: 'on' }}
                    />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default TestGenie;