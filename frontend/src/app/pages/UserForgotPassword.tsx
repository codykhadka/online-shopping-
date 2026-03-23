import { useState } from "react";
import { useNavigate } from "react-router";
import { Leaf, Lock, User, Key, ArrowLeft, Send, CheckCircle2, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export function UserForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return toast.error("Please enter your username.");
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Recovery code sent to your registered account.");
        setStep("reset");
      } else {
        toast.error(data.error || "Account not found.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !newPassword.trim()) return toast.error("Please fill in all fields.");
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password updated! You can now log in.");
        navigate("/login");
      } else {
        toast.error(data.error || "Invalid or expired code.");
      }
    } catch {
      toast.error("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 p-24 opacity-10">
        <Leaf size={120} className="text-green-600 rotate-12" />
      </div>
      <div className="absolute bottom-0 left-0 p-24 opacity-10">
        <Leaf size={80} className="text-green-500 -rotate-12" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-white border-2 border-green-50 rounded-[2.5rem] p-10 shadow-2xl shadow-green-900/5">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="size-16 bg-green-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
              <Key size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recovery Plan</h1>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Let's get you back to your organic journey.
            </p>
          </div>

          {step === "request" ? (
            <form onSubmit={handleRequest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group"
              >
                {loading ? "Sending..." : "Send Reset Code"}
                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Reset Code</label>
                  <div className="relative group">
                    <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600" />
                    <input
                      type="text"
                      value={token}
                      onChange={e => setToken(e.target.value)}
                      placeholder="Enter verification code"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium tracking-widest text-center"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-green-100"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          <button
            onClick={() => navigate("/login")}
            className="w-full mt-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
