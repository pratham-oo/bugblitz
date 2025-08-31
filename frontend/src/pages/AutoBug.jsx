import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Editor from "@monaco-editor/react";

const severityColors = {
  Critical: "bg-red-500 text-white",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-400 text-black",
  Low: "bg-blue-400 text-white",
  Typo: "bg-gray-400 text-black",
};

const AutoBug = () => {
  const [inputType, setInputType] = useState('paste');
  const [code, setCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [fixApplied, setFixApplied] = useState(false);
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [sandboxLanguage, setSandboxLanguage] = useState('javascript');
  const [testStdin, setTestStdin] = useState('');
  const [testExpectedOutput, setTestExpectedOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis({});
    setTestResult(null);
    setFixApplied(false);
    if (inputType === 'paste') {
      setOriginalCode(code);
    }

    let endpoint = '';
    let body = {};
    let headers = {};

    if (inputType === 'paste') {
      if (!code.trim()) {
        setAnalysis({ Error: "Please paste some code to analyze." });
        setLoading(false);
        return;
      }
      endpoint = "https://bugblitz-grl6.vercel.app/explain-bug";
      headers = { "Content-Type": "application/json" };
      body = JSON.stringify({ code });
    } else if (inputType === 'upload') {
      if (!file) {
        setAnalysis({ Error: "Please select a file to upload." });
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append('zipFile', file);
      endpoint = "https://bugblitz-grl6.vercel.app/upload-analyze";
      body = formData;
    }

    try {
      const res = await fetch(endpoint, { method: "POST", headers, body });
      const data = await res.json();
      
      if (data.isCheating) {
        parseAndSetAnalysis(data.message);
      } else if (res.ok && data.result) {
        parseAndSetAnalysis(data.result);
      } else {
        setAnalysis({ Error: `❌ Error: ${data.error || "Invalid AI response."}` });
      }
    } catch (err) {
      setAnalysis({ Error: "⚠️ Network error: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const parseAndSetAnalysis = (text) => {
    const resultObj = {};
    const regex = /### (.*?)\n([\s\S]*?)(?=### |$)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const sectionTitle = match[1].trim();
      const sectionContent = match[2].trim();
      resultObj[sectionTitle] = sectionContent;
    }

    if (Object.keys(resultObj).length === 0 && text) {
      resultObj["Analysis Result"] = text;
    }
    
    setAnalysis(resultObj);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(
      Object.entries(analysis)
        .map(([title, content]) => `### ${title}\n${content}`)
        .join("\n\n")
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyFix = () => {
    const correctedCodeContent = analysis["Final Corrected Code"];
    if (!correctedCodeContent) return;

    const codeRegex = /```(?:\w+)?\n([\s\S]*?)```/;
    const match = correctedCodeContent.match(codeRegex);
    
    if (match && match[1]) {
      setCode(match[1].trim());
    } else {
      setCode(correctedCodeContent);
    }
    
    setFixApplied(true);
    
    const langMatch = correctedCodeContent.match(/```(\w+)/);
    if (langMatch && langMatch[1].toLowerCase().includes('python')) {
      setSandboxLanguage('python');
    } else {
      setSandboxLanguage('javascript');
    }
  };
  
  const handleRunTest = async () => {
    if (!code.trim()) {
        setTestResult({ status: 'fail', message: 'There is no code in the editor to test.' });
        return;
    };
    setIsTesting(true);
    setTestResult(null);

    let functionName = '';
    let harness = '';
    const pyMatch = code.match(/def (\w+)\(/);
    const jsMatch = code.match(/function (\w+)\(/);

    if (sandboxLanguage === 'python' && pyMatch) {
        functionName = pyMatch[1];
        harness = `\nimport sys\ntry:\n  nums = list(map(float, sys.stdin.read().strip().split()))\n  print(${functionName}(nums))\nexcept:\n  print(${functionName}(sys.stdin.read().strip()))`;
    } else if (sandboxLanguage === 'javascript' && jsMatch) {
        functionName = jsMatch[1];
        harness = `\nconst fs = require('fs');\ntry {\n  const input = fs.readFileSync(0,'utf8').trim();\n  const nums = input.split(/\\s+/).map(Number);\n  console.log(${functionName}(nums));\n} catch (e) {\n  const input = fs.readFileSync(0,'utf8').trim();\n  console.log(${functionName}(input));\n}`;
    }

    if (!harness) {
        setTestResult({ status: 'fail', message: 'Could not detect a standard Python/JS function to test.' });
        setIsTesting(false);
        return;
    }

    const fullCodeToRun = code + harness;

    try {
        const res = await fetch("https://bugblitz-grl6.vercel.app/run-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sourceCode: fullCodeToRun,
                stdin: testStdin,
                language: sandboxLanguage,
            }),
        });
        const data = await res.json();
        if (res.ok) {
            const actualOutput = (data.stdout || "").trim().replace(/\r\n/g, "\n");
            const expected = testExpectedOutput.trim().replace(/\r\n/g, "\n");
            if (actualOutput === expected) {
                setTestResult({ status: 'pass', message: `✅ Test Passed! Output matched.` });
            } else {
                setTestResult({ status: 'fail', message: `❌ Test Failed. Output was: "${actualOutput}"` });
            }
        } else {
            setTestResult({ status: 'fail', message: `❌ Error: ${data.stderr || data.error}` });
        }
    } catch (err) {
        setTestResult({ status: 'fail', message: `⚠️ Network error: ${err.message}` });
    } finally {
        setIsTesting(false);
    }
  };

  const formatContent = (text) => {
    const codeRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const parts = text.split(codeRegex);
    
    if (parts.length <= 1) {
        return <p>{text}</p>;
    }

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <pre key={index} className="bg-black/50 text-green-300 text-sm p-4 my-2 rounded-lg overflow-x-auto font-mono border border-fuchsia-500/20">
            <code>{part.trim()}</code>
          </pre>
        );
      }
      return <p key={index} className="whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full bg-gray-900 p-6 sm:p-12 text-white flex flex-col items-center">
        <div className="absolute inset-0 z-0">
          <motion.div className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 via-indigo-950 to-black" animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 20, ease: "linear", repeat: Infinity }} style={{ backgroundSize: '200% 200%' }} />
        </div>

        <motion.div className="relative z-10 w-full max-w-4xl" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">
              🐞 AutoBug
            </h1>
            <p className="text-pink-300 text-lg mt-2 font-mono">
              &gt; AI-powered root cause analysis
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="flex border-b border-fuchsia-500/30 mb-6">
              <button onClick={() => setInputType('paste')} className={`px-6 py-3 font-semibold transition-colors duration-300 ${inputType === 'paste' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400 hover:text-white'}`}>
                Paste Code Snippet
              </button>
              <button onClick={() => setInputType('upload')} className={`px-6 py-3 font-semibold transition-colors duration-300 ${inputType === 'upload' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400 hover:text-white'}`}>
                Upload File (.zip)
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              {inputType === 'paste' ? (
                <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold text-cyan-300">Paste your buggy code:</label>
                        {fixApplied && (
                            <button onClick={() => { setCode(originalCode); setFixApplied(false); }} className="text-xs font-semibold text-orange-300 hover:underline">
                                ↲ View Original Code
                            </button>
                        )}
                    </div>
                    <div className="border-2 border-red-700/80 rounded-lg overflow-hidden shadow-lg">
                        <Editor height="250px" language={sandboxLanguage} theme="vs-dark" value={code} onChange={setCode} options={{ minimap: { enabled: false }, fontSize: 16, wordWrap: 'on' }} />
                    </div>
                </motion.div>
              ) : (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <label className="block mb-2 font-semibold text-cyan-300">Upload a .zip file of your project:</label>
                    <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-fuchsia-500/50 px-6 py-10">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <div className="mt-4 flex text-sm leading-6 text-gray-400">
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-cyan-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-cyan-300">
                                    <span>Select a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files[0])} accept=".zip" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            {file && <p className="text-xs leading-5 text-green-400 mt-2">Selected: {file.name}</p>}
                        </div>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handleAnalyze} disabled={loading} className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold px-6 py-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-xl">
              {loading ? ( <><svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Analyzing...</> ) : "🔍 Analyze Bug"}
            </button>
          </div>
          
          <AnimatePresence>
            {analysis["Final Corrected Code"] && (
                <motion.div 
                    className="mt-8 bg-black/40 backdrop-blur-lg border-2 border-cyan-500/30 rounded-2xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-cyan-300">🔬 Test Your Fix</h3>
                        <div className="flex gap-2">
                           <button onClick={() => setSandboxLanguage('python')} className={`px-3 py-1 text-xs rounded-full font-bold ${sandboxLanguage === 'python' ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>🐍 Python</button>
                           <button onClick={() => setSandboxLanguage('javascript')} className={`px-3 py-1 text-xs rounded-full font-bold ${sandboxLanguage === 'javascript' ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}>🟨 JS</button>
                        </div>
                    </div>
                     <p className="text-xs text-cyan-300/70 italic mb-4">
                        ⓘ The "Run Test" feature is optimized for standard Python and JavaScript functions. The main AI analysis works for most languages.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea value={testStdin} onChange={(e) => setTestStdin(e.target.value)} placeholder="Test Input (stdin)..." className="w-full h-24 p-2 rounded-lg bg-gray-800/50 border border-fuchsia-500/50 text-cyan-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 outline-none transition font-mono text-sm" />
                        <textarea value={testExpectedOutput} onChange={(e) => setTestExpectedOutput(e.target.value)} placeholder="Expected Output..." className="w-full h-24 p-2 rounded-lg bg-gray-800/50 border border-fuchsia-500/50 text-cyan-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 outline-none transition font-mono text-sm" />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <button onClick={handleRunTest} disabled={isTesting} className="flex-grow bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50">
                            {isTesting ? "Testing..." : "Run Test"}
                        </button>
                         {testResult && (
                            <div className={`text-sm font-bold p-3 rounded-lg ${testResult.status === 'pass' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-400'}`}>
                                {testResult.message}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {Object.keys(analysis).length > 0 && (
              <motion.div className="mt-8 relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex gap-4 mb-6">
                    {analysis["Bug Severity"] && (
                        <div className="flex-1 bg-black/30 p-4 rounded-lg border border-white/10">
                            <h4 className="text-sm font-bold text-cyan-300/80 uppercase tracking-wider">Severity</h4>
                            <p className={`mt-1 text-lg font-black rounded-md px-3 py-1 inline-block ${severityColors[analysis["Bug Severity"]] || 'bg-gray-400'}`}>{analysis["Bug Severity"]}</p>
                        </div>
                    )}
                    {analysis["Root Cause Category"] && (
                         <div className="flex-1 bg-black/30 p-4 rounded-lg border border-white/10">
                            <h4 className="text-sm font-bold text-cyan-300/80 uppercase tracking-wider">Root Cause</h4>
                            <p className="mt-1 text-lg font-bold text-pink-300">{analysis["Root Cause Category"]}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                  {Object.entries(analysis).map(([section, content], idx) => {
                    if (section === "Bug Severity" || section === "Root Cause Category") return null;
                    return (
                        <motion.div key={idx} className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6 relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                          <div className="flex justify-between items-start">
                            <h3 className={`text-xl font-bold mb-3 ${section.includes('ALERT') ? 'text-yellow-400' : 'text-red-400'}`}>{section}</h3>
                            {section === "Final Corrected Code" && (
                              <button onClick={handleApplyFix} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors">
                                  Apply Fix ➔
                              </button>
                            )}
                          </div>
                          <div className="text-cyan-200/90 text-sm whitespace-pre-wrap leading-relaxed">{formatContent(content)}</div>
                        </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default AutoBug;