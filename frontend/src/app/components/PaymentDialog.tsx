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
type PaymentMode = "card" | "esewa" | "khalti" | "cod";

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

const CITIES = ["Kathmandu", "Bhaktapur", "Lalitpur", "Budhanilkantha", "Tokha"];

const KATHMANDU_WARDS_DATA = [
  { ward: "Ward 1", label: "Ward 1 – Naxal", areas: ["Naxal Bhagwati", "Narayanchaur", "Nagpokhari", "Gairidhara"] },
  { ward: "Ward 2", label: "Ward 2 – Lazimpat", areas: ["Lazimpat main", "Panipokhari", "Dhobichaur (part)"] },
  { ward: "Ward 3", label: "Ward 3 – Maharajgunj", areas: ["Maharajgunj", "Chakrapath area", "Teaching Hospital area"] },
  { ward: "Ward 4", label: "Ward 4 – Baluwatar", areas: ["Baluwatar", "Bishalnagar", "Kapan (part)"] },
  { ward: "Ward 5", label: "Ward 5 – Handigaun", areas: ["Handigaun core", "Dhumbarahi (part)"] },
  { ward: "Ward 6", label: "Ward 6 – Boudha", areas: ["Boudhanath", "Tinchuli", "Ramhiti"] },
  { ward: "Ward 7", label: "Ward 7 – Chabahil", areas: ["Chabahil", "Mitrapark", "Gopi Krishna area"] },
  { ward: "Ward 8", label: "Ward 8 – Gaushala", areas: ["Gaushala", "Pingalasthan", "Airport area (part)"] },
  { ward: "Ward 9", label: "Ward 9 – Sinamangal", areas: ["Sinamangal", "Airport residential", "Pepsicola (part)"] },
  { ward: "Ward 10", label: "Ward 10 – Baneshwor", areas: ["New Baneshwor", "Old Baneshwor", "Sankhamul"] },
  { ward: "Ward 11", label: "Ward 11 – Tripureshwor", areas: ["Tripureshwor", "Thapathali", "Kalmochan"] },
  { ward: "Ward 12", label: "Ward 12 – Teku", areas: ["Teku", "Pachali", "Bishnumati riverside"] },
  { ward: "Ward 13", label: "Ward 13 – Kalimati", areas: ["Kalimati", "Tankeshwor", "Soltimode"] },
  { ward: "Ward 14", label: "Ward 14 – Kuleshwor", areas: ["Kuleshwor", "Balkhu (part)"] },
  { ward: "Ward 15", label: "Ward 15 – Swoyambhu", areas: ["Swayambhunath", "Bijeshwori", "Sitapaila (part)"] },
  { ward: "Ward 16", label: "Ward 16 – Balaju", areas: ["Balaju", "Machhapokhari", "Industrial area"] },
  { ward: "Ward 17", label: "Ward 17 – Chhetrapati", areas: ["Chhetrapati", "Thahiti", "Jhochhen"] },
  { ward: "Ward 18", label: "Ward 18 – Naradevi", areas: ["Naradevi", "Kilagal", "Nardevi temple area"] },
  { ward: "Ward 19", label: "Ward 19 – Bangemudha", areas: ["Bangemudha", "Wotu", "Nhyokha"] },
  { ward: "Ward 20", label: "Ward 20 – Basantapur", areas: ["Basantapur", "Hanuman Dhoka", "Kathmandu Durbar Square"] },
  { ward: "Ward 21", label: "Ward 21 – Bhimsensthan", areas: ["Bhimsensthan", "Sukra Path", "New Road"] },
  { ward: "Ward 22", label: "Ward 22 – New Road core", areas: ["Indrachowk (part)", "Makhan", "Asan entry area"] },
  { ward: "Ward 23", label: "Ward 23 – Indra Chowk", areas: ["Indra Chowk", "Makhan Tole"] },
  { ward: "Ward 24", label: "Ward 24 – Maru", areas: ["Maru Tole", "Kasthamandap area"] },
  { ward: "Ward 25", label: "Ward 25 – Ason", areas: ["Asan Bazaar", "Kel Tole", "Balkumari area"] },
  { ward: "Ward 26", label: "Ward 26 – Thamel", areas: ["Thamel main", "Paknajol", "Chaksibari"] },
  { ward: "Ward 27", label: "Ward 27 – Jyatha", areas: ["Jyatha", "Kantipath area"] },
  { ward: "Ward 28", label: "Ward 28 – Bagbazaar", areas: ["Bagbazaar", "Exhibition Road", "Padmodaya area"] },
  { ward: "Ward 29", label: "Ward 29 – Dillibazar", areas: ["Dillibazar", "Putalisadak", "Gyaneshwor (part)"] },
  { ward: "Ward 30", label: "Ward 30 – Ason / Indra Chowk", areas: ["Asan core", "Indra Chowk", "Maru surroundings"] },
  { ward: "Ward 31", label: "Ward 31 – Balkhu", areas: ["Balkhu", "Kalanki side (part)"] },
  { ward: "Ward 32", label: "Ward 32 – Koteshwor", areas: ["Koteshwor", "Jadibuti", "Tinkune (part)"] }
];

