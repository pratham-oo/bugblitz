import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import * as d3 from 'd3-force';

// This function now creates the initial structure for the D3 simulation
const createGraphElements = (flatTree, currentPath = 'root') => {
    if (!flatTree || flatTree.length === 0) {
        return { initialNodes: [], initialEdges: [] };
    }

    const children = flatTree.filter(item => {
        const pathParts = item.path.split('/');
        if (currentPath === 'root') return pathParts.length === 1;
        const parentPath = pathParts.slice(0, -1).join('/');
        return parentPath === currentPath;
    });

    const nodes = [];
    const edges = [];
    
    const parentNodeLabel = currentPath === 'root' ? 'Repo Root' : `📁 ${currentPath.split('/').pop()}`;
    nodes.push({ 
        id: currentPath, 
        data: { label: parentNodeLabel }, 
        position: { x: 400, y: 50 },
        type: 'input',
        style: {
            background: '#1f2937', color: '#f59e0b', border: '2px solid #f59e0b',
            width: 150, height: 150, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '16px', fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
        }
    });

    children.forEach(item => {
        const nodeLabel = (item.type === 'tree' ? '📁' : '📄') + ' ' + item.path.split('/').pop();
        nodes.push({
            id: item.path,
            data: { 
                label: nodeLabel, 
                type: item.type === 'tree' ? 'folder' : 'file'
            },
            position: { x: Math.random() * 800, y: Math.random() * 400 + 200 },
            type: 'default',
            style: {
                background: '#111827',
                color: item.type === 'tree' ? '#f59e0b' : '#34d399',
                border: '1px solid #4f46e5',
                width: 100, height: 100, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '11px',
                wordBreak: 'break-word', padding: '5px'
            },
        });
        edges.push({
            id: `e-${currentPath}-${item.path}`,
            source: currentPath,
            target: item.path,
            style: { stroke: '#4f46e5', strokeWidth: 1.5 },
            type: 'smoothstep'
        });
    });
    
    return { initialNodes: nodes, initialEdges: edges };
};

const GitHubAnalyzer = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const [fullFileTree, setFullFileTree] = useState([]);
  const [currentPath, setCurrentPath] = useState('root');
  const [pathHistory, setPathHistory] = useState(['root']);
  
  const simulationRef = useRef();

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    setAnalysisResult("");
    setFullFileTree([]);
    setCurrentPath('root');
    setPathHistory(['root']);

    try {
      const res = await fetch("https://bugblitz.onrender.com/analyze-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const text = await res.text(); // Read raw response
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server: " + text);
      }

      if (res.ok) {
        setAnalysisResult(data.analysisResult || "✅ Analysis complete (no text returned).");
        if (data.fileTree) {
            setFullFileTree(data.fileTree);
        }
      } else {
        setAnalysisResult("❌ Server Error: " + (data.error || "Something went wrong"));
      }
    } catch (err) {
      setAnalysisResult("⚠️ Network/Parsing error: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const onNodeDoubleClick = (event, node) => {
    if (node.data.type === 'folder') {
        setCurrentPath(node.id);
        setPathHistory([...pathHistory, node.id]);
    }
  };

  const handleGoBack = () => {
    if (pathHistory.length > 1) {
        const newHistory = [...pathHistory];
        newHistory.pop();
        const newPath = newHistory[newHistory.length - 1];
        setPathHistory(newHistory);
        setCurrentPath(newPath);
    }
  };
  
  useEffect(() => {
    if(fullFileTree.length > 0) {
        const { initialNodes, initialEdges } = createGraphElements(fullFileTree, currentPath);
        setNodes(initialNodes);
        setEdges(initialEdges);
        
        simulationRef.current = d3.forceSimulation(initialNodes)
            .force("link", d3.forceLink(initialEdges).id(d => d.id).distance(150).strength(0.8))
            .force("charge", d3.forceManyBody().strength(-800))
            .force("x", d3.forceX(window.innerWidth / 4).strength(0.03))
            .force("y", d3.forceY(window.innerHeight / 4).strength(0.03));

        simulationRef.current.on("tick", () => {
            setNodes((currentNodes) =>
                currentNodes.map(n => {
                    const simNode = initialNodes.find(sn => sn.id === n.id);
                    return { ...n, position: { x: simNode.x, y: simNode.y }};
                })
            );
        });
        
        return () => {
            simulationRef.current.stop();
        }
    } else {
        setNodes([]);
        setEdges([]);
    }
  }, [currentPath, fullFileTree, setNodes, setEdges]);
  
  const onNodeDragStart = useCallback((event, node) => {
    if (!simulationRef.current) return;
    simulationRef.current.alphaTarget(0.3).restart();
    simulationRef.current.nodes().find(n => n.id === node.id).fx = node.position.x;
    simulationRef.current.nodes().find(n => n.id === node.id).fy = node.position.y;
  }, []);

  const onNodeDrag = useCallback((event, node) => {
    if (!simulationRef.current) return;
    simulationRef.current.nodes().find(n => n.id === node.id).fx = node.position.x;
    simulationRef.current.nodes().find(n => n.id === node.id).fy = node.position.y;
  }, []);

  const onNodeDragStop = useCallback((event, node) => {
    if (!simulationRef.current) return;
    simulationRef.current.alphaTarget(0);
    simulationRef.current.nodes().find(n => n.id === node.id).fx = null;
    simulationRef.current.nodes().find(n => n.id === node.id).fy = null;
  }, []);

  const formatContent = (text) => {
    const codeRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const parts = text.split(codeRegex);
    if (parts.length <= 1) { return <p className="whitespace-pre-wrap">{text}</p>; }
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

        <motion.div className="relative z-10 w-full max-w-7xl" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">
              🔍 GitHub Analyzer
            </h1>
            <p className="text-pink-300 text-lg mt-2 font-mono">
              &gt; AI-powered repository intelligence
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 max-w-4xl mx-auto">
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-cyan-300/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </span>
                <input
                    type="url"
                    placeholder="Paste a public GitHub repository URL here..."
                    className="w-full pl-14 pr-4 py-4 rounded-lg bg-gray-800/50 border border-fuchsia-500/50 text-cyan-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 outline-none transition font-mono"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={loading}
                />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold px-6 py-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-xl"
            >
              {loading ? "Analyzing..." : "🚀 Analyze Repo"}
            </button>
          </div>
          
          <AnimatePresence>
            {(nodes.length > 0 || analysisResult) && (
              <motion.div
                className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8 items-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl p-4 h-[70vh] w-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <button onClick={handleGoBack} disabled={pathHistory.length <= 1} className="px-4 py-1 bg-fuchsia-600/50 text-sm rounded-md hover:bg-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            ↑ Up One Level
                        </button>
                        <h3 className="text-xl font-bold text-cyan-300 text-center">Interactive File Map</h3>
                        <div className="w-24"></div>
                    </div>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeDoubleClick={onNodeDoubleClick}
                        onNodeDragStart={onNodeDragStart}
                        onNodeDrag={onNodeDrag}
                        onNodeDragStop={onNodeDragStop}
                        fitView
                        className="bg-transparent"
                    >
                        <Controls />
                        <Background color="#4b5563" gap={24} variant="dots" />
                    </ReactFlow>
                </div>
                {analysisResult && (
                    <div className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6 h-[70vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-cyan-300 mb-4">AI Mentor Analysis</h3>
                        <div className="text-cyan-200/90 leading-relaxed prose prose-invert prose-sm">
                            {formatContent(analysisResult)}
                        </div>
                    </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default GitHubAnalyzer;