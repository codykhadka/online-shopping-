/// <reference types="vite/client" />
import { useState, useEffect, useRef } from "react";
import { Product } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Leaf, Award, Recycle, ChevronDown, Loader2, Send, Search, AlertCircle, Star, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../AuthProvider";
import { Link } from "react-router";
import { WelcomePopup } from "../components/WelcomePopup";
import { LiveChat } from "../components/LiveChat";
import "@/styles/ui styles/WelcomePopup.css";

import "@/styles/Home.css";


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

interface HomeProps {
  onAddToCart: (product: Product) => void;
  userRatings: { [key: string]: number };
  onRate: (productId: string, rating: number) => void;
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
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

const features = [
  {
    icon: <Award size={28} strokeWidth={1.5} />,
    title: "Certified Organic",
    desc: "100% natural products, independently verified and free from synthetics."
  },
  {
    icon: <Leaf size={28} strokeWidth={1.5} />,
    title: "Farm to Table",
    desc: "Sourced directly from local farmers, ensuring maximum freshness."
  },
  {
    icon: <Recycle size={28} strokeWidth={1.5} />,
    title: "Eco-Sustainable",
    desc: "Packaged in 100% biodegradable materials to protect our earth."
  }
];

export function Home({ onAddToCart, userRatings, onRate, products, isLoading = false, error = null }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { user, logout } = useAuth();
  const { scrollY } = useScroll();

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const backgroundY = useTransform(scrollY, [0, 1000], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 450], [1, 0.95]);

  const filteredProducts = products
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
              100% Pure & Natural
            </motion.span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="hero-headline"
          >
            Purity You Can{" "}
            <motion.span
              variants={typingContainer}
              initial="hidden"
              animate="visible"
              className="hero-headline-italic"
            >
              {"Trust".split("").map((char, index) => (
                <motion.span key={index} variants={typingLetter}>{char}</motion.span>
              ))}
            </motion.span>
            ,<br />
            Nature You Can{" "}
            <motion.span
              variants={typingContainer}
              initial="hidden"
              animate="visible"
              className="hero-headline-italic"
            >
              {"Taste".split("").map((char, index) => (
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
            Ethically sourced, sustainably grown, and delivered fresh to your door.
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
                Explore Collection
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
                  <CounterDisplay end={5000} duration={2.5} />
                </motion.p>
                <p className="badge-subtitle">Happy Customers</p>
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
                <p className="badge-title-sm">100% Organic</p>
                <p className="badge-subtitle">Certified</p>
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
            <p className="badge-verified-text">Purity Verified</p>
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
                  Danphe Organic
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
                    placeholder="Search products…"
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
              <p className="loading-spinner-text">Loading products…</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon-wrapper">
                <AlertCircle size={32} className="error-icon" />
              </div>
              <p className="error-title">Connection Error</p>
              <p className="error-message">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="error-retry-button"
              >
                Try Again
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
                  No products found.
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
              Join the Organic Movement
            </h2>
            <p className="newsletter-description">
              Subscribe for exclusive access to seasonal harvests, healthy living guides, and member-only benefits.
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
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
                  <>Subscribe Now <Send size={18} className="newsletter-button-icon" /></>
                )}
              </Button>
            </form>
          </motion.div>
          <div className="footer-text">
            © {new Date().getFullYear()} Danphe Organic. All rights reserved. Crafted carefully for nature.
          </div>
        </div>
      </motion.section>

      {/* Floating Customer Support Chat */}
      <LiveChat user={user} />
    </motion.div>
  );
}