import { Product } from "../data/products";
import { Star, ShoppingCart, Leaf } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

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
      className="group bg-white rounded-2xl border-transparent shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className="aspect-square overflow-hidden bg-green-50/50 relative">
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-green-800 shadow-sm flex items-center gap-1">
          <Leaf className="size-3" /> Organic 
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="flex-1 line-clamp-2 font-bold text-gray-800">{product.name}</h3>
          {!product.inStock && (
            <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
          )}
        </div>

        <div className="flex items-center gap-1 mb-1">
          <Star className="size-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-500">Global: {product.rating}</span>
        </div>

        <div className="flex flex-col gap-1 mb-3">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Your Rating</span>
          <div className="flex items-center gap-0.5" onClick={(e) => e.preventDefault()}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`size-4 cursor-pointer transition-colors ${
                  i < userRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-200 hover:text-yellow-400"
                }`}
                onClick={() => onRate?.(i + 1)}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-xl font-bold text-green-700 leading-none">Rs {Math.round(product.discountPrice * 133).toLocaleString()}</span>
                <span className="text-xs font-medium text-gray-400 line-through mt-0.5">Rs {Math.round(product.price * 133).toLocaleString()}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-green-700">Rs {Math.round(product.price * 133).toLocaleString()}</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            disabled={!product.inStock}
            className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingCart className="size-4 mr-1.5" />
            Add
          </Button>
        </div>
      </div>
    </Link>
  );
}

