// index.js - Full Backend for Bug Arena (Vercel Ready)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import multer from "multer";
import unzipper from "unzipper";
import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import { dummyChallenges } from "./dummyChallenges.js";

// IMPORTANT: Vercel needs the path to be relative to the API route
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "/tmp/uploads" }); // Use /tmp for Vercel's writable directory

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const GITHUB_API_HEADERS = {
    "Authorization": `token ${process.env.GITHUB_TOKEN}`,
    "Accept": "application/vnd.github.v3+json",
};

const judge0LanguageMap = {
  python: 71,
  javascript: 63,
  cpp: 54,
  java: 62,
};

async function runJudge0({ source, stdin = "", language }) {
  const languageId = judge0LanguageMap[language.toLowerCase()];
  if (!languageId) throw new Error("Unsupported language");
  const resp = await fetch(
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true&fields=status,stdout,stderr,time,memory",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        source_code: source,
        language_id: languageId,
        stdin,
      }),
    }
  );
  return resp.json();
}

const clean = (s) => (s || "").trim().replace(/\r\n/g, "\n");

async function getRepoTree(owner, repo) {
  try {
    const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: GITHUB_API_HEADERS });
    if (!repoInfoRes.ok) {
        throw new Error(`Could not fetch repo info: ${repoInfoRes.statusText}`);
    }
    const repoInfo = await repoInfoRes.json();
    const defaultBranch = repoInfo.default_branch;
    
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers: GITHUB_API_HEADERS });
    if (!treeRes.ok) {
      throw new Error(`Could not fetch repo tree: ${treeRes.statusText}`);
    }
    const data = await treeRes.json();

    if(data.truncated) {
        console.warn(`Warning: Repository ${owner}/${repo} is very large and the file tree was truncated.`);
    }

    return data.tree || [];
  } catch (error) {
    console.error("Failed to fetch repo tree:", error);
    return null;
  }
}

app.post("/run-code", async (req, res) => {
  const { sourceCode, language, stdin } = req.body;
  if (!sourceCode || !language) { return res.status(400).json({ error: "sourceCode and language are required." }); }
  try {
    const resultData = await runJudge0({ source: sourceCode, stdin: stdin || "", language });
    res.json({ status: resultData.status?.description, stdout: resultData.stdout, stderr: resultData.stderr, time: resultData.time, memory: resultData.memory });
  } catch (error) {
    console.error("Judge0 execution error:", error);
    res.status(500).json({ error: "Error during code execution." });
  }
});

app.post("/generate-testcases", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "A prompt is required." });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ result: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/explain-bug", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Code is required." });

  const normalizedInputCode = clean(code);
  for (const challenge of dummyChallenges) {
    if (challenge.variants) {
      for (const lang in challenge.variants) {
        for (const buggyCode of challenge.variants[lang]) {
          if (clean(buggyCode) === normalizedInputCode) {
            return res.json({ 
              isCheating: true,
              message: "### 🚨 ALERT! 🚨\nAha! Trying to use our own tools against us, debugger? Clever... but not clever enough. Solve this one in the Arena yourself! 😉" 
            });
          }
        }
      }
    }
  }

  const prompt = `You are an expert software tester and code reviewer...`; // Full prompt

  try {
    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ result: completion.choices[0]?.message?.content || "No response." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/analyze-repo", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ error: "Repository URL is required." });

  const urlMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!urlMatch) { return res.status(400).json({ error: "Invalid GitHub repository URL." }); }
  const owner = urlMatch[1];
  const repo = urlMatch[2].replace('.git', '');

  try {
    const flatTree = await getRepoTree(owner, repo);
    if (flatTree === null) {
        return res.status(500).json({ error: "Could not fetch repository data from GitHub. The repository might be private, deleted, or the URL may have a typo."});
    }

    const fileTreeTextForAI = flatTree.map(item => `${item.path}`).join('\n');
    
    const prompt = `You are a 10x senior developer...`; // Full prompt

    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
    });

    const aiAnalysis = completion.choices[0]?.message?.content || "AI analysis failed.";
    
    res.json({
        fileTree: flatTree,
        analysisResult: aiAnalysis,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/upload-analyze", upload.single("zipFile"), async (req, res) => {
  const zipPath = req.file?.path;
  if (!zipPath) return res.status(400).json({ error: "No file uploaded." });
  const extractPath = `/tmp/extracted/${Date.now()}`;
  await fs.ensureDir(extractPath);
  try {
    // ... Full logic
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await fs.remove(zipPath);
    await fs.remove(extractPath);
  }
});

