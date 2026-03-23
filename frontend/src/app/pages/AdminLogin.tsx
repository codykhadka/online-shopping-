import { useState } from "react";
import { useNavigate } from "react-router";
import { setAdminSession } from "../utils/adminAuth";
import { Shield, Lock, User, Eye, EyeOff, Cpu, Key, Send, X as CloseIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"request" | "reset">("request");
  const [recoveryUsername, setRecoveryUsername] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);

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

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryUsername.trim()) return toast.error("Enter admin username.");
    setIsRecovering(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: recoveryUsername.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Security token requested.");
        setRecoveryStep("reset");
      } else {
        toast.error(data.error || "System access denied.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsRecovering(false);
    }
  };

  const handleRecoveryReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryToken.trim() || !recoveryNewPassword.trim()) return toast.error("Fields required.");
    setIsRecovering(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: recoveryToken.trim(), newPassword: recoveryNewPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Identity verified. Protocol updated.");
        setShowRecovery(false);
        setRecoveryStep("request");
      } else {
        toast.error(data.error || "Invalid token.");
      }
    } catch {
      toast.error("Operation failed.");
    } finally {
      setIsRecovering(false);
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

          {/* Hint & Forgot Password */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <button 
              type="button"
              onClick={() => setShowRecovery(true)}
              className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
            >
              Forgot Access Credentials?
            </button>
            <p className="text-[9px] text-zinc-700 font-mono text-center">
              Default Protocol: admin / admin123
            </p>
          </div>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-medium py-2"
        >
          ← Return to Store
        </button>
      </motion.div>

      {/* Admin Recovery Modal */}
      <AnimatePresence>
        {showRecovery && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecovery(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-3xl p-10 shadow-2xl relative z-10 overflow-hidden"
            >
              <button 
                onClick={() => setShowRecovery(false)}
                className="absolute top-6 right-6 p-2 text-zinc-600 hover:text-zinc-100 transition-colors"
              >
                <CloseIcon size={20} />
              </button>

              <div className="flex flex-col items-center mb-8 text-center pt-4">
                <div className="size-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-900/40">
                  <Key size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-zinc-100 uppercase tracking-widest">Protocol Recovery</h3>
              </div>

              {recoveryStep === "request" ? (
                <form onSubmit={handleRecoveryRequest} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Admin Username</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input
                        type="text"
                        value={recoveryUsername}
                        onChange={e => setRecoveryUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isRecovering}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isRecovering ? "Syncing..." : "Initiate Recovery"}
                    <Send size={14} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRecoveryReset} className="space-y-4">
                  <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl mb-4">
                    <p className="text-[10px] text-blue-400 font-bold leading-relaxed text-center">
                      Security Verification Required. Check Command Console for Access Token.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={recoveryToken}
                      onChange={e => setRecoveryToken(e.target.value)}
                      placeholder="ACCESS-TOKEN"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 text-center font-mono tracking-widest uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={recoveryNewPassword}
                      onChange={e => setRecoveryNewPassword(e.target.value)}
                      placeholder="New Secure Password"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isRecovering}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all"
                  >
                    {isRecovering ? "Securing..." : "Restore Authorization"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
