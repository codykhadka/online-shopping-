/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { User, Lock, ArrowRight, Leaf, UserPlus, LogIn, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const result = await register(name.trim(), username.trim(), password);
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
                  <button type="button" className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors">Forgot?</button>
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

            <div className="pt-4">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-7 bg-neutral-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-neutral-200 flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? "Processing..." : mode === "signin" ? "Sign In to Harvest" : "Join the Community"}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </form>

          <p className="mt-10 text-neutral-400 text-xs font-medium max-w-[280px] text-center leading-relaxed">
             By joining Danphe Organic, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
