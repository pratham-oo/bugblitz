🧠 BugBlitz.AI - The Ultimate Gamified Debugging Arena
BugBlitz.AI is a full-stack, AI-powered SaaS platform designed to revolutionize how developers learn software testing and debugging. Stop reading theory—start fixing real bugs in a competitive, gamified environment.

✨ Core Features
BugBlitz.AI is more than just a coding app; it's a comprehensive training ground.

🎮 The Double Trouble Arena
The heart of the experience. A competitive, cyberpunk-themed arena where you face two distinct types of challenges to earn XP and climb the leaderboards.

Classic Mode (🪓): A pure test of debugging skill. You're given broken code—find the bug, fix it, and claim victory.

Regression Guard (🛡️): A test of precision. You're given working code and a new feature request. Your mission: add the feature without breaking any of the existing functionality.

🎓 The BugBlitz Academy
Learn JavaScript from the ground up, the BugBlitz way.

Interactive Articles: Read lessons packed with runnable code examples.

Learn by Breaking: Every chapter ends with a hands-on challenge where you apply what you've learned to fix a relevant bug.

Chapter Quizzes: Test your knowledge with interactive, one-question-at-a-time quizzes with instant feedback and explanations to earn Knowledge Points (KP).

🏆 The Hall of Heroes Leaderboard
A fully-featured competitive hub with a stunning "winner's podium" UI.

Multiple Boards: Track your rank on three separate leaderboards: Classic Mode (XP), Regression Mode (XP), and Quiz Masters (KP).

Weighted Overall Score: The main leaderboard uses a weighted formula (Classic XP + 2 * Regression XP) to reward players who master the tougher challenges.

🛠️ The Developer Toolkit
A suite of powerful, AI-driven tools to supercharge your workflow.

🧪 TestGenie: An AI test case generator with adjustable "Intensity Levels" (Quick Check, Standard Audit, Deep Dive) to control the depth of the analysis.

🐞 AutoBug: An AI debugging partner featuring:

An "Anti-Cheat" system that detects Bug Arena challenges.

A "Pro-Level Report" with structured analysis on Bug Severity and Root Cause.

An "Interactive Sandbox" to instantly apply the AI's fix and run your own tests to verify it works.

🔍 GitHub Analyzer (The "Mic Drop" Feature):

Get a full, AI-powered "Project Mentor" report on any public GitHub repo.

Explore the repository's structure with a stunning, interactive, explorable file map powered by React Flow and a D3 physics engine.

🚀 Tech Stack
This project is a full-stack application built with a modern, professional technology stack.

Category

Technology

Frontend

React.js Vite React Router Tailwind CSS Framer Motion React Flow d3-force

Backend

Node.js Express.js

Database

Firebase Firestore (for user data, XP, and progress)

Auth

Firebase Authentication (Email/Password & Google OAuth)

External APIs

OpenAI API (for AI features) Judge0 API (for secure code execution) GitHub API (for repository analysis)

🏁 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
You'll need Node.js and npm installed on your machine.

Installation & Setup
Clone the repo

git clone [https://github.com/your-username/bugblitz-ai2.git](https://github.com/your-username/bugblitz-ai2.git)
cd bugblitz-ai2

Install Frontend Dependencies

npm install

Install Backend Dependencies

cd server
npm install

Set up Environment Variables

In the server/ directory, create a new file named .env.

IMPORTANT: Add your secret API keys and Firebase configuration to this file. DO NOT commit this file to GitHub.

Your .env file should follow this template:

# Firebase Config (get this from your Firebase project settings)
VITE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_PROJECT_ID=your_firebase_project_id
VITE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_APP_ID=your_firebase_app_id

# API Keys
OPENROUTER_API_KEY=your_openrouter_api_key
RAPIDAPI_KEY=your_judge0_rapidapi_key
GITHUB_TOKEN=your_github_personal_access_token

Run the Application

Start the backend server (from the server/ directory):

node index.js

In a separate terminal, start the frontend development server (from the root bugblitz-ai2/ directory):

npm run dev

Open your browser and go to http://localhost:5173 (or whatever port Vite is using).

🌟 Future Scope
BugBlitz.AI is built to grow. Here's what's planned for the future:

Optimizer Mode: The third Bug Arena mode, focused on code efficiency.

Multi-Language Support: Expanding the Bug Arena and Academy to support Python and other languages.

Expanded Academy: Adding more advanced JavaScript chapters and complete courses for other languages.

Leaderboard V2: Adding weekly rankings, friend leaderboards, and achievements.

This project was built with passion by Pratham Shinde.