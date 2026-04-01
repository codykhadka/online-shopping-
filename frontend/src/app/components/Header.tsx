import {
  ShoppingCart, Search, Shield, User, LogOut, X, ArrowRight, Star,
  BookOpen, Package, Leaf, Sparkles, Menu, Moon, Sun, Globe, Check, ChevronRight
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { Product } from "../data/products";
import { useSettings } from "../SettingsContext";
import "@/styles/ui styles/Header.css";


interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  products: Product[];
  userCount?: number;
  visitorCount?: number;
}

export function Header({ cartItemCount, onCartClick, products, userCount, visitorCount }: HeaderProps) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode, language, setLanguage, t } = useSettings();
  const isUserAuthenticated = user !== null;
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"language" | "darkmode">("language");
  const [searchQuery, setSearchQuery] = useState("");
  const [typedOrganic, setTypedOrganic] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";
  const isTransparent = isHomePage && !scrolled;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 60);
  });

  // Fallback / standard scroll listener for global reliability
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) return;
    const handler = (e: MouseEvent) => {
      if (settingsPanelRef.current && !settingsPanelRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isSettingsOpen]);

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
              <Leaf size={14} className="logo-icon text-white fill-white" />
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
                {t("nav.signin")}
              </button>
            )}

            {user?.username === 'Cody' && (
              <Link to="/admin/tracking" className="nav-icon-button" title="Admin Panel">
                <Shield className="nav-icon" />
              </Link>
            )}

            <Link to="/ratings" className="nav-icon-button" title="Product Ratings">
              <Star className="nav-icon" />
            </Link>

            <Link to="/featured-products" className="nav-text-button nav-text-button--amber" title="Featured Products">
              <Sparkles className="nav-text-icon" />
              {t("nav.featured")}
            </Link>

            <Link to="/how-to-make" className="nav-text-button nav-text-button--green" title="How-To Guides">
              <BookOpen className="nav-text-icon" />
              {t("nav.howto")}
            </Link>

            {isUserAuthenticated && (
              <Link to="/profile" className="nav-text-button nav-text-button--blue" title="Your Orders">
                <Package className="nav-text-icon" />
                {t("nav.orders")}
              </Link>
            )}

            <button onClick={() => setIsSearchOpen(true)} className="nav-icon-button" title={t("nav.search")}>
              <Search className="nav-icon" />
            </button>

            <button onClick={onCartClick} className="nav-icon-button cart-button">
              <ShoppingCart className="nav-icon" />
              {cartItemCount > 0 && (
                <Badge className="cart-badge">{cartItemCount}</Badge>
              )}
            </button>

            {/* ── Hamburger / Settings ── */}
            <div className="settings-menu-wrapper" ref={settingsPanelRef}>
              <button
                id="settings-menu-btn"
                onClick={() => setIsSettingsOpen(prev => !prev)}
                className={`nav-icon-button hamburger-btn ${isSettingsOpen ? "hamburger-btn--active" : ""}`}
                title={t("settings.title")}
                aria-expanded={isSettingsOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isSettingsOpen ? (
                    <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
                      <X size={20} />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
                      <Menu size={20} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* ── Settings Panel ── */}
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    id="settings-panel"
                    initial={{ opacity: 0, y: -12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="settings-panel"
                  >
                    {/* ── User Profile Card ── */}
                    <div className="settings-profile-card">
                      {isUserAuthenticated ? (
                        <>
                          <div className="settings-avatar">
                            {user?.avatar ? (
                              <img src={user.avatar} alt={user.name} className="settings-avatar-img" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="settings-avatar-placeholder">
                                <User size={22} />
                              </div>
                            )}
                          </div>
                          <div className="settings-profile-info">
                            <p className="settings-profile-name">{user?.name}</p>
                            <p className="settings-profile-email">{user?.email || user?.username}</p>
                          </div>
                          <Link
                            to="/profile"
                            className="settings-profile-link"
                            onClick={() => setIsSettingsOpen(false)}
                            title={t("settings.profile.viewProfile")}
                          >
                            <ChevronRight size={16} />
                          </Link>
                        </>
                      ) : (
                        <>
                          <div className="settings-avatar-placeholder">
                            <User size={22} />
                          </div>
                          <div className="settings-profile-info">
                            <p className="settings-profile-name">{t("settings.profile.guest")}</p>
                            <p className="settings-profile-email">{t("settings.profile.notLoggedIn")}</p>
                          </div>
                          <button
                            onClick={() => { navigate("/login"); setIsSettingsOpen(false); }}
                            className="settings-signin-pill"
                          >
                            {t("nav.signin")}
                          </button>
                        </>
                      )}
                    </div>

                    {/* ── Tab Navigation — Language + Dark Mode only ── */}
                    <div className="settings-tabs">
                      <button
                        id="tab-language"
                        className={`settings-tab ${activeSettingsTab === "language" ? "settings-tab--active" : ""}`}
                        onClick={() => setActiveSettingsTab("language")}
                      >
                        <Globe size={14} />
                        {t("settings.language")}
                      </button>
                      <button
                        id="tab-darkmode"
                        className={`settings-tab ${activeSettingsTab === "darkmode" ? "settings-tab--active" : ""}`}
                        onClick={() => setActiveSettingsTab("darkmode")}
                      >
                        {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                        {t("settings.darkMode")}
                      </button>
                    </div>

                    {/* ── Tab Content ── */}
                    <div className="settings-tab-content">
                      <AnimatePresence mode="wait">

                        {/* Language Tab */}
                        {activeSettingsTab === "language" && (
                          <motion.div key="language" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.18 }} className="settings-section">
                            <div className="language-options">
                              <button
                                id="lang-en-btn"
                                className={`language-option ${language === "en" ? "language-option--active" : ""}`}
                                onClick={() => setLanguage("en")}
                              >
                                <span className="lang-flag">🇺🇸</span>
                                <div className="lang-info">
                                  <span className="lang-name">{t("settings.lang.en")}</span>
                                  <span className="lang-native">English</span>
                                </div>
                                {language === "en" && <Check size={14} className="lang-check" />}
                              </button>
                              <button
                                id="lang-ne-btn"
                                className={`language-option ${language === "ne" ? "language-option--active" : ""}`}
                                onClick={() => setLanguage("ne")}
                              >
                                <span className="lang-flag">🇳🇵</span>
                                <div className="lang-info">
                                  <span className="lang-name">{t("settings.lang.ne")}</span>
                                  <span className="lang-native">नेपाली</span>
                                </div>
                                {language === "ne" && <Check size={14} className="lang-check" />}
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Dark Mode Tab */}
                        {activeSettingsTab === "darkmode" && (
                          <motion.div key="darkmode" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.18 }} className="settings-section">
                            <div className="darkmode-toggle-row">
                              <div className="darkmode-info">
                                <div className="darkmode-icon-wrap">
                                  {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                                </div>
                                <div>
                                  <p className="darkmode-status">
                                    {darkMode
                                      ? (language === "ne" ? "डार्क मोड चालू" : "Dark Mode On")
                                      : (language === "ne" ? "लाइट मोड चालू" : "Light Mode On")}
                                  </p>
                                  <p className="darkmode-hint">
                                    {darkMode
                                      ? (language === "ne" ? "अफ गर्न क्लिक गर्नुहोस्" : "Click to switch to light")
                                      : (language === "ne" ? "डार्क गर्न क्लिक गर्नुहोस्" : "Click to switch to dark")}
                                  </p>
                                </div>
                              </div>
                              <button
                                id="dark-mode-toggle"
                                onClick={toggleDarkMode}
                                className={`toggle-switch ${darkMode ? "toggle-switch--on" : ""}`}
                                aria-label="Toggle dark mode"
                              >
                                <motion.div
                                  className="toggle-thumb"
                                  layout
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </button>
                            </div>

                            <div className="darkmode-themes">
                              <button
                                id="theme-light-btn"
                                className={`theme-option ${!darkMode ? "theme-option--active" : ""}`}
                                onClick={() => darkMode && toggleDarkMode()}
                              >
                                <div className="theme-preview theme-preview--light" />
                                <span>{language === "ne" ? "लाइट" : "Light"}</span>
                              </button>
                              <button
                                id="theme-dark-btn"
                                className={`theme-option ${darkMode ? "theme-option--active" : ""}`}
                                onClick={() => !darkMode && toggleDarkMode()}
                              >
                                <div className="theme-preview theme-preview--dark" />
                                <span>{language === "ne" ? "डार्क" : "Dark"}</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ── Footer: logout if logged in ── */}
                    {isUserAuthenticated && (
                      <div className="settings-panel-footer">
                        <button
                          onClick={() => { logout(); navigate("/"); setIsSettingsOpen(false); }}
                          className="settings-logout-btn"
                        >
                          <LogOut size={14} />
                          {t("settings.profile.logout")}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="search-overlay">
            <div className="search-backdrop" onClick={() => setIsSearchOpen(false)} />
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="search-panel"
            >
              <div className="search-input-row">
                <Search size={20} className="search-panel-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-panel-input"
                />
                <button onClick={() => setIsSearchOpen(false)} className="search-panel-close">
                  <X size={18} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {searchQuery.trim() === "" ? (
                  <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="search-results-info">
                    {t("search.hint")}
                  </motion.div>
                ) : searchResults.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="search-results-info">
                    {t("search.empty")} "<span className="search-results-query">{searchQuery}</span>"
                  </motion.div>
                ) : (
                  <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="search-results-list">
                    {searchResults.map((product, i) => (
                      <motion.button
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleProductClick(product.id)}
                        className="search-result-item"
                      >
                        <img src={product.image} alt={product.name} className="search-result-image" />
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
