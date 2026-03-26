import { ShoppingCart, Search, Shield, User, LogOut, X, ArrowRight, Star, BookOpen, Package } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { Product } from "../data/products";
import "@/styles/ui styles/Header.css";


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
        className={`header ${isTransparent ? "transparent" : ""}`}
      >
        <div className="header-content">
          <Link to="/" className="logo-link">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="logo-icon-wrapper"
            >
              <span className="logo-icon-text">D</span>
            </motion.div>
            <span className="logo-text">
              <span className="logo-letter-d">D</span><span className="logo-letter-a">a</span><span className="logo-letter-n">n</span><span className="logo-letter-p">p</span><span className="logo-letter-h">h</span><span className="logo-letter-e">e</span>  <span className="logo-letter-organic">{typedOrganic}</span>
            </span>
          </Link>

          <div className="header-nav">
            {isUserAuthenticated ? (
              <div className="user-auth-block">
                <Link to="/profile" className="user-profile-link">
                  <div className="user-avatar-mini">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="user-avatar-img" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={12} className="user-profile-icon" />
                    )}
                  </div>
                  <span className="user-name">{user?.name}</span>
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="logout-button"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="signin-button"
              >
                Sign In
              </button>
            )}

            {user?.username === 'Cody' && (
              <Link
                to="/admin/tracking"
                className="nav-icon-button"
                title="Admin Panel"
              >
                <Shield className="nav-icon" />
              </Link>
            )}

            <Link
              to="/ratings"
              className="nav-icon-button"
              title="Product Ratings"
            >
              <Star className="nav-icon" />
            </Link>

            <Link
              to="/how-to-make"
              className="nav-text-button nav-text-button--green"
              title="How-To Guides"
            >
              <BookOpen className="nav-text-icon" />
              How-To
            </Link>

            {isUserAuthenticated && (
              <Link
                to="/profile"
                className="nav-text-button nav-text-button--blue"
                title="Your Orders"
              >
                <Package className="nav-text-icon" />
                Your Orders
              </Link>
            )}

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="nav-icon-button"
              title="Search Products"
            >
              <Search className="nav-icon" />
            </button>

            <button
              onClick={onCartClick}
              className="nav-icon-button cart-button"
            >
              <ShoppingCart className="nav-icon" />
              {cartItemCount > 0 && (
                <Badge className="cart-badge">
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
            className="search-overlay"
          >
            {/* Backdrop */}
            <div
              className="search-backdrop"
              onClick={() => setIsSearchOpen(false)}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="search-panel"
            >
              {/* Input Row */}
              <div className="search-input-row">
                <Search size={20} className="search-panel-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, categories…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-panel-input"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="search-panel-close"
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
                    className="search-results-info"
                  >
                    Start typing to search products…
                  </motion.div>
                ) : searchResults.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="search-results-info"
                  >
                    No products found for "<span className="search-results-query">{searchQuery}</span>"
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="search-results-list"
                  >
                    {searchResults.map((product, i) => (
                      <motion.button
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleProductClick(product.id)}
                        className="search-result-item"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="search-result-image"
                        />
                        <div className="search-result-text">
                          <p className="search-result-name">{product.name}</p>
                          <p className="search-result-category">{product.category}</p>
                        </div>
                        <div className="search-result-price-container">
                          <div className="search-result-price">
                            {product.discountPrice ? (
                              <>
                                <span className="search-result-discount-price">${product.discountPrice}</span>
                                <span className="search-result-original-price">${product.price}</span>
                              </>
                            ) : (
                              <span className="search-result-regular-price">${product.price}</span>
                            )}
                          </div>
                          <ArrowRight size={15} className="search-result-arrow" />
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
