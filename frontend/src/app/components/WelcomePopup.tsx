import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Leaf, Sparkles, ArrowRight } from "lucide-react";
import "@/styles/ui styles/WelcomePopup.css";

// Shows once per browser session (disappears on page refresh next visit)
const SESSION_KEY = "danphe_welcome_shown";

interface WelcomePopupProps {
  userCount?: number;
  visitorCount?: number;
}

export function WelcomePopup({ userCount = 0, visitorCount = 1 }: WelcomePopupProps) {
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
          className="overlay"
          onClick={dismiss}
        >
          {/* Backdrop */}
          <div className="backdrop" />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="card"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="closeButton"
            >
              <X size={16} />
            </button>

            {/* Top banner */}
            <div className="banner">
              {/* Ambient blobs */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="blob1"
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="blob2"
              />

              <motion.div
                animate={{ rotate: [0, 10, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="iconWrapper"
              >
                <Leaf className="leafIcon" />
              </motion.div>
              <h2 className="title">
                Welcome to<br />Danphe Organic!
              </h2>
              <p className="subtitle">
                Pure. Natural. Straight from the farm to your door.
              </p>
            </div>

            {/* Content */}
            <div className="content">
              {/* Trust points */}
              <div className="trustPoints">
                {[
                  { emoji: "🌿", text: "100% Organic & Certified Products" },
                  { emoji: "✨", text: `${visitorCount} ${visitorCount === 1 ? 'person' : 'people'} visiting now` },
                  { emoji: "👥", text: `${userCount.toLocaleString()}+ happy customers across Nepal` },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className="trustPointItem"
                  >
                    <span className="emoji">{item.emoji}</span>
                    <p className="trustText">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Promo tag */}
              <div className="promoTag">
                <Sparkles size={18} className="sparkles" />
                <div>
                  <p className="promoTitle">New Visitor Offer</p>
                  <p className="promoText">Use code <span className="promoCode">ORGANIC10</span> for 10% off!</p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={dismiss}
                className="ctaButton"
              >
                Start Shopping
                <ArrowRight size={18} className="arrowIcon" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
