/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { Product } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Leaf, Award, Recycle, ChevronDown } from "lucide-react";

interface HomeProps {
  onAddToCart: (product: Product) => void;
}

// Smooth spring variant for all scroll-reveal elements
const smoothReveal = {
  hidden: { opacity: 0, y: 50, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 70,
      damping: 18,
      mass: 0.8,
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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 80, damping: 16 }
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

export function Home({ onAddToCart }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { scrollY } = useScroll();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
    fetch(`${apiUrl}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to fetch products", err));
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const backgroundY = useTransform(scrollY, [0, 1000], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 450], [1, 0.95]);

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-neutral-50"
    >
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative text-white min-h-[95vh] flex items-center justify-center overflow-hidden">

        {/* Parallax Background */}
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0 origin-top h-[125%]"
        >
          <motion.div
            initial={{ scale: 1.2, filter: "blur(8px)" }}
            animate={{
              scale: [1, 1.07, 1],
              x: [0, -18, 0],
              filter: "blur(0px)"
            }}
            transition={{
              scale: { duration: 28, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 28, repeat: Infinity, ease: "easeInOut" },
              filter: { duration: 2 }
            }}
            className="w-full h-full origin-center"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/80 z-10" />
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
          <p className="text-[9vw] font-black tracking-tighter text-white/[0.04] select-none leading-none uppercase">
            Danphe Organic
          </p>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto px-4 z-20 text-center flex flex-col items-center mt-12"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.2 }}
            className="mb-7"
          >
            <motion.span
              animate={{
                boxShadow: [
                  "0 0 0px 0px rgba(74,222,128,0)",
                  "0 0 22px 7px rgba(74,222,128,0.3)",
                  "0 0 0px 0px rgba(74,222,128,0)"
                ]
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/10 backdrop-blur-md border border-green-400/40 text-xs font-bold tracking-[0.2em] uppercase text-green-50"
            >
              <motion.span
                animate={{ rotate: [0, 18, -8, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                className="flex"
              >
                <Leaf size={13} className="text-green-400" />
              </motion.span>
              100% Pure &amp; Natural
            </motion.span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 16, delay: 0.35 }}
            className="text-5xl lg:text-7xl xl:text-8xl mb-7 font-black tracking-tighter leading-[1.05] max-w-5xl text-white"
          >
            Purity You Can{" "}
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-green-400 font-serif italic font-normal"
            >
              Trust
            </motion.span>
            ,<br />
            Nature You Can{" "}
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75, duration: 0.7 }}
              className="text-green-400 font-serif italic font-normal"
            >
              Taste
            </motion.span>
            .
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.55 }}
            className="text-lg md:text-xl text-neutral-200/90 max-w-2xl font-light mb-12 leading-relaxed"
          >
            Ethically sourced, sustainably grown, and delivered fresh to your door.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.75 }}
            className="flex flex-col items-center gap-5"
          >
            <Button
              size="lg"
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-green-600 hover:bg-green-500 text-white rounded-full px-12 py-7 text-lg font-bold tracking-wide shadow-xl shadow-green-900/40 transition-all hover:scale-105 hover:shadow-green-700/50"
            >
              Explore Collection
            </Button>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="text-white/40"
            >
              <ChevronDown size={22} />
            </motion.div>
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
              whileHover={{ scale: 1.03, backgroundColor: "rgba(240,253,244,0.5)" }}
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
                  className={`relative px-7 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-colors duration-200 ${
                    selectedCategory === category
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
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 10 }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={cardVariant}
                  className="h-full flex"
                >
                  <div className="w-full">
                    <ProductCard product={product} onAddToCart={onAddToCart} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={smoothReveal}
        className="relative bg-neutral-900 py-24 overflow-hidden"
      >
        {/* Glowing orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.07, 0.13, 0.07] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 left-1/4 w-[28rem] h-[28rem] bg-emerald-600 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 60, damping: 16 }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-5 text-white tracking-tight">
              Join the Organic Movement
            </h2>
            <p className="text-neutral-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Subscribe for exclusive access to seasonal harvests, healthy living guides, and member-only benefits.
            </p>
            <div className="flex flex-col sm:flex-row justify-center max-w-xl mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white/10 text-white placeholder-neutral-500 flex-1 transition-all"
              />
              <Button className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-8 py-6 font-bold shadow-lg hover:shadow-green-500/30 shrink-0">
                Subscribe Now
              </Button>
            </div>
          </motion.div>
          <div className="mt-20 pt-8 border-t border-white/10 text-sm text-neutral-500 font-medium">
            © {new Date().getFullYear()} Danphe Organic. All rights reserved. Crafted carefully for nature.
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}