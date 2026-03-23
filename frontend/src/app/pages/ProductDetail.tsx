import { useParams, Link, useNavigate } from "react-router";
import { Product } from "../data/products";
import { Star, ShoppingCart, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { PaymentDialog } from "../components/PaymentDialog";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { motion } from "motion/react";

interface ProductDetailProps {
  onAddToCart: (product: Product) => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export function ProductDetail({ onAddToCart }: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then((data: Product[]) => {
        setAllProducts(data);
        const found = data.find(p => p.id === id);
        if (found) {
          setProduct(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleBuyNow = () => {
    if (!user) { openLoginModal(); } else { setIsPaymentOpen(true); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-green-600">
          <Loader2 size={40} className="animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-5xl">🌿</p>
        <h1 className="text-2xl font-black text-gray-800">Product Not Found</h1>
        <p className="text-gray-500 max-w-sm">This product doesn't exist or may have been removed.</p>
        <Link to="/" className="mt-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 transition-colors">
          Back to Store
        </Link>
      </div>
    );
  }

  // Recommended: same category first, then others (up to 4)
  const recommended = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const allOthers = recommended.length < 4
    ? [...recommended, ...allProducts.filter(p => p.id !== product.id && !recommended.find(r => r.id === p.id))].slice(0, 4)
    : recommended;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
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
            <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
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
                {!product.inStock && <Badge variant="secondary">Out of Stock</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`size-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <span className="text-lg text-gray-600">{product.rating}</span>
              </div>

              {/* User Rating */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Rate this product:</h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-6 cursor-pointer transition-colors ${i < userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
                      onClick={() => setUserRating(i + 1)}
                    />
                  ))}
                </div>
                {userRating > 0 && <p className="text-sm text-gray-500 mt-1">You rated: {userRating} star{userRating > 1 ? 's' : ''}</p>}
              </div>

              {product.discountPrice ? (
                <div className="mb-6">
                  <p className="text-3xl font-bold text-green-700 leading-none">Rs {Math.round(product.discountPrice * 133).toLocaleString()}</p>
                  <p className="text-lg font-medium text-gray-400 line-through mt-1">Rs {Math.round(product.price * 133).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-3xl font-bold text-green-700 mb-6">Rs {Math.round(product.price * 133).toLocaleString()}</p>
              )}
            </div>

            <div>
              <h2 className="text-xl mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {product.features?.length > 0 && (
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
            )}

            <div className="flex gap-3 pt-4">
              <Button size="lg" className="flex-1" onClick={() => onAddToCart(product)} disabled={!product.inStock}>
                <ShoppingCart className="size-5 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button size="lg" variant="outline" onClick={handleBuyNow} disabled={!product.inStock}>
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
              <div className="w-1 h-7 bg-green-500 rounded-full" />
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
                    <img src={rec.image} alt={rec.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1">{rec.category}</p>
                    <h3 className="font-bold text-sm text-neutral-900 mb-2 leading-snug line-clamp-2">{rec.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        {rec.discountPrice ? (
                          <>
                            <span className="text-base font-black text-neutral-900 leading-none">Rs {Math.round(rec.discountPrice * 133).toLocaleString()}</span>
                            <span className="text-[10px] font-medium text-gray-400 line-through mt-0.5">Rs {Math.round(rec.price * 133).toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-base font-black text-neutral-900">Rs {Math.round(rec.price * 133).toLocaleString()}</span>
                        )}
                      </div>
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
