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
import { getAdminSession } from "../utils/adminAuth";
import "@/styles/AdminTracker.css";

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
  const [activities, setActivities] = useState<{ id: string, orderId: string, action: string, timestamp: string }[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const admin = getAdminSession();
  const adminName = admin?.name || admin?.username || 'Admin';

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

  const handleUpdateStatus = async (orderIds: string[], newStatus: number, location?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    await Promise.all(orderIds.map(id => updateOrderStatus(id, newStatus, location)));

    const newItems = orderIds.map(id => {
      const order = orders.find(o => o.id === id);
      const pName = order ? ` - ${order.productName}` : '';
      return {
        id: Math.random().toString(36).substr(2, 9),
        orderId: id,
        action: newStatus === 0 ? `Accepted by ${adminName}${pName}` : `Status ${statusLabels[newStatus]} by ${adminName}${location ? ' (' + location + ')' : ''}`,
        timestamp
      };
    });

    setActivities(prev => [...newItems, ...prev].slice(0, 50));
    loadOrders();
  };

  const pendingCount = orders.filter(o => o.status === -1).length;

  return (
    <div className="admin-tracker-container">
      {/* Dynamic Notification Banner */}
      {pendingCount > 0 && (
        <div className="notification-banner">
          <div className="notification-content">
            <div className="notification-icon-wrapper">
              <Bell className="notification-icon" size={20} />
            </div>
            <div className="notification-text">
              <p className="title">{pendingCount} New Purchase Inbound</p>
              <p className="subtitle">Awaiting Admin Clearance</p>
            </div>
          </div>
          <div className="notification-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter("pending")}
              className="review-dispatch-btn"
            >
              Review Dispatch
            </Button>
            <div className="actions-separator"></div>
            <div className="auto-sync-wrapper">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`auto-sync-btn ${autoRefresh ? 'active' : 'inactive'}`}
              >
                <div className={`sync-indicator ${autoRefresh ? 'active' : 'inactive'}`}></div>
                <span className="auto-sync-label">Auto-Sync</span>
              </button>
              <button
                onClick={loadOrders}
                className="refresh-btn"
                title="Manual Refresh"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="telemetry-bar">
        <span>Active Telemetry</span>
        <span className="last-updated">
         {/* Already updated in storage.ts */}
          Last Updated: {lastRefreshed.toLocaleTimeString()}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <MiniStat label="Pending Intake" value={pendingCount} icon={Bell} trend={pendingCount > 0 ? "Urgent" : "Clear"} color={pendingCount > 0 ? "text-amber-500" : "text-zinc-500"} />
        <MiniStat label="Out for Delivery" value={orders.filter(o => o.status === 2).length} icon={Truck} trend="Stable" color="text-blue-500" />
        <MiniStat label="Completed Orders" value={orders.filter(o => o.status === 3).length} icon={CheckCircle} trend="+8 today" color="text-emerald-500" />
        <MiniStat label="System Pulse" value="Active" icon={Zap} trend="Online" color="text-purple-500" />
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-and-filter">
          <div className="search-group">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search Deployment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-tracker"
            />
          </div>
          <div className="filter-pills">
            <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label="All" />
            <FilterButton active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} label={`Pending (${pendingCount})`} highlight={pendingCount > 0} />
            {statusLabels.map((l, i) => (
              <FilterButton key={i} active={statusFilter === i} onClick={() => setStatusFilter(i as any)} label={l} />
            ))}
          </div>
        </div>

        <div className="filter-actions">
          {selectedOrderIds.length > 0 && (
            <div className="selected-actions flex items-center gap-3">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                Admin {adminName}: {selectedOrderIds.length} Selected
              </span>
              <Button size="sm" onClick={() => handleUpdateStatus(selectedOrderIds, 0)} className="accept-selected-btn bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                Accept Selected
              </Button>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={async () => { await clearOrders(); loadOrders(); }} className="reset-all-btn">
            <RotateCcw size={14} className="mr-2" /> Reset All
          </Button>
        </div>
      </div>

      <div className="main-grid-tracker">
        <div className="orders-table-container">
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th className="w-12 text-center">
                    <Checkbox
                      checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                      onCheckedChange={() => setSelectedOrderIds(selectedOrderIds.length === filteredOrders.length ? [] : filteredOrders.map(o => o.id))}
                    />
                  </th>
                  <th>Deployment</th>
                  <th>Personnel</th>
                  <th>Current State</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  const isPending = order.status === -1;
                  return (
                    <tr key={order.id} className={`order-row ${isSelected ? "selected" : ""} ${isPending ? "pending" : ""}`}>
                      <td className="text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => setSelectedOrderIds(prev => prev.includes(order.id) ? prev.filter(i => i !== order.id) : [...prev, order.id])}
                        />
                      </td>
                      <td>
                        <p className="order-id">#ORD-{order.id}</p>
                        <p className="order-timestamp">{order.timestamp}</p>
                      </td>
                      <td>
                        <p className="personnel-name">{order.customerName}</p>
                        <p className="product-name">{order.productName}</p>
                        <div className="location-edit-group mt-1 flex items-center gap-2">
                          <MapPin size={10} className="text-red-500" />
                          <input 
                            type="text" 
                            defaultValue={order.location || "Sorting Hub"}
                            onBlur={(e) => {
                              if (e.target.value !== order.location) {
                                handleUpdateStatus([order.id], order.status, e.target.value);
                              }
                            }}
                            className="bg-transparent border-b border-zinc-700 text-[10px] text-zinc-400 focus:text-white transition-colors outline-none w-32"
                          />
                        </div>
                        <div className="address-info mt-1">
                          <span className="line-clamp-1 italic text-[9px] text-zinc-500 opacity-60">{order.address}</span>
                        </div>
                      </td>
                      <td>
                        <div className={`status-badge ${statusColors[order.status]}`}>
                          {isPending ? <AlertCircle size={12} className="animate-pulse" /> : <Zap size={12} />}
                          {isPending ? "Pending CLEARANCE" : statusLabels[order.status]}
                        </div>
                      </td>
                      <td>
                        <div className="review-actions">
                          {isPending ? (
                            <div className="pending-actions">
                              <button
                                onClick={() => handleUpdateStatus([order.id], 0)}
                                className="confirm-btn"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleUpdateStatus([order.id], -2)}
                                className="reject-btn"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="status-stepper">
                              {statusLabels.map((label, idx) => {
                                const isCurrent = order.status === idx;
                                const isPast = order.status > idx;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => handleUpdateStatus([order.id], idx)}
                                    className={`step-btn ${isCurrent ? "current" : isPast ? "past" : "future"}`}
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
                            className="open-customer-view-btn"
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
              <div className="empty-table-state">
                <Activity size={32} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Active Telemetry</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Stream */}
        <div className="activity-log-sidebar">
          <div className="activity-log-card">
            <h3 className="activity-log-title">
              <ListFilter size={14} className="icon" />
              Pulse Log
            </h3>
            <div className="activity-log-list custom-scrollbar-dark">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-dot"></div>
                  <p className="activity-timestamp">{activity.timestamp}</p>
                  <p className="activity-text">
                    <span className="order-id-log">#{activity.orderId}</span> {activity.action}
                  </p>
                </div>
              ))}
              {activities.length === 0 && <p className="empty-log-state">Stream Empty</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, trend, color }: any) {
  return (
    <div className="mini-stat-card">
      <div className="stat-header">
        <div className={`stat-icon-wrapper ${color}`}><Icon size={18} /></div>
        <span className="stat-trend">{trend}</span>
      </div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function FilterButton({ active, onClick, label, highlight }: any) {
  return (
    <button
      onClick={onClick}
      className={`filter-btn ${active ? "active" : ""} ${highlight ? "highlight" : ""}`}
    >
      {label}
    </button>
  );
}
