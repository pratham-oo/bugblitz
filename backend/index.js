// index.js - Full Backend for Bug Arena
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

dotenv.config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

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

// ----------------- 🔥 GitHub Repo Tree Fetcher -----------------
async function getRepoTree(owner, repo) {
  try {
    const GITHUB_API_HEADERS = {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    };

    // 1. Get default branch
    const repoInfoRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers: GITHUB_API_HEADERS }
    );
    if (!repoInfoRes.ok) {
      throw new Error(`Could not fetch repo info: ${repoInfoRes.statusText}`);
    }
    const repoInfo = await repoInfoRes.json();
    const defaultBranch = repoInfo.default_branch;

    // 2. Get latest commit SHA for that branch
    const branchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches/${defaultBranch}`,
      { headers: GITHUB_API_HEADERS }
    );
    if (!branchRes.ok) {
      throw new Error(
        `Could not fetch branch info: ${branchRes.statusText}`
      );
    }
    const branchInfo = await branchRes.json();
    const commitSha = branchInfo.commit?.sha;
    if (!commitSha) throw new Error("Could not resolve commit SHA");

    // 3. Get the tree recursively
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`,
      { headers: GITHUB_API_HEADERS }
    );
    if (!treeRes.ok) {
      throw new Error(`Could not fetch repo tree: ${treeRes.statusText}`);
    }
    const data = await treeRes.json();

    if (data.truncated) {
      console.warn(
        `⚠️ Warning: Repository ${owner}/${repo} is very large and tree was truncated.`
      );
    }

    return data.tree || [];
  } catch (error) {
    console.error("❌ Failed to fetch repo tree:", error);
    return null;
  }
}
// ----------------------------------------------------------------

app.post("/run-code", async (req, res) => {
  const { sourceCode, language, stdin } = req.body;
  if (!sourceCode || !language) {
    return res.status(400).json({ error: "sourceCode and language are required." });
  }
  try {
    const resultData = await runJudge0({
      source: sourceCode,
      stdin: stdin || "",
      language,
    });
    res.json({
      status: resultData.status?.description,
      stdout: resultData.stdout,
      stderr: resultData.stderr,
      time: resultData.time,
      memory: resultData.memory,
    });
  } catch (error) {
    console.error("Judge0 execution error:", error);
    res.status(500).json({ error: "Error during code execution." });
  }
});

app.get('/', () =>{
  return res.status(2000).json({message : "Server is running"});
})

// ----------------- Test Case Generator -----------------
app.post("/generate-testcases", async (req, res) => {
  console.log("inside");
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

// ----------------- Auto Bug Explainer -----------------
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
              message:
                "### 🚨 ALERT! 🚨\nAha! Trying to use our own tools against us, debugger? Clever... but not clever enough. Solve this one in the Arena yourself! 😉",
            });
          }
        }
      }
    }
  }

  const prompt = `You are an expert software tester and code reviewer. Analyze this code and respond IN MARKDOWN format with the following exact headers:
### Bug Severity
(Classify as: Critical, High, Medium, Low, or Typo)
### Root Cause Category
(Classify as: Logic Error, Off-by-One Error, Null Pointer, Type Mismatch, Syntax Error, or other relevant category)
### Bug Explanation
<Detailed explanation>
### Suggested Fix
<How to fix>
### Final Corrected Code
\`\`\`
${code}
\`\`\``;

  try {
    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({
      result: completion.choices[0]?.message?.content || "No response.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- 🔥 GitHub Analyzer -----------------
app.post("/analyze-repo", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: "Repository URL is required." });
  }

  const urlMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!urlMatch) {
    return res.status(400).json({ error: "Invalid GitHub repository URL." });
  }
  const owner = urlMatch[1];
  const repo = urlMatch[2].replace(".git", "");

  try {
    const flatTree = await getRepoTree(owner, repo);
    if (flatTree === null) {
      return res.status(500).json({
        error:
          "Could not fetch repository data from GitHub. Repo might be private, deleted, or the URL has a typo.",
      });
    }

    const fileTreeTextForAI = flatTree.map((item) => `${item.path}`).join("\n");

    const prompt = `You are a 10x senior developer. Analyze this GitHub repository. Respond IN MARKDOWN with these exact headers: 
### 🚀 Project Summary
### 🛠️ Tech Stack Analysis
### 📁 Key File Explanations
### 🐞 Potential Bugs & Improvements
### ⭐ Getting Started for Beginners

Here is the file tree for context:
${fileTreeTextForAI}

Repository: ${repoUrl}`;

    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
    });

    const aiAnalysis =
      completion.choices[0]?.message?.content || "AI analysis failed.";

    res.json({
      fileTree: flatTree,
      analysisResult: aiAnalysis,
    });
  } catch (error) {
    console.error("❌ analyze-repo error:", error);
    res.status(500).json({ error: error.message });
  }
});
// ----------------------------------------------------------------

// (upload-analyze + submit-fix code stays same as yours…)


app.post("/upload-analyze", upload.single("zipFile"), async (req, res) => {
  const zipPath = req.file?.path;
  if (!zipPath) return res.status(400).json({ error: "No file uploaded." });
  const extractPath = `/tmp/extracted/${Date.now()}`;
  await fs.ensureDir(extractPath);
  try {
    await fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: extractPath })).promise();
    const walk = async (dir) => {
      let files = [];
      for (const file of await fs.readdir(dir)) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) files = files.concat(await walk(fullPath));
        else files.push(fullPath);
      }
      return files;
    };
    const allFiles = await walk(extractPath);
    let codeData = "";
    for (const fullPath of allFiles) {
      const ext = path.extname(fullPath);
      if (/\.(js|ts|jsx|tsx|py|c|cpp|java)$/.test(ext)) {
        const content = await fs.readFile(fullPath, "utf8");
        codeData += `\n\n--- File: ${fullPath.replace(extractPath, "")} ---\n${content}`;
      }
    }
    if (!codeData.trim()) return res.status(400).json({ error: "No code files found." });
    const prompt = `Analyze this uploaded project:\n${codeData}`;
    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ result: completion.choices[0]?.message?.content || "No AI response." });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
