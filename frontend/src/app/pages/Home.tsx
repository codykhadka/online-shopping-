/// <reference types="vite/client" />
import { useState, useEffect, useRef } from "react";
import { Product } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Leaf, Award, Recycle, ChevronDown, Loader2, Send, Search, AlertCircle, Star, Sparkles, X, Truck, ChevronRight, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../AuthProvider";
import { useSettings } from "../SettingsContext";
import { Link } from "react-router";
import { WelcomePopup } from "../components/WelcomePopup";
import { LiveChat } from "../components/LiveChat";
import { SocialProofNotification } from "../components/SocialProofNotification";
import "@/styles/ui styles/WelcomePopup.css";
import "@/styles/ui styles/SocialProofNotification.css";

import "@/styles/Home.css";


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

interface HomeProps {
  onAddToCart: (product: Product) => void;
  userRatings: { [key: string]: number };
  onRate: (productId: string, rating: number) => void;
  products: Product[];
  socialData: any;
  onToggleLike: (productId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  userCount?: number;
  visitorCount?: number;
}

// Typing animation variants
const typingContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.8 }
  }
};

const typingLetter = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    color: ["#ffffff", "#a7f3d0", "#4ade80"],
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

// Luxurious easing curve for smooth reveal
const smoothReveal = {
  hidden: { opacity: 0, y: 60, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
  }
};

// Counter Component
function CounterDisplay({ end, duration = 2.5 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(progress * end));
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}+</span>;
}

// features defined inside component to use t()

