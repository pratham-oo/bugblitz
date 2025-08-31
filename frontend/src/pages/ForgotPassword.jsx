import React, { useState } from "react";
import { motion } from "framer-motion";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus(
        "✅ Password reset email sent! Check your inbox (and your spam folder, just in case)."
      );
      setEmail("");
      // Optional: Auto-redirect after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setStatus("❌ " + (err?.message || "Reset failed. Try again!"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-indigo-100 to-purple-200 px-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute w-[400px] h-[400px] bg-purple-300 rounded-full blur-3xl opacity-20 animate-pulse -top-20 -left-20"></div>
      <div className="absolute w-[350px] h-[350px] bg-pink-300 rounded-full blur-2xl opacity-20 animate-pulse -bottom-32 right-10"></div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl max-w-md w-full space-y-7 z-10 text-center"
      >
        <h2 className="text-3xl font-bold text-indigo-600 flex justify-center gap-2 items-center">
          🗝️ Forgot Your Password?
        </h2>
        <p className="mb-4 text-purple-700 font-medium">
          No stress, Debug Hero! Enter your email to get a magic reset link:
        </p>

        <form className="space-y-5" onSubmit={handleReset}>
          <input
            className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none font-semibold text-base"
            type="email"
            placeholder="Your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl shadow hover:scale-105 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "🔑 Send Reset Link"}
          </button>
        </form>
        {status && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center text-sm font-semibold p-3 rounded-xl ${
              status.startsWith("✅")
                ? "bg-green-100 text-green-700"
                : "bg-pink-100 text-pink-700"
            } mt-1`}
          >
            {status}
          </motion.div>
        )}
        <div className="text-purple-700 mt-7">
          {/* Back to login */}
          <Link
            to="/login"
            className="underline hover:text-indigo-600 font-bold transition"
          >
            ← Return to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
