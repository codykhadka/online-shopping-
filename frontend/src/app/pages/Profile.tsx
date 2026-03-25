import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { Package, User, Phone, Mail, Calendar, Hash, ArrowRight, ShoppingBag, Clock } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import "@/styles/Profile.css";

interface Order {
  id: string;
  customerName: string;
  productName: string;
  price: number;
  status: number;
  timestamp: string;
  address: string;
  phone: string;
}

export function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${user?.id}/orders`);
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load order history.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-icon-wrapper">
          <User size={40} />
        </div>
        <h2 className="unauthorized-title">Unauthorized Access</h2>
        <p className="unauthorized-text">Please sign in to view your profile and order history.</p>
      </div>
    );
  }

  const statusLabels = ["Confirmed", "Prepared", "Shipping", "Completed"];
  const statusColors = ["blue", "yellow", "purple", "green"];

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-card-main"
        >
          {/* Background Decoration */}
          <div className="profile-card-bg-decor"></div>

          <div className="profile-card-content">
            <div className="profile-avatar-container">
              <div className="profile-avatar-inner">
                <User className="text-white" size={48} />
              </div>
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{user.name}</h1>
              <div className="profile-meta-tags">
                <div className="profile-meta-tag">
                  <Hash size={14} className="icon" />
                  {user.username}
                </div>
                <div className="profile-meta-tag green">
                  <Phone size={14} />
                  {user.phone || "No phone added"}
                </div>
                <div className="profile-meta-tag blue">
                  <Calendar size={14} />
                  Joined {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orders Section */}
        <div className="orders-section">
          <div className="orders-header">
            <h3 className="orders-title">
              <ShoppingBag className="icon" size={24} />
              Recent Orders
            </h3>
            <span className="orders-count-badge">
              Total {orders.length}
            </span>
          </div>

          {isLoading ? (
            <div className="orders-loading-state">
              <div className="orders-loading-spinner" />
              <p className="orders-loading-text">Syncing order logs...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty-state">
              <div className="orders-empty-icon-wrapper">
                <Package size={32} />
              </div>
              <h4 className="orders-empty-title">No orders found yet</h4>
              <p className="orders-empty-text">Fill your cart with Danphe Organic goodness and start your healthy journey!</p>
              <button
                onClick={() => window.location.href = '/'}
                className="orders-empty-button"
              >
                Start Shopping
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="order-item-card"
                >
                  <div className="order-item-content">
                    <div className="order-item-icon-wrapper">
                      <Package size={24} className="order-item-icon" />
                    </div>

                    <div className="order-item-details">
                      <div className="order-item-header">
                        <span className="order-item-id-badge">#ORD-{order.id.slice(-6)}</span>
                        <div className={`order-item-status-badge bg-${order.status >= 0 ? statusColors[order.status] : 'neutral-400'}`}>
                          {order.status >= 0 ? statusLabels[order.status] : "Pending Approval"}
                        </div>
                      </div>
                      <h4 className="order-item-product-name">{order.productName}</h4>
                      <div className="order-item-footer">
                        <div className="order-item-footer-item">
                          <Clock size={12} />
                          {new Date(order.timestamp).toLocaleDateString()}
                        </div>
                        <div className="order-item-footer-separator"></div>
                        <div className="order-item-price">
                          {order.price.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block" style={{ display: 'none' }}>
                      <button className="order-item-action-btn">
                        <ArrowRight size={20} className="icon" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
