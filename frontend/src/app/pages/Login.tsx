/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { User, Lock, ArrowRight, Leaf, UserPlus, LogIn, ChevronLeft, Key, Send, Shield, Phone, Mail, Facebook, X as CloseIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useGoogleLogin } from "@react-oauth/google";
import "@/styles/Login.css";


export function LoginPage() {
  const { user, login, register, loginWithSocial } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"request" | "reset">("request");
  const [recoveryUsername, setRecoveryUsername] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      toast.promise(
        loginWithSocial("google", tokenResponse.access_token, "Google User", "google-user@example.com"),
        {
          loading: 'Authenticating with Google...',
          success: 'Welcome back through Google! 🌿',
          error: 'Google login failed.',
        }
      );
    },
    onError: () => toast.error("Google login failed."),
  });

  const handleFacebookLogin = () => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID || "123456789";
    const redirectUri = window.location.origin + "/login";
    const state = Math.random().toString(36).substring(7);

    // Store state for verification
    localStorage.setItem('fb_auth_state', state);

    const facebookUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email,public_profile&response_type=token`;

    window.location.href = facebookUrl;
  };

  // Handle Facebook Auth Token if redirected back
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const accessToken = params.get("access_token");
      const state = params.get("state");
      const savedState = localStorage.getItem('fb_auth_state');

      if (accessToken && state === savedState) {
        toast.promise(
          loginWithSocial("facebook", accessToken, "Facebook User", "fb-user@example.com"),
          {
            loading: 'Authenticating with Facebook...',
            success: 'Welcome back through Facebook! 🌿',
            error: 'Facebook login failed.',
          }
        );
        // Clear hash
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [loginWithSocial]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const resetForm = () => {
    setName("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setEmail("");
  };

  const switchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        if (!name.trim() || !username.trim() || !password.trim()) {
          toast.error("Please fill in all fields.");
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }
        if (password.length < 4) {
          toast.error("Password must be at least 4 characters.");
          return;
        }
        const result = await register(name.trim(), username.trim(), password, phone.trim(), email.trim());
        if (result.success) {
          toast.success(`Welcome to Danphe Organic, ${name}! 🌿`);
        } else {
          toast.error(result.error);
        }
      } else {
        if (!username.trim() || !password.trim()) {
          toast.error("Please enter your username and password.");
          return;
        }
        const result = await login(username.trim(), password);
        if (result.success) {
          toast.success("Welcome back! 👋");
        } else {
          toast.error(result.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryUsername.trim()) return toast.error("Please enter your username.");
    setIsRecovering(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: recoveryUsername.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Recovery code sent to your account.");
        setRecoveryStep("reset");
      } else {
        toast.error(data.error || "Account not found.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsRecovering(false);
    }
  };

  const handleRecoveryReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryToken.trim() || !recoveryNewPassword.trim()) return toast.error("Fill in all fields.");
    setIsRecovering(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: recoveryToken.trim(), newPassword: recoveryNewPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password updated! Please log in.");
        setShowRecovery(false);
        setRecoveryStep("request");
      } else {
        toast.error(data.error || "Invalid code.");
      }
    } catch {
      toast.error("Operation failed.");
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Left side: Hero/Image */}
      <div className="login-hero-section">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="login-hero-image-container"
        >
          <div className="login-hero-gradient" />
          <img
            src="/images/organic_hero.png"
            alt="Danphe Organic Farm"
            className="login-hero-image"
          />
        </motion.div>

        <div className="login-hero-content">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="login-hero-logo">
              <div className="login-hero-logo-icon">
                <Leaf size={20} />
              </div>
              <span className="login-hero-logo-text">Danphe Organic</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="login-hero-main-text"
          >
            <h1 className="login-hero-title">
              Experience the <span className="login-hero-title-highlight">Purest</span> Harvest.
            </h1>
            <p className="login-hero-subtitle">
              Join our community of wholesome living and get access to exclusive seasonal harvests delivered fresh to your door.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="login-hero-footer"
          >
            © {new Date().getFullYear()} Danphe Organic. All rights reserved.
          </motion.div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="login-form-section">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="login-back-button"
        >
          <ChevronLeft size={18} />
          Go Back
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="login-form-wrapper"
        >
          {/* Logo mobile */}
          <div className="login-mobile-logo">
            <Leaf className="text-white" size={28} />
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="login-form-subtitle">
              {mode === "signin" ? "Sign in to access your dashboard" : "Start your organic journey today"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="login-mode-toggle">
            <button
              onClick={() => switchMode("signin")}
              className={`login-mode-btn ${mode === 'signin' ? 'active' : 'inactive'}`}
            >
              <LogIn size={15} />
              Sign In
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`login-mode-btn ${mode === 'signup' ? 'active' : 'inactive'}`}
            >
              <UserPlus size={15} />
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form-main">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="login-input-group"
                >
                  <label className="login-input-label">Full Name</label>
                  <div className="login-input-wrapper group">
                    <User className="login-input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="login-input"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="login-input-group">
              <label className="login-input-label">Username</label>
              <div className="login-input-wrapper group">
                <div className="login-input-icon-at">@</div>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input login-input-at"
                />
              </div>
            </div>

            <div className="login-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '0.25rem' }}>
                <label className="login-input-label" style={{ marginBottom: 0 }}>Password</label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="login-forgot-btn"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="login-input-wrapper group">
                <Lock className="login-input-icon" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="login-input-group"
                >
                  <label className="login-input-label">Confirm Password</label>
                  <div className="login-input-wrapper group">
                    <Lock className="login-input-icon" size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="login-input"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <>
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="login-input-group"
                  >
                    <label className="login-input-label">Phone Number (Optional)</label>
                    <div className="login-input-wrapper group">
                      <Phone className="login-input-icon" size={18} />
                      <input
                        type="tel"
                        placeholder="+1 234 567 890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="login-input"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="login-input-group"
                  >
                    <label className="login-input-label">Email Address</label>
                    <div className="login-input-wrapper group">
                      <Mail className="login-input-icon" size={18} />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="login-actions">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="login-submit-btn"
              >
                {isSubmitting ? "Processing..." : mode === "signin" ? "Sign In to Harvest" : "Join the Community"}
                <ArrowRight size={18} className="icon" />
              </Button>

              <div className="login-separator">
                <div className="login-separator-line"></div>
                <span className="login-separator-text">OR</span>
                <div className="login-separator-line"></div>
              </div>

              <div className="login-social-buttons">
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  className="login-social-btn google"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="login-social-btn facebook"
                >
                  <Facebook size={16} fill="currentColor" stroke="none" />
                  Facebook
                </button>
              </div>
            </div>
          </form>

          <p className="login-terms">
            By joining Danphe Organic, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>

      {/* Recovery Modal */}
      <AnimatePresence>
        {showRecovery && (
          <div className="recovery-modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecovery(false)}
              className="recovery-modal-backdrop"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="recovery-modal-content"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowRecovery(false)}
                className="recovery-close-btn"
              >
                <CloseIcon size={20} />
              </button>

              <div className="recovery-header">
                <div className="recovery-icon-wrapper">
                  <Key size={28} />
                </div>
                <h3 className="recovery-title">Recovery Plan</h3>
              </div>

              {recoveryStep === "request" ? (
                <form onSubmit={handleRecoveryRequest} className="recovery-form">
                  <div className="recovery-input-group">
                    <label className="recovery-input-label">Username</label>
                    <div className="recovery-input-wrapper group">
                      <User size={18} className="recovery-input-icon" />
                      <input
                        type="text"
                        value={recoveryUsername}
                        onChange={e => setRecoveryUsername(e.target.value)}
                        placeholder="Your username"
                        className="recovery-input"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isRecovering}
                    className="recovery-submit-btn request"
                  >
                    {isRecovering ? "Sending Pulse..." : "Send Verification"}
                    <Send size={16} />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRecoveryReset} className="recovery-form" style={{ gap: '1rem' }}>
                  <div className="recovery-input-group">
                    <label className="recovery-input-label">Reset Code</label>
                    <input
                      type="text"
                      value={recoveryToken}
                      onChange={e => setRecoveryToken(e.target.value)}
                      placeholder="Enter verification code"
                      className="recovery-input" style={{ textAlign: 'center' }}
                    />
                  </div>
                  <div className="recovery-input-group">
                    <label className="recovery-input-label">New Password</label>
                    <input
                      type="password"
                      value={recoveryNewPassword}
                      onChange={e => setRecoveryNewPassword(e.target.value)}
                      placeholder="New password"
                      className="recovery-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isRecovering}
                    className="recovery-submit-btn reset"
                  >
                    {isRecovering ? "Updating..." : "Secure Account"}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
