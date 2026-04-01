import { Outlet, useNavigate, useParams, Link } from "react-router";
import { ArrowLeft, Package, ShieldCheck, Info } from "lucide-react";
import "@/styles/TrackingLayout.css";

export function TrackingLayout() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  return (
    <div className="tracking-layout">
      {/* Simplified, focused header */}
      <header className="tracking-header">
        <div className="header-container">
          <div className="header-left">
            <button
              onClick={() => navigate("/")}
              className="back-button"
              title="Back to Shop"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="header-divider"></div>
            <div className="header-info">
              <h1 className="header-title">Track Order</h1>
              <p className="order-id-label">#{orderId}</p>
            </div>
          </div>

          <div className="verified-badge">
            <ShieldCheck size={14} />
            <span className="verified-text">Verified Shipment</span>
          </div>
        </div>
      </header>

      {/* Main Track & Trace Content */}
      <main className="tracking-main">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="tracking-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand-icon">D</div>
            <span className="brand-name">Danphe Organic</span>
          </div>

          <div className="footer-links">
            <Link to="#" className="footer-link">Help Center</Link>
            <Link to="#" className="footer-link">Privacy Policy</Link>
            <Link to="#" className="footer-link">Terms of Service</Link>
          </div>

          <div className="secure-tracking-badge">
            <Info size={12} />
            SECURE TRACKING PROTOCOL ACTIVE
          </div>
        </div>
      </footer>
    </div>
  );
}
