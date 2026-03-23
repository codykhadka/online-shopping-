/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { Product } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Leaf, Award, Recycle, ChevronDown, CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

interface HomeProps {
  onAddToCart: (product: Product) => void;
  userRatings: { [key: string]: number };
  onRate: (productId: string, rating: number) => void;
  products: Product[];
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

export function Home({ onAddToCart, userRatings, onRate, products }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { scrollY } = useScroll();

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const backgroundY = useTransform(scrollY, [0, 1000], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 450], [1, 0.95]);

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.category === selectedCategory);

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
      className="min-h-screen bg-neutral-50"
    >
      {/* ... (Hero section remains unchanged) */}
      <section className="relative text-white min-h-[95vh] flex items-center justify-center overflow-hidden">

        {/* Parallax Background */}
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0 origin-top h-[125%]"
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
            className="w-full h-full origin-center relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/80 z-10" />

            {/* Animated Ambient Sunlight */}
            <motion.div
              animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1], x: [0, 40, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-yellow-200/30 rounded-full blur-[120px] mix-blend-overlay z-10 pointer-events-none"
            />
            <motion.div
              animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.2, 1], x: [0, -30, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-green-300/20 rounded-full blur-[100px] mix-blend-overlay z-10 pointer-events-none"
            />

            <img
              src="/images/organic_hero.png"
              alt="Organic Farm"
              className="w-full h-full object-cover object-top"
            />
          </motion.div>
        </motion.div>

        {/* Watermark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 1 }}
          className="absolute inset-0 z-10 flex items-end justify-center pb-10 pointer-events-none"
        >
          <p className="text-[9vw] font-black tracking-tighter text-yellow-400/15 select-none leading-none uppercase">
            Danphe
             Organic
          </p>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto px-4 z-20 text-center flex flex-col items-center mt-12"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="mb-7"
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
              className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/10 backdrop-blur-md border border-yellow-400/40 text-xs font-bold tracking-[0.2em] uppercase text-yellow-50"
            >
              <motion.span
                animate={{ rotate: [0, 18, -8, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                className="flex"
              >
                <Leaf size={13} className="text-yellow-400" />
              </motion.span>
              100% Pure &amp; Natural
            </motion.span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="text-5xl lg:text-7xl xl:text-8xl mb-7 font-black tracking-tighter leading-[1.05] max-w-5xl text-white"
          >
            Purity You Can{" "}
            <motion.span
              variants={typingContainer}
              initial="hidden"
              animate="visible"
              className="font-serif italic font-normal inline-flex text-yellow-400"
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
              className="font-serif italic font-normal inline-flex text-yellow-400"
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
            className="text-lg md:text-xl text-neutral-200/90 max-w-2xl font-light mb-12 leading-relaxed"
          >
            Ethically sourced, sustainably grown, and delivered fresh to your door.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                size="lg"
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-green-600 hover:bg-green-500 text-white rounded-full px-12 py-7 text-lg font-bold tracking-wide shadow-xl shadow-green-900/40 transition-all hover:shadow-green-700/50"
              >
                Explore Collection
              </Button>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="text-white/40"
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
          className="absolute left-6 bottom-28 z-30 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center text-xl">
                🍯
              </div>
              <div>
                <motion.p
                  className="text-2xl font-black text-white leading-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  5,000+
                </motion.p>
                <p className="text-[11px] text-white/60 font-bold uppercase tracking-widest mt-0.5">Happy Customers</p>
              </div>
            </div>
            <div className="mt-3 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2 + i * 0.1, type: "spring" }}
                  className="text-yellow-400 text-sm"
                >⭐</motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Floating Right Badge ── */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-6 bottom-32 z-30 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-green-400/20 border border-green-400/30 flex items-center justify-center text-xl">
                🌿
              </div>
              <div>
                <p className="text-sm font-black text-white leading-tight">100% Organic</p>
                <p className="text-[11px] text-white/60 font-bold uppercase tracking-widest">Certified</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, delay: 2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full"
              />
            </div>
            <p className="text-[10px] text-green-300/80 font-bold mt-1.5 uppercase tracking-widest">Purity Verified</p>
          </motion.div>
        </motion.div>

      </section>

      {/* ── FEATURES CARD ────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="bg-white py-12 shadow-2xl shadow-neutral-200/60 relative z-30 -mt-20 mx-3 md:mx-auto max-w-6xl rounded-[2.5rem] border border-neutral-100/60 overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-100 relative z-10 px-4">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={smoothReveal}
              whileHover={{ scale: 1.03, backgroundColor: "rgba(0, 240, 72, 0.5)" }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="flex gap-5 items-start p-6 md:px-10 rounded-3xl cursor-default transition-colors"
            >
              <div className="bg-green-100/80 p-4 rounded-2xl text-green-700 shrink-0 border border-green-200/50 shadow-sm">
                {f.icon}
              </div>
              <div>
                <h4 className="font-extrabold text-neutral-900 text-base mb-1">{f.title}</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── PRODUCT SECTION ──────────────────────────── */}
      <section id="products" className="py-24">
        <div className="container mx-auto px-4">

          {/* Section Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={smoothReveal}
            className="flex flex-col items-center text-center mb-14"
          >
            <motion.h2
              className="text-4xl md:text-5xl font-black text-neutral-900 mb-4 tracking-tight"
            >
              Danphe Organic
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="w-24 h-1 bg-green-500 rounded-full mb-10 origin-left"
            />

            {/* Category Pills */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 w-full justify-start md:justify-center no-scrollbar px-2">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileTap={{ scale: 0.93 }}
                  layout
                  className={`relative px-7 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-colors duration-200 ${selectedCategory === category
                    ? "text-white shadow-lg shadow-green-900/20"
                    : "text-neutral-600 hover:text-green-700 hover:bg-green-50 bg-white border border-neutral-200 shadow-sm"
                    }`}
                >
                  {selectedCategory === category && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-green-600 rounded-full z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="flex justify-center items-center py-24 text-green-600">
              <Loader2 className="animate-spin" size={48} />
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
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-7"
                  >
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={cardVariant}
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="h-full flex relative group hover:shadow-[0_20px_40px_-15px_rgba(74,222,128,0.25)] hover:z-10 rounded-2xl transition-shadow duration-300"
                        layout
                      >
                        <div className="w-full">
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
                  className="text-center py-20 text-neutral-400 text-lg font-medium"
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
        className="relative bg-[#062c16] py-24 overflow-hidden"
      >
        {/* Glowing orbs (lite green colors) */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] right-[10%] w-[32rem] h-[32rem] bg-green-400 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] left-[10%] w-[36rem] h-[36rem] bg-emerald-400/80 rounded-full blur-[120px]"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-5 text-white tracking-tight">
              Join the Organic Movement
            </h2>
            <p className="text-green-50/80 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Subscribe for exclusive access to seasonal harvests, healthy living guides, and member-only benefits.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row justify-center max-w-xl mx-auto gap-3">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={isSubscribing}
                className="px-6 py-4 bg-white/[0.08] border border-green-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/[0.12] text-white placeholder-green-100/50 flex-1 transition-all shadow-sm backdrop-blur-md disabled:opacity-50"
              />
              <Button 
                type="submit"
                disabled={isSubscribing}
                className="bg-green-500 hover:bg-green-400 text-green-950 rounded-xl px-8 py-6 font-extrabold shadow-lg shadow-green-500/20 shrink-0 transition-transform hover:scale-105 disabled:hover:scale-100"
              >
                {isSubscribing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>Subscribe Now <Send size={18} className="ml-2" /></>
                )}
              </Button>
            </form>
          </motion.div>
          <div className="mt-20 pt-8 border-t border-green-800/40 text-sm text-green-300/50 font-medium">
            © {new Date().getFullYear()} Danphe Organic. All rights reserved. Crafted carefully for nature.
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
