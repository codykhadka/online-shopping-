import { ShoppingCart, Search } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemCount, onCartClick }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-green-50"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="size-8 rounded-lg bg-green-700 flex items-center justify-center transition-transform group-hover:scale-110"
          >
            <span className="text-white font-bold">D</span>
          </motion.div>
          <span className="text-xl font-semibold">Danphe Organic</span>
        </Link>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="size-5" />
          </button>
          
          <button
            onClick={onCartClick}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ShoppingCart className="size-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs">
                {cartItemCount}
              </Badge>
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
