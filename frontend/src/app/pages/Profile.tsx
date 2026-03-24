import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { Package, User, Phone, Mail, Calendar, Hash, ArrowRight, ShoppingBag, Clock } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

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
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-center px-4">
        <div className="size-20 bg-neutral-100 rounded-3xl flex items-center justify-center mb-6 text-neutral-400">
           <User size={40} />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Unauthorized Access</h2>
        <p className="text-neutral-500 max-w-sm mb-8 font-medium">Please sign in to view your profile and order history.</p>
      </div>
    );
  }

  const statusLabels = ["Confirmed", "Prepared", "Shipping", "Completed"];
  const statusColors = ["bg-blue-500", "bg-yellow-500", "bg-purple-500", "bg-green-500"];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-neutral-50/50 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-neutral-200/50 border border-neutral-100 mb-10 overflow-hidden relative"
        >
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-64 bg-green-50 rounded-full blur-3xl opacity-60"></div>
          
          <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="size-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-200 rotate-3 p-1">
               <div className="size-full bg-white/20 rounded-[inherit] flex items-center justify-center backdrop-blur-sm">
                  <User className="text-white" size={48} />
               </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-2 underline decoration-green-500/30 decoration-8 underline-offset-[-2px]">{user.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2 bg-neutral-100 px-4 py-2 rounded-xl text-neutral-600 font-bold text-xs uppercase tracking-widest border border-neutral-200">
                  <Hash size={14} className="text-neutral-400" />
                  {user.username}
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl text-green-700 font-bold text-xs border border-green-100">
                  <Phone size={14} />
                  {user.phone || "No phone added"}
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl text-blue-700 font-bold text-xs border border-blue-100">
                  <Calendar size={14} />
                  Joined {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orders Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-neutral-900 flex items-center gap-3 tracking-tight">
              <ShoppingBag className="text-green-600" size={24} />
              Recent Orders
            </h3>
            <span className="bg-white px-4 py-1.5 rounded-full border border-neutral-100 shadow-sm text-xs font-black text-neutral-500 uppercase tracking-widest">
              Total {orders.length}
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-neutral-100 shadow-sm">
              <div className="size-10 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mb-4" />
              <p className="text-neutral-500 font-bold text-sm tracking-wide">Syncing order logs...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-neutral-100 shadow-sm">
              <div className="size-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-300">
                 <Package size={32} />
              </div>
              <h4 className="text-lg font-black text-neutral-800 mb-2">No orders found yet</h4>
              <p className="text-neutral-500 font-medium mb-8 max-w-xs mx-auto text-sm">Fill your cart with Danphe Organic goodness and start your healthy journey!</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                Start Shopping
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 transition-all group overflow-hidden relative"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                    <div className="size-14 bg-neutral-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-50 transition-colors">
                       <Package size={24} className="text-neutral-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-2.5 py-1 bg-neutral-50 rounded-lg">#ORD-{order.id.slice(-6)}</span>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${order.status >= 0 ? statusColors[order.status] : 'bg-neutral-400'}`}>
                           {order.status >= 0 ? statusLabels[order.status] : "Pending Approval"}
                        </div>
                      </div>
                      <h4 className="text-lg font-black text-neutral-900 leading-none truncate">{order.productName}</h4>
                      <div className="flex items-center gap-4 mt-3">
                         <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-bold">
                            <Clock size={12} />
                            {new Date(order.timestamp).toLocaleDateString()}
                         </div>
                         <div className="size-1 bg-neutral-200 rounded-full"></div>
                         <div className="text-xs font-black text-green-600 uppercase tracking-widest">
                            {order.price.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}
                         </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:block">
                       <button className="size-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 hover:bg-slate-900 hover:text-white transition-all group/btn">
                          <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
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
