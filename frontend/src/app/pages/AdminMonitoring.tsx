import { Activity, MapPin, Truck, AlertTriangle, Cpu, Globe } from "lucide-react";
import { LiveMap } from "../components/LiveMap";

export function AdminMonitoring() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
            <Activity className="text-emerald-500" />
            Live Fleet Monitoring
          </h2>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Real-time geospatial telemetry for active deployments</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="size-2 bg-emerald-500 rounded-full pulse"></div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Link</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map View */}
        <div className="lg:col-span-3">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative h-[600px] group">
            <div className="absolute inset-0 z-0">
               <LiveMap destination="Kathmandu Valley" />
            </div>
            
            {/* Map Overlays */}
            <div className="absolute top-6 left-6 z-10 space-y-3">
              <OverlayCard icon={Truck} label="In-Transit" value="12" color="bg-blue-500 shadow-blue-500/40" />
              <OverlayCard icon={AlertTriangle} label="Delayed" value="2" color="bg-amber-500 shadow-amber-500/40" />
            </div>

            <div className="absolute bottom-6 right-6 z-10">
              <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-4 rounded-2xl flex items-center gap-6 shadow-2xl">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-blue-500 rounded-full"></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Deployment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Hub Station</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Side Panel */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-[10px] font-black text-zinc-100 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Cpu size={14} className="text-blue-500" />
              Signal Stream
            </h3>
            <div className="space-y-4">
              <SignalItem time="10:45:02" caller="AGENT-042" action="Pickup Confirmed" order="#ORD-523" />
              <SignalItem time="10:43:12" caller="SYSTEM" action="Route Optimized" order="#ORD-112" />
              <SignalItem time="10:40:55" caller="AGENT-018" action="Deliver Completed" order="#ORD-889" />
              <SignalItem time="10:35:22" caller="AGENT-007" action="Entering Hub" order="N/A" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 shadow-2xl">
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Globe size={14} /> Global Status
            </p>
            <p className="text-xl font-bold text-white tracking-tight">System Optimal</p>
            <p className="text-xs text-blue-400 mt-2 leading-relaxed opacity-70">All logistics nodes are currently operating within specified performance parameters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverlayCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 p-3 rounded-2xl flex items-center gap-4 w-40 animate-in slide-in-from-left-4 duration-300 shadow-2xl">
      <div className={`size-10 rounded-xl flex items-center justify-center text-white ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-bold text-zinc-100">{value}</p>
      </div>
    </div>
  );
}

function SignalItem({ time, caller, action, order }: any) {
  return (
    <div className="border-l border-zinc-800 pl-4 py-1 relative">
      <div className="absolute top-2 -left-[5px] size-2 bg-blue-500/20 border border-blue-500/40 rounded-full"></div>
      <p className="text-[9px] font-mono text-zinc-600">{time}</p>
      <p className="text-[10px] font-bold text-zinc-300 mt-1">{caller}</p>
      <p className="text-[10px] text-zinc-500">{action} <span className="text-blue-500">{order}</span></p>
    </div>
  );
}
