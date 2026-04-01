/// <reference types="vite/client" />
export interface Order {
  id: string;
  customerName: string;
  productName: string;
  price: number;
  status: number; // -1: Pending, 0: Confirmed, 1: Prepared, 2: Shipping, 3: Completed
  location: string;
  timestamp: string;
  address: string;
  phone: string;
  user_id?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
const ORDERS_KEY = "danphe_organic_orders";

export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_URL}/orders`);
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch orders from API, falling back to local storage", err);
    const saved = localStorage.getItem(ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  }
};

export const saveOrder = async (order: Order) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const result = await response.json();
    if (result.success) {
      window.dispatchEvent(new Event('storage'));
      return result;
    }
  } catch (err) {
    console.error("Failed to save order to API", err);
  }
  
  // Local fallback for UI reactivity
  const orders = await getOrders();
  const updatedOrders = [order, ...orders];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  localStorage.setItem(`order_status_${order.id}`, order.status.toString());
  window.dispatchEvent(new Event('storage'));
};

export const updateOrderStatus = async (orderId: string, status: number, location?: string) => {
  try {
    await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, location }),
    });
  } catch (err) {
    console.error("Failed to update order status on API", err);
  }

  const orders = await getOrders();
  const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  localStorage.setItem(`order_status_${orderId}`, status.toString());
  window.dispatchEvent(new Event('storage'));
};

export const clearOrders = async () => {
  const orders = await getOrders();
  orders.forEach(o => {
    localStorage.removeItem(`order_status_${o.id}`);
  });
  localStorage.removeItem(ORDERS_KEY);
  window.dispatchEvent(new Event('storage'));
};
