import { motion } from "motion/react";

const SPONSORS = [
  { name: "Nepal Organics Board", logo: "🌱", tagline: "Official Certifier" },
  { name: "Himalayan Farmers Co-op", logo: "🏔️", tagline: "Trusted Harvest Partner" },
  { name: "BioNepal Trust", logo: "🌿", tagline: "Organic Standards" },
  { name: "AgroNepal Foundation", logo: "🌾", tagline: "Farm to Table Initiative" },
  { name: "Pure Earth Initiative", logo: "🌍", tagline: "Sustainability Partner" },
  { name: "Nat'l Honey Council", logo: "🍯", tagline: "Quality Verified" },
  { name: "GreenMark Certified", logo: "✅", tagline: "International Certification" },
  { name: "Himalayan Bee Society", logo: "🐝", tagline: "Beekeeper Alliance" },
];

// Duplicate for infinite scroll illusion
const DOUBLED = [...SPONSORS, ...SPONSORS];

export function SponsorsStrip() {
  return (
    <section className="bg-white border-t border-b border-neutral-100 py-10 overflow-hidden">
      <p className="text-center text-[11px] text-neutral-400 font-black uppercase tracking-[0.25em] mb-8">
        Trusted Partners &amp; Sponsors
      </p>

      {/* Scrolling strip */}
      <div className="relative overflow-hidden">
        {/* Fade left/right */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: [0, -50 * SPONSORS.length] }}
          transition={{ duration: SPONSORS.length * 3.5, ease: "linear", repeat: Infinity }}
          className="flex gap-6 w-max"
        >
          {DOUBLED.map((sponsor, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl shadow-sm whitespace-nowrap shrink-0 hover:bg-green-50 hover:border-green-200 transition-colors cursor-default group"
            >
              <span className="text-2xl">{sponsor.logo}</span>
              <div>
                <p className="text-sm font-black text-neutral-800 leading-tight group-hover:text-green-700 transition-colors">
                  {sponsor.name}
                </p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">
                  {sponsor.tagline}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
