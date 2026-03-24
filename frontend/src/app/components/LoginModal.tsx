import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { Button } from "./ui/button";
import { User, Lock, ArrowRight, ShieldCheck, Leaf, X, UserPlus, LogIn, Phone, Mail, Facebook } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";



export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, register, loginWithSocial } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // In a real app, you'd fetch user info from Google using this token
      // or send the code to your backend to exchange it.
      // For now, we'll simulate the user info or just pass the token.
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

  const responseFacebook = (response: any) => {
    if (response.accessToken) {
      toast.promise(
        loginWithSocial("facebook", response.accessToken, response.name || "Facebook User", response.email || "fb-user@example.com"),
        {
          loading: 'Authenticating with Facebook...',
          success: 'Welcome back through Facebook! 🌿',
          error: 'Facebook login failed.',
        }
      );
    } else {
      toast.error("Facebook login failed or was cancelled.");
    }
  };

  if (!isLoginModalOpen) return null;

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
        resetForm();
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
                    
                    <div className="relative group/input mt-3">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-green-600 transition-colors">
                        <Phone size={15} />
                      </div>
                      <input 
                        type="tel" 
                        placeholder="Phone Number (optional)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 focus:bg-white transition-all text-sm text-slate-800 font-medium"
                      />
                    </div>

                    <div className="relative group/input mt-3">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-green-600 transition-colors">
                        <Mail size={15} />
                      </div>
                      <input 
                        type="email" 
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 focus:bg-white transition-all text-sm text-slate-800 font-medium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2 space-y-3">
                <Button 
                  type="submit"
                  className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {mode === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight size={17} />
                </Button>

                <div className="relative flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-slate-100"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">OR</span>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => googleLogin()}
                    className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <FacebookLogin
                    appId={import.meta.env.VITE_FACEBOOK_APP_ID || "123456789"}
                    autoLoad={false}
                    fields="name,email,picture"
                    callback={responseFacebook}
                    render={(renderProps: any) => (
                      <button
                        type="button"
                        onClick={renderProps.onClick}
                        className="flex items-center justify-center gap-2 py-3 bg-[#1877F2]/10 border border-[#1877F2]/10 rounded-xl text-xs font-bold text-[#1877F2] hover:bg-[#1877F2]/20 transition-all w-full"
                      >
                        <Facebook size={14} fill="currentColor" stroke="none" />
                        Facebook
                      </button>
                    )}
                  />
                </div>
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
