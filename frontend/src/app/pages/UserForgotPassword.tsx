import { useState } from "react";
import { useNavigate } from "react-router";
import { Leaf, Lock, User, Key, ArrowLeft, Send, CheckCircle2, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import "@/styles/UserForgotPassword.css";

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
    <div className="ufp-page">
      {/* Decorative background elements */}
      <div className="ufp-decor-top">
        <Leaf size={120} className="text-green-600 rotate-12" />
      </div>
      <div className="ufp-decor-bottom">
        <Leaf size={80} className="text-green-500 -rotate-12" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ufp-card-wrapper"
      >
        <div className="ufp-card">
          <div className="ufp-header">
            <div className="ufp-icon-box">
              <Key size={28} className="text-white" />
            </div>
            <h1 className="ufp-title">Recovery Plan</h1>
            <p className="ufp-subtitle">
              Let's get you back to your organic journey.
            </p>
          </div>

          {step === "request" ? (
            <form onSubmit={handleRequest} className="ufp-form">
              <div className="ufp-input-group">
                <label className="ufp-label">Username</label>
                <div className="ufp-input-wrapper group">
                  <User size={18} className="ufp-input-icon" />
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
                className="ufp-submit-btn black group"
              >
                {loading ? "Sending..." : "Send Reset Code"}
                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="ufp-form">
              <div className="ufp-form-inner">
                <div className="ufp-input-group">
                  <label className="ufp-label">Reset Code</label>
                  <div className="ufp-input-wrapper group">
                    <Shield size={18} className="ufp-input-icon" />
                    <input
                      type="text"
                      value={token}
                      onChange={e => setToken(e.target.value)}
                      placeholder="Enter verification code"
                      className="ufp-input token-input"
                    />
                  </div>
                </div>
                <div className="ufp-input-group">
                  <label className="ufp-label">New Password</label>
                  <div className="ufp-input-wrapper group">
                    <Lock size={18} className="ufp-input-icon" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="ufp-input"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="ufp-submit-btn green"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          <button
            onClick={() => navigate("/login")}
            className="ufp-back-btn"
          >
            <ArrowLeft size={14} />
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
