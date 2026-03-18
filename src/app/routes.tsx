import { createBrowserRouter, Outlet } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
import { TrackingLayout } from "./pages/TrackingLayout";
import { DeliveryTracking } from "./pages/DeliveryTracking";
import { AdminLayout } from "./pages/AdminLayout";
import { AdminTracker } from "./pages/AdminTracker";
import { NotFound } from "./pages/NotFound";
import { useOutletContext } from "react-router";
import { Product } from "./data/products";
import { useAuth, AuthProvider } from "./AuthProvider";
import { LoginModal } from "./components/LoginModal";
import { Toaster } from "sonner";
import { useEffect } from "react";

interface RouterContext {
  onAddToCart: (product: Product) => void;
}

export function useRouterContext() {
  return useOutletContext<RouterContext>();
}

// Global Layout providing Auth to all children
function GlobalLayout() {
  return (
    <AuthProvider>
      <Outlet />
      <LoginModal />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}

// Simple Protected Route Wrapper that triggers modal
function Protected({ children }: { children: React.ReactNode }) {
  const { user, openLoginModal } = useAuth();
  
  useEffect(() => {
    if (!user) {
      openLoginModal();
    }
  }, [user, openLoginModal]);

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: GlobalLayout,
    children: [
      {
        path: "/",
        Component: Root,
        children: [
          {
            index: true,
            Component: () => {
              const { onAddToCart } = useRouterContext();
              return <Home onAddToCart={onAddToCart} />;
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
        ],
      },
      {
        path: "/tracking",
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
        path: "/admin",
        Component: AdminLayout,
        children: [
          {
            path: "tracking",
            Component: AdminTracker,
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