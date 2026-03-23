import { useState } from "react";
import { Product } from "../data/products";
import { Star, Heart, MessageSquare, Send, Quote, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SocialData } from "./Root";

interface RatingsProps {
  onAddToCart: (product: Product) => void;
  userRatings: { [key: string]: number };
  onRate: (productId: string, rating: number) => void;
  socialData: SocialData;
  onToggleLike: (productId: string) => void;
  onAddComment: (productId: string, text: string, isMotivational?: boolean) => void;
  products: Product[];
}

export function Ratings({
  onAddToCart,
  userRatings,
  onRate,
  socialData,
  onToggleLike,
  onAddComment,
  products
}: RatingsProps) {
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [isMotivational, setIsMotivational] = useState<{ [key: string]: boolean }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-neutral-900 mb-4 tracking-tight">
            Community & Ratings
          </h1>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            Share your thoughts, like your favorites, and spread motivational vibes with the community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => {
            const likesCount = socialData.likes[product.id]?.count || 0;
            const isLiked = socialData.likes[product.id]?.isLiked || false;
            const comments = socialData.comments[product.id] || [];

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onMouseEnter={() => setActiveCardId(product.id)}
                onMouseLeave={() => setActiveCardId(null)}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col h-[320px] group transition-all hover:shadow-xl hover:shadow-neutral-200/50 relative cursor-pointer"
              >
                {/* Product Image Area */}
                <div className="w-full relative h-40 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white font-bold">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-green-300 mb-0.5">{product.category}</p>
                    <h2 className="text-sm font-black tracking-tight leading-tight">{product.name}</h2>
                  </div>

                  {/* Floating Like Button */}
                  <button
                    onClick={() => onToggleLike(product.id)}
                    className={`absolute top-2 right-2 p-2 rounded-xl backdrop-blur-md transition-all ${isLiked
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110"
                      : "bg-white/20 text-white hover:bg-white/40"
                      }`}
                  >
                    <Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Permanent Content Area */}
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-100">
                        <Star className="size-3 fill-green-600 text-green-600" />
                        <span className="text-[10px] font-black text-green-700">{product.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-400">
                        <Heart className="size-3" />
                        <span className="text-[10px] font-bold">{likesCount}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="bg-neutral-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                    >
                      Buy
                    </button>
                  </div>

                  <div className="mt-auto group-hover:hidden">
                    <p className="text-[10px] text-neutral-400 italic mb-1">Hover for details & comments</p>
                    <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-green-500 rounded-full group-hover:w-full transition-all duration-500" />
                    </div>
                  </div>
                </div>

                {/* Hover/Click Overlay Area */}
                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{
                    opacity: activeCardId === product.id ? 1 : 0,
                    y: activeCardId === product.id ? 0 : "100%"
                  }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={`absolute inset-0 bg-white/95 backdrop-blur-sm p-4 flex flex-col z-10 ${activeCardId === product.id ? "pointer-events-auto" : "pointer-events-none"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Quick Preview</span>
                    <Heart size={12} className={isLiked ? "fill-red-500 text-red-500" : "text-neutral-300"} />
                  </div>
                  <h3 className="text-xs font-black text-neutral-900 mb-3 truncate px-1">{product.name}</h3>

                  {/* Rating Section */}
                  <div className="mb-4 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                    <p className="text-[10px] uppercase font-black text-neutral-500 tracking-widest mb-2 text-center">Your Rating</p>
                    <div className="flex items-center justify-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-5 cursor-pointer transition-all hover:scale-125 ${i < (userRatings[product.id] || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-neutral-300 hover:text-yellow-400"
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRate(product.id, i + 1);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comments Display */}
                  {/* <div className="flex-1 mb-4 overflow-y-auto max-h-36 custom-scrollbar">
                    <p className="text-[10px] uppercase font-black text-neutral-500 tracking-widest mb-2">Community Comments</p>
                    <div className="space-y-1.5">
                      <AnimatePresence initial={false}>
                        {comments.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic py-2 text-center">No comments yet. Be the first!</p>
                        ) : (
                          comments.map((c, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-2 rounded-xl border ${
                                c.isMotivational 
                                  ? "bg-amber-50 border-amber-100 text-amber-900 shadow-sm" 
                                  : "bg-white border-neutral-100 text-neutral-700 shadow-sm"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {c.isMotivational && <Quote className="size-3 mt-0.5 shrink-0 text-amber-500" />}
                                <p className={`text-[11px] font-medium ${c.isMotivational ? "italic leading-relaxed" : "leading-relaxed"}`}>
                                  {c.text}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div> */}

                  {/* Comment Input */}
                  <div className="mt-auto pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMotivational(prev => ({ ...prev, [product.id]: !prev[product.id] }));
                        }}
                        className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${isMotivational[product.id]
                          ? "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-200"
                          : "bg-white border-neutral-200 text-neutral-300 hover:bg-neutral-50 shadow-sm"
                          }`}
                      >
                        ✨ Motivational
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={isMotivational[product.id] ? "Share a motive..." : "Add a comment..."}
                        value={commentInputs[product.id] || ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleCommentChange(product.id, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitComment(product.id)}
                        className={`w-full pl-4 pr-10 py-2.5 bg-neutral-100 border-none rounded-2xl text-xs focus:ring-2 transition-all shadow-inner ${isMotivational[product.id] ? "focus:ring-amber-500 bg-amber-50 placeholder-amber-400 text-amber-900" : "focus:ring-green-500 text-neutral-800"
                          }`}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          submitComment(product.id);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-green-600 transition-colors"
                      >
                        <Send size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Big Side Detail Panel */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-[60]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-white shadow-2xl z-[70] overflow-hidden flex flex-col shadow-black/20"
            >
              {/* Panel Header */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-1">{selectedProduct.category}</p>
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{selectedProduct.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-3 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* Product Focus Image */}
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl shadow-neutral-100 border border-neutral-100">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="size-full object-cover" />
                </div>

                {/* Big Rating Section */}
                <div className="bg-neutral-50 rounded-[32px] p-8 border border-neutral-100 text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 font-mono">Your Experience</p>
                  <div className="flex items-center justify-center gap-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-10 cursor-pointer transition-all hover:scale-110 active:scale-95 ${i < (userRatings[selectedProduct.id] || 0)
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                          : "text-neutral-200 hover:text-yellow-400"
                          }`}
                        onClick={() => onRate(selectedProduct.id, i + 1)}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-bold text-neutral-500">
                    {userRatings[selectedProduct.id] ? `You rated it ${userRatings[selectedProduct.id]} stars` : "Click to rate this product"}
                  </p>
                </div>

                {/* Big Comments Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                      <MessageSquare className="size-5 text-green-600" />
                      Community Feed
                    </h3>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-600 shadow-sm">
                      <Heart className={`size-3.5 ${socialData.likes[selectedProduct.id]?.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      {socialData.likes[selectedProduct.id]?.count || 0} Likes
                    </div>
                  </div>

                  <div className="space-y-3">
                    {socialData.comments[selectedProduct.id]?.length === 0 ? (
                      <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-neutral-200">
                        <p className="text-neutral-400 text-sm italic">Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      socialData.comments[selectedProduct.id]?.map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-2xl border ${c.isMotivational
                            ? "bg-amber-50 border-amber-100 text-amber-900 shadow-sm"
                            : "bg-white border-neutral-100 text-neutral-700 shadow-sm"
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            {c.isMotivational ? (
                              <Quote className="size-5 mt-1 shrink-0 text-amber-500" />
                            ) : (
                              <div className="size-2 rounded-full bg-green-500 mt-2 shrink-0" />
                            )}
                            <p className={`text-sm leading-relaxed ${c.isMotivational ? "font-serif italic text-lg" : "font-medium"}`}>
                              {c.text}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky Comment Area */}
              <div className="p-6 bg-white border-t border-neutral-100">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setIsMotivational(prev => ({ ...prev, [selectedProduct.id]: !prev[selectedProduct.id] }))}
                    className={`text-xs font-black px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${isMotivational[selectedProduct.id]
                      ? "bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-200"
                      : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 shadow-sm"
                      }`}
                  >
                    {isMotivational[selectedProduct.id] ? "✨ Motivational Active" : "Regular Comment"}
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    rows={1}
                    placeholder={isMotivational[selectedProduct.id] ? "Deep thought..." : "Write a comment..."}
                    value={commentInputs[selectedProduct.id] || ""}
                    onChange={(e) => handleCommentChange(selectedProduct.id, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submitComment(selectedProduct.id))}
                    className={`w-full pl-6 pr-14 py-4 bg-neutral-100 border-none rounded-2xl text-sm focus:ring-2 transition-all shadow-inner resize-none ${isMotivational[selectedProduct.id]
                      ? "focus:ring-amber-500 bg-amber-50 placeholder-amber-400 text-amber-900"
                      : "focus:ring-green-500 text-neutral-800"
                      }`}
                  />
                  <button
                    onClick={() => submitComment(selectedProduct.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-neutral-900 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg active:scale-95 disabled:bg-neutral-200 disabled:shadow-none"
                    disabled={!commentInputs[selectedProduct.id]?.trim()}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
