import { useState, useEffect, useMemo } from "react";
import { 
  Package, Truck, CheckCircle, Clock, ChevronRight, 
  Search, RotateCcw, ListFilter, Activity, Zap, 
  Bell, AlertCircle, Check, X, MapPin, RefreshCw
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { getOrders, updateOrderStatus, clearOrders, Order } from "../utils/storage";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const statusLabels = [
  "Confirmed",
  "Prepared",
  "Shipping",
  "Completed"
];

const statusActions = [
  "Confirm Order",
  "Mark Prepared",
  "Start Shipping",
  "Mark Completed"
];

const statusIcons = [
  Zap,
  Package,
  Truck,
  CheckCircle
];

const statusColors: Record<number, string> = {
  [-1]: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  0: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  2: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  3: "text-purple-400 bg-purple-500/10 border-purple-500/20"
};

export function AdminTracker() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | "all" | "pending">("all");
  const [activities, setActivities] = useState<{id: string, orderId: string, action: string, timestamp: string}[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Sound effect simulation for notifications
  const playNotification = (count: number, lastOrder?: Order) => {
    toast.success(`New Dispatch Request [${count}]`, {
      description: lastOrder ? `From ${lastOrder.customerName} at ${lastOrder.address}` : "A new order is awaiting administrative clearance.",
      duration: 6000,
    });
    console.log("New order pulse received!");
  };

  const loadOrders = async () => {
    setIsLoading(true);
    const freshOrders = await getOrders();
    const pendingOrders = freshOrders.filter(o => o.status === -1);
    
    // Check if any new pending orders arrived
    if (freshOrders.length > orders.length && pendingOrders.length > 0) {
      playNotification(pendingOrders.length, pendingOrders[0]);
    }
    setOrders(freshOrders);
    setIsLoading(false);
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('storage', loadOrders);
    
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(loadOrders, 5000); 
    }
    
    return () => {
      window.removeEventListener('storage', loadOrders);
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           order.id.includes(searchQuery);
      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "pending") return matchesSearch && order.status === -1;
      return matchesSearch && order.status === statusFilter;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleUpdateStatus = async (orderIds: string[], newStatus: number) => {
    const timestamp = new Date().toLocaleTimeString();
    await Promise.all(orderIds.map(id => updateOrderStatus(id, newStatus)));
    
    const newItems = orderIds.map(id => ({
      id: Math.random().toString(36).substr(2, 9),
      orderId: id,
      action: newStatus === 0 ? "Order Accepted" : `Status set to ${statusLabels[newStatus]}`,
      timestamp
    }));

    setActivities(prev => [...newItems, ...prev].slice(0, 50));
    loadOrders();
  };

  const pendingCount = orders.filter(o => o.status === -1).length;

  return (
    <div className="space-y-6">
      {/* Dynamic Notification Banner */}
      {pendingCount > 0 && (
        <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Bell className="text-white animate-bounce" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">{pendingCount} New Purchase Inbound</p>
              <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">Awaiting Admin Clearance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setStatusFilter("pending")}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-[10px] font-black uppercase tracking-widest"
            >
              Review Dispatch
            </Button>
            <div className="h-6 w-px bg-zinc-800 mx-2"></div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${autoRefresh ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
              >
                <div className={`size-1.5 rounded-full ${autoRefresh ? 'bg-blue-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-widest">Auto-Sync</span>
              </button>
              <button 
                onClick={loadOrders}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors"
                title="Manual Refresh"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
        <span>Active Telemetry</span>
        <span className="flex items-center gap-1.5 text-[10px]">
          Last Updated: {lastRefreshed.toLocaleTimeString()}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MiniStat label="Pending Intake" value={pendingCount} icon={Bell} trend={pendingCount > 0 ? "Urgent" : "Clear"} color={pendingCount > 0 ? "text-amber-500" : "text-zinc-500"} />
        <MiniStat label="Out for Delivery" value={orders.filter(o => o.status === 2).length} icon={Truck} trend="Stable" color="text-blue-500" />
        <MiniStat label="Completed Orders" value={orders.filter(o => o.status === 3).length} icon={CheckCircle} trend="+8 today" color="text-emerald-500" />
        <MiniStat label="System Pulse" value="Active" icon={Zap} trend="Online" color="text-purple-500" />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500" size={16} />
            <input 
              type="text" 
              placeholder="Search Deployment ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs outline-none text-zinc-300 font-mono"
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto">
            <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label="All" />
            <FilterButton active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} label={`Pending (${pendingCount})`} highlight={pendingCount > 0} />
            {statusLabels.map((l, i) => (
              <FilterButton key={i} active={statusFilter === i} onClick={() => setStatusFilter(i as any)} label={l} />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {selectedOrderIds.length > 0 && (
            <div className="flex gap-1.5 animate-in slide-in-from-right-2">
              <Button size="sm" onClick={() => handleUpdateStatus(selectedOrderIds, 0)} className="bg-blue-600 text-white text-[10px] font-black uppercase">Accept Selected</Button>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={async () => { await clearOrders(); loadOrders(); }} className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest">
            <RotateCcw size={14} className="mr-2" /> Reset All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800">
                  <th className="p-4 w-12 text-center">
                    <Checkbox
                      checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                      onCheckedChange={() => setSelectedOrderIds(selectedOrderIds.length === filteredOrders.length ? [] : filteredOrders.map(o => o.id))}
                    />
                  </th>
                  <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deployment</th>
                  <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Personnel</th>
                  <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Current State</th>
                  <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  const isPending = order.status === -1;
                  return (
                    <tr key={order.id} className={`hover:bg-zinc-900/40 transition-colors ${isSelected ? "bg-blue-500/5" : ""} ${isPending ? "border-l-2 border-amber-500" : ""}`}>
                      <td className="p-4 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => setSelectedOrderIds(prev => prev.includes(order.id) ? prev.filter(i => i !== order.id) : [...prev, order.id])}
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-xs font-bold text-zinc-300">#ORD-{order.id}</p>
                        <p className="text-[10px] text-zinc-600 mt-1 font-mono">{order.timestamp}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-xs font-bold text-zinc-400">{order.customerName}</p>
                        <p className="text-[10px] text-zinc-600 line-clamp-1">{order.productName}</p>
                        <div className="mt-1 flex items-center gap-1 text-[9px] text-zinc-500 font-medium">
                          <MapPin size={10} className="text-blue-500/50" />
                          <span className="line-clamp-1">{order.address}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusColors[order.status]}`}>
                          {isPending ? <AlertCircle size={12} className="animate-pulse" /> : <Zap size={12} />}
                          {isPending ? "Pending CLEARANCE" : statusLabels[order.status]}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {isPending ? (
                            <div className="flex gap-2 min-w-[140px]">
                              <button 
                                onClick={() => handleUpdateStatus([order.id], 0)}
                                className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40 text-[10px] font-black uppercase tracking-widest border border-blue-400/30 active:scale-95"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus([order.id], -2)} 
                                className="px-3 py-1.5 bg-zinc-900 text-zinc-500 rounded-lg hover:bg-zinc-800 hover:text-zinc-300 transition-colors text-[10px] font-black uppercase border border-zinc-800"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden self-start">
                              {statusLabels.map((label, idx) => {
                                const isCurrent = order.status === idx;
                                const isPast = order.status > idx;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => handleUpdateStatus([order.id], idx)}
                                    className={`relative z-10 px-2 py-1 text-[8px] font-black uppercase tracking-tighter transition-all whitespace-nowrap border-r last:border-r-0 border-zinc-800/50
                                      ${isCurrent 
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20" 
                                        : isPast 
                                          ? "text-blue-500/20 text-blue-400/60" 
                                          : "text-zinc-700 hover:text-zinc-400"
                                      }`}
                                    title={label}
                                  >
                                    {label.slice(0, 4)}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          <button 
                            onClick={() => window.open(`/tracking/${order.id}`, '_blank')}
                            className="p-2 text-zinc-600 hover:text-blue-500 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Open Customer View"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="p-12 text-center opacity-30">
                <Activity size={32} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Active Telemetry</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Stream */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-[10px] font-black text-zinc-100 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <ListFilter size={14} className="text-blue-500" />
              Pulse Log
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar-dark">
              {activities.map((activity) => (
                <div key={activity.id} className="relative pl-4 border-l border-zinc-800 pb-3">
                  <div className="absolute -left-[5px] top-1.5 size-2 bg-blue-500/20 border border-blue-500/40 rounded-full"></div>
                  <p className="text-[10px] font-bold text-zinc-600 tracking-wider mb-1 font-mono">{activity.timestamp}</p>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    <span className="text-blue-500">#{activity.orderId}</span> {activity.action}
                  </p>
                </div>
              ))}
              {activities.length === 0 && <p className="text-[10px] text-zinc-700 text-center py-8 font-black uppercase tracking-widest">Stream Empty</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, trend, color }: any) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-xl bg-zinc-900 border border-zinc-800 ${color}`}><Icon size={18} /></div>
        <span className="text-[10px] font-black uppercase text-zinc-500">{trend}</span>
      </div>
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-bold text-zinc-100">{value}</p>
    </div>
  );
}

function FilterButton({ active, onClick, label, highlight }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
        active ? "bg-zinc-800 text-blue-500" : highlight ? "text-amber-500 animate-pulse" : "text-zinc-600 hover:text-zinc-400"
      }`}
    >
      {label}
    </button>
  );
}
