import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { Header } from "../components/Header";
import { Cart, CartItem } from "../components/Cart";
import { Product } from "../data/products";
import { toast } from "sonner";
import { WelcomePopup } from "../components/WelcomePopup";
import { SponsorsStrip } from "../components/SponsorsStrip";

const CART_KEY = "danphe_organic_cart";

export interface SocialData {
  likes: { [key: string]: { count: number; isLiked: boolean } };
  comments: { [key: string]: { text: string; isMotivational: boolean }[] };
}

export function Root() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart — restored from localStorage on first render
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Initialize state from localStorage
  const [userRatings, setUserRatings] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem("userRatings");
    return saved ? JSON.parse(saved) : {};
  });

  const [socialData, setSocialData] = useState<SocialData>(() => {
    const saved = localStorage.getItem("socialData");
    return saved ? JSON.parse(saved) : { likes: {}, comments: {} };
  });

  useEffect(() => {
    localStorage.setItem("userRatings", JSON.stringify(userRatings));
  }, [userRatings]);

  useEffect(() => {
    localStorage.setItem("socialData", JSON.stringify(socialData));
  }, [socialData]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    setIsLoading(true);
    setError(null);
    fetch(`${apiUrl}/products`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Could not connect to the server. Please make sure the backend is running.");
        setIsLoading(false);
      });
  }, []);


  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        toast.success(`Updated ${product.name} quantity in cart`);
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast.success(`Added ${product.name} to cart`);
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from cart");
  };

  const handleRate = (productId: string, rating: number) => {
    setUserRatings(prev => ({ ...prev, [productId]: rating }));
    toast.success("Thank you for your rating!");
  };

  const handleToggleLike = (productId: string) => {
    setSocialData(prev => {
      const current = prev.likes[productId] || { count: 0, isLiked: false };
      const newIsLiked = !current.isLiked;
      const newCount = newIsLiked ? current.count + 1 : Math.max(0, current.count - 1);
      
      return {
        ...prev,
        likes: {
          ...prev.likes,
          [productId]: { count: newCount, isLiked: newIsLiked }
        }
      };
    });
  };

  const handleAddComment = (productId: string, text: string, isMotivational: boolean = false) => {
    if (!text.trim()) return;
    
    setSocialData(prev => ({
      ...prev,
      comments: {
        ...prev.comments,
        [productId]: [
          ...(prev.comments[productId] || []),
          { text, isMotivational }
        ]
      }
    }));
    toast.success(isMotivational ? "Shared your motivational command!" : "Comment added!");
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        products={products}
      />
      
      <main>
        <Outlet context={{ 
          products,
          isLoading,
          error,
          onAddToCart: handleAddToCart,
          userRatings,
          handleRate,
          socialData,
          handleToggleLike,
          handleAddComment
        }} />
      </main>

      <SponsorsStrip />
      
      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <WelcomePopup />
    </div>
  );
}

