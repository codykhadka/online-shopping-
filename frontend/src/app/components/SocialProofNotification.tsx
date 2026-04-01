import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, User, MapPin, Eye, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { Product } from "../data/products";
import "@/styles/ui styles/SocialProofNotification.css";

interface SocialProofProps {
  products: Product[];
}

const LOCATIONS = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Butwal", "Dharan", "Biratnagar", "Chitwan"];
const ACTIONS = [
  { text: "just purchased", icon: <ShoppingBag size={14} className="text-emerald-500" /> },
  { text: "added to cart", icon: <Sparkles size={14} className="text-amber-500" /> },
  { text: "is viewing", icon: <Eye size={14} className="text-blue-500" /> },
];

export function SocialProofNotification({ products }: SocialProofProps) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<{
    location: string;
    product: Product;
    action: typeof ACTIONS[0];
    count: number;
  } | null>(null);

  useEffect(() => {
    // Initial delay
    const initialDelay = setTimeout(() => showRandom(), 3000);

    const interval = setInterval(() => {
      if (!current) showRandom();
      else setCurrent(null); // Hide before showing next
    }, 12000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [products, current]);

  const showRandom = () => {
    if (products.length === 0) return;

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const randomCount = Math.floor(Math.random() * 8) + 2;

    setCurrent({
      location: randomLocation,
      product: randomProduct,
      action: randomAction,
      count: randomCount,
    });

    // Auto hide after 6 seconds
    setTimeout(() => setCurrent(null), 6000);
  };

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ x: -100, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -100, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          onClick={() => current && navigate(`/product/${current.product.id}`)}
          className="social-proof-card clickable"
        >
          <div className="social-proof-content">
            <div className="social-proof-image-wrapper">
              <img src={current.product.image} alt={current.product.name} className="social-proof-img" />
              <div className="social-proof-icon-badge">
                {current.action.icon}
              </div>
            </div>

            <div className="social-proof-text-area">
              <div className="social-proof-header">
                <div className="social-proof-user">
                  <User size={10} className="mr-1 opacity-50" />
                  <span>Verified User from</span>
                </div>
                <div className="social-proof-location">
                  <MapPin size={10} className="mr-1 text-red-500" />
                  <span>{current.location}</span>
                </div>
              </div>

              <p className="social-proof-message">
                <span className="font-bold">{current.action.text === "is viewing" ? `${current.count} people` : "Someone"}</span> {current.action.text}{" "}
                <span className="font-black text-emerald-600">{current.product.name}</span>
              </p>

              <p className="social-proof-time">Just now</p>
            </div>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 10, ease: "linear" }}
            className="social-proof-progress"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
