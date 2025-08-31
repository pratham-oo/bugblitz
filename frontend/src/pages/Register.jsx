import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

// Emoji Avatars
const avatars = [
  "🧑‍💻", "🦸‍♂️", "🧙‍♂️", "🤖", "🐱‍👤", "🧟‍♂️", "🦄", "🐉", "👽"
];

// --- All of your Firebase logic remains exactly the same ---
const DEFAULT_UNLOCKED_LEVELS = { classic: 1, regression: 1 };
const DEFAULT_XP_PER_MODE = { classic: 0, regression: 0 };

export default function Register() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [role, setRole] = useState("student");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrMsg("");
    if (!displayName.trim()) return setErrMsg("Please enter your Arena Name!");
    if (pass !== confirmPass) return setErrMsg("Passwords do not match!");
    if (pass.length < 6) return setErrMsg("Password must be at least 6 characters long.");

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = result.user;
      await updateProfile(user, { displayName, photoURL: avatar });
      await setDoc(doc(db, "users", user.uid), {
        name: displayName,
        email,
        role,
        avatar,
        xp: 0,
        level: 1,
        badges: [],
        challengesCompleted: 0,
        completedChallengeIds: [],
        unlockedLevels: DEFAULT_UNLOCKED_LEVELS,
        xpPerMode: DEFAULT_XP_PER_MODE,
      });
      localStorage.setItem("user", JSON.stringify({ ...user, displayName, photoURL: avatar }));
      localStorage.setItem("role", role);
      navigate("/dashboard");
    } catch (err) {
      setErrMsg("❌ " + (err?.code?.replace('auth/', '').replace(/-/g, ' ') || "Registration failed!"));
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
        className="relative z-10 bg-black/40 backdrop-blur-lg shadow-2xl shadow-purple-500/10 p-8 rounded-3xl max-w-lg w-full text-center space-y-6 border border-white/10"
      >
        <h1 className="text-4xl font-extrabold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">
          Create Your Debugger ID
        </h1>
        <p className="text-md text-cyan-200/90 font-mono">
          &gt; Join the Arena
        </p>
        
        <form className="space-y-5 text-left" onSubmit={handleRegister} autoComplete="off">
          
          <div>
            <label className="font-semibold text-pink-300 mb-1 block text-sm">Arena Name</label>
            <input 
              className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-fuchsia-500/50 text-cyan-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 outline-none transition"
              type="text"
              placeholder="Your cool display name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="font-semibold text-pink-300 mb-2 block text-sm">Choose Your Avatar</label>
            <div className="flex gap-2 flex-wrap bg-black/20 p-2 rounded-lg">
              {avatars.map((a) => (
                <button
                  type="button"
                  key={a}
                  className={`p-2 text-3xl rounded-lg transition-all duration-200 ${avatar === a ? "ring-2 ring-cyan-400 bg-fuchsia-600/50 scale-110" : "hover:bg-fuchsia-500/30"}`}
                  onClick={() => setAvatar(a)}
                  disabled={loading}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-pink-300 mb-1 block text-sm">Email Address</label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-fuchsia-500/50 text-cyan-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 outline-none transition"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-pink-300 mb-1 block text-sm">Password</label>
              <input
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-fuchsia-500/50 text-cyan-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 outline-none transition"
                type="password"
                placeholder="6+ characters"
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="font-semibold text-pink-300 mb-1 block text-sm">Confirm Password</label>
              <input
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-fuchsia-500/50 text-cyan-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 outline-none transition"
                type="password"
                placeholder="Repeat password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          {errMsg && <div className="text-red-400 font-medium text-sm pt-1 text-center">{errMsg}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold px-6 py-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? "Initializing Profile..." : "Enter Arena"}
          </button>
        </form>
        
        <p className="text-sm text-cyan-300/80 text-center pt-4">
          Already have a Debugger ID?{" "}
          <Link to="/login" className="font-bold hover:text-white underline">
            Login Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}