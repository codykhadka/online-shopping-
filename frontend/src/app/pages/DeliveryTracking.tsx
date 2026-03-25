/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Package, Truck, CheckCircle, Clock, MapPin,
  Phone, User, ChevronRight, Star, AlertCircle,
  MessageSquare, FastForward, ExternalLink
} from "lucide-react";
import { Button } from "../components/ui/button";
import { LiveMap } from "../components/LiveMap";
import "@/styles/DeliveryTracking.css";

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

  // Sync with Backend API
  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
        const response = await fetch(`${apiUrl}/orders`);
        const allOrders = await response.json();
        const currentOrder = allOrders.find((o: any) => o.id === orderId);
        if (currentOrder) {
          setCurrentStep(currentOrder.status + 1);
        }
      } catch (err) {
        console.error("Failed to fetch order status from API", err);
      }
    };

    fetchOrderStatus();

    const interval = setInterval(fetchOrderStatus, 3000); // Poll for status updates

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="tracking-page">
      {/* Pending Banner */}
      {currentStep === 0 && (
        <div className="pending-banner">
          <div className="banner-content">
            <div className="banner-icon-box">
              <Clock className="banner-icon" size={24} />
            </div>
            <div className="banner-text">
              <h3>Awaiting Confirmation</h3>
              <p>The store is reviewing your order details.</p>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="priority-badge">Intake Priority: HIGH</span>
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <div className="hero-stats-grid">
        <StatusCard
          label="Estimated Arrival"
          value="Today, 4:30 PM"
          icon={Clock}
          color="text-blue-600 bg-blue-50" // Keeping inline tailwind for colors passed as props for now as StatusCard uses them directly for className construction in original
        />
        <StatusCard
          label="Shipping From"
          value="Kathmandu Hub"
          icon={MapPin}
          color="text-purple-600 bg-purple-50" // Same here
        />
        <StatusCard
          label="Courier"
          value="Ram Bahadur"
          icon={User}
          color="text-orange-600 bg-orange-50" // Same here
        />
      </div>

      <div className="main-grid">
        {/* Progress Column */}
        <div className="timeline-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="timeline-card">
            <div className="timeline-header">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Delivery Timeline</h2>
                <p className="text-sm text-slate-500 font-medium">Real-time tracking enabled</p>
              </div>
            </div>

            <div className="timeline-container">
              {/* Connector Line */}
              <div className="timeline-line"></div>

              {STEPS.map((step) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="timeline-step">
                    {/* Step Indicator */}
                    <div className={`
                      step-icon-box
                      ${isCompleted ? "step-completed" : isActive ? "step-active" : "step-pending"}
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
            <div className="map-container">
              <LiveMap destination="Baluwatar-04, Kathmandu" />
            </div>
          )}
        </div>

        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Destination Card */}
          <div className="info-card">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-red-500" />
              Delivery Address
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4" style={{ backgroundColor: '#f8fafc' }}>
              <p className="text-sm font-bold text-slate-800">Baluwatar-04, Kathmandu</p>
              <p className="text-xs text-slate-500 mt-1">Near Speaker's House, Nepal</p>
            </div>
            <Button
              variant="outline"
              className="w-full text-xs font-bold gap-2 py-5 rounded-xl"
              onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Baluwatar-04,+Kathmandu', '_blank')}
            >
              <ExternalLink size={14} className="text-slate-400" />
              View on Google Maps
            </Button>
          </div>

          {/* Owner/Support Card */}
          <div className={`info-card transition-all duration-500 ${currentStep === 1 ? "blue" : ""
            }`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${currentStep === 1 ? "text-white" : "text-slate-900"}`}>
              <Phone size={18} />
              Store Contact
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-xl flex items-center justify-center font-bold ${currentStep === 1 ? "bg-white/20" : "bg-slate-100"}`} style={{ width: '2.5rem', height: '2.5rem' }}>
                  AK
                </div>
                <div>
                  <p className="text-sm font-bold">Animesh Karki</p>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${currentStep === 1 ? "text-blue-100" : "text-slate-400"}`}>Store Owner</p>
                </div>
              </div>

              <div className={`p-3 rounded-2xl transition-colors ${currentStep === 1 ? "bg-white/10 border border-white/20" : "bg-slate-50 border border-slate-100"}`} style={{ backgroundColor: currentStep === 1 ? 'rgba(255,255,255,0.1)' : '#f8fafc' }}>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${currentStep === 1 ? "text-blue-100" : "text-slate-400"}`}>Direct Line</p>
                <p className="font-mono font-bold">+977 9766205175</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert('Calling owner...')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${currentStep === 1 ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                    }`}>
                  Call Now
                </button>
                <button className={`p-3 rounded-xl transition-all ${currentStep === 1 ? "bg-white/20" : "bg-slate-100"
                  }`}>
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="help-card group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 bg-blue-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-blue-400" />
              Need Help?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              If there's any issue with your delivery, our support team is available 24/7.
            </p>
            <button className="w-full py-2.5 bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all">
              Chat with Agent
            </button>
          </div>

          <div className="info-card">
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
    <div className="status-card">
      <div className={`status-card-icon ${color}`}>
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
