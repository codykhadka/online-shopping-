import { useState, useMemo } from "react";
import { Product } from "../data/products";
import { Star, Heart, MessageSquare, Send, Quote, X, ShoppingBag, Sparkles, TrendingUp, Award, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SocialData } from "./Root";
import { PaymentDialog } from "../components/PaymentDialog";
import "@/styles/Ratings.css";

interface RatingsProps {
  onAddToCart: (product: Product) => void;
  userRatings: { [key: string]: number };
  onRate: (productId: string, rating: number) => void;
  socialData: SocialData;
  onToggleLike: (productId: string) => void;
  onAddComment: (productId: string, text: string, isMotivational?: boolean) => void;
  products: Product[];
  userCount?: number;
  visitorCount?: number;
}

// Helper to generate a consistent color for user avatars
const getAvatarColor = (name: string) => {
  const colors = [
    "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", 
    "#ec4899", "#06b6d4", "#f97316", "#84cc16"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getRatingLabel = (rating: number) => {
  if (rating === 5) return "Amazing";
  if (rating === 4) return "Good";
  if (rating === 3) return "Average";
  if (rating === 2) return "Poor";
  if (rating === 1) return "Terrible";
  return "";
};

export function Ratings({
  onAddToCart,
  userRatings,
  onRate,
  socialData,
  onToggleLike,
  onAddComment,
  products,
  userCount = 0,
  visitorCount = 1
}: RatingsProps) {
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [isMotivational, setIsMotivational] = useState<{ [key: string]: boolean }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentProduct, setPaymentProduct] = useState<Product | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleCommentChange = (productId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [productId]: value }));
  };

  const submitComment = (productId: string) => {
    const text = commentInputs[productId];
    if (!text?.trim()) return;

    onAddComment(productId, text, isMotivational[productId] || false);
    setCommentInputs(prev => ({ ...prev, [productId]: "" }));
    setIsMotivational(prev => ({ ...prev, [productId]: false }));
  };

  // Determine which items get ribbons
  const trendingItems = useMemo(() => {
    // For demo, top 3 products are "Trending", top 2 are "Award Winner"
    const sortedByRating = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return {
      trending: sortedByRating.slice(0, 3).map(p => p.id),
      award: sortedByRating.slice(0, 1).map(p => p.id)
    };
  }, [products]);

  return (
    <div className="ratings-page">
      <div className="ratings-container">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="ratings-header"
        >
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">
            <TrendingUp size={12} />
            Community Driven
          </div>
          <h1 className="ratings-title">
            Community & Ratings
          </h1>
          <p className="ratings-subtitle">
            Share your thoughts, like your favorites, and spread motivational vibes with the community.
          </p>
          <div className="community-status-row">
            <div className="status-item">
              <span className="status-dot pulse" />
              <span>{visitorCount} Visiting Now</span>
            </div>
            <div className="status-divider w-px h-4 bg-neutral-200 dark:bg-neutral-800" />
            <div className="status-item">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>{userCount.toLocaleString()}+ Happy Customers</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="ratings-grid"
        >
          {products.map((product) => {
            const likesCount = product.likes || 0;
            const isLiked = socialData.likes[product.id]?.isLiked || false;
            const isTrending = trendingItems.trending.includes(product.id);
            const isAward = trendingItems.award.includes(product.id);

            return (
              <motion.div
                key={product.id}
                variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                }}
                onClick={() => setSelectedProduct(product)}
                className="product-card"
              >
                {/* Ribbons */}
                {isTrending && (
                  <div className="trending-ribbon">
                    <Zap size={10} className="fill-current" />
                    Trending
                  </div>
                )}
                {isAward && !isTrending && (
                  <div className="trending-ribbon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                    <Award size={10} className="fill-current" />
                    Top Rated
                  </div>
                )}

                {/* Product Image Area */}
                <div className="product-image-section">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-img"
                  />
                  <div className="image-overlay" />
                  <div className="floating-info">
                    <p className="category-tag">{product.category}</p>
                    <h2 className="product-name-small">{product.name}</h2>
                  </div>

                  {/* Read-only Like Badge */}
                  <div className={`like-btn ${isLiked ? "liked" : ""}`} style={{ color: isLiked ? '#ef4444' : 'white' }}>
                    <Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} />
                  </div>
                </div>

                {/* Body Area */}
                <div className="product-card-body">
                  <div className="stats-row">
                    <div className="stats-pills">
                      <div className="rating-pill">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating} <span className="text-[8px] opacity-60">({product.ratingCount || 0})</span></span>
                      </div>
                      <div className="likes-pill">
                        <Heart className="size-3 fill-red-400 text-red-400 opacity-60" />
                        <span>{likesCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                     <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Click to Review</p>
                     <ShoppingBag size={14} className="text-emerald-500 opacity-40" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Luxury Side Detail Panel */}
      <AnimatePresence mode="wait">
        {selectedProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="panel-backdrop"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="side-panel"
            >
              {/* Panel Header */}
              <div className="panel-header">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">{selectedProduct.category}</p>
                  <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">{selectedProduct.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              {/* Panel Content - Dual Column Layout */}
              <div className="panel-body">
                {/* LEFT COLUMN: Product Info & Actions */}
                <div className="panel-left-column custom-scrollbar">
                  <div className="focus-image-wrapper">
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="focus-image" />
                    {!selectedProduct.inStock && (
                      <div className="out-of-stock-badge">Out of Stock</div>
                    )}
                  </div>

                  <div className="pannel-bottom">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedProduct) onAddToCart(selectedProduct);
                      }}
                      className="slide-cart-btn"
                    >
                      <ShoppingBag size={18} />
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentProduct(selectedProduct);
                        setSelectedProduct(null);
                        setTimeout(() => setIsPaymentOpen(true), 300);
                      }}
                      className="slide-buy-btn"
                    >
                      Buy Now
                    </button>
                  </div>

                  {/* Interactive Rating Section */}
                  <div className="experience-section">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">
                        Your Experience
                      </h3>
                      {hoverRating > 0 && (
                        <motion.span 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-[11px] font-black text-amber-500 uppercase tracking-tighter"
                        >
                          {getRatingLabel(hoverRating)}
                        </motion.span>
                      )}
                    </div>
                    <div className="experience-stars">
                      {[...Array(5)].map((_, i) => {
                        const starValue = i + 1;
                        const isFilled = starValue <= (hoverRating || userRatings[selectedProduct.id] || 0);
                        return (
                          <Star
                            key={i}
                            className={`large-star ${isFilled ? "filled" : "empty"}`}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => onRate(selectedProduct.id, starValue)}
                          />
                        );
                      })}
                    </div>
                    <p className="experience-feedback">
                      {userRatings[selectedProduct.id] ? `You rated it ${userRatings[selectedProduct.id]} stars` : "Hover to preview, click to rate"}
                    </p>
                  </div>
                </div>

                {/* RIGHT COLUMN: Community Hub */}
                <div className="panel-right-column">
                  <div className="feed-section" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="feed-header mb-6">
                      <h3 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="size-5 text-emerald-600" />
                        Community Hub
                      </h3>
                      <div className={`likes-badge ${socialData.likes[selectedProduct.id]?.isLiked ? "bg-red-50 text-red-600 dark:bg-red-950/20" : ""}`} 
                           onClick={() => onToggleLike(selectedProduct.id)}
                           style={{ cursor: 'pointer' }}>
                        <Heart className={`size-3.5 ${socialData.likes[selectedProduct.id]?.isLiked ? "fill-red-500" : ""}`} />
                        {socialData.likes[selectedProduct.id]?.count || 0}
                      </div>
                    </div>

                    <div className="feed-container custom-scrollbar">
                      {socialData.comments[selectedProduct.id]?.length === 0 ? (
                        <div className="empty-feed">
                          <Sparkles className="size-8 mx-auto text-neutral-200 mb-3" />
                          <p className="text-neutral-400 font-medium">Be the first to share your thoughts!</p>
                        </div>
                      ) : (
                        socialData.comments[selectedProduct.id]?.map((c, i) => {
                          const avatarBg = getAvatarColor(c.userName || "Guest");
                          const initial = (c.userName || "G")[0];
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`feed-comment ${c.isMotivational ? "motivational" : ""}`}
                            >
                              <div className="comment-body">
                                <div className="flex gap-3 w-full">
                                  <div className="comment-avatar" style={{ backgroundColor: avatarBg }}>
                                    {initial}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="comment-username">{c.userName || "Organic Enthusiast"}</p>
                                      <span className="text-[9px] font-bold text-neutral-400">Just Now</span>
                                    </div>
                                    <div className="relative">
                                      {c.isMotivational && <Quote className="quote-icon size-3 absolute -top-1 -left-2 opacity-20" />}
                                      <p className="comment-text">{c.text}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>

                    {/* New Inline Comment Area at the bottom of Right Column */}
                    <div className="panel-footer">
                      <div className="footer-options mb-3">
                        <button
                          onClick={() => setIsMotivational(prev => ({ ...prev, [selectedProduct.id]: !prev[selectedProduct.id] }))}
                          className={`footer-toggle-btn ${isMotivational[selectedProduct.id] ? "active" : ""}`}
                          style={{ fontSize: '11px', padding: '0.4rem 0.8rem' }}
                        >
                          {isMotivational[selectedProduct.id] ? "✨ Giving Vibes" : "Regular Comment"}
                        </button>
                      </div>
                      <div className="footer-input-wrapper">
                        <textarea
                          rows={1}
                          placeholder={isMotivational[selectedProduct.id] ? "Spread vibes..." : "Comment..."}
                          value={commentInputs[selectedProduct.id] || ""}
                          onChange={(e) => handleCommentChange(selectedProduct.id, e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submitComment(selectedProduct.id))}
                          className={`footer-input ${isMotivational[selectedProduct.id] ? "motivational" : ""}`}
                        />
                        <button
                          onClick={() => submitComment(selectedProduct.id)}
                          className="footer-send-btn"
                          disabled={!commentInputs[selectedProduct.id]?.trim()}
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {paymentProduct && (
        <PaymentDialog
          product={paymentProduct}
          quantity={1}
          isOpen={isPaymentOpen}
          onClose={() => {
            setIsPaymentOpen(false);
            setPaymentProduct(null);
          }}
        />
      )}
    </div>
  );
}
