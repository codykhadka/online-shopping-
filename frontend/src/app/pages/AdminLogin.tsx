import { useState } from "react";
import { useNavigate } from "react-router";
import { setAdminSession } from "../utils/adminAuth";
import { Shield, Lock, User, Eye, EyeOff, Cpu } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Enter your admin credentials.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminSession(data.admin);
        toast.success("Access granted. Welcome, Admin.");
        navigate("/admin/tracking");
      } else {
        toast.error(data.error || "Invalid credentials.");
      }
    } catch {
      toast.error("Cannot reach server. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      {/* Background grid glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[600px] bg-blue-600/10 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ boxShadow: ["0 0 0px 0px rgba(59,130,246,0)", "0 0 30px 8px rgba(59,130,246,0.25)", "0 0 0px 0px rgba(59,130,246,0)"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="size-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-900/40"
            >
              <Cpu size={28} className="text-white" />
            </motion.div>
            <h1 className="text-xl font-black text-zinc-100 tracking-tight">Command Center</h1>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Admin Access Only</p>
          </div>

          {/* Warning badge */}
          <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Shield size={14} className="text-amber-400 shrink-0" />
            <p className="text-[11px] text-amber-300 font-bold">Restricted area. Authorized personnel only.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Admin Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
            >
              {isLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="size-4 border-2 border-white/30 border-t-white rounded-full" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Access Command Center
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-[10px] text-zinc-700 font-mono mt-6">
            Default: admin / admin123
          </p>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-medium py-2"
        >
          ← Return to Store
        </button>
      </motion.div>
    </div>
  );
}
