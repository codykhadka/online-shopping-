import { useState } from "react";
import { products, categories, Product } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import { motion, useScroll, useTransform } from "motion/react";

interface HomeProps {
  onAddToCart: (product: Product) => void;
}

export function Home({ onAddToCart }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 800], [0, 200]);

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden flex items-center justify-center min-h-[500px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            style={{ y: backgroundY }}
            animate={{ 
              scale: [1.05, 1.1, 1.05],
              x: [0, -15, 0],
            }}
            transition={{ 
              duration: 30, 
              repeat: Infinity,
              ease: "linear"
            }}
            src="/images/organic_hero.png" 
            alt="Organic Food" 
            className="w-full h-full object-cover origin-center"
          />
          <div className="absolute inset-0 bg-green-900/60 backdrop-blur-[2px]"></div>
        </div>
        <div className="container mx-auto px-4 text-center z-10">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl mb-4 font-bold"
          >
            Bringing Nature's Goodness to Your Table
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-green-100 max-w-2xl mx-auto"
          >
            Pure Food, Thoughtfully Crafted — No Drama, 🌿Just Nature 🌿
          </motion.p>
        </div>
      </section>

      {/* Premium Features Banner */}
      <section className="bg-white border-b py-8 shadow-sm relative z-20 -mt-8 mx-4 md:mx-auto container rounded-2xl">
        <div className="flex flex-col md:flex-row justify-around items-center gap-6 px-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full text-green-700">🌿</div>
            <div>
              <h4 className="font-bold text-gray-800">100% Organic</h4>
              <p className="text-sm text-gray-500">Certified natural products</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full text-green-700">🚜</div>
            <div>
              <h4 className="font-bold text-gray-800">Farm to Table</h4>
              <p className="text-sm text-gray-500">Sourced directly from farmers</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full text-green-700">💚</div>
            <div>
              <h4 className="font-bold text-gray-800">Sustainable</h4>
              <p className="text-sm text-gray-500">Eco-friendly packaging</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b bg-white sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                className={`rounded-full px-6 transition-all duration-300 ${
                  selectedCategory === category 
                  ? "bg-green-700 hover:bg-green-800 text-white shadow-md transform scale-105" 
                  : "hover:bg-green-50 hover:text-green-700 border-gray-200"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl mb-2">
            {selectedCategory === "All" ? "All Products" : selectedCategory}
          </h2>
          <p className="text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
          </p>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
            >
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Subscription Section */}
      <section className="bg-green-50 py-16 border-t border-green-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-4 text-green-900">Subscribe for Healthy Living</h2>
          <p className="text-green-700 mb-8 max-w-md mx-auto">Get organic products delivered to your doorstep. Stay in touch for healthy updates and our monthly best offers!</p>
          <div className="flex flex-col sm:flex-row justify-center max-w-md mx-auto gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 flex-1"
            />
            <Button className="bg-green-700 hover:bg-green-800 text-white">Subscribe</Button>
          </div>
          <p className="mt-8 text-sm text-green-600">© 2025-26 Danphe Organic. All rights reserved.</p>
        </div>
      </section>
    </motion.div>
  );
}