export function Home({ onAddToCart, userRatings, onRate, products, socialData, onToggleLike, isLoading = false, error = null, userCount = 0, visitorCount = 1 }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const { user, logout } = useAuth();
  const { t } = useSettings();
  const { scrollY } = useScroll();

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_URL}/users/${user.id}/orders`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // Find most recent order that isn't completed (status < 3)
            const active = data.find((o: any) => o.status < 3);
            if (active) setActiveOrder(active);
          }
        })
        .catch(err => console.error("Error fetching active order:", err));
    } else {
      setActiveOrder(null);
    }
  }, [user]);

  const features = [
    { icon: <Award size={28} strokeWidth={1.5} />, title: t("home.feat.certified"), desc: t("home.feat.certifiedDesc") },
    { icon: <Leaf size={28} strokeWidth={1.5} />, title: t("home.feat.farm"), desc: t("home.feat.farmDesc") },
    { icon: <Recycle size={28} strokeWidth={1.5} />, title: t("home.feat.eco"), desc: t("home.feat.ecoDesc") },
  ];

  const statusLabels = ["Confirmed", "Prepared", "Shipping"];
  const statusProgress = [20, 50, 80];

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const backgroundY = useTransform(scrollY, [0, 1000], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 450], [1, 0.95]);

  const filteredProducts = products
    .filter(p => !p.isFeatured && p.category !== "Featured")
    .filter(p => selectedCategory === "All" || p.category === selectedCategory)
    .filter(p => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      return toast.error("Please enter a valid email address.");
    }

    setIsSubscribing(true);
    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Welcome! Check your 'Identity' for a surprise incoming.", {
          description: "Owner notified. You're now part of the movement.",
          icon: <Leaf className="text-green-500" />
        });
        setNewsletterEmail("");
      } else {
        toast.error(data.error || "Subscription failure.");
      }
    } catch {
      toast.error("Network instability. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="home-container"
    >
      {/* ... (Hero section remains unchanged) */}
      <section className="hero-section">
        {/* Active Order Tracker Overlay */}
        <AnimatePresence>
          {activeOrder && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute top-24 right-6 z-50 max-w-xs w-full"
            >
              <Link to={`/tracking/${activeOrder.id}`} className="block">
                <div className="bg-white/90 backdrop-blur-md border border-green-100 rounded-2xl p-4 shadow-2xl hover:shadow-green-200/50 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                        <Truck size={16} className="animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-700">{t("home.liveTracking")}</p>
                        <p className="text-xs font-bold text-neutral-900">Order #{activeOrder.id.slice(-6)}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-sm font-black text-neutral-800">
                        {activeOrder.status === -1 ? (t("home.liveTracking")) : statusLabels[activeOrder.status]}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-400">{activeOrder.status === -1 ? "0%" : statusProgress[activeOrder.status]}%</p>
                    </div>
                    
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${activeOrder.status === -1 ? 5 : statusProgress[activeOrder.status]}%` }}
                        className="h-full bg-green-600"
                      />
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500">
                      <MapPin size={10} className="text-red-500" />
                      <span className="truncate">{activeOrder.location || "Sorting Hub"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parallax Background */}
        <motion.div
          style={{ y: backgroundY }}
          className="hero-parallax-bg"
        >
          <motion.div
            initial={{ scale: 1.1, filter: "blur(12px)" }}
            animate={{
              scale: [1, 1.05, 1],
              filter: "blur(0px)"
            }}
            transition={{
              scale: { duration: 24, repeat: Infinity, ease: "easeInOut" },
              filter: { duration: 1.5, ease: "easeOut" }
            }}
            className="hero-image-container"
          >
            <div className="hero-gradient-overlay" />

            {/* Animated Ambient Sunlight */}
            <motion.div
              animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1], x: [0, 40, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="hero-ambient-blob-1"
            />
            <motion.div
              animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.2, 1], x: [0, -30, 0] }}
              transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="hero-ambient-blob-2"
            />

            <img
              src="/images/organic_hero.png"
              alt="Organic Farm"
              className="hero-image"
            />
          </motion.div>
        </motion.div>

        {/* Watermark */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 1 }}
          className="absolute inset-0 z-10 flex items-end justify-center pb-10 pointer-events-none"
        >
          <p className="text-[9vw] font-black tracking-tighter text-yellow-400/15 select-none leading-none uppercase">
            Danphe
            Organic
          </p>
        </motion.div> */}

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="hero-content"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="hero-badge-wrapper"
          >
            <motion.span
              animate={{
                boxShadow: [
                  "0 0 0px 0px rgba(234,179,8,0)",
                  "0 0 22px 7px rgba(234,179,8,0.3)",
                  "0 0 0px 0px rgba(234,179,8,0)"
                ]
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="hero-badge"
            >
              <motion.span
                animate={{ rotate: [0, 18, -8, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                className="hero-badge-icon"
              >
                <Leaf size={13} className="hero-badge-leaf" />
              </motion.span>
              {t("home.badge")}
            </motion.span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="hero-headline"
          >
            {t("home.headline1")}{" "}
            <motion.span variants={typingContainer} initial="hidden" animate="visible" className="hero-headline-italic">
              {t("home.headline1b").split("").map((char, index) => (
                <motion.span key={index} variants={typingLetter}>{char}</motion.span>
              ))}
            </motion.span>
            ,<br />
            {t("home.headline2")}{" "}
            <motion.span variants={typingContainer} initial="hidden" animate="visible" className="hero-headline-italic">
              {t("home.headline2b").split("").map((char, index) => (
                <motion.span key={index} variants={typingLetter}>{char}</motion.span>
              ))}
            </motion.span>
            .
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
            className="hero-subheadline"
          >
            {t("home.subheadline")}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
            className="hero-cta-container"
          >
            <motion.div
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                size="lg"
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                className="hero-cta-button"
              >
                {t("home.cta")}
              </Button>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="hero-scroll-indicator"
            >
              <ChevronDown size={22} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Floating Left Badge ── */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="floating-badge-left"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="floating-badge-content"
          >
            <div className="badge-item-row">
              <div className="badge-icon-wrapper badge-icon-honey text-yellow-600">
                <Sparkles size={18} />
              </div>
              <div>
                <motion.p
                  className="badge-title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  <CounterDisplay end={userCount || 3} duration={2} />
                </motion.p>
                <p className="badge-subtitle">{t("home.customers")}</p>
              </div>
            </div>
            <div className="badge-stars-container">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2 + i * 1.1, type: "spring" }}
                  className="badge-star text-yellow-400"
                >
                  <Star size={14} fill="currentColor" />
                </motion.div>
              ))}
            </div>

            {/* Live Visitor Pulse in Badge */}
            <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] font-bold text-neutral-400">
                {visitorCount} browsing now
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Floating Right Badge ── */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="floating-badge-right"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="floating-badge-content"
          >
            <div className="badge-item-row">
              <div className="badge-icon-wrapper badge-icon-leaf text-green-600">
                <Leaf size={18} />
              </div>
              <div>
                <p className="badge-title-sm">{t("home.organic")}</p>
                <p className="badge-subtitle">{t("home.certified")}</p>
              </div>
            </div>
            <div className="badge-progress-container">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, delay: 2, ease: "easeOut" }}
                className="badge-progress-bar"
              />
            </div>
            <p className="badge-verified-text">{t("home.purityVerified")}</p>
          </motion.div>
        </motion.div>

      </section>

      {/* ── FEATURES CARD ────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="features-section"
      >
        <div className="features-bg-blob" />
        <div className="features-grid">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={smoothReveal}
              whileHover={{ scale: 1.03, backgroundColor: "rgba(0, 240, 72, 0.5)" }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="feature-item"
            >
              <div className="feature-icon-wrapper">{f.icon}</div>
              <div>
                <h4 className="feature-title">{f.title}</h4>
                <p className="feature-description">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── PRODUCT SECTION ──────────────────────────── */}
      <section id="products" className="products-section">
        <div className="products-container">

          {/* Section Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={smoothReveal}
            className="products-header"
          >
            <div className="products-header-top">
              <div className="products-title-group">
                <motion.h2 className="products-title">
                  <span className="title-danphe">Danphe</span> <span className="title-organic">Organic</span>
                </motion.h2>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                  className="products-title-underline"
                />
              </div>

              <div className="products-controls-group">
                {/* Search Bar */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="search-bar-wrapper"
                >
                  <Search className="search-bar-icon" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("home.search")}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="search-clear-button"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>

                {/* Category Pills */}
                <div className="category-pills-container">
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      whileTap={{ scale: 0.93 }}
                      layout
                      className={`category-pill ${selectedCategory === category
                        ? "active"
                        : "inactive"
                        }`}
                    >
                      {selectedCategory === category && (
                        <motion.div
                          layoutId="activeCategory"
                          className="category-pill-bg"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="category-pill-text">{category}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          {/* Loading State */}
          {isLoading ? (
            <div className="loading-spinner-container">
              <Loader2 className="animate-spin" size={48} />
              <p className="loading-spinner-text">{t("home.loading")}</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon-wrapper">
                <AlertCircle size={32} className="error-icon" />
              </div>
              <p className="error-title">{t("home.error.title")}</p>
              <p className="error-message">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="error-retry-button"
              >
                {t("home.error.retry")}
              </Button>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {filteredProducts.length > 0 && (
                  <motion.div
                    key={selectedCategory}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: 10 }}
                    variants={staggerContainer}
                    layout
                    className="products-grid"
                  >
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={cardVariant}
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="product-card-container"
                        layout
                      >
                        <div className="product-card-inner">
                          <ProductCard
                            product={product}
                            onAddToCart={onAddToCart}
                            userRating={userRatings[product.id]}
                            onRate={(r) => onRate(product.id, r)}
                            isLiked={socialData?.likes?.[product.id]?.isLiked || false}
                            onToggleLike={() => onToggleLike(product.id)}
                            isReadOnly={false}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {filteredProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="no-products-found"
                >
                  {t("home.noProducts")}
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={smoothReveal}
        className="newsletter-section"
      >
        {/* Glowing orbs (lite green colors) */}
        <div className="newsletter-blobs-container">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="newsletter-blob-1"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="newsletter-blob-2"
          />
        </div>

        <div className="newsletter-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="newsletter-title">
              {t("home.newsletter.title")}
            </h2>
            <p className="newsletter-description">
              {t("home.newsletter.desc")}
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t("home.newsletter.placeholder")}
                disabled={isSubscribing}
                className="newsletter-input"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="newsletter-button"
              >
                {isSubscribing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>{t("home.newsletter.btn")} <Send size={18} className="newsletter-button-icon" /></>
                )}
              </Button>
            </form>
          </motion.div>
          <div className="footer-text">
            © {new Date().getFullYear()} Danphe Organic. All rights reserved. Crafted carefully for nature.
          </div>
        </div>
      </motion.section>

      {/* Floating Featured Products Link */}
      <motion.div
         initial={{ opacity: 0, x: 50 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ delay: 1, type: "spring", stiffness: 200 }}
         className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 pointer-events-auto"
      >
         <Link to="/featured-products" className="group flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl shadow-xl shadow-amber-500/30 border border-white/30 hover:scale-105 transition-all outline-none">
             <div className="relative">
                <Sparkles size={24} className="text-white drop-shadow-md group-hover:rotate-12 transition-transform" />
                <div className="absolute inset-0 bg-white/40 rounded-full blur-md group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100 mix-blend-overlay"></div>
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-white mt-1.5 drop-shadow">{t("home.featured")}</span>
             
             {/* Ping animation behind */}
             <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-ping opacity-20 -z-10 group-hover:animate-none"></div>
         </Link>
      </motion.div>

      {/* Floating Customer Support Chat */}
      <LiveChat user={user} />

      {/* Social Proof "Push" Notifications */}
      <SocialProofNotification products={products} />
    </motion.div>
  );
}