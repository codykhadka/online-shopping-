import { Outlet, useNavigate, Link, useLocation } from "react-router";
import { LayoutDashboard, Package, Users, Settings, LogOut, Bell, Search, Shield, Cpu, Activity, Clock, Trash2, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { clearAdminSession, getAdminSession } from "../utils/adminAuth";
import { toast } from "sonner";

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = getAdminSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
      const response = await fetch(`${apiUrl}/admin/notifications`);
      const data = await response.json();
      
      if (data.length > notifications.length && notifications.length > 0) {
        const newOnes = data.filter((n: any) => !notifications.find(prev => prev.id === n.id));
        newOnes.forEach((n: any) => {
          toast.success(n.title, { 
            description: n.message,
            action: {
              label: "View",
              onClick: () => navigate("/admin/tracking")
            }
          });
        });
      }
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login");
  };

  const markAsRead = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
      await fetch(`${apiUrl}/admin/notifications/read`, { method: "POST" });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-400 flex font-sans selection:bg-blue-500/30">
      {/* Sidebar - Extreme Dark */}
      <aside className="w-64 bg-[#09090b] border-r border-zinc-800 hidden md:flex flex-col fixed inset-y-0 z-50">
        <div className="p-6">
          <Link to="/admin/tracking" className="flex items-center gap-3 mb-10 group">
            <div className="size-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40 transition-transform group-hover:scale-110">
              <Cpu size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-zinc-100 text-lg leading-none tracking-tight">COMMAND</span>
              <span className="text-[10px] font-bold text-blue-500 tracking-[0.2em] mt-1">CENTER v2.0</span>
            </div>
          </Link>
          
          <nav className="space-y-1.5">
            <NavItem icon={LayoutDashboard} label="Order Management" to="/admin/tracking" active={location.pathname === '/admin/tracking'} />
            <NavItem icon={Package} label="Product Catalog" to="/admin/products" active={location.pathname === '/admin/products'} />
            <NavItem icon={Users} label="Personnel" to="/admin/personnel" active={location.pathname === '/admin/personnel'} />
            <NavItem icon={Activity} label="Monitoring" to="/admin/monitoring" active={location.pathname === '/admin/monitoring'} />
            <NavItem icon={Settings} label="System Config" to="/admin/config" active={location.pathname === '/admin/config'} />
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-zinc-800 bg-zinc-900/30">
          <div className="mb-3 px-3 py-2 bg-zinc-900 rounded-xl">
            <p className="text-xs font-black text-zinc-100">{admin?.username || 'Admin'}</p>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">● Authorized</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all duration-200 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Admin Top Header - Sleek Dark */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search telemetry data..." 
                className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm transition-all outline-none text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 pl-4">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-zinc-500 hover:text-zinc-200 transition-colors relative p-2 hover:bg-zinc-800 rounded-lg group"
              >
                <Bell size={20} className={unreadCount > 0 ? "animate-pulse text-blue-500" : ""} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 size-2.5 bg-blue-500 rounded-full border-2 border-[#09090b] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                    <h3 className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">Inbound Alerts</h3>
                    <button onClick={markAsRead} className="text-[9px] font-black text-blue-500 uppercase hover:underline">Mark All Read</button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar-dark">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center opacity-30">
                        <Activity size={24} className="mx-auto mb-2 text-zinc-700" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">No signals detected</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            setShowNotifications(false);
                            navigate("/admin/tracking");
                          }}
                          className={`p-4 border-b border-zinc-900/50 hover:bg-zinc-900/80 cursor-pointer transition-colors group relative ${!n.read ? "bg-blue-500/5" : ""}`}
                        >
                          {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>}
                          <div className="flex gap-3">
                            <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'order' ? 'bg-blue-500/10 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-zinc-800 text-zinc-500'}`}>
                              {n.type === 'order' ? <Package size={14} /> : <Clock size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] font-black uppercase tracking-tight transition-colors ${!n.read ? 'text-zinc-100' : 'text-zinc-500'}`}>{n.title}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed font-medium">{n.message}</p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <Activity size={10} className="text-zinc-700" />
                                <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Shield size={12} className="text-blue-500/50" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-zinc-900/40 border-t border-zinc-800 text-center">
                    <button className="text-[9px] font-black text-zinc-600 uppercase hover:text-blue-500 tracking-widest transition-colors">Clear Protocol Logs</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-6 w-px bg-zinc-800"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-zinc-100 leading-tight">Root Admin</p>
                <div className="flex items-center gap-1 justify-end">
                  <div className="size-1 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Authorized</p>
                </div>
              </div>
              <div className="size-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700 shadow-inner group hover:border-blue-500/50 transition-colors cursor-pointer">
                <Shield size={20} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 pb-32">
          {/* Status Bar */}
          <div className="flex items-center gap-4 mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            <span className="flex items-center gap-1.5 text-blue-500">
              <div className="size-1.5 bg-blue-500 rounded-full pulse"></div>
              System Online
            </span>
            <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
            <span>Uptime: 99.9%</span>
            <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
            <span>Region: Global-Alpha</span>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, to, active = false }: { icon: any, label: string, to: string, active?: boolean }) {
  return (
    <Link to={to} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? "bg-blue-600/10 text-blue-500 border border-blue-500/20 font-bold" 
        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
    }`}>
      <Icon size={18} className={active ? "text-blue-500" : "text-zinc-500"} />
      <span className="text-sm">{label}</span>
      {active && <div className="ml-auto size-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>}
    </Link>
  );
}
