import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Leaf, Sparkles, ArrowRight } from "lucide-react";

// Shows once per browser session (disappears on page refresh next visit)
const SESSION_KEY = "danphe_welcome_shown";

export function WelcomePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800); // small delay
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          onClick={dismiss}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 z-10 size-8 bg-white/80 hover:bg-white backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow transition-all"
            >
              <X size={16} />
            </button>

            {/* Top banner */}
            <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 px-8 pt-10 pb-12 relative overflow-hidden">
              {/* Ambient blobs */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 size-40 bg-white/20 rounded-full blur-2xl"
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -left-8 size-32 bg-yellow-300/30 rounded-full blur-2xl"
              />

              <motion.div
                animate={{ rotate: [0, 10, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl mb-4 w-fit"
              >
                🍯
              </motion.div>
              <h2 className="text-2xl font-black text-white leading-tight mb-2">
                Welcome to<br />Danphe Organic!
              </h2>
              <p className="text-green-100 text-sm font-medium">
                Pure. Natural. Straight from the farm to your door.
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              {/* Trust points */}
              <div className="space-y-3 mb-6">
                {[
                  { emoji: "🌿", text: "100% Organic & Certified Products" },
                  { emoji: "🚚", text: "Free delivery on orders over Rs. 999" },
                  { emoji: "✨", text: "5,000+ happy customers across Nepal" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <p className="text-sm font-semibold text-gray-700">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Promo tag */}
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3 mb-5">
                <Sparkles size={18} className="text-green-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-green-800 uppercase tracking-wider">New Visitor Offer</p>
                  <p className="text-sm font-bold text-green-700">Use code <span className="font-black text-green-900">ORGANIC10</span> for 10% off!</p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={dismiss}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2 group"
              >
                Start Shopping
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
