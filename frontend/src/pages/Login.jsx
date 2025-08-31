
import React, { useState } from "react";
import { motion } from "framer-motion";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, provider, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

// --- All of your Firebase logic remains exactly the same ---
const DEFAULT_AVATAR = "🦸‍♂️";
const DEFAULT_ROLE = "student";
const DEFAULT_UNLOCKED_LEVELS = { classic: 1, regression: 1 };
const DEFAULT_XP_PER_MODE = { classic: 0, regression: 0 };

const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createUserDocIfNotExists = async (user, displayName) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          avatar: DEFAULT_AVATAR,
          badges: [],
          challengesCompleted: 0,
          completedChallengeIds: [],
          email: user.email,
          level: 1,
          name: displayName || user.displayName || "New User",
          role: DEFAULT_ROLE,
          xp: 0,
          unlockedLevels: DEFAULT_UNLOCKED_LEVELS,
          xpPerMode: DEFAULT_XP_PER_MODE,
        });
      }
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const user = result.user;
      await createUserDocIfNotExists(user, null);
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      let role = userSnap.exists() ? userSnap.data().role || DEFAULT_ROLE : DEFAULT_ROLE;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role);
      navigate("/dashboard");
    } catch (err) {
      setErrMsg("❌ " + (err?.code?.replace('auth/', '').replace(/-/g, ' ') || "Login failed. Try again!"));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setErrMsg("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocIfNotExists(user, user.displayName);
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      let role = userSnap.exists() ? userSnap.data().role || DEFAULT_ROLE : DEFAULT_ROLE;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role);
      navigate("/dashboard");
    } catch (err) {
      setErrMsg("❌ " + (err?.code?.replace('auth/', '').replace(/-/g, ' ') || "Google sign-in failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
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
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 bg-black/40 backdrop-blur-lg shadow-2xl shadow-purple-500/10 p-8 rounded-3xl max-w-md w-full text-center space-y-6 border border-white/10"
      >
        <h1 className="text-4xl font-extrabold text-orange-400 flex items-center justify-center gap-2 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">
          🧠 BugBlitz<span className="text-pink-400">.AI</span>
        </h1>
        <p className="text-lg text-cyan-200/90 font-mono">
          &gt; Authentication Required
        </p>
        
        <form className="space-y-4" onSubmit={handleEmailLogin}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-cyan-300/50">📧</span>
            <input
              type="email"
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800/50 border border-fuchsia-500/50 text-cyan-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
              placeholder="Email Address"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-cyan-300/50">🔑</span>
            <input
              type="password"
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800/50 border border-fuchsia-500/50 text-cyan-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
              placeholder="Password"
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          {errMsg && <div className="text-red-400 font-medium text-sm pt-1">{errMsg}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? "Authenticating..." : "Login to Terminal"}
          </button>
        </form>

        <div className="flex items-center gap-4">
            <hr className="w-full border-t border-fuchsia-500/20" />
            <span className="text-gray-400 text-xs">OR</span>
            <hr className="w-full border-t border-fuchsia-500/20" />
        </div>

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full bg-black/30 border border-white/20 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-white/10 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.082,5.571l6.19,5.238C42.022,35.637,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
          Sign in with Google
        </button>

        <div className="text-sm text-center">
            <Link to="/forgot-password" className="text-cyan-300/80 hover:text-cyan-200 hover:underline transition">Forgot Password?</Link>
            <span className="mx-2 text-gray-500">|</span>
            <Link to="/register" className="text-cyan-300/80 hover:text-cyan-200 hover:underline transition">Need an account? Register</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
