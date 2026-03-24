import { useState, useEffect } from "react";
import { Users, User, Mail, Phone, ShoppingBag, Search, ChevronRight, Hash, Shield, Key, ArrowLeft, Package, Clock, ShieldCheck, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface AdminUser {
  id: number;
  name: string;
  username: string;
  password?: string;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  orders: any[];
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      toast.error("Protocol Error: Could not retrieve user database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery)
  );

  const statusLabels = ["Confirmed", "Prepared", "Shipping", "Completed"];
  const statusColors = ["text-blue-500", "text-yellow-500", "text-purple-500", "text-green-500"];

  if (selectedUser) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <button 
          onClick={() => setSelectedUser(null)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Terminal
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* User Profile Info */}
          <div className="w-full md:w-80 space-y-6">
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Shield size={60} />
               </div>
               
               <div className="relative z-10 text-center mb-6">
                  <div className="size-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-2xl shadow-blue-900/40 rotate-3">
                     <User size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-100 tracking-tight">{selectedUser.name}</h3>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">@{selectedUser.username}</p>
               </div>

               <div className="space-y-4 pt-4 border-t border-zinc-900/50">
                  <DetailItem icon={Hash} label="User ID" value={`UUID-${selectedUser.id}`} />
                   <DetailItem icon={Mail} label="Email Protocol" value={selectedUser.email || "No email available"} />
                   <DetailItem icon={Phone} label="Contact Signal" value={selectedUser.phone || "No signal"} />
                   <DetailItem icon={MapPin} label="Last Known Location" value={selectedUser.orders.length > 0 ? selectedUser.orders[0].address : "Unknown Sector"} />
                   <DetailItem icon={Clock} label="Enlistment" value={new Date(selectedUser.created_at).toLocaleDateString()} />
                   <DetailItem icon={ShieldCheck} label="Access Tier" value={selectedUser.role.toUpperCase()} />
                   <DetailItem icon={Key} label="Credential" value={selectedUser.password || "********"} isPassword />
               </div>
            </div>
          </div>

          {/* User Logistics/Orders */}
          <div className="flex-1 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest flex items-center gap-3">
                   <ShoppingBag className="text-blue-500" size={18} />
                   Logistics History
                </h3>
                <span className="text-[10px] font-black text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">{selectedUser.orders.length} Records</span>
             </div>

             <div className="grid gap-3">
                {selectedUser.orders.length === 0 ? (
                  <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
                     <Package className="mx-auto mb-4 text-zinc-700" size={32} />
                     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-relaxed">No logistics activity detected in the system.</p>
                  </div>
                ) : (
                  selectedUser.orders.map((order, i) => (
                    <div key={order.id} className="bg-[#0c0c0e] border border-zinc-900 p-5 rounded-2xl flex items-center justify-between group hover:border-zinc-800 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="size-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-600 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-colors">
                             <Package size={18} />
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-zinc-100 uppercase tracking-tight">{order.productName}</p>
                             <p className="text-[9px] text-zinc-600 mt-1 flex items-center gap-2">
                                <Clock size={10} />
                                {new Date(order.timestamp).toLocaleString()}
                                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                                <span className="font-bold text-zinc-500">{order.price.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}</span>
                             </p>
                          </div>
                       </div>
                       <div className={`text-[9px] font-black uppercase tracking-widest ${order.status >= 0 ? statusColors[order.status] : "text-zinc-600"}`}>
                          {order.status >= 0 ? statusLabels[order.status] : "Pending"}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard icon={Users} label="Active Operatives" value={users.length} color="blue" />
         <StatCard icon={ShoppingBag} label="Total Transactions" value={users.reduce((acc, u) => acc + u.orders.length, 0)} color="green" />
         <StatCard icon={Shield} label="System Integrity" value="98.4%" color="purple" />
      </div>

      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40">
           <div>
              <h2 className="text-[10px] font-black text-zinc-100 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                 <div className="size-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                 Personnel Database
              </h2>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Master encrypted directory</p>
           </div>
           
           <div className="relative group max-w-sm w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search encrypted records..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/50 border border-zinc-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all outline-none text-zinc-400 placeholder:text-zinc-700"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/70 border-b border-zinc-800">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Personnel</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contact Signal</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Logistics</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {isLoading ? (
                <tr>
                   <td colSpan={4} className="px-6 py-20 text-center">
                     <div className="size-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                     <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest animate-pulse">Decrypting system logs...</p>
                   </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-6 py-20 text-center text-zinc-600">
                      <Search size={24} className="mx-auto mb-3 opacity-20" />
                      <p className="text-[9px] font-black uppercase tracking-widest">No matching records detected in sector</p>
                   </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className="group hover:bg-zinc-800/30 cursor-pointer transition-all border-b border-zinc-900/50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-11 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-600 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all border border-zinc-800 group-hover:border-blue-500/30">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-zinc-200 uppercase tracking-tight group-hover:text-blue-500 transition-colors">{user.name}</p>
                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5 min-w-0 max-w-[200px]">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold truncate">
                           <Mail size={12} className="text-zinc-600 shrink-0" />
                           {user.email || "---"}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold truncate">
                           <MapPin size={12} className="text-zinc-600 shrink-0" />
                           {user.orders.length > 0 ? user.orders[0].address : "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                         <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-black text-blue-500/70 group-hover:border-blue-500/20 transition-all">
                            {user.orders.length > 0 ? `${user.orders.length} ACTIVE` : "O STATUS"}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button className="text-zinc-700 group-hover:text-blue-500 transition-colors p-2">
                          <ChevronRight size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, isPassword = false }: { icon: any, label: string, value: string, isPassword?: boolean }) {
   const [revealed, setRevealed] = useState(!isPassword);
   return (
      <div className="flex flex-col gap-1.5">
         <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
            <Icon size={10} />
            {label}
         </p>
         <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black text-zinc-300 tracking-tight truncate">
               {revealed ? value : "••••••••"}
            </span>
            {isPassword && (
               <button onClick={() => setRevealed(!revealed)} className="text-[8px] font-black uppercase text-blue-500 hover:underline">
                  {revealed ? "Mask" : "Decode"}
               </button>
            )}
         </div>
      </div>
   );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: 'blue' | 'green' | 'purple' }) {
   const colors = {
      blue: "border-blue-500/20 bg-blue-500/5 text-blue-500",
      green: "border-green-500/20 bg-green-500/5 text-green-500",
      purple: "border-purple-500/20 bg-purple-500/5 text-purple-500"
   };
   
   return (
      <div className={`p-6 border rounded-3xl backdrop-blur-sm ${colors[color]}`}>
         <div className="flex items-start justify-between mb-4">
            <div className={`size-10 rounded-xl flex items-center justify-center border ${colors[color]}`}>
               <Icon size={20} />
            </div>
            <div className="size-1 bg-current rounded-full animate-pulse"></div>
         </div>
         <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{label}</p>
         <h4 className="text-2xl font-black tracking-tight">{value}</h4>
      </div>
   );
}
