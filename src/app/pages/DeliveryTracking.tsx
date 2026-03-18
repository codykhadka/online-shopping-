import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  Package, Truck, CheckCircle, Clock, MapPin, 
  Phone, User, ChevronRight, Star, AlertCircle,
  MessageSquare, FastForward, ExternalLink
} from "lucide-react";
import { Button } from "../components/ui/button";
import { LiveMap } from "../components/LiveMap";

const STEPS = [
  { id: 1, label: "Order Confirmed", icon: CheckCircle, description: "Your order has been confirmed and is being processed." },
  { id: 2, label: "Package Prepared", icon: Package, description: "Your items have been packed and are ready for pickup." },
  { id: 3, label: "Out for Delivery", icon: Truck, description: "Our courier is on the way to your location." },
  { id: 4, label: "Delivered", icon: CheckCircle, description: "Order successfully delivered. Enjoy your purchase!" }
];

export function DeliveryTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0 means Pending

  // Sync with localStorage (Admin status updates)
  useEffect(() => {
    const savedStatus = localStorage.getItem(`order_status_${orderId}`);
    if (savedStatus !== null) {
      setCurrentStep(parseInt(savedStatus, 10) + 1);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `order_status_${orderId}` && e.newValue !== null) {
        setCurrentStep(parseInt(e.newValue, 10) + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      const saved = localStorage.getItem(`order_status_${orderId}`);
      if (saved) {
        const step = parseInt(saved, 10) + 1;
        if (step !== currentStep) {
          setCurrentStep(step);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [orderId, currentStep]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Pending Banner */}
      {currentStep === 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
              <Clock className="text-white animate-pulse" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 tracking-tight">Awaiting Confirmation</h3>
              <p className="text-sm text-slate-500 font-medium">The store is reviewing your order details.</p>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-3 py-1 rounded-full">Intake Priority: HIGH</span>
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard 
          label="Estimated Arrival" 
          value="Today, 4:30 PM" 
          icon={Clock} 
          color="text-blue-600 bg-blue-50"
        />
        <StatusCard 
          label="Shipping From" 
          value="Kathmandu Hub" 
          icon={MapPin} 
          color="text-purple-600 bg-purple-50"
        />
        <StatusCard 
          label="Courier" 
          value="Ram Bahadur" 
          icon={User} 
          color="text-orange-600 bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Delivery Timeline</h2>
                <p className="text-sm text-slate-500 font-medium">Real-time tracking enabled</p>
              </div>
            </div>

            <div className="p-8 space-y-8 relative">
              {/* Connector Line */}
              <div className="absolute left-[3.25rem] top-10 bottom-10 w-0.5 bg-slate-100"></div>
              
              {STEPS.map((step) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="relative flex gap-6 group">
                    {/* Step Indicator */}
                    <div className={`
                      relative z-10 size-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2
                      ${isCompleted ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-200 scale-110" : 
                        isActive ? "bg-white border-blue-600 text-blue-600 shadow-xl shadow-blue-100 scale-125 ring-4 ring-blue-50" : 
                        "bg-white border-slate-200 text-slate-300"}
                    `}>
                      <Icon size={isCompleted ? 18 : 22} className={isCompleted ? "text-white" : ""} />
                    </div>

                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-bold transition-colors ${isActive ? "text-blue-600 text-lg" : isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                          {step.label}
                        </h3>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Completed</span>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${isActive ? "text-slate-600" : "text-slate-400"}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Map Simulation Area */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative h-80 border-4 border-white">
               <LiveMap destination="Baluwatar-04, Kathmandu" />
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          {/* Destination Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-red-500" />
              Delivery Address
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
              <p className="text-sm font-bold text-slate-800">Baluwatar-04, Kathmandu</p>
              <p className="text-xs text-slate-500 mt-1">Near Speaker's House, Nepal</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full text-xs font-bold gap-2 py-5 rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Baluwatar-04,+Kathmandu', '_blank')}
            >
              <ExternalLink size={14} className="text-slate-400" />
              View on Google Maps
            </Button>
          </div>

          {/* Owner/Support Card */}
          <div className={`p-6 rounded-3xl border transition-all duration-500 ${
            currentStep === 1 
              ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-200" 
              : "bg-white border-slate-200 text-slate-800"
          }`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${currentStep === 1 ? "text-white" : "text-slate-900"}`}>
              <Phone size={18} />
              Store Contact
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-xl flex items-center justify-center font-bold ${currentStep === 1 ? "bg-white/20" : "bg-slate-100"}`}>
                  AK
                </div>
                <div>
                  <p className="text-sm font-bold">Animesh Karki</p>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${currentStep === 1 ? "text-blue-100" : "text-slate-400"}`}>Store Owner</p>
                </div>
              </div>

              <div className={`p-3 rounded-2xl transition-colors ${currentStep === 1 ? "bg-white/10 border border-white/20" : "bg-slate-50 border border-slate-100"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${currentStep === 1 ? "text-blue-100" : "text-slate-400"}`}>Direct Line</p>
                <p className="font-mono font-bold">+977 9841234567</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => alert('Calling owner...')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
                  currentStep === 1 ? "bg-white text-blue-600 hover:scale-[1.02]" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}>
                  Call Now
                </button>
                <button className={`p-3 rounded-xl transition-all ${
                  currentStep === 1 ? "bg-white/20 hover:bg-white/30" : "bg-slate-100 hover:bg-slate-200"
                }`}>
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 bg-blue-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-blue-400" />
              Need Help?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              If there's any issue with your delivery, our support team is available 24/7.
            </p>
            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all">
              Chat with Agent
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Quality Assurance</h3>
            <div className="space-y-3">
              <QualityItem label="Fragile Handling" checked />
              <QualityItem label="Cold Chain" checked />
              <QualityItem label="Sterilized Packing" checked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
      <div className={`size-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function QualityItem({ label, checked }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={`size-4 rounded-full flex items-center justify-center ${checked ? "bg-green-100 text-green-600" : "bg-slate-100"}`}>
        <Star size={10} fill={checked ? "currentColor" : "none"} />
      </div>
      <span className="text-xs font-medium text-slate-600">{label}</span>
    </div>
  );
}
