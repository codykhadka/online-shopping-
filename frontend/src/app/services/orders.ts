import { apiFetch } from "./api";

export interface Order {
  id: string;
  customerName: string;
  productName: string;
  price: number;
  status: number; // -1: Pending, 0: Confirmed, 1: Prepared, 2: Shipping, 3: Completed
  timestamp: string;
  address: string;
  phone: string;
  user_id?: number | null;
}

const LOCAL_KEY = "danphe_organic_orders";

/** Fetch orders from the API, fall back to localStorage on failure */
export const getOrders = async (): Promise<Order[]> => {
  try {
    return await apiFetch<Order[]>("/orders");
  } catch (err) {
    console.warn("Failed to fetch orders from API — using localStorage", err);
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : [];
  }
};

/** Post a new order. Falls back to localStorage if the API is unreachable */
export const saveOrder = async (order: Order): Promise<void> => {
  try {
    const result = await apiFetch<{ success: boolean }>("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
    if (result.success) {
      window.dispatchEvent(new Event("storage"));
      return;
    }
  } catch (err) {
    console.warn("Failed to save order to API — saving locally", err);
  }

  // Local fallback
  const orders = await getOrders();
  localStorage.setItem(LOCAL_KEY, JSON.stringify([order, ...orders]));
  window.dispatchEvent(new Event("storage"));
};

/** Update an order's status, with localStorage fallback */
export const updateOrderStatus = async (
  orderId: string,
  status: number
): Promise<void> => {
  try {
    await apiFetch(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.warn("Failed to update order status on API", err);
  }

  const orders = await getOrders();
  localStorage.setItem(
    LOCAL_KEY,
    JSON.stringify(orders.map((o) => (o.id === orderId ? { ...o, status } : o)))
  );
  window.dispatchEvent(new Event("storage"));
};

export const clearOrders = async (): Promise<void> => {
  localStorage.removeItem(LOCAL_KEY);
  window.dispatchEvent(new Event("storage"));
};
