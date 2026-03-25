import { useState, useEffect } from "react";
import { Users, User, Mail, Phone, ShoppingBag, Search, ChevronRight, Hash, Shield, Key, ArrowLeft, Package, Clock, ShieldCheck, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import "@/styles/AdminUsers.css";
interface UserOrder {
   id: string | number;
   productName: string;
   status: number;
   timestamp: string;
   price: number;
   address: string;
}

interface AdminUser {
   id: number;
   name: string;
   username: string;
   password?: string;
   email: string | null;
   phone: string | null;
   role: string;
   created_at: string;
   orders: UserOrder[];
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
         <div className="user-detail-view">
            <button
               onClick={() => setSelectedUser(null)}
               className="back-to-terminal-btn"
            >
               <ArrowLeft size={14} className="icon" />
               Back to Terminal
            </button>

            <div className="user-detail-content">
               {/* User Profile Info */}
               <div className="profile-sidebar">
                  <div className="profile-card">
                     <div className="profile-card-bg-icon">
                        <Shield size={60} />
                     </div>

                     <div className="profile-header">
                        <div className="profile-avatar-wrapper">
                           <User size={32} className="icon" />
                        </div>
                        <h3 className="profile-name">{selectedUser.name}</h3>
                        <p className="profile-username">@{selectedUser.username}</p>
                     </div>

                     <div className="profile-details-list">
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
               <div className="logistics-history-panel">
                  <div className="logistics-header">
                     <h3 className="logistics-title">
                        <ShoppingBag className="icon" size={18} />
                        Logistics History
                     </h3>
                     <span className="logistics-count">{selectedUser.orders.length} Records</span>
                  </div>

                  <div className="logistics-list">
                     {selectedUser.orders.length === 0 ? (
                        <div className="logistics-item-empty">
                           <Package className="icon" size={32} />
                           <p className="text">No logistics activity detected in the system.</p>
                        </div>
                     ) : (
                        selectedUser.orders.map((order, i) => (
                           <div key={order.id} className="logistics-item">
                              <div className="logistics-item-info">
                                 <div className="logistics-item-icon-wrapper">
                                    <Package size={18} />
                                 </div>
                                 <div className="logistics-item-text">
                                    <p className="product-name">{order.productName}</p>
                                    <p className="details">
                                       <Clock size={10} />
                                       {new Date(order.timestamp).toLocaleString()}
                                       <span className="separator"></span>
                                       <span className="price">{order.price.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}</span>
                                    </p>
                                 </div>
                              </div>
                              <div className={`logistics-item-status ${order.status >= 0 && order.status < statusColors.length ? statusColors[order.status] : "text-zinc-600"}`}>
                                 {order.status >= 0 && order.status < statusLabels.length ? statusLabels[order.status] : "Pending"}
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
      <div className="admin-users-container">
         {/* Header section with Stats */}
         <div className="stats-grid-users">
            <StatCard icon={Users} label="Active Operatives" value={users.length} color="blue" />
            <StatCard icon={ShoppingBag} label="Total Transactions" value={users.reduce((acc, u) => acc + u.orders.length, 0)} color="green" />
            <StatCard icon={Shield} label="System Integrity" value="98.4%" color="purple" />
         </div>

         <div className="user-database-card">
            <div className="database-header">
               <div className="database-title-group">
                  <h2 className="title">
                     <div className="dot"></div>
                     Personnel Database
                  </h2>
                  <p className="subtitle">Master encrypted directory</p>
               </div>

               <div className="search-group-users">
                  <Search size={14} className="search-icon-users" />
                  <input
                     type="text"
                     placeholder="Search encrypted records..."
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="search-input-users"
                  />
               </div>
            </div>

            <div className="user-table-container">
               <table className="user-table">
                  <thead>
                     <tr>
                        <th>Personnel</th>
                        <th>Contact</th>
                        <th>Location</th>
                        <th>Enlistment Date</th>
                        <th className="text-center">Logistics</th>
                        <th className="text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {isLoading && (
                        <tr>
                           <td colSpan={6} className="loading-state">
                              <div className="loading-spinner-users" />
                              <p className="loading-text">Decrypting system logs...</p>
                           </td>
                        </tr>
                     )}
                     {!isLoading && filteredUsers.length === 0 && (
                        <tr>
                           <td colSpan={6} className="empty-state">
                              <Search size={24} className="empty-icon" />
                              <p className="empty-text">No matching records detected in sector</p>
                           </td>
                        </tr>
                     )}
                     {!isLoading && filteredUsers.length > 0 && filteredUsers.map((user) => (
                           <tr
                              key={user.id}
                              onClick={() => setSelectedUser(user)}
                              className="user-row"
                           >
                              <td>
                                 <div className="personnel-cell">
                                    <div className="personnel-icon-wrapper">
                                       <User size={20} />
                                    </div>
                                    <div className="personnel-info">
                                       <p className="name">{user.name}</p>
                                       <p className="username">@{user.username}</p>
                                    </div>
                                 </div>
                              </td>
                              <td>
                                 <div className="contact-cell">
                                    <div className="contact-item">
                                       <Mail size={12} className="icon" />
                                       {user.email || "No Email"}
                                    </div>
                                    <div className="contact-item">
                                       <Phone size={12} className="icon" />
                                       {user.phone || "No Phone"}
                                    </div>
                                 </div>
                              </td>
                              <td>
                                 <div className="contact-item">
                                    <MapPin size={12} className="icon" />
                                    {user.orders.length > 0 ? user.orders[0].address : "N/A"}
                                 </div>
                              </td>
                              <td>
                                 <div className="contact-item">
                                    <Clock size={12} className="icon" />
                                    {new Date(user.created_at).toLocaleDateString()}
                                 </div>
                              </td>
                              <td>
                                 <div className="logistics-cell">
                                    <div className="logistics-badge">
                                       {user.orders.length > 0 ? `${user.orders.length} ACTIVE` : "0 STATUS"}
                                    </div>
                                 </div>
                              </td>
                              <td className="records-cell">
                                 <button className="records-btn" title="View Detail">
                                    <ChevronRight size={18} />
                                 </button>
                              </td>
                           </tr>
                        ))}
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
      <div className="detail-item">
         <p className="detail-label">
            <Icon size={10} />
            {label}
         </p>
         <div className="detail-value-wrapper">
            <span className="detail-value">
               {revealed ? value : "••••••••"}
            </span>
            {isPassword && (
               <button onClick={() => setRevealed(!revealed)} className="decode-btn">
                  {revealed ? "Mask" : "Decode"}
               </button>
            )}
         </div>
      </div>
   );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: 'blue' | 'green' | 'purple' }) {
   return (
      <div className={`stat-card ${color}`}>
         <div className="stat-card-header">
            <div className="stat-card-icon-wrapper">
               <Icon size={20} />
            </div>
            <div className="stat-card-pulse"></div>
         </div>
         <p className="stat-card-label">{label}</p>
         <h4 className="stat-card-value">{value}</h4>
      </div>
   );
}
