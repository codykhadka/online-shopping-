import { useState } from "react";
import { useNavigate } from "react-router";
import { setAdminSession } from "../utils/adminAuth";
import { Shield, Lock, User, Eye, EyeOff, Cpu, Key, Send, X as CloseIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import "@/styles/AdminLogin.css";

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
    <div className="admin-login-container">
      {/* Background grid glow */}
      <div className="bg-grid-glow-wrapper">
        <div className="bg-grid" />
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="bg-blob"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="login-card-wrapper"
      >
        {/* Card */}
        <div className="login-card">
          {/* Logo */}
          <div className="logo-container">
            <motion.div
              animate={{ boxShadow: ["0 0 0px 0px rgba(59,130,246,0)", "0 0 30px 8px rgba(59,130,246,0.25)", "0 0 0px 0px rgba(59,130,246,0)"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="logo-icon-wrapper"
            >
              <Cpu size={28} className="logo-icon" />
            </motion.div>
            <h1 className="logo-title">Command Center</h1>
            <p className="logo-subtitle">Admin Access Only</p>
          </div>

          {/* Warning badge */}
          <div className="warning-badge">
            <Shield size={14} className="warning-icon" />
            <p className="warning-text">Restricted area. Authorized personnel only.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="input-label">Admin Username</label>
              <div className="input-wrapper">
                <User size={15} className="input-icon" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="text-input with-icon"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock size={15} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="text-input with-icon with-toggle"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="loading-spinner" />
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
          <div className="links-container">
            <button
              type="button"
              onClick={() => setShowRecovery(true)}
              className="forgot-password-btn"
            >
              Forgot Access Credentials?
            </button>
            <p className="hint-text">
              Default Protocol: admin / admin123
            </p>
          </div>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate("/")}
          className="back-to-store-btn"
        >
          ← Return to Store
        </button>
      </motion.div>

      {/* Admin Recovery Modal */}
      <AnimatePresence>
        {showRecovery && (
          <div className="recovery-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecovery(false)}
              className="recovery-backdrop"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="recovery-modal"
            >
              <button
                onClick={() => setShowRecovery(false)}
                className="close-modal-btn"
              >
                <CloseIcon size={20} />
              </button>

              <div className="recovery-header">
                <div className="logo-icon-wrapper" style={{ marginBottom: '1.5rem' }}>
                  <Key size={28} className="logo-icon" />
                </div>
                <h3 className="recovery-title">Protocol Recovery</h3>
              </div>

              {recoveryStep === "request" ? (
                <form onSubmit={handleRecoveryRequest} className="recovery-form">
                  <div className="input-group">
                    <label className="input-label" style={{ marginLeft: '0.25rem' }}>Admin Username</label>
                    <div className="input-wrapper">
                      <User size={15} className="input-icon" />
                      <input
                        type="text"
                        value={recoveryUsername}
                        onChange={e => setRecoveryUsername(e.target.value)}
                        placeholder="admin"
                        className="text-input with-icon"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isRecovering}
                    className="recovery-btn request"
                  >
                    {isRecovering ? "Syncing..." : "Initiate Recovery"}
                    <Send size={14} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRecoveryReset} className="recovery-form reset">
                  <div className="recovery-info-box">
                    <p className="recovery-info-text">
                      Security Verification Required. Check Command Console for Access Token.
                    </p>
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      value={recoveryToken}
                      onChange={e => setRecoveryToken(e.target.value)}
                      placeholder="ACCESS-TOKEN"
                      className="token-input"
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="password"
                      value={recoveryNewPassword}
                      onChange={e => setRecoveryNewPassword(e.target.value)}
                      placeholder="New Secure Password"
                      className="text-input"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isRecovering}
                    className="recovery-btn reset"
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
