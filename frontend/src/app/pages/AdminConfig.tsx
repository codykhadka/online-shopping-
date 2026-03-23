import { useState, useEffect } from "react";
import { Settings, Save, Globe, Truck, DollarSign, Store, ShieldCheck, BellRing } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

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
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
            <Settings className="text-blue-500" />
            System Configuration
          </h2>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Manage global parameters and store behavior</p>
        </div>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
          <Save size={18} />
          Deploy Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Store size={14} className="text-blue-500" />
            Identity & Localization
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Store Nomenclature</label>
              <input 
                type="text" 
                value={config.store_name}
                onChange={e => setConfig({...config, store_name: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-blue-500/50 transition-colors"
                placeholder="e.g. Danphe Organic"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Primary Currency Tag</label>
              <select 
                value={config.currency}
                onChange={e => setConfig({...config, currency: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-blue-500/50 transition-colors appearance-none"
              >
                <option value="Rs.">Nepalese Rupee (Rs.)</option>
                <option value="$">US Dollar ($)</option>
                <option value="€">Euro (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logistics Configuration */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Truck size={14} className="text-blue-500" />
            Logistics Parameters
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Standard Delivery Fee</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input 
                  type="number" 
                  value={config.delivery_charge_standard}
                  onChange={e => setConfig({...config, delivery_charge_standard: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Express Deployment Fee</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input 
                  type="number" 
                  value={config.delivery_charge_express}
                  onChange={e => setConfig({...config, delivery_charge_express: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Intelligence */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:col-span-2 shadow-2xl">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
            <ShieldCheck size={14} className="text-blue-500" />
            Advanced Matrix Controls
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    <div className="flex gap-4 items-start p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 hover:border-blue-500/20 transition-all cursor-pointer group">
      <div className={`p-2 rounded-xl transition-colors ${enabled ? "bg-blue-500/10 text-blue-500" : "bg-zinc-800 text-zinc-600"}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className={`text-xs font-bold ${enabled ? "text-zinc-100" : "text-zinc-500"}`}>{label}</p>
        <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className={`size-4 rounded-full border-2 mt-1 shrink-0 transition-all ${enabled ? "border-blue-500 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "border-zinc-700"}`}></div>
    </div>
  );
}
