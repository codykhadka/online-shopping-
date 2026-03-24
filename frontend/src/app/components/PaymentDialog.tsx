import { useState } from "react";
import { useNavigate } from "react-router";
import { Product } from "../data/products";
import { CreditCard, Lock, Truck, Zap, Plus, Minus, Banknote, CheckCircle2 } from "lucide-react";
import { saveOrder } from "../utils/storage";
import { getAuthUser } from "../utils/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface PaymentDialogProps {
  product: Product;
  quantity?: number;
  isOpen: boolean;
  onClose: () => void;
}

type DeliveryMethod = "economy" | "standard" | "express" | "cashOnDelivery";

// Conversion: $1 = Rs 133 (approx)
const RS_RATE = 133;

// Helper: convert product's USD price to NPR
const toRs = (usd: number) => Math.round(usd * RS_RATE);
const MIN_DELIVERY = 1;   // $1 minimum
const MAX_DELIVERY = 50;  // $50 maximum

const deliveryOptions: {
  id: DeliveryMethod;
  name: string;
  description: string;
  priceRs: number;  // base delivery price in NPR
  icon: React.ElementType;
  badge: string | null;
  color: string;
}[] = [
  {
    id: "economy",
    name: "Economy",
    description: "7–10 business days",
    priceRs: 20,
    icon: Truck,
    badge: "Cheapest",
    color: "green",
  },
  {
    id: "standard",
    name: "Standard",
    description: "5–7 business days",
    priceRs: 399,
    icon: Truck,
    badge: null,
    color: "blue",
  },
  {
    id: "express",
    name: "Express",
    description: "2–3 business days",
    priceRs: 930,
    icon: Zap,
    badge: "Fast",
    color: "orange",
  },
  {
    id: "cashOnDelivery",
    name: "Cash on Delivery",
    description: "Pay when you receive",
    priceRs: 266,
    icon: Banknote,
    badge: null,
    color: "purple",
  },
];

const iconColors: Record<string, string> = {
  green: "bg-green-600 text-white",
  blue: "bg-blue-600 text-white",
  orange: "bg-orange-500 text-white",
  purple: "bg-purple-600 text-white",
};

const selectedBorder: Record<string, string> = {
  green: "border-green-500 ring-green-400 bg-green-50",
  blue: "border-blue-500 ring-blue-400 bg-blue-50",
  orange: "border-orange-400 ring-orange-300 bg-orange-50",
  purple: "border-purple-500 ring-purple-400 bg-purple-50",
};

const badgeStyle: Record<string, string> = {
  Cheapest: "bg-green-100 text-green-700",
  Fast: "bg-orange-100 text-orange-700",
};

