import { useState } from "react";
import { useNavigate } from "react-router";
import { Shield, Lock, User, Key, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return toast.error("Enter your username or email.");
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Security token requested.");
        setStep("reset");
      } else {
        toast.error(data.error || "Account not found.");
      }
    } catch {
      toast.error("Network error. Verify server status.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !newPassword.trim()) return toast.error("All fields required.");
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Identity verified. Password updated.");
        navigate("/admin/login");
      } else {
        toast.error(data.error || "Invalid token.");
      }
    } catch {
      toast.error("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="size-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <Key size={24} className="text-blue-500" />
            </div>
            <h1 className="text-xl font-black text-zinc-100 uppercase tracking-tighter">Security Recovery</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1 text-center">
              Internal Clearance Protocol
            </p>
          </div>

          {step === "request" ? (
            <motion.form initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onSubmit={handleRequest} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Account Identifier</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-700" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Username or System Email"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Initializing..." : "Request Security Token"}
              </button>
            </motion.form>
          ) : (
            <motion.form initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onSubmit={handleReset} className="space-y-5">
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl mb-6">
                <p className="text-[10px] text-blue-400 font-bold leading-relaxed text-center">
                  Verification pending. Enter the security token generated by the server terminal.
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1.5">Security Token</label>
                <div className="relative">
                  <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-700" />
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="PROTOCOL-XXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 uppercase font-mono tracking-wider outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-700" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all"
              >
                {loading ? "Re-encrypting..." : "Restore Account Access"}
              </button>
            </motion.form>
          )}

          <button
            onClick={() => navigate("/admin/login")}
            className="w-full mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
