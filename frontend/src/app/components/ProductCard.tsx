import { Product } from "../data/products";
import { Star, ShoppingCart, Leaf, Heart } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import "@/styles/ui styles/ProductCard.css";
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  userRating?: number;
  onRate?: (rating: number) => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
  isReadOnly?: boolean;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  userRating = 0, 
  onRate,
  isLiked = false,
  onToggleLike,
  isReadOnly = false
}: ProductCardProps) {
  const canLike = !isReadOnly && !isLiked;
  const canRate = !isReadOnly && userRating === 0;
  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card-link"
    >
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
        <div className="organic-badge">
          <Leaf className="organic-badge-icon" /> Organic
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (canLike) onToggleLike?.();
          }}
          disabled={!canLike && !isLiked}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 ${
            isLiked 
              ? "bg-red-500 text-white shadow-lg scale-110" 
              : !canLike
                ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                : "bg-white/80 backdrop-blur-sm text-neutral-400 hover:text-red-500 hover:bg-white"
          }`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          {!product.inStock && (
            <span className="out-of-stock-badge">Out of Stock</span>
          )}
        </div>

        <div className="stats-row">
          <div className="global-rating">
            <Star className="global-rating-star" />
            <span className="global-rating-text">{product.rating} ({product.ratingCount || 0})</span>
          </div>
          <div className="likes-count">
            <Heart 
              className={`likes-count-icon ${isLiked ? "fill-red-500 text-red-500" : ""}`} 
              size={14} 
              fill={isLiked ? "currentColor" : "none"} 
            />
            <span className="likes-count-text">{product.likes || 0}</span>
          </div>
        </div>

        <div className="user-rating-container">
          <span className="user-rating-label">Your Rating</span>
          <div className={`user-rating-stars ${!canRate ? 'read-only' : ''}`} onClick={(e) => e.preventDefault()}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`user-rating-star ${i < userRating
                  ? "rated"
                  : "unrated"
                  } ${!canRate ? 'disabled' : ''}`}
                onClick={() => canRate && onRate?.(i + 1)}
              />
            ))}
          </div>
        </div>

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-footer">
          <div className="price-container">
            {product.discountPrice ? (
              <>
                <span className="discount-price">Rs {Math.round(product.discountPrice * 133).toLocaleString()}</span>
                <span className="original-price">Rs {Math.round(product.price * 133).toLocaleString()}</span>
              </>
            ) : (
              <span className="regular-price">Rs {Math.round(product.price * 133).toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            disabled={!product.inStock}
            className="add-to-cart-btn"
          >
            <ShoppingCart className="add-to-cart-icon" />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