const TOKHA_WARDS_DATA = [
  { ward: "Ward 1",  label: "Ward 1 – Tokha (Old core)",       areas: ["Tokha Bazaar", "Chandeshwori area"] },
  { ward: "Ward 2",  label: "Ward 2 – Baniyatar",               areas: ["Baniyatar", "Greenhill area"] },
  { ward: "Ward 3",  label: "Ward 3 – Gongabu",                 areas: ["Gongabu", "New Bus Park area"] },
  { ward: "Ward 4",  label: "Ward 4 – Dhapasi",                 areas: ["Dhapasi", "Basundhara (part)"] },
  { ward: "Ward 5",  label: "Ward 5 – Grande / Pasikot",        areas: ["Grande area", "Pasikot"] },
  { ward: "Ward 6",  label: "Ward 6 – Jhor",                    areas: ["Jhor Mahankal", "Rural hillside settlements"] },
  { ward: "Ward 7",  label: "Ward 7 – Bhadrabas",               areas: ["Bhadrabas", "Forest-side areas"] },
  { ward: "Ward 8",  label: "Ward 8 – Lamatar",                 areas: ["Lamatar", "Semi-rural zones"] },
  { ward: "Ward 9",  label: "Ward 9 – Manamaiju",               areas: ["Manamaiju", "Agricultural/residential mix"] },
  { ward: "Ward 10", label: "Ward 10 – Samakhusi (part)",       areas: ["Samakhusi area (part)", "Ring Road connection zone"] },
  { ward: "Ward 11", label: "Ward 11 – Gongabu (extended)",     areas: ["Gongabu outskirts", "Bus park surroundings (expanded zone)"] },
];

const getWardsForCity = (city: string) => {
  if (city === "Kathmandu") return KATHMANDU_WARDS_DATA;
  if (city === "Tokha") return TOKHA_WARDS_DATA;
  return [];
};

