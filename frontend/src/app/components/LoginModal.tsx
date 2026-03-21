import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { Button } from "./ui/button";
import { User, Lock, ArrowRight, ShieldCheck, Leaf, X, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, register } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!isLoginModalOpen) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
      const result = register(name.trim(), username.trim(), password);
      if (result.success) {
        toast.success(`Welcome to Danphe Organic, ${name}! 🌿`);
        resetForm();
      } else {
        toast.error(result.error);
      }
    } else {
      if (!username.trim() || !password.trim()) {
        toast.error("Please enter your username and password.");
        return;
      }
      const result = login(username.trim(), password);
      if (result.success) {
        toast.success("Welcome back! 👋");
        resetForm();
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLoginModal}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button 
            onClick={closeLoginModal}
            className="absolute top-5 right-5 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors z-10"
          >
            <X size={18} />
          </button>

          {/* Decorative Background */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 size-48 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          
          <div className="relative p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-7 text-center">
              <div className="size-13 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 mb-3 rotate-3 p-3">
                 <Leaf className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === "signin" ? "Welcome Back" : "Join Danphe Organic"}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {mode === "signin" ? "Sign in to continue shopping" : "Create your free account"}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
              <button
                onClick={() => switchMode("signin")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LogIn size={14} />
                Sign In
              </button>
              <button
                onClick={() => switchMode("signup")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <UserPlus size={14} />
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative group/input">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-green-600 transition-colors">
                        <User size={15} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 focus:bg-white transition-all text-sm text-slate-800 font-medium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-green-600 transition-colors text-xs font-bold select-none">@</div>
                <input 
                  type="text" 
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 focus:bg-white transition-all text-sm text-slate-800 font-medium"
                />
              </div>

              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-green-600 transition-colors">
                  <Lock size={15} />
                </div>
                <input 
                  type="password" 
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 focus:bg-white transition-all text-sm text-slate-800 font-medium"
                />
              </div>

              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    key="confirm-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative group/input">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-green-600 transition-colors">
                        <Lock size={15} />
                      </div>
                      <input 
                        type="password" 
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 focus:bg-white transition-all text-sm text-slate-800 font-medium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2">
                <Button 
                  type="submit"
                  className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {mode === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight size={17} />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <ShieldCheck className="text-green-500" size={13} />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure AES-256 Portal</p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
