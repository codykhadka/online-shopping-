import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { Truck, Navigation, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

// Using a limited set of libraries to keep it lightweight
const libraries: ("drawing" | "geometry" | "places" | "visualization")[] = ['geometry'];

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%'
};

// Route from a hub to Baluwatar (Kathmandu coordinates)
const ROUTE_COORDS = [
  { lat: 27.712, lng: 85.315 }, // Hub (e.g., Thamel area)
  { lat: 27.715, lng: 85.318 },
  { lat: 27.718, lng: 85.320 }, // Midpoint
  { lat: 27.721, lng: 85.324 },
  { lat: 27.725, lng: 85.328 }, // Baluwatar
];

const DESTINATION = ROUTE_COORDS[ROUTE_COORDS.length - 1];

export function LiveMap({ destination }: { destination: string }) {
  // Uses API key from environment, or defaults to empty (which shows the "For development purposes only" watermark, but works for demo)
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentPosition, setCurrentPosition] = useState(ROUTE_COORDS[0]);
  const [progress, setProgress] = useState(0);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Simulate movement along the route
  useEffect(() => {
    if (!isLoaded) return;

    let pr = 0;
    const interval = setInterval(() => {
      pr += 0.002; // Speed of the truck
      if (pr > 1) pr = 0; // loops back to start for the demo
      setProgress(pr);

      // Interpolate between coords
      const totalSegments = ROUTE_COORDS.length - 1;
      const scaledProgress = pr * totalSegments;
      const segmentIndex = Math.floor(scaledProgress);
      const t = scaledProgress - segmentIndex;

      if (segmentIndex >= totalSegments) {
        setCurrentPosition(ROUTE_COORDS[totalSegments]);
      } else {
        const start = ROUTE_COORDS[segmentIndex];
        const end = ROUTE_COORDS[segmentIndex + 1];
        setCurrentPosition({
          lat: start.lat + (end.lat - start.lat) * t,
          lng: start.lng + (end.lng - start.lng) * t
        });
      }
    }, 50); // 50ms updates for smooth animation

    return () => clearInterval(interval);
  }, [isLoaded]);

  // Optionally pan map to follow the truck if we want to
  useEffect(() => {
    if (map) {
      map.panTo(currentPosition);
    }
  }, [currentPosition, map]);

  const mapCenter = useMemo(() => {
    // Center map between start and end
    return {
      lat: (ROUTE_COORDS[0].lat + DESTINATION.lat) / 2,
      lng: (ROUTE_COORDS[0].lng + DESTINATION.lng) / 2
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <MapPin size={32} className="animate-bounce" />
          <p className="font-bold text-sm tracking-widest uppercase">Loading Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden rounded-[1.25rem]">
      {/* Google Map Instance */}
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={mapCenter}
        zoom={14.5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true, // Hides map controls to look like a clean custom widget
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] }
          ]
        }}
      >
        {/* Destination Location Marker using OverlayView to use standard React/Tailwind elements */}
        <OverlayView
          position={DESTINATION}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <div className="bg-red-500 p-2.5 rounded-xl shadow-xl border-2 border-white flex items-center justify-center">
              <MapPin className="text-white" size={18} />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2.5 py-1 rounded-full shadow-lg border border-slate-100">
              <p className="text-[10px] font-black text-slate-900 whitespace-nowrap uppercase">{destination.split(',')[0] || "Home"}</p>
            </div>
          </div>
        </OverlayView>

        {/* Moving Delivery Truck Marker */}
        <OverlayView
          position={currentPosition}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div className="relative -translate-x-1/2 -translate-y-1/2 group">
            {/* Pulse Ring for active tracking */}
            <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"></div>

            <div className="relative bg-blue-600 p-3 rounded-2xl shadow-xl border-2 border-white flex flex-col items-center">
              <Truck className="text-white" size={20} />

              {/* Label that hovers above the truck */}
              <div className="absolute -top-14 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2 whitespace-nowrap group-hover:scale-105 transition-transform origin-bottom shadow-2xl">
                <Navigation className="text-blue-400 animate-pulse" size={14} />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Live Tracking</span>
                  <span className="text-[10px] font-bold text-white leading-none">Courier Approaching</span>
                </div>
                {/* Little triangle pointing down */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/90 rotate-45 border-r border-b border-white/10"></div>
              </div>
            </div>
          </div>
        </OverlayView>
      </GoogleMap>

      {/* Floating UI Overlays - Kept independent of map API to always stick to corners */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-5">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Speed</p>
            <p className="text-sm font-bold text-slate-800">24 km/h</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">ETA</p>
            <p className="text-sm font-bold text-blue-600">12 Mins</p>
          </div>
        </div>

        <div className="bg-blue-50/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-blue-200 shadow-lg flex items-center gap-2.5">
          <div className="size-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
          <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest mt-px">GPS Locked</span>
        </div>
      </div>
    </div>
  );
}
