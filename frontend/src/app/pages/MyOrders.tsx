import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { Link } from "react-router";
import { Package, Clock, Truck, CheckCircle, ExternalLink, ArrowLeft, Loader2, MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import "@/styles/MyOrders.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const STEPS = [
  { id: 0, label: "Pending", icon: Clock, color: "amber" },
  { id: 1, label: "Confirmed", icon: CheckCircle, color: "blue" },
  { id: 2, label: "Prepared", icon: Package, color: "indigo" },
  { id: 3, label: "Out for Delivery", icon: Truck, color: "purple" },
  { id: 4, label: "Delivered", icon: CheckCircle, color: "emerald" }
];

export function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/users/${user.id}/orders`)
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-container">
        {/* Header */}
        <div className="page-header">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Your Orders</h1>
            <p className="page-subtitle">Manage and track your recent purchases</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders-card">
            <div className="empty-orders-icon-wrapper">
              <Package className="empty-orders-icon" />
            </div>
            <h3 className="empty-orders-title">No orders yet</h3>
            <p className="empty-orders-text">Looks like you haven't placed any orders with us yet.</p>
            <Link to="/">
              <Button className="start-shopping-btn">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const stepIndex = Math.max(0, Math.min(4, order.status + 1));
              const step = STEPS[stepIndex];
              const StepIcon = step.icon;

              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-content">
                    {/* Left: Info */}
                    <div className="order-info">
                      <div className={`order-icon-wrapper ${step.color}`}>
                        <StepIcon className="order-icon" />
                      </div>
                      <div>
                        <div className="order-title-wrapper">
                          <h3 className="order-product-name">{order.productName || "Various Items"}</h3>
                        </div>
                        <p className="order-id">Order #{order.id}</p>
                        <p className="order-timestamp">{order.timestamp}</p>
                        <div className="order-location mt-1 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <MapPin size={12} className="text-red-400" />
                          {order.location || "Sorting Hub"}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="order-actions">
                      <div className="order-price-status">
                        <span className="order-price">Rs {order.price.toLocaleString()}</span>
                        <div className="order-status-badge">
                          <span className={`status-dot ${step.color}`} />
                          <span className="status-label">{step.label}</span>
                        </div>
                      </div>

                      <Link to={`/tracking/${order.id}`} className="track-link">
                        <Button variant="outline" className="track-button">
                          Track Delivery
                          <ExternalLink className="track-icon" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
