import { useState, useEffect } from "react";
import { Settings, Save, Globe, Truck, DollarSign, Store, ShieldCheck, BellRing } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import "@/styles/AdminConfig.css";

export function AdminConfig() {
  const [config, setConfig] = useState<any>({
    store_name: "",
    delivery_charge_standard: "",
    delivery_charge_express: "",
    currency: "Rs.",
  });
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
      const response = await fetch(`${apiUrl}/admin/config`);
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
      const response = await fetch(`${apiUrl}/admin/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        toast.success("System configuration updated successfully");
      }
    } catch (err) {
      toast.error("Failed to save configuration");
    }
  };

  if (loading) return <div className="p-8 text-zinc-500 animate-pulse">Loading System Matrix...</div>;

  return (
    <div className="admin-config-container">
      <div className="header-row">
        <div>
          <h2 className="page-title">
            <Settings className="title-icon" />
            System Configuration
          </h2>
          <p className="page-description">Manage global parameters and store behavior</p>
        </div>
        <Button onClick={handleSave} className="deploy-btn">
          <Save size={18} />
          Deploy Changes
        </Button>
      </div>

      <div className="config-grid">
        {/* General Settings */}
        <div className="config-card">
          <h3 className="section-header">
            <Store size={14} className="section-icon" />
            Identity & Localization
          </h3>

          <div className="input-group">
            <div className="input-wrapper">
              <label className="input-label">Store Nomenclature</label>
              <input
                type="text"
                value={config.store_name}
                onChange={e => setConfig({ ...config, store_name: e.target.value })}
                className="text-input"
                placeholder="e.g. Danphe Organic"
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label">Primary Currency Tag</label>
              <select
                value={config.currency}
                onChange={e => setConfig({ ...config, currency: e.target.value })}
                className="select-input"
              >
                <option value="Rs.">Nepalese Rupee (Rs.)</option>
                <option value="$">US Dollar ($)</option>
                <option value="€">Euro (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logistics Configuration */}
        <div className="config-card">
          <h3 className="section-header">
            <Truck size={14} className="section-icon" />
            Logistics Parameters
          </h3>

          <div className="input-group">
            <div className="input-wrapper">
              <label className="input-label">Standard Delivery Fee</label>
              <div className="currency-icon-wrapper">
                <DollarSign size={14} className="currency-icon" />
                <input
                  type="number"
                  value={config.delivery_charge_standard}
                  onChange={e => setConfig({ ...config, delivery_charge_standard: e.target.value })}
                  className="text-input has-icon"
                />
              </div>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Express Deployment Fee</label>
              <div className="currency-icon-wrapper">
                <DollarSign size={14} className="currency-icon" />
                <input
                  type="number"
                  value={config.delivery_charge_express}
                  onChange={e => setConfig({ ...config, delivery_charge_express: e.target.value })}
                  className="text-input has-icon"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Intelligence */}
        <div className="config-card span-2-cols">
          <h3 className="section-header" style={{ marginBottom: '1.5rem' }}>
            <ShieldCheck size={14} className="section-icon" />
            Advanced Matrix Controls
          </h3>

          <div className="config-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <ConfigToggle
              icon={Globe}
              label="Live Telemetry"
              description="Real-time monitoring of all active logistics"
              enabled={true}
            />
            <ConfigToggle
              icon={BellRing}
              label="Push Notifications"
              description="Instant alerts for admin status changes"
              enabled={true}
            />
            <ConfigToggle
              icon={ShieldCheck}
              label="Auto-Clearance"
              description="Experimental: AI-driven order validation"
              enabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigToggle({ icon: Icon, label, description, enabled }: any) {
  return (
    <div className={`config-toggle ${enabled ? 'enabled' : ''}`}>
      <div className="toggle-icon-box">
        <Icon size={18} />
      </div>
      <div className="toggle-text">
        <p className="toggle-label">{label}</p>
        <p className="toggle-desc">{description}</p>
      </div>
      <div className="toggle-indicator"></div>
    </div>
  );
}
