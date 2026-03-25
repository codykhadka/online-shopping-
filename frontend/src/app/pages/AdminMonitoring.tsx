import { Activity, MapPin, Truck, AlertTriangle, Cpu, Globe } from "lucide-react";
import { LiveMap } from "../components/LiveMap";
import "@/styles/AdminMonitoring.css";

export function AdminMonitoring() {
  return (
    <div className="admin-monitoring-container">
      <div className="am-header">
        <div>
          <h2 className="am-title">
            <Activity />
            Live Fleet Monitoring
          </h2>
          <p className="am-subtitle">Real-time geospatial telemetry for active deployments</p>
        </div>
        <div>
          <div className="am-active-badge">
            <div className="am-pulse-dot"></div>
            <span className="am-active-text">Active Link</span>
          </div>
        </div>
      </div>

      <div className="am-grid">
        {/* Main Map View */}
        <div className="am-map-section">
          <div className="am-map-card">
            <div className="am-map-live">
              <LiveMap destination="Kathmandu Valley" />
            </div>

            {/* Map Overlays */}
            <div className="am-overlays">
              <OverlayCard icon={Truck} label="In-Transit" value="12" type="blue" />
              <OverlayCard icon={AlertTriangle} label="Delayed" value="2" type="amber" />
            </div>

            <div className="am-legend">
              <div className="am-legend-box">
                <div className="am-legend-item">
                  <div className="am-legend-dot blue"></div>
                  <span className="am-legend-text">Deployment</span>
                </div>
                <div className="am-legend-item">
                  <div className="am-legend-dot emerald"></div>
                  <span className="am-legend-text">Hub Station</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Side Panel */}
        <div className="am-sidebar">
          <div className="am-signal-card">
            <h3 className="am-card-title">
              <Cpu size={14} />
              Signal Stream
            </h3>
            <div className="am-signal-list">
              <SignalItem time="10:45:02" caller="AGENT-042" action="Pickup Confirmed" order="#ORD-523" />
              <SignalItem time="10:43:12" caller="SYSTEM" action="Route Optimized" order="#ORD-112" />
              <SignalItem time="10:40:55" caller="AGENT-018" action="Deliver Completed" order="#ORD-889" />
              <SignalItem time="10:35:22" caller="AGENT-007" action="Entering Hub" order="N/A" />
            </div>
          </div>

          <div className="am-status-card">
            <p className="am-status-header">
              <Globe size={14} /> Global Status
            </p>
            <p className="am-status-value">System Optimal</p>
            <p className="am-status-desc">All logistics nodes are currently operating within specified performance parameters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverlayCard({ icon: Icon, label, value, type }: any) {
  return (
    <div className="overlay-card">
      <div className={`overlay-icon-box ${type}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="overlay-label">{label}</p>
        <p className="overlay-value">{value}</p>
      </div>
    </div>
  );
}

function SignalItem({ time, caller, action, order }: any) {
  return (
    <div className="signal-item">
      <div className="signal-dot"></div>
      <p className="signal-time">{time}</p>
      <p className="signal-caller">{caller}</p>
      <p className="signal-action">{action} <span className="signal-order">{order}</span></p>
    </div>
  );
}
