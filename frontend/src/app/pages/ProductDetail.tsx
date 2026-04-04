import { useParams, Link, useNavigate } from "react-router";
import { Product } from "../data/products";
import { Star, ShoppingCart, Check, ArrowLeft, Loader2, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { PaymentDialog } from "../components/PaymentDialog";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { motion } from "motion/react";
import { useRouterContext } from "../routes";
import "@/styles/ProductDetail.css";

interface ProductDetailProps {
  onAddToCart: (product: Product) => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export function ProductDetail({ onAddToCart: _unused }: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { 
    onAddToCart, 
    userRatings, 
    handleRate, 
    socialData, 
    handleToggleLike 
  } = useRouterContext();
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
    if (!user) { 
      openLoginModal(); 
    } else { 
      setIsPaymentOpen(true); 
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={40} className="loading-spinner" />
          <p className="loading-text">Loading product...</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="not-found-container">
        <p className="not-found-emoji">🌿</p>
        <h1 className="not-found-title">Product Not Found</h1>
        <p className="not-found-text">This product doesn't exist or may have been moved.</p>
        <Link to="/" className="not-found-link">
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
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Back Button */}
        <Link to="/" className="back-to-products-link">
          <ArrowLeft />
          Back to Products
        </Link>

        <div className="product-detail-grid">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="product-image-card"
          >
            <img src={product.image} alt={product.name} className="product-image-main" />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="product-info-container"
          >
            <div>
              <div className="product-badges">
                <Badge className="badge primary">{product.category}</Badge>
                {!product.inStock && <Badge className="badge secondary">Out of Stock</Badge>}
              </div>
              <h1 className="product-title">{product.name}</h1>

              <div className="global-rating-container">
                <div className="global-rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={i < Math.floor(product.rating) ? "filled" : "empty"} size={16} />
                  ))}
                  <span className="global-rating-value ml-2 text-sm">{product.rating}</span>
                </div>
                <div className="flex items-center gap-1 ml-4 text-xs text-neutral-400">
                  <Heart size={12} className={socialData.likes[product.id]?.isLiked ? "fill-red-500 text-red-500" : ""} fill={socialData.likes[product.id]?.isLiked ? "currentColor" : "none"} />
                  <span>{(product as any).likes || 0}</span>
                </div>
              </div>

              {/* User Rating */}
              <div className="user-rating-section">
                <h3 className="user-rating-title">Verify your Experience:</h3>
                <div className="user-rating-stars-container">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={i < (userRatings[product.id] || 0) ? "rated" : "unrated"}
                      onClick={() => (handleRate as any)(product.id, i + 1)}
                    />
                  ))}
                </div>
                {(userRatings[product.id] || 0) > 0 && <p className="user-rating-feedback">Verification: {userRatings[product.id]} star{(userRatings[product.id] || 0) > 1 ? 's' : ''}</p>}
              </div>

              {product.discountPrice ? (
                <div className="price-section">
                  <p className="price-discounted">Rs {Math.round(product.discountPrice * 133).toLocaleString()}</p>
                  <p className="price-original">Rs {Math.round(product.price * 133).toLocaleString()}</p>
                </div>
              ) : (
                <p className="price-regular">Rs {Math.round(product.price * 133).toLocaleString()}</p>
              )}
            </div>

            <div>
              <h2 className="section-title">Description</h2>
              <p className="description-text">{product.description}</p>
            </div>

            {product.features?.length > 0 && (
              <div>
                <h2 className="section-title">Key Features</h2>
                <ul className="features-list">
                  {product.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <Check className="feature-icon" />
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="action-buttons">
              <Button size="lg" className="btn" onClick={() => onAddToCart(product)} disabled={!product.inStock}>
                <ShoppingCart className="btn-icon" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button size="lg" variant="outline" className="btn" onClick={handleBuyNow} disabled={!product.inStock}>
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
