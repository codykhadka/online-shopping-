import { createBrowserRouter, Outlet, useLocation, useNavigate } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
import { TrackingLayout } from "./pages/TrackingLayout";
import { DeliveryTracking } from "./pages/DeliveryTracking";
import { AdminLayout } from "./pages/AdminLayout";
import { AdminTracker } from "./pages/AdminTracker";
import { AdminProducts } from "./pages/AdminProducts";
import { AdminLogin } from "./pages/AdminLogin";
import { isAdminLoggedIn } from "./utils/adminAuth";
import { LoginPage } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Ratings } from "./pages/Ratings";
import { HowToMake } from "./pages/HowToMake";
import { AdminConfig } from "./pages/AdminConfig";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminMonitoring } from "./pages/AdminMonitoring";
import { Profile } from "./pages/Profile";
import { useOutletContext } from "react-router";
import { Product } from "./data/products";
import { useAuth, AuthProvider } from "./AuthProvider";
import { LoginModal } from "./components/LoginModal";
import { Toaster } from "sonner";
import { useEffect } from "react";

import { SocialData } from "./pages/Root";

interface RouterContext {
  onAddToCart: (product: Product) => void;
  userRatings: { [key: string]: number };
  handleRate: (productId: string, rating: number) => void;
  socialData: SocialData;
  handleToggleLike: (productId: string) => void;
  handleAddComment: (productId: string, text: string, isMotivational?: boolean) => void;
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

export function useRouterContext() {
  return useOutletContext<RouterContext>();
}

import { GoogleOAuthProvider } from "@react-oauth/google";

// Global Layout providing Auth to all children
function GlobalLayout() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Outlet />
        <LoginModal />
        <Toaster position="top-center" />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

// Simple Protected Route Wrapper that triggers modal
function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [user, navigate, location]);

  return <>{children}</>;
}

// Admin Protected Route — redirects to /admin/login if not authenticated
function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAdminLoggedIn()) navigate("/admin/login", { replace: true });
  }, [navigate]);
  if (!isAdminLoggedIn()) return null;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: GlobalLayout,
    children: [
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "/",
        Component: Root,
        children: [
          {
            index: true,
            Component: () => {
              const { onAddToCart, userRatings, handleRate, products, isLoading, error } = useRouterContext();
              return <Home onAddToCart={onAddToCart} userRatings={userRatings} onRate={handleRate} products={products} isLoading={isLoading} error={error} />;
            },
          },
          {
            path: "product/:id",
            Component: () => {
              const { onAddToCart } = useRouterContext();
              return (
                <Protected>
                  <ProductDetail onAddToCart={onAddToCart} />
                </Protected>
              );
            },
          },
          {
            path: "ratings",
            Component: () => {
              const {
                onAddToCart,
                userRatings,
                handleRate,
                socialData,
                handleToggleLike,
                handleAddComment,
                products
              } = useRouterContext();
              return (
                <Ratings
                  onAddToCart={onAddToCart}
                  userRatings={userRatings}
                  onRate={handleRate}
                  socialData={socialData}
                  onToggleLike={handleToggleLike}
                  onAddComment={handleAddComment}
                  products={products}
                />
              );
            },
          },
          {
            path: "how-to-make",
            Component: HowToMake,
          },
          {
            path: "profile",
            Component: () => (
              <Protected>
                <Profile />
              </Protected>
            ),
          },
        ],
      },
      {
        path: "tracking",
        Component: TrackingLayout,
        children: [
          {
            path: ":orderId",
            Component: () => (
              <Protected>
                <DeliveryTracking />
              </Protected>
            ),
          },
        ],
      },
      {
        path: "admin",
        children: [
          {
            path: "login",
            Component: AdminLogin,
          },
          {
            path: "",
            Component: () => <AdminGuard><AdminLayout /></AdminGuard>,
            children: [
              {
                path: "tracking",
                Component: AdminTracker,
              },
              {
                path: "products",
                Component: AdminProducts,
              },
              {
                path: "users",
                Component: AdminUsers,
              },
              {
                path: "monitoring",
                Component: AdminMonitoring,
              },
              {
                path: "config",
                Component: AdminConfig,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);