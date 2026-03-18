import { motion } from "motion/react";
import { Truck, MapPin, Navigation } from "lucide-react";
import { useEffect, useState } from "react";

const landmarks = [
  { name: "Kathmandu Hub", x: 10, y: 80 },
  { name: "Maharajgunj Circle", x: 30, y: 60 },
  { name: "Teaching Hospital", x: 50, y: 55 },
  { name: "Baluwatar-04", x: 85, y: 20 },
];

export function LiveMap({ destination }: { destination: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 0.5 : 0)); // Resets for demo loop
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Calculate current interpolated position
  const currentX = 10 + (progress * 0.75); // Starts at 10, ends around 85
  const currentY = 80 - (progress * 0.6); // Starts at 80, ends around 20

  // Find nearest landmark
  const currentLandmark = landmarks.reduce((prev, curr) => {
    const currDist = Math.sqrt(Math.pow(curr.x - currentX, 2) + Math.pow(curr.y - currentY, 2));
    const prevDist = Math.sqrt(Math.pow(prev.x - currentX, 2) + Math.pow(prev.y - currentY, 2));
    return currDist < prevDist ? curr : prev;
  });

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden rounded-3xl">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      {/* Moving Car Path (SVG) */}
      <svg className="absolute inset-0 w-full h-full p-10 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path 
          d="M 10 80 Q 30 70 50 55 T 85 20" 
          fill="none" 
          stroke="white" 
          strokeWidth="0.5" 
          strokeDasharray="2 2"
        />
      </svg>

      {/* Landmarks */}
      {landmarks.map((loc, i) => (
        <div 
          key={i}
          className="absolute"
          style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
        >
          <div className="relative -translate-x-1/2 -translate-y-1/2">
             <div className="size-2 bg-slate-600 rounded-full"></div>
             <p className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-slate-500 uppercase tracking-widest">
               {loc.name}
             </p>
          </div>
        </div>
      ))}

      {/* Destination Marker */}
      <motion.div 
        className="absolute z-20"
        style={{ left: "85%", top: "20%" }}
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <div className="bg-red-500 p-2 rounded-xl shadow-2xl shadow-red-500/50">
             <MapPin className="text-white" size={16} />
          </div>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-lg">
             <p className="text-[10px] font-black text-slate-900 whitespace-nowrap">HOME</p>
          </div>
        </div>
      </motion.div>

      {/* The Delivery Car (Truck) */}
      <motion.div 
        className="absolute z-30"
        style={{ left: `${currentX}%`, top: `${currentY}%` }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          {/* Pulse Ripple */}
          <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"></div>
          
          <div className="relative bg-blue-600 p-3 rounded-2xl shadow-2xl shadow-blue-500/50 flex flex-col items-center">
             <Truck className="text-white" size={24} />
             <div className="absolute -top-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                <Navigation className="text-blue-400 animate-pulse" size={12} />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-0.5">Live Dispatch</span>
                  <span className="text-[10px] font-bold text-white whitespace-nowrap leading-none">{currentLandmark.name}</span>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Overlay Stats */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
        <div className="bg-black/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div>
            <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Speed</p>
            <p className="text-xs font-bold text-white">24 km/h</p>
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div>
            <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">ETA</p>
            <p className="text-xs font-bold text-blue-400">12 Mins</p>
          </div>
        </div>
        
        <div className="bg-blue-600/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-blue-500/30 flex items-center gap-2">
          <div className="size-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Signal Locked</span>
        </div>
      </div>
    </div>
  );
}
