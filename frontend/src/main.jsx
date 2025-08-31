import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

// Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TestGenie from "./pages/TestGenie.jsx";
import AutoBug from "./pages/AutoBug.jsx";
import GitHubAnalyzer from "./pages/GitHubAnalyzer.jsx";
// import UploadAnalyzer from "./pages/UploadAnalyzer.jsx"; // Replaced by Learn by Breaking
import BugArena from "./pages/BugArena.jsx";
import BugChallenge from "./pages/BugChallenge.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import ModeSelector from "./components/ModeSelector.jsx";
import ChallengeGrid from "./components/ChallengeGrid.jsx";
import LearnJavaScript from "./pages/LearnJavaScript.jsx"; // New Academy Hub
import Lesson from "./pages/Lesson.jsx"; // New Lesson Page

// Components
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Protected Route wrapper checks localStorage
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? children : <Navigate to="/login" replace />;
}

// Wrapper for ChallengeGrid that extracts mode param
function ChallengeGridWrapper() {
  const { mode } = useParams();
  return <ChallengeGrid mode={mode} />;
}

// Wrapper for Lesson page to extract the chapter ID
function LessonWrapper() {
    const { id } = useParams();
    return <Lesson chapterId={id} />;
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-red-600">
      404 - Page Not Found
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* PROTECTED ROUTES */}
          <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />
          <Route path="/testgenie" element={ <ProtectedRoute> <TestGenie /> </ProtectedRoute> } />
          <Route path="/autobug" element={ <ProtectedRoute> <AutoBug /> </ProtectedRoute> } />
          <Route path="/github-analyzer" element={ <ProtectedRoute> <GitHubAnalyzer /> </ProtectedRoute> } />
          <Route path="/leaderboard" element={ <ProtectedRoute> <Leaderboard /> </ProtectedRoute> } />
          
          {/* ACADEMY ROUTES */}
          <Route path="/learn-javascript" element={ <ProtectedRoute> <LearnJavaScript /> </ProtectedRoute> } />
          <Route path="/lesson/:id" element={ <ProtectedRoute> <LessonWrapper /> </ProtectedRoute> } />

          {/* ARENA ROUTES */}
          <Route path="/bug-arena" element={ <ProtectedRoute> <BugArena /> </ProtectedRoute> } />
          <Route path="/modes" element={ <ProtectedRoute> <ModeSelector /> </ProtectedRoute> } />
          <Route path="/arena/:mode" element={ <ProtectedRoute> <ChallengeGridWrapper /> </ProtectedRoute> } />
          <Route path="/challenge/:id" element={ <ProtectedRoute> <BugChallenge /> </ProtectedRoute> } />

          {/* 404 CATCH-ALL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);