import { useParams, Link, Navigate, useNavigate } from "react-router";
import { products, Product } from "../data/products";
import { Star, ShoppingCart, Check, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { PaymentDialog } from "../components/PaymentDialog";
import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { motion } from "motion/react";

interface ProductDetailProps {
  onAddToCart: (product: Product) => void;
}

export function ProductDetail({ onAddToCart }: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === id);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();

  const handleBuyNow = () => {
    if (!user) {
      openLoginModal();
    } else {
      setIsPaymentOpen(true);
    }
  };

  if (!product) {
    return <Navigate to="/404" replace />;
  }

  // Recommended: same category, not current product (up to 4)
  const recommended = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const allOthers = recommended.length < 4
    ? [
        ...recommended,
        ...products.filter(p => p.id !== product.id && !recommended.find(r => r.id === p.id))
      ].slice(0, 4)
    : recommended;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl overflow-hidden shadow-md"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{product.category}</Badge>
                {!product.inStock && (
                  <Badge variant="secondary">Out of Stock</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg text-gray-600">{product.rating}</span>
              </div>

              <p className="text-3xl mb-6">${product.price}</p>
            </div>

            <div>
              <h2 className="text-xl mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl mb-3">Key Features</h2>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => onAddToCart(product)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="size-5 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Buy Now
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Recommended Products */}
        {allOthers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-7 bg-green-500 rounded-full"></div>
              <h2 className="text-2xl font-black text-neutral-800 tracking-tight">You May Also Like</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {allOthers.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  onClick={() => navigate(`/product/${rec.id}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all cursor-pointer group"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1">{rec.category}</p>
                    <h3 className="font-bold text-sm text-neutral-900 mb-2 leading-snug line-clamp-2">{rec.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-neutral-900">${rec.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-neutral-500 font-medium">{rec.rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <PaymentDialog
        product={product}
        quantity={1}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  );
}