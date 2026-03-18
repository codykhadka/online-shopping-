export interface Order {
  id: string;
  customerName: string;
  productName: string;
  price: number;
  status: number; // -1: Pending, 0: Confirmed, 1: Prepared, 2: Shipping, 3: Completed
  timestamp: string;
  address: string;
  phone: string;
}

const ORDERS_KEY = "danphe_organic_orders";

export const getOrders = (): Order[] => {
  const saved = localStorage.getItem(ORDERS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveOrder = (order: Order) => {
  const orders = getOrders();
  const updatedOrders = [order, ...orders];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  // Also set the specific status key for the tracker to pick up
  localStorage.setItem(`order_status_${order.id}`, order.status.toString());
  window.dispatchEvent(new Event('storage'));
};

export const updateOrderStatus = (orderId: string, status: number) => {
  const orders = getOrders();
  const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  localStorage.setItem(`order_status_${orderId}`, status.toString());
  window.dispatchEvent(new Event('storage'));
};

export const clearOrders = () => {
  const orders = getOrders();
  orders.forEach(o => {
    localStorage.removeItem(`order_status_${o.id}`);
  });
  localStorage.removeItem(ORDERS_KEY);
  window.dispatchEvent(new Event('storage'));
};
