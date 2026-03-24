import { ShoppingCart, Search, Shield, User, LogOut, X, ArrowRight, Star, BookOpen, Package } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { Product } from "../data/products";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  products: Product[];
}

export function Header({ cartItemCount, onCartClick, products }: HeaderProps) {
  const { user, logout, openLoginModal } = useAuth();
  const isUserAuthenticated = user !== null;
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typedOrganic, setTypedOrganic] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";
  const isTransparent = isHomePage && !scrolled;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 60);
  });

  // Typing effect for "Organic"
  useEffect(() => {
    const organic = "Organic";
    let i = 0;
    const interval = setInterval(() => {
      setTypedOrganic(organic.slice(0, i + 1));
      i++;
      if (i === organic.length) clearInterval(interval);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const searchResults = searchQuery.trim().length > 0
    ? products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 6)
    : [];

  const handleProductClick = (id: string) => {
    setIsSearchOpen(false);
    navigate(`/product/${id}`);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${isTransparent
            ? "bg-transparent border-b border-white/0"
            : "bg-white/90 backdrop-blur-xl shadow-md shadow-neutral-200/50 border-b border-neutral-100"
          }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="size-8 rounded-lg bg-green-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-md"
            >
              <span className="text-white font-bold text-sm tracking-wide">D</span>
            </motion.div>
            <span className={`text-xl font-black tracking-tight transition-colors duration-300 ${!isTransparent ? "text-neutral-900" : "text-white"}`}>
              <span className="text-red-500 logo-letter">D</span><span className="text-blue-500 logo-letter">a</span><span className="text-green-500 logo-letter">n</span><span className="text-purple-500 logo-letter">p</span><span className="text-pink-500 logo-letter">h</span><span className="text-orange-500 logo-letter">e</span>  <span className="text-yellow-300 logo-letter">{typedOrganic}</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isUserAuthenticated ? (
              <div className={`flex items-center gap-2 px-1 py-1 rounded-xl border transition-all duration-300 ${!isTransparent
                  ? "bg-green-50 border-green-100"
                  : "bg-white/10 border-white/20 backdrop-blur-md"
                }`}>
                <Link to="/profile" className={`flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/20 transition-colors ${!isTransparent ? "text-green-700" : "text-white"}`}>
                  <User size={14} className={!isTransparent ? "text-green-600" : "text-green-300"} />
                  <span className="text-xs font-bold">{user?.name}</span>
                </Link>
                <button
                  onClick={() => { logout(); window.location.reload(); }}
                  className={`p-1.5 rounded-md transition-colors ${!isTransparent ? "hover:bg-green-100 text-green-600" : "hover:bg-white/20 text-white/70"}`}
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className={`text-xs font-bold transition-colors duration-300 ${!isTransparent ? "text-slate-500 hover:text-green-600" : "text-white/80 hover:text-white"}`}
              >
                Sign In
              </button>
            )}

            <Link
              to="/admin/tracking"
              className={`p-2 rounded-lg transition-colors duration-300 ${!isTransparent ? "hover:bg-gray-100 text-slate-500 hover:text-slate-900" : "text-white/70 hover:text-white hover:bg-white/10"}`}
              title="Admin Panel"
            >
              <Shield className="size-5" />
            </Link>

            <Link
              to="/ratings"
              className={`p-2 rounded-lg transition-colors duration-300 ${!isTransparent ? "hover:bg-gray-100 text-slate-500 hover:text-slate-900" : "text-white/70 hover:text-white hover:bg-white/10"}`}
              title="Product Ratings"
            >
              <Star className="size-5" />
            </Link>

            <Link
              to="/how-to-make"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors duration-300 ${!isTransparent ? "hover:bg-green-50 text-green-700 border border-green-200 bg-green-50" : "text-white/80 hover:text-white hover:bg-white/10 border border-white/20"}`}
              title="How-To Guides"
            >
              <BookOpen className="size-4" />
              How-To
            </Link>

            {isUserAuthenticated && (
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors duration-300 ${!isTransparent ? "hover:bg-blue-50 text-blue-700 border border-blue-200 bg-blue-50" : "text-white/80 hover:text-white hover:bg-white/10 border border-white/20"}`}
                title="Your Orders"
              >
                <Package className="size-4" />
                Your Orders
              </Link>
            )}

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-2 rounded-lg transition-colors duration-300 ${!isTransparent ? "hover:bg-gray-100 text-slate-600" : "text-white/70 hover:text-white hover:bg-white/10"}`}
              title="Search Products"
            >
              <Search className="size-5" />
            </button>

            <button
              onClick={onCartClick}
              className={`relative p-2 rounded-lg transition-colors duration-300 ${!isTransparent ? "hover:bg-gray-100 text-slate-600" : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              <ShoppingCart className="size-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSearchOpen(false)}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="relative z-10 bg-white shadow-2xl max-w-2xl w-full mx-auto mt-20 rounded-2xl overflow-hidden border border-neutral-100"
            >
              {/* Input Row */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
                <Search size={20} className="text-neutral-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, categories…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-base text-neutral-800 placeholder-neutral-400 outline-none bg-transparent font-medium"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Results */}
              <AnimatePresence mode="wait">
                {searchQuery.trim() === "" ? (
                  <motion.div
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-8 text-center text-neutral-400 text-sm font-medium"
                  >
                    Start typing to search products…
                  </motion.div>
                ) : searchResults.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-8 text-center text-neutral-400 text-sm font-medium"
                  >
                    No products found for "<span className="text-neutral-700 font-bold">{searchQuery}</span>"
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-2 max-h-[420px] overflow-y-auto"
                  >
                    {searchResults.map((product, i) => (
                      <motion.button
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full flex items-center gap-4 px-5 py-3 hover:bg-green-50 transition-colors group text-left"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-12 rounded-xl object-cover shrink-0 border border-neutral-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-neutral-900 text-sm truncate">{product.name}</p>
                          <p className="text-xs text-green-600 font-semibold">{product.category}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex flex-col text-right">
                            {product.discountPrice ? (
                              <>
                                <span className="font-black text-green-600 leading-none">${product.discountPrice}</span>
                                <span className="text-[10px] text-neutral-400 line-through">${product.price}</span>
                              </>
                            ) : (
                              <span className="font-black text-neutral-800">${product.price}</span>
                            )}
                          </div>
                          <ArrowRight size={15} className="text-neutral-300 group-hover:text-green-500 transition-colors" />
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
