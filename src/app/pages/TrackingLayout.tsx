import { Outlet, useNavigate, useParams, Link } from "react-router";
import { ArrowLeft, Package, ShieldCheck, Info } from "lucide-react";

export function TrackingLayout() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      {/* Simplified, focused header */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/")}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
              title="Back to Shop"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">Track Order</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">#{orderId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
            <ShieldCheck size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">Verified Shipment</span>
          </div>
        </div>
      </header>

      {/* Main Track & Trace Content */}
      <main className="container mx-auto py-8 px-4 max-w-5xl">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="py-10 border-t border-slate-200 mt-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="size-6 rounded bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">D</div>
            <span className="text-xs font-bold tracking-tight">Danphe Organic</span>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
            <Link to="#" className="hover:text-slate-900 transition-colors">Help Center</Link>
            <Link to="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full outline outline-1 outline-slate-200">
            <Info size={12} />
            SECURE TRACKING PROTOCOL ACTIVE
          </div>
        </div>
      </footer>
    </div>
  );
}
