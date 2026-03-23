import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, MapPin, Activity, Star, Clock, MoreVertical, Search, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

export function AdminPersonnel() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPersonnel = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
      const response = await fetch(`${apiUrl}/admin/personnel`);
      const data = await response.json();
      setPersonnel(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (username: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        toast.info("Recovery Protocol Initiated", { 
          description: `Token generated for personnel. Provide them with token: PROTOCOL-XYZ (Check backend logs for actual token)` 
        });
      }
    } catch (err) {
      toast.error("Failed to initiate reset");
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
            <Users className="text-blue-500" />
            Personnel Management
          </h2>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Monitor and manage delivery agents and system admins</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
          <UserPlus size={18} />
          Register New Personnel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MiniStat label="Total Active" value={personnel.filter(p => p.status === 'Online').length} icon={Users} color="text-blue-500" />
        <MiniStat label="On Delivery" value={Math.floor(personnel.length * 0.4)} icon={Activity} color="text-amber-500" />
        <MiniStat label="Avg. Rating" value="4.8" icon={Star} color="text-emerald-500" />
        <MiniStat label="Shift Status" value="Active" icon={Clock} color="text-purple-500" />
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
          <div className="flex items-center gap-3 bg-zinc-900 rounded-xl px-3 py-1.5 border border-zinc-800 w-full max-w-xs">
            <Search size={14} className="text-zinc-600" />
            <input type="text" placeholder="Search by name or ID..." className="bg-transparent border-none outline-none text-[11px] text-zinc-300 w-full" />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-zinc-500 text-[10px] uppercase font-black tracking-widest gap-2">
              <Filter size={14} /> Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-zinc-900">
          {personnel.map((person) => (
            <div key={person.id} className="p-6 hover:bg-zinc-900/40 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="size-12 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center relative shadow-inner">
                    <Shield className={person.role === 'admin' ? "text-purple-500" : "text-blue-500"} size={24} />
                    <div className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-[#09090b] ${person.status === 'Online' ? "bg-emerald-500 pulse" : "bg-zinc-600"}`}></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">{person.name}</h4>
                    <p className="text-[10px] text-zinc-600 font-mono mt-0.5 uppercase tracking-tighter">ID: PERSONNEL-00{person.id}</p>
                    <div className="flex gap-1.5 mt-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${person.role === 'admin' ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"}`}>
                        {person.role}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-zinc-700 hover:text-zinc-400"><MoreVertical size={16} /></button>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => handleResetPassword(person.name)} // name is fallback if username is hidden
                  className="flex-1 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-500 hover:border-blue-500/30 transition-all active:scale-95"
                >
                  Reset Password
                </button>
                <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-600 hover:text-zinc-300">
                  <Activity size={14} />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                <MapPin size={10} className="text-blue-500/50" />
                <span className="line-clamp-1 italic">Kathmandu Hub, Baneshwor Area</span>
              </div>
            </div>
          ))}
          
          {loading && [1,2,3].map(i => <div key={i} className="p-12 animate-pulse bg-zinc-900/20"></div>)}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl shadow-xl">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-xl bg-zinc-900 border border-zinc-800 ${color}`}><Icon size={18} /></div>
      </div>
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-bold text-zinc-100">{value}</p>
    </div>
  );
}
