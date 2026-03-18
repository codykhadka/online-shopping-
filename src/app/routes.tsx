import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
import { DeliveryTracking } from "./pages/DeliveryTracking";
import { NotFound } from "./pages/NotFound";
import { useOutletContext } from "react-router";
import { Product } from "./data/products";

interface RouterContext {
  onAddToCart: (product: Product) => void;
}

export function useRouterContext() {
  return useOutletContext<RouterContext>();
}

export const router = createBrowserRouter([
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
          return <ProductDetail onAddToCart={onAddToCart} />;
        },
      },
      {
        path: "tracking/:orderId",
        Component: DeliveryTracking,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);