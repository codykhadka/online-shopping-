import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRouterContext } from "../routes";
import { Sparkles, ArrowLeft, Star, Leaf, Heart, MessageSquare, Send } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { useSettings } from "../SettingsContext";
import "@/styles/FeaturedProducts.css";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

function FeaturedCard({ product, socialData, handleToggleLike }: any) {
  const { t } = useSettings();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLiked = socialData?.likes?.[product.id]?.isLiked || false;
  const likeCount = product.likes || 0;

  const onLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleToggleLike(product.id);
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/products/${product.id}/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "feedback", feedback: feedbackText.trim() })
      });
      toast.success("Feedback sent to admin!");
      setFeedbackText("");
      setShowFeedback(false);
    } catch (err) {
      toast.error("Failed to send feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="product-card-link" style={{ display: 'block', height: '100%', cursor: 'default' }}>
      <div className="product-image-wrapper">
        <div className="block">
          <img
            src={product.image}
            alt={product.name}
            className="product-image hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="organic-badge">
          <Leaf className="organic-badge-icon" /> {t("featured.organic")}
        </div>
      </div>

      <div className="product-content">
        <div className="product-header">
          <div className="block">
            <h3 className="product-name">{product.name}</h3>
          </div>
        </div>

        <p className="product-description line-clamp-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
          <button
            onClick={onLikeClick}
            className={`flex items-center gap-2 group p-2 rounded-xl transition-all ${isLiked
              ? "bg-red-500 hover:bg-red-600 shadow-sm"
              : "hover:bg-red-50 -ml-2"
              }`}
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
            >
              <Heart
                size={22}
                fill={isLiked ? "currentColor" : "none"}
                className={`transition-colors ${isLiked
                  ? "fill-white text-white"
                  : "text-neutral-400 group-hover:text-white"
                  }`}
              />
            </motion.div>
            <span className={`text-sm font-bold ${isLiked
              ? "text-white"
              : "text-neutral-500"
              }`}>
              {likeCount === 0
                ? t("featured.loveFirst")
                : `${likeCount.toLocaleString()} ${t("featured.loved")}`}
            </span>
          </button>

          {/* Feedback Icon */}
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${showFeedback ? "bg-amber-100 text-amber-700" : "hover:bg-amber-50 text-neutral-400 hover:text-amber-600"}`}
          >
            <MessageSquare size={20} />
            <span className="text-sm font-bold hidden sm:inline">{t("featured.feedback")}</span>
          </button>
        </div>

        {/* Feedback Dropdown/Panel */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={submitFeedback} className="pt-3 pb-1 flex gap-2">
                <input
                  type="text"
                  placeholder={t("featured.feedbackPlaceholder")}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="flex-1 text-sm px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-amber-300"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center min-w-[40px]"
                >
                  {isSubmitting ? <Sparkles size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function FeaturedProducts() {
  const { products, socialData, handleToggleLike, isLoading, error } = useRouterContext();
  const { scrollY } = useScroll();
  const { t } = useSettings();

  // Identify featured products accurately even if `isFeatured` was dropped by un-restarted backend schema
  const featuredProducts = products.filter(p => p.isFeatured || p.category === "Featured");

  const backgroundY = useTransform(scrollY, [0, 800], ["0%", "30%"]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.2]);

  useEffect(() => {
    fetch(`${API_URL}/featured/view`, { method: "POST" }).catch(console.error);
  }, []);

  return (
    <div className="featured-page">
      {/* Decorative Background Elements */}
      <div className="featured-ambient-blob top-blob" />
      <div className="featured-ambient-blob bottom-blob" />

      <motion.div style={{ y: backgroundY }} className="featured-parallax-bg" />

      <div className="featured-content-wrapper">
        <Link to="/" className="featured-back-link">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>{t("featured.back")}</span>
        </Link>

        {/* Header Section */}
        <motion.div
          style={{ opacity: headerOpacity }}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="featured-hero-header"
        >
          <div className="featured-badge">
            <Sparkles size={14} className="text-amber-500" />
            <span className="font-black tracking-widest uppercase text-xs text-amber-600">{t("featured.badge")}</span>
          </div>

          <h1 className="featured-title">
            {t("featured.title")} <span className="text-green-600 italic">{t("featured.titleItalic")}</span> {t("featured.titleEnd")}
          </h1>
          <p className="featured-subtitle">
            {t("featured.subtitle")}
          </p>
        </motion.div>

        {/* Grid Section */}
        <div className="featured-grid-container">
          {isLoading ? (
            <div className="featured-loading">
              <Sparkles className="animate-pulse size-12 text-green-400 mb-4" />
              <p>{t("featured.loading")}</p>
            </div>
          ) : error ? (
            <div className="featured-error">
              <Leaf className="size-10 text-neutral-300 mb-3" />
              <p className="text-xl font-bold text-neutral-700">{t("featured.error")}</p>
              <p className="text-sm text-neutral-500">{error}</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="featured-empty">
              <p>{t("featured.empty")}</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="featured-products-grid"
            >
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95, y: 20 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: { type: "spring", stiffness: 300, damping: 24 }
                    }
                  }}
                  whileHover={{ y: -8 }}
                  className="featured-card-wrapper bg-white shadow-xl shadow-gray-100/50"
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  {/* Visual flare for featured indicator */}
                  <div className="featured-glow" />

                  <FeaturedCard
                    product={product}
                    socialData={socialData}
                    handleToggleLike={handleToggleLike}
                  />

                  {/* Extra flair tag for high rated items if no discount */}
                  {product.rating > 4.7 && !product.discountPrice && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/30 border border-white/20 flex items-center gap-1 z-10 pointer-events-none">
                      <Star size={10} className="fill-white" />
                      {t("featured.fanFavorite")}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
