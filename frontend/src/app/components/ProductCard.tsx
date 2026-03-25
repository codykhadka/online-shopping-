import { Product } from "../data/products";
import { Star, ShoppingCart, Leaf } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import "@/styles/ui styles/ProductCard.css";
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  userRating?: number;
  onRate?: (rating: number) => void;
}

export function ProductCard({ product, onAddToCart, userRating = 0, onRate }: ProductCardProps) {
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
      </div>

      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          {!product.inStock && (
            <span className="out-of-stock-badge">Out of Stock</span>
          )}
        </div>

        <div className="global-rating">
          <Star className="global-rating-star" />
          <span className="global-rating-text">Global: {product.rating}</span>
        </div>

        <div className="user-rating-container">
          <span className="user-rating-label">Your Rating</span>
          <div className="user-rating-stars" onClick={(e) => e.preventDefault()}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`user-rating-star ${i < userRating
                  ? "rated"
                  : "unrated"
                  }`}
                onClick={() => onRate?.(i + 1)}
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
