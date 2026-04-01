import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Cart, CartItem } from "../components/Cart";
import { Product } from "../data/products";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { useAuth } from "../AuthProvider";
import { getAuthToken } from "../utils/auth";
import { WelcomePopup } from "../components/WelcomePopup";
import { SponsorsStrip } from "../components/SponsorsStrip";

const BASE_CART_KEY = "danphe_organic_cart";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface SocialData {
  likes: { [key: string]: { count: number; isLiked: boolean } };
  comments: { [key: string]: { text: string; isMotivational: boolean; userName?: string }[] };
}

export function Root() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const [socialData, setSocialData] = useState<SocialData>({ likes: {}, comments: {} });
  const [userCount, setUserCount] = useState<number>(0);
  const [visitorCount, setVisitorCount] = useState<number>(1);

  // Unique cart key for each user to prevent cross-account item visibility
  const CART_KEY = user ? `${BASE_CART_KEY}_${user.id}` : `${BASE_CART_KEY}_guest`;

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load user-specific cart whenever the user changes (login/logout)
  useEffect(() => {
    const syncCart = async () => {
      const token = getAuthToken();
      if (user && token) {
        // If logged in, fetch from DB
        try {
          const res = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            // Transform DB items to match CartItem interface if necessary
            const dbItems = data.cart.map((item: any) => ({
              id: item.productId,
              name: item.name,
              image: item.image,
              price: item.price,
              quantity: item.quantity
            }));
            setCartItems(dbItems);
          }
        } catch (err) {
          console.error("Failed to fetch cart from DB:", err);
        }
      } else {
        // If guest, fetch from localStorage
        try {
          const saved = localStorage.getItem(CART_KEY);
          setCartItems(saved ? JSON.parse(saved) : []);
        } catch {
          setCartItems([]);
        }
      }
    };

    syncCart();
  }, [user, CART_KEY]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!user && CART_KEY.endsWith('_guest')) {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, user, CART_KEY]);

  // Handle Logout case — if user is null, we can also clear the guest cart if requested, 
  // but usually isolation means just switching keys. The user specifically asked to "remove" 
  // on logout, which imply clearing the current session.
  useEffect(() => {
    const handleAuthChange = () => {
       // This triggers when AuthProvider dispatches 'auth-change'
       // We don't necessarily need to clear here if we use user-specific keys,
       // but it's good for a clean UI reset.
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Initialize state from localStorage
  const [userRatings, setUserRatings] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem("userRatings");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("userRatings", JSON.stringify(userRatings));
  }, [userRatings]);

  // Load all comments from backend on mount
  useEffect(() => {
    const loadComments = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        const prods = await res.json();
        const allComments: SocialData['comments'] = {};
        await Promise.all(prods.map(async (p: any) => {
          const r = await fetch(`${API_URL}/products/${p.id}/comments`);
          if (!r.ok) {
            allComments[p.id] = [];
            return;
          }
          const contentType = r.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
             const data = await r.json();
             allComments[p.id] = data.map((c: any) => ({ text: c.text, isMotivational: c.isMotivational, userName: c.user_name }));
          } else {
             allComments[p.id] = [];
          }
        }));
        setSocialData(prev => ({ ...prev, comments: allComments }));
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    };
    loadComments();
  }, []);

  // Synchronize user interactions (likes/ratings) from backend when logged in
  useEffect(() => {
    const fetchInteractions = async () => {
      const token = getAuthToken();
      if (user && token) {
        try {
          const res = await fetch(`${API_URL}/user/interactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            // Update socialData liked status
            setSocialData(prev => {
              const newLikes = { ...prev.likes };
              data.likes.forEach((id: string) => {
                newLikes[id] = { ...newLikes[id], isLiked: true }; 
              });
              return { ...prev, likes: newLikes };
            });

            // Update userRatings
            setUserRatings(data.ratings || {});
          }
        } catch (err) {
          console.error("Failed to fetch user interactions:", err);
        }
      }
    };

    fetchInteractions();
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_URL}/products`)
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

    // Real-time synchronization
    const serverUrl = API_URL.replace(/\/api\/?$/, "");
    const socket = io(serverUrl);
    
    socket.on("product_likes_updated", (data: { id: string, likes: number }) => {
      setProducts(prev => prev.map(p => p.id === data.id ? { ...p, likes: data.likes } : p));
      // Also sync user's own like count in socialData if it exists
      setSocialData(prev => {
        if (!prev.likes[data.id]) return prev;
        return {
          ...prev,
          likes: { ...prev.likes, [data.id]: { ...prev.likes[data.id], count: data.likes } }
        };
      });
    });

    socket.on("product_rating_updated", (data: { id: string, rating: number, ratingCount: number }) => {
      setProducts(prev => prev.map(p => p.id === data.id ? { ...p, ratingAverage: data.rating, ratingCount: data.ratingCount } : p));
    });

    socket.on("visitor_count_update", (data: { count: number }) => {
      setVisitorCount(data.count);
    });

    // Fetch total registered users count
    fetch(`${API_URL}/users/count`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setUserCount(data.count);
      })
      .catch(err => console.error("Failed to fetch user count:", err));

    return () => {
      socket.disconnect();
    };
  }, []);


  const handleAddToCart = async (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    toast.success(`Added ${product.name} to cart`);

    const token = getAuthToken();
    if (user && token) {
      try {
        await fetch(`${API_URL}/cart/add`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity: 1
          })
        });
      } catch (err) {
        console.error("Failed to sync cart add:", err);
      }
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );

    const token = getAuthToken();
    if (user && token) {
      try {
        await fetch(`${API_URL}/cart/update`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ productId: id, quantity })
        });
      } catch (err) {
        console.error("Failed to sync cart update:", err);
      }
    }
  };

  const handleRemoveItem = async (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from cart");

    const token = getAuthToken();
    if (user && token) {
      try {
        await fetch(`${API_URL}/cart/remove/${id}`, {
          method: "DELETE",
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to sync cart removal:", err);
      }
    }
  };

  const handleRate = async (productId: string, rating: number) => {
    const location = window.location.pathname;
    if (location !== "/") {
      toast.error("Ratings are only allowed on the Home page");
      return;
    }

    if (userRatings[productId]) {
      toast.error("You have already rated this product");
      return;
    }

    const token = getAuthToken();
    if (!user || !token) {
      toast.error("Please login to rate products");
      return;
    }

    setUserRatings(prev => ({ ...prev, [productId]: rating }));
    toast.success("Thank you for your rating!");

    try {
      const res = await fetch(`${API_URL}/products/${productId}/rate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ value: rating })
      });
      const data = await res.json();
      if (!data.success) {
         toast.error(data.error || "Failed to submit rating");
         // Revert local state if server failed
         setUserRatings(prev => {
            const next = { ...prev };
            delete next[productId];
            return next;
         });
      }
    } catch (err) {
      console.error("Failed to sync rating:", err);
    }
  };

  const handleToggleLike = async (productId: string) => {
    const location = window.location.pathname;
    if (location !== "/") {
      toast.error("Likes are only allowed on the Home page");
      return;
    }

    if (socialData.likes[productId]?.isLiked) {
      toast.error("You have already liked this product");
      return;
    }

    const token = getAuthToken();
    if (!user || !token) {
      toast.error("Please login to like products");
      return;
    }

    let nextLiked = true;
    setSocialData(prev => {
      const current = prev.likes[productId] || { count: 0, isLiked: false };
      return {
        ...prev,
        likes: {
          ...prev.likes,
          [productId]: { ...current, isLiked: nextLiked }
        }
      };
    });

    // Optimistic Update for global products count
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, likes: (p.likes || 0) + 1 } : p
    ));

    toast.success("Loved it! Product liked.");

    try {
      const res = await fetch(`${API_URL}/products/${productId}/toggle-like`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setSocialData(prev => {
          const current = prev.likes[productId];
          return { ...prev, likes: { ...prev.likes, [productId]: { ...current, isLiked: false } } };
        });
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, likes: (p.likes || 1) - 1 } : p));
      }
    } catch (err) {
      console.error("Failed to sync like:", err);
    }
  };

  const handleAddComment = async (productId: string, text: string, isMotivational: boolean = false) => {
    if (!text.trim()) return;
    const userName = user?.name || 'Anonymous';
    const userId = user?.id || 'guest';
    try {
      const res = await fetch(`${API_URL}/products/${productId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, user_name: userName, text, isMotivational })
      });
      const data = await res.json();
      if (data.success) {
        setSocialData(prev => ({
          ...prev,
          comments: {
            ...prev.comments,
            [productId]: [...(prev.comments[productId] || []), { text, isMotivational, userName }]
          }
        }));
        toast.success(isMotivational ? 'Motivational thought shared!' : 'Comment added!');
      } else {
        console.error('Comment save failed:', data.error);
        // Still update UI optimistically so user sees their comment
        setSocialData(prev => ({
          ...prev,
          comments: {
            ...prev.comments,
            [productId]: [...(prev.comments[productId] || []), { text, isMotivational, userName }]
          }
        }));
        toast.success(isMotivational ? 'Motivational thought shared!' : 'Comment added!');
      }
    } catch (err) {
      console.error('Comment fetch error:', err);
      // Fallback: save to local state so comment still shows
      const userName = user?.name || 'Anonymous';
      setSocialData(prev => ({
        ...prev,
        comments: {
          ...prev.comments,
          [productId]: [...(prev.comments[productId] || []), { text, isMotivational, userName }]
        }
      }));
      toast.success(isMotivational ? 'Motivational thought shared!' : 'Comment added!');
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        products={products}
        userCount={userCount}
        visitorCount={visitorCount}
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
          handleAddComment,
          userCount,
          visitorCount
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

      <WelcomePopup userCount={userCount} visitorCount={visitorCount} />
    </div>
  );
}