export function PaymentDialog({ product, quantity = 1, isOpen, onClose }: PaymentDialogProps) {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("economy");
  const [customDeliveryFeeRs, setCustomDeliveryFeeRs] = useState(20); // starts at Rs 20
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: authUser?.name || "",
    expiryDate: "",
    cvv: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
  });

  const selectedOption = deliveryOptions.find(d => d.id === deliveryMethod)!;
  const subtotalRs = toRs((product.discountPrice || product.price) * quantity);
  const deliveryFeeRs = customDeliveryFeeRs;
  const totalRs = subtotalRs + deliveryFeeRs;

  // When user picks a method, reset the custom fee to that option's base NPR price
  const handleSelectMethod = (id: DeliveryMethod) => {
    setDeliveryMethod(id);
    const opt = deliveryOptions.find(d => d.id === id)!;
    setCustomDeliveryFeeRs(opt.priceRs);
  };

  const incrementFee = () => setCustomDeliveryFeeRs(v => Math.min(v + 10, 6650)); // max Rs 6650
  const decrementFee = () => setCustomDeliveryFeeRs(v => Math.max(v - 10, 10)); // min Rs 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    const orderId = Math.random().toString(36).substring(7).toUpperCase();

    await saveOrder({
      id: orderId,
      customerName: formData.cardName || "Guest Customer",
      productName: product.name,
      price: totalRs,
      status: -1,
      timestamp: new Date().toLocaleString(),
      address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
      phone: formData.phone,
      user_id: authUser?.id || null,
    });

    const msg = deliveryMethod === "cashOnDelivery"
      ? "Order confirmed! Pay when you receive your delivery."
      : "Payment successful! Order confirmed.";
    toast.success(msg);
    onClose();

    setFormData({ cardNumber: "", cardName: "", expiryDate: "", cvv: "", email: "", address: "", city: "", zipCode: "", phone: "" });
    setDeliveryMethod("economy");
    setCustomDeliveryFeeRs(20);
    navigate(`/tracking/${orderId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="size-5 text-green-600" />
            Secure Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your purchase securely. All transactions are encrypted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* ── Order Summary ─────────────────────────────── */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
            <h3 className="text-sm font-bold text-green-800 mb-4 uppercase tracking-wide">Order Summary</h3>
            <div className="flex gap-4 mb-4">
              <img src={product.image} alt={product.name} className="size-20 object-cover rounded-xl shadow-sm border border-white" />
              <div className="flex-1">
                <p className="font-bold text-neutral-900 mb-1">{product.name}</p>
                <p className="text-sm text-neutral-500">Qty: {quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-green-700">Rs {subtotalRs.toLocaleString()}</p>
              </div>
            </div>
            <div className="border-t border-green-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">Rs {subtotalRs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Delivery Fee</span>
                <span className="font-bold text-green-700">Rs {deliveryFeeRs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-green-200 pt-2">
                <span className="font-bold text-base">Total</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-700">Rs {totalRs.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Delivery Method ───────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Select Delivery Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {deliveryOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = deliveryMethod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectMethod(option.id)}
                    className={`relative p-5 border-2 rounded-2xl text-left transition-all duration-200 ${
                      isSelected
                        ? `${selectedBorder[option.color]} ring-2`
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    {/* Checkmark */}
                    {isSelected && (
                      <CheckCircle2 className="absolute top-3 right-3 size-5 text-current opacity-70" />
                    )}

                    {/* Icon */}
                    <div className={`size-12 rounded-xl flex items-center justify-center mb-3 ${
                      isSelected ? iconColors[option.color] : "bg-neutral-100 text-neutral-500"
                    }`}>
                      <Icon className="size-6" />
                    </div>

                    <p className={`font-bold text-sm mb-0.5 ${isSelected ? "text-neutral-900" : "text-neutral-700"}`}>
                      {option.name}
                    </p>
                    <p className="text-xs text-neutral-500 mb-2">{option.description}</p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-base font-black ${isSelected ? "text-neutral-900" : "text-neutral-700"}`}>
                        Rs {option.priceRs.toLocaleString()}
                      </span>
                      {option.badge && (
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStyle[option.badge]}`}>
                          {option.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── Delivery Fee Adjuster ─────────────────── */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900 text-sm mb-0.5">Adjust Delivery Charge</p>
                  <p className="text-xs text-neutral-500">Based on {selectedOption.name} · ±Rs 10 per click</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={decrementFee}
                    disabled={customDeliveryFeeRs <= 10}
                    className="size-10 rounded-xl border-2 border-neutral-300 bg-white hover:bg-red-50 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
                  >
                    <Minus className="size-4 text-neutral-700" />
                  </button>

                  <div className="min-w-[72px] text-center">
                    <p className="text-2xl font-black text-green-700">Rs {customDeliveryFeeRs}</p>
                  </div>

                  <button
                    type="button"
                    onClick={incrementFee}
                    disabled={customDeliveryFeeRs >= 6650}
                    className="size-10 rounded-xl border-2 border-neutral-300 bg-white hover:bg-green-50 hover:border-green-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
                  >
                    <Plus className="size-4 text-neutral-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Contact Information ───────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Contact Information</h3>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} required className="mt-1.5 h-12 text-base" />
            </div>
          </div>

          {/* ── Delivery Address ──────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Delivery Address</h3>
            <div>
              <Label htmlFor="address" className="text-sm font-semibold">Street Address</Label>
              <Input id="address" name="address" placeholder="123 Main St" value={formData.address} onChange={handleChange} required className="mt-1.5 h-12 text-base" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                <Input id="city" name="city" placeholder="Kathmandu" value={formData.city} onChange={handleChange} required className="mt-1.5 h-12 text-base" />
              </div>
              <div>
                <Label htmlFor="zipCode" className="text-sm font-semibold">ZIP / Postal Code</Label>
                <Input id="zipCode" name="zipCode" placeholder="44600" value={formData.zipCode} onChange={handleChange} required className="mt-1.5 h-12 text-base" />
              </div>
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+977 98XXXXXXXX" value={formData.phone} onChange={handleChange} required className="mt-1.5 h-12 text-base" />
            </div>
          </div>

          {/* ── Payment Details (card only) ───────────────── */}
          {deliveryMethod !== "cashOnDelivery" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <CreditCard className="size-5 text-green-600" />
                Payment Details
              </h3>
              <div>
                <Label htmlFor="cardName" className="text-sm font-semibold">Cardholder Name</Label>
                <Input id="cardName" name="cardName" placeholder="Full Name" value={formData.cardName} onChange={handleChange} required className="mt-1.5 h-12 text-base" />
              </div>
              <div>
                <Label htmlFor="cardNumber" className="text-sm font-semibold">Card Number</Label>
                <Input id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={handleChange} maxLength={19} required className="mt-1.5 h-12 text-base tracking-widest" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="text-sm font-semibold">Expiry Date</Label>
                  <Input id="expiryDate" name="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={handleChange} maxLength={5} required className="mt-1.5 h-12 text-base" />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-sm font-semibold">CVV</Label>
                  <Input id="cvv" name="cvv" type="password" placeholder="•••" value={formData.cvv} onChange={handleChange} maxLength={4} required className="mt-1.5 h-12 text-base" />
                </div>
              </div>
            </div>
          )}

          {/* ── Cash on Delivery Notice ────────────────────── */}
          {deliveryMethod === "cashOnDelivery" && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Banknote className="size-6 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-purple-900 mb-1">Cash on Delivery</p>
                  <p className="text-sm text-purple-700">
                    You will pay <strong>Rs {totalRs.toLocaleString()}</strong> in cash when your order arrives. Please keep exact change ready.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Action Buttons ────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-13 text-base font-bold rounded-xl" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-13 text-base font-black rounded-xl bg-green-600 hover:bg-green-500" disabled={isProcessing}>
              {isProcessing ? (
                "Processing..."
              ) : deliveryMethod === "cashOnDelivery" ? (
                `Confirm Order · Rs ${totalRs.toLocaleString()}`
              ) : (
                `Pay Rs ${totalRs.toLocaleString()}`
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-neutral-400">
            🔒 {deliveryMethod === "cashOnDelivery"
              ? "Your order is secure and will be confirmed immediately"
              : "Your payment information is encrypted and secure"}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
