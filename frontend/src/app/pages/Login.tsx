/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { User, Lock, ArrowRight, Leaf, UserPlus, LogIn, ChevronLeft, Key, Send, Shield, Phone, Mail, Facebook, X as CloseIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";



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
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Left side: Hero/Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-900">
        <motion.div
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5 }}
           className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-10" />
          <img 
            src="/images/organic_hero.png" 
            alt="Danphe Organic Farm" 
            className="w-full h-full object-cover grayscale-[0.2]"
          />
        </motion.div>

        <div className="relative z-20 flex flex-col justify-between p-16 w-full h-full">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-12">
               <div className="size-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Leaf className="text-white" size={20} />
               </div>
               <span className="text-xl font-black text-white tracking-tight uppercase">Danphe Organic</span>
            </div>
          </motion.div>

          <motion.div
             initial={{ y: 30, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.8 }}
             className="max-w-md"
          >
            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
               Experience the <span className="text-green-400">Purest</span> Harvest.
            </h1>
            <p className="text-neutral-400 text-lg font-medium leading-relaxed">
               Join our community of wholesome living and get access to exclusive seasonal harvests delivered fresh to your door.
            </p>
          </motion.div>

          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1.2 }}
             className="text-neutral-500 text-sm font-medium"
          >
            © {new Date().getFullYear()} Danphe Organic. All rights reserved.
          </motion.div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 xl:p-24 relative overflow-hidden">
        
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-10 left-10 p-3 hover:bg-neutral-100 rounded-2xl text-neutral-400 transition-all flex items-center gap-2 font-bold text-sm"
        >
          <ChevronLeft size={18} />
          Go Back
        </button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm flex flex-col items-center"
        >
          {/* Logo mobile */}
          <div className="lg:hidden size-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 mb-8 p-3 rotate-3">
             <Leaf className="text-white" size={28} />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">
               {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-neutral-500 font-medium">
               {mode === "signin" ? "Sign in to access your dashboard" : "Start your organic journey today"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="w-full flex bg-neutral-100 rounded-2xl p-1.5 mb-8">
            <button
              onClick={() => switchMode("signin")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === "signin" ? "bg-white text-neutral-900 shadow-md" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <LogIn size={15} />
              Sign In
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === "signup" ? "bg-white text-neutral-900 shadow-md" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <UserPlus size={15} />
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-1.5"
                >
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-green-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-green-600 font-bold transition-colors">@</div>
                <input 
                  type="text" 
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Password</label>
                {mode === "signin" && (
                  <button 
                    type="button" 
                    onClick={() => setShowRecovery(true)}
                    className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-green-600 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium"
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
                  className="space-y-1.5"
                >
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-green-600 transition-colors" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium"
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
                    className="space-y-1.5"
                  >
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Phone Number (Optional)</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-green-600 transition-colors" size={18} />
                      <input 
                        type="tel" 
                        placeholder="+1 234 567 890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-1.5 mt-4"
                  >
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-green-600 transition-colors" size={18} />
                      <input 
                        type="email" 
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium"
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="pt-4 space-y-4">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-7 bg-neutral-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-neutral-200 flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? "Processing..." : mode === "signin" ? "Sign In to Harvest" : "Join the Community"}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Button>

              <div className="relative flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-neutral-100"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">OR</span>
                <div className="flex-1 h-px bg-neutral-100"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  className="flex items-center justify-center gap-2 py-4 bg-white border border-neutral-100 rounded-2xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-all group"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="flex items-center justify-center gap-2 py-4 bg-[#1877F2]/10 border border-[#1877F2]/10 rounded-2xl text-xs font-bold text-[#1877F2] hover:bg-[#1877F2]/20 transition-all w-full"
                >
                  <Facebook size={16} fill="currentColor" stroke="none" />
                  Facebook
                </button>
              </div>
            </div>
          </form>

          <p className="mt-10 text-neutral-400 text-xs font-medium max-w-[280px] text-center leading-relaxed">
             By joining Danphe Organic, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>

      {/* Recovery Modal */}
      <AnimatePresence>
        {showRecovery && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecovery(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowRecovery(false)}
                className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                <CloseIcon size={20} />
              </button>

              <div className="flex flex-col items-center mb-8 text-center pt-4">
                <div className="size-16 bg-green-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                  <Key size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recovery Plan</h3>
              </div>

              {recoveryStep === "request" ? (
                <form onSubmit={handleRecoveryRequest} className="space-y-6">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Username</label>
                    <div className="relative group">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-green-600 transition-colors" />
                      <input
                        type="text"
                        value={recoveryUsername}
                        onChange={e => setRecoveryUsername(e.target.value)}
                        placeholder="Your username"
                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    disabled={isRecovering}
                    className="w-full py-7 bg-neutral-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 group"
                  >
                    {isRecovering ? "Sending Pulse..." : "Send Verification"}
                    <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRecoveryReset} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Reset Code</label>
                    <input
                      type="text"
                      value={recoveryToken}
                      onChange={e => setRecoveryToken(e.target.value)}
                      placeholder="Enter verification code"
                      className="w-full px-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium text-center"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">New Password</label>
                    <input
                      type="password"
                      value={recoveryNewPassword}
                      onChange={e => setRecoveryNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full px-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-medium"
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={isRecovering}
                    className="w-full py-7 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold mt-2"
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
