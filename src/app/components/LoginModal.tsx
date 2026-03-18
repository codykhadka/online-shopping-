import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { Button } from "./ui/button";
import { User, Lock, ArrowRight, ShieldCheck, Leaf, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  if (!isLoginModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && password.trim()) {
      login(name);
      toast.success(`Welcome back, ${name}!`);
    } else {
      toast.error("Please enter both name and password.");
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
          className="relative w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button 
            onClick={closeLoginModal}
            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Decorative Background */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 size-40 bg-green-50 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative p-8 md:p-10">
            {/* Logo Area */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="size-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 mb-4 rotate-3">
                 <Leaf className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Required</h2>
              <p className="text-xs text-slate-500 font-medium">Please sign in to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-green-600 transition-colors">
                    <User size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 focus:bg-white transition-all font-medium text-sm text-slate-800"
                  />
                </div>

                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-green-600 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-500 focus:bg-white transition-all font-medium text-sm text-slate-800"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Sign In to Harvest
                <ArrowRight size={18} />
              </Button>

              <div className="flex items-center justify-center gap-2 pt-2">
                <ShieldCheck className="text-green-500" size={14} />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure AES-256 Portal</p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