app.post("/submit-fix", async (req, res) => {
  const { id, fixedCode, language } = req.body;
  if (!fixedCode || !language) { return res.status(400).json({ error: "fixedCode and language are required" }); }
  const challenge = dummyChallenges.find((ch) => ch.id === id);
  if (!challenge) { return res.status(404).json({ error: "Challenge not found" }); }
  try {
    if (challenge.mode === "classic" || challenge.mode === "optimizer") {
      for (const test of challenge.tests || []) {
        const harness = challenge.callCode[language.toLowerCase()];
        const codeToRun = fixedCode + "\n\n" + harness;
        const judgeResponse = await runJudge0({ source: codeToRun, stdin: test.input, language });
        const actualOutput = clean(judgeResponse.stdout);
        const expectedOutput = clean(test.expected_output);
        if (judgeResponse.status?.description !== "Accepted" || actualOutput !== expectedOutput) {
          return res.json({ allPassed: false, failedTest: { input: test.input.replace(/\n/g, "\\n"), expected: expectedOutput, yours: actualOutput, error: judgeResponse.stderr, }, xpAwarded: 0 });
        }
      }
      if (challenge.mode === "optimizer") {
        const antiPattern = challenge.antiPattern?.[language.toLowerCase()];
        if (antiPattern && fixedCode.includes(antiPattern)) {
          return res.json({
            allPassed: false,
            feedback: `Your code is correct, but not optimized! It still uses the slow '${antiPattern}' method. Try a more efficient approach to pass.`,
            xpAwarded: 0
          });
        }
      }
      const feedback = challenge.mode === 'optimizer' 
        ? "Perfect Optimization! Your code is both correct and efficient. ✅" 
        : "Excellent work! 🥳";
      return res.json({ allPassed: true, xpAwarded: challenge.xpReward, feedback });
    } else if (challenge.mode === "regression") {
      const allTestResults = { regression: [], feature: [] };
      let allPassed = true;
      for (const test of challenge.regressionTests || []) {
        const harness = test.testCode[language.toLowerCase()];
        if (!harness) continue;
        const codeToRun = fixedCode + "\n\n" + harness;
        const judgeResponse = await runJudge0({ source: codeToRun, language });
        const actualOutput = clean(judgeResponse.stdout);
        const expectedOutput = clean(test.expected_output);
        const passed = judgeResponse.status?.description === "Accepted" && actualOutput === expectedOutput;
        if (!passed) allPassed = false;
        allTestResults.regression.push({ name: "Regression Test", passed, actual: actualOutput, expected: expectedOutput });
      }
      for (const test of challenge.featureTests || []) {
        const harness = test.testCode[language.toLowerCase()];
        if (!harness) continue;
        const codeToRun = fixedCode + "\n\n" + harness;
        const judgeResponse = await runJudge0({ source: codeToRun, language });
        const actualOutput = clean(judgeResponse.stdout);
        const expectedOutput = clean(test.expected_output);
        const passed = judgeResponse.status?.description === "Accepted" && actualOutput === expectedOutput;
        if (!passed) allPassed = false;
        allTestResults.feature.push({ name: "Feature Test", passed, actual: actualOutput, expected: expectedOutput });
      }
      return res.json({
        allPassed,
        testResults: allTestResults,
        xpAwarded: allPassed ? challenge.xpReward : 0,
        feedback: allPassed ? "Success! ✅" : "Not quite. Check the test results."
      });
    }
    res.status(400).json({ error: "Unknown challenge mode" });
  } catch (e) {
    console.error("submit-fix error:", e);
    res.status(500).json({ allPassed: false, feedback: "A server error occurred.", xpAwarded: 0 });
  }
});


const PORT = 3001
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));