export function PaymentDialog({ product, quantity = 1, isOpen, onClose }: PaymentDialogProps) {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("cashOnDelivery");
  const [customDeliveryFeeRs, setCustomDeliveryFeeRs] = useState(266); // starts at Rs 266 (COD default)
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: authUser?.name || "",
    expiryDate: "",
    cvv: "",
    email: "",
    ward: "Ward 1",
    area: KATHMANDU_WARDS_DATA[0].areas[0],
    landmark: "",
    address: "",
    city: "Kathmandu",
    zipCode: "44600",
    phone: "",
  });
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("card");

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

  const handleInitiatePayment = async (gateway: "esewa" | "khalti") => {
    try {
      setIsProcessing(true);
      const productId = `order-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      const response = await fetch("http://localhost:5001/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.cardName || authUser?.name || "Customer",
          customerEmail: formData.email || authUser?.email || "customer@example.com",
          customerPhone: formData.phone || "9800000000",
          productName: product.name,
          amount: totalRs,
          paymentGateway: gateway,
          productId: productId
        })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("An error occurred. Please check if the payment server is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMode === "esewa") {
      return handleInitiatePayment("esewa");
    }
    if (paymentMode === "khalti") {
      return handleInitiatePayment("khalti");
    }
    if (paymentMode === "cod") {
      setDeliveryMethod("cashOnDelivery");
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    const orderId = Math.random().toString(36).substring(7).toUpperCase();

    await saveOrder({
      id: orderId,
      customerName: formData.cardName || "Guest Customer",
      productName: product.name,
      price: totalRs,
      deliveryFee: deliveryFeeRs,
      status: -1,
      location: "",
      timestamp: new Date().toLocaleString(),
      address: [
        formData.area,
        formData.landmark,
        formData.ward,
        formData.city
      ].filter(Boolean).join(", ") + (formData.zipCode ? ` (Near: ${formData.zipCode})` : ""),
      phone: formData.phone,
      user_id: authUser?.id || null,
    });

    const msg = deliveryMethod === "cashOnDelivery"
      ? "Order confirmed! Pay when you receive your delivery."
      : "Payment successful! Order confirmed.";
    toast.success(msg);
    onClose();

    setFormData({ cardNumber: "", cardName: "", expiryDate: "", cvv: "", email: "", ward: "Ward 1", area: KATHMANDU_WARDS_DATA[0].areas[0], landmark: "", address: "", city: "Kathmandu", zipCode: "44600", phone: "" });
    setDeliveryMethod("cashOnDelivery");
    setCustomDeliveryFeeRs(266);
    navigate(`/tracking/${orderId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "city") {
        const wards = getWardsForCity(value);
        if (wards.length > 0) {
          updated.ward = wards[0].ward;
          updated.area = wards[0].areas[0];
        } else {
          updated.ward = "";
          updated.area = "";
        }
      } else if (name === "ward") {
        const wards = getWardsForCity(prev.city);
        const matchingWard = wards.find(w => w.ward === value);
        if (matchingWard) {
          updated.area = matchingWard.areas[0] || "";
        }
      }
      return updated;
    });
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



          {/* ── Payment Mode Selection ────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Select Payment Method</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: "card", name: "Card", icon: CreditCard },
                { id: "esewa", name: "eSewa", icon: CheckCircle2 },
                { id: "khalti", name: "Khalti", icon: CheckCircle2 },
                { id: "cod", name: "COD", icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMode(m.id as PaymentMode);
                    }}
                    className={`p-3 border-2 rounded-xl text-center flex flex-col items-center gap-2 transition-all ${
                      isSelected ? "border-green-600 bg-green-50 ring-2 ring-green-100" : "border-neutral-200 bg-white"
                    }`}
                  >
                    <Icon className={`size-5 ${isSelected ? "text-green-600" : "text-neutral-400"}`} />
                    <span className={`text-xs font-bold ${isSelected ? "text-neutral-900" : "text-neutral-600"}`}>{m.name}</span>
                  </button>
                );
              })}
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
          <div className="space-y-4 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100">
            <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-2">Delivery Location</h3>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm text-indigo-800 flex items-center gap-2 font-medium">
              <span>📍 State: Bagmati Province (Currently serving only)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-semibold text-neutral-700">City / District</Label>
                <select 
                  id="city" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  required 
                  className="mt-1.5 flex h-12 w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-neutral-900"
                >
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {(formData.city === "Kathmandu" || formData.city === "Tokha") ? (
                <>
                  <div>
                    <Label htmlFor="ward" className="text-sm font-semibold text-neutral-700">{formData.city} Ward</Label>
                    <select 
                      id="ward" 
                      name="ward" 
                      value={formData.ward} 
                      onChange={handleChange} 
                      required 
                      className="mt-1.5 flex h-12 w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-neutral-900 line-clamp-1 truncate"
                    >
                      {getWardsForCity(formData.city).map(w => (
                        <option key={w.ward} value={w.ward}>{w.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="area" className="text-sm font-semibold text-neutral-700">Specific Area</Label>
                    <select
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      className="mt-1.5 flex h-12 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-neutral-900"
                    >
                      {getWardsForCity(formData.city).find(w => w.ward === formData.ward)?.areas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-1">
                  <Label htmlFor="area" className="text-sm font-semibold text-neutral-700">General Area / Landmark</Label>
                  <Input 
                    id="area" 
                    name="area" 
                    placeholder="E.g., Downtown"
                    value={formData.area} 
                    onChange={handleChange} 
                    required 
                    className="mt-1.5 h-12 text-base bg-white rounded-xl w-full"
                  />
                </div>
              )}
            </div>

            {/* Landmark description row */}
            <div>
              <Label htmlFor="landmark" className="text-sm font-semibold text-neutral-700">House Location / Landmark</Label>
              <Input
                id="landmark"
                name="landmark"
                placeholder="E.g., Near supermarket, road side, opposite to temple, blue gate..."
                value={formData.landmark}
                onChange={handleChange}
                className="mt-1.5 h-12 text-base bg-white rounded-xl w-full"
              />
              <p className="text-xs text-neutral-400 mt-1">📍 Help us find you easily — mention any nearby famous place or landmark</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode" className="text-sm font-semibold text-neutral-700">House / Flat No.</Label>
                <Input id="zipCode" name="zipCode" placeholder="House No. or Flat..." value={formData.zipCode} onChange={handleChange} className="mt-1.5 h-12 text-base bg-white rounded-xl" />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold text-neutral-700">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+977 98XXXXXXXX" value={formData.phone} onChange={handleChange} required className="mt-1.5 h-12 text-base bg-white rounded-xl" />
              </div>
            </div>
          </div>

          {/* ── Payment Details (card only) ───────────────── */}
          {paymentMode === "card" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <CreditCard className="size-5 text-green-600" />
                Card Details
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

          {/* ── Gateway Notice ────────────────────── */}
          {paymentMode === "esewa" && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <p className="text-sm text-green-700">
                You will be redirected to the <strong>eSewa</strong> checkout page to complete your payment of <strong>Rs {totalRs.toLocaleString()}</strong>.
              </p>
            </div>
          )}

          {paymentMode === "khalti" && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
              <p className="text-sm text-purple-700">
                You will be redirected to the <strong>Khalti</strong> checkout page to complete your payment of <strong>Rs {totalRs.toLocaleString()}</strong>.
              </p>
            </div>
          )}

          {paymentMode === "cod" && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="text-sm text-blue-700">
                You will pay <strong>Rs {totalRs.toLocaleString()}</strong> in cash when your order arrives. Please keep exact change ready.
              </p>
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
              ) : paymentMode === "cod" ? (
                `Confirm Order · Rs ${totalRs.toLocaleString()}`
              ) : (
                `Pay Rs ${totalRs.toLocaleString()}`
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-neutral-400">
            🔒 {paymentMode === "cod" 
              ? "Your order is secure and will be confirmed immediately"
              : "Your payment information is encrypted and secure"}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
