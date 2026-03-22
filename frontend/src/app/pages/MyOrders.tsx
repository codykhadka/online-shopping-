import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { Link } from "react-router";
import { Package, Clock, Truck, CheckCircle, ExternalLink, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const STEPS = [
  { id: 0, label: "Pending", icon: Clock, color: "text-amber-600 bg-amber-50" },
  { id: 1, label: "Confirmed", icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
  { id: 2, label: "Prepared", icon: Package, color: "text-indigo-600 bg-indigo-50" },
  { id: 3, label: "Out for Delivery", icon: Truck, color: "text-purple-600 bg-purple-50" },
  { id: 4, label: "Delivered", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" }
];

export function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/orders`)
      .then(res => res.json())
      .then(data => {
        // Filter backend orders by the logged in user's name
        const userOrders = data.filter((o: any) => o.customerName === user.name);
        // Sort descending
        userOrders.reverse();
        setOrders(userOrders);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="size-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Your Orders</h1>
            <p className="text-sm font-medium text-gray-500">Manage and track your recent purchases</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="size-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders with us yet.</p>
            <Link to="/">
              <Button className="rounded-xl px-8 font-black bg-green-600 hover:bg-green-500">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const stepIndex = Math.max(0, Math.min(4, order.status + 1));
              const step = STEPS[stepIndex];
              const StepIcon = step.icon;

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                    {/* Left: Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`shrink-0 size-12 rounded-xl flex items-center justify-center ${step.color}`}>
                        <StepIcon className="size-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900">{order.productName || "Various Items"}</h3>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Order #{order.id}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{order.timestamp}</p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0 gap-3 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                      <div className="flex items-center justify-between sm:justify-end w-full gap-4">
                        <span className="text-lg font-black text-green-700">Rs {order.price.toLocaleString()}</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
                          <span className={`size-2 rounded-full ${step.color.split(' ')[0].replace('text', 'bg')}`} />
                          <span className="text-xs font-bold text-gray-600">{step.label}</span>
                        </div>
                      </div>
                      
                      <Link to={`/tracking/${order.id}`} className="w-full">
                        <Button variant="outline" className="w-full gap-2 rounded-xl font-bold hover:bg-gray-50 border-gray-200">
                          Track Delivery
                          <ExternalLink className="size-4" />
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
