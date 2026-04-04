import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Product, products } from "../data/products";
import { CreditCard, Lock, Truck, Zap, Plus, Minus, Banknote, CheckCircle2, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { saveOrder } from "../utils/storage";
import { getAuthUser } from "../utils/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { motion } from "motion/react";

type DeliveryMethod = "economy" | "standard" | "express" | "cashOnDelivery";
type PaymentMode = "card" | "esewa" | "khalti" | "cod";

const RS_RATE = 133;
const toRs = (usd: number) => Math.round(usd * RS_RATE);

const deliveryOptions = [
  { id: "cashOnDelivery", name: "Delivery", description: "Home delivery within 3–5 days", priceRs: 250, icon: Truck, color: "green" },
];

export function Checkout() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod] = useState<DeliveryMethod>("cashOnDelivery");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("card");
  const [quantity] = useState(1);
  const [customDeliveryFeeRs] = useState(250);

  const [formData, setFormData] = useState({
    cardName: authUser?.name || "",
    email: authUser?.email || "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    const found = products.find(p => p.id === productId);
    if (found) setProduct(found);
    else navigate("/");
  }, [productId, navigate]);

  if (!product) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>;

  const subtotalRs = toRs((product.discountPrice || product.price) * quantity);
  const totalRs = subtotalRs + customDeliveryFeeRs;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInitiatePayment = async (gateway: "esewa" | "khalti") => {
    try {
      setIsProcessing(true);
      const orderId = `order-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
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
          productId: orderId
        })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to initiate gateway. Please try again.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Gateway error. Ensure payment server (Port 5001) is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMode === "esewa") return handleInitiatePayment("esewa");
    if (paymentMode === "khalti") return handleInitiatePayment("khalti");

    setIsProcessing(true);
    const orderId = Math.random().toString(36).substring(7).toUpperCase();

    await saveOrder({
      id: orderId,
      customerName: formData.cardName || "Guest",
      productName: product.name,
      price: totalRs,
      status: -1,
      location: "Order Placed",
      timestamp: new Date().toLocaleString(),
      address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
      phone: formData.phone,
      user_id: authUser?.id || null,
    });

    toast.success("Order confirmed successfully!");
    navigate(`/tracking/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-10">
      <div className="max-w-5xl mx-auto px-4">
        <Link to={`/product/${productId}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-green-600 mb-8 font-medium transition-colors">
          <ArrowLeft size={20} />
          Back to Product
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Form */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                <ShieldCheck className="text-green-600" />
                Secure Checkout
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-neutral-800">Contact & Shipping</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 block">Full Name</Label>
                       <Input name="cardName" value={formData.cardName} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-none px-4" />
                    </div>
                    <div>
                       <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 block">Email</Label>
                       <Input name="email" value={formData.email} onChange={handleChange} type="email" required className="h-12 rounded-xl bg-slate-50 border-none px-4" />
                    </div>
                    <div>
                       <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 block">Phone</Label>
                       <Input name="phone" value={formData.phone} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-none px-4" />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-neutral-800">Delivery Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Input name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-none px-4" />
                    </div>
                    <Input name="city" placeholder="City" value={formData.city} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-none px-4" />
                    <Input name="zipCode" placeholder="ZIP Code" value={formData.zipCode} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-none px-4" />
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-neutral-800">Delivery Service</h3>
                  <div className="p-5 rounded-2xl border-2 border-green-600 bg-green-50 flex items-center gap-4">
                     <div className="p-3 bg-green-600 text-white rounded-xl">
                        <Truck size={24} />
                     </div>
                     <div>
                        <p className="font-black text-neutral-900">Standard Delivery</p>
                        <p className="text-sm text-green-700 font-medium">Arrives in 3–5 business days</p>
                     </div>
                     <div className="ml-auto text-right">
                        <p className="text-xl font-black text-green-700">Rs 250</p>
                     </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-neutral-800">Payment Method</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "card", name: "Card", img: "/icons/card.svg" },
                      { id: "esewa", name: "eSewa", img: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.webp" },
                      { id: "khalti", name: "Khalti", img: "https://khalti.com/static/img/logo1.png" },
                      { id: "cod", name: "COD", img: "/icons/cod.svg" },
                    ].map(mode => (
                      <button key={mode.id} type="button" onClick={() => setPaymentMode(mode.id as PaymentMode)} className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMode === mode.id ? "border-green-600 bg-green-50 shadow-md" : "border-slate-100 bg-white shadow-sm"}`}>
                        {mode.id === "esewa" || mode.id === "khalti" ? (
                           <img src={mode.img} className="h-6 object-contain" alt={mode.name} />
                        ) : (
                          <div className={`p-1.5 rounded-lg ${paymentMode === mode.id ? "bg-green-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                            {mode.id === "card" ? <CreditCard size={18} /> : <Banknote size={18} />}
                          </div>
                        )}
                        <span className="text-xs font-black">{mode.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Fields */}
                {paymentMode === "card" && (
                  <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-200">
                    <Input name="cardNumber" placeholder="Card Number" value={formData.cardNumber} onChange={handleChange} className="h-12 bg-white" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input name="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={handleChange} className="h-12 bg-white" />
                      <Input name="cvv" placeholder="CVV" type="password" value={formData.cvv} onChange={handleChange} className="h-12 bg-white" />
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={isProcessing} className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-500 text-lg font-black shadow-xl shadow-green-100">
                  {isProcessing ? "Processing..." : `Complete Purchase · Rs ${totalRs.toLocaleString()}`}
                </Button>
              </form>
            </motion.div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-10 space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-neutral-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-10 blur-2xl bg-green-500 rounded-full -mr-20 -mt-20 w-64 h-64" />
                
                <h3 className="text-sm font-black uppercase tracking-widest text-green-500 mb-8">Order Summary</h3>
                
                <div className="flex gap-5 mb-10">
                  <img src={product.image} className="size-24 rounded-2xl object-cover shadow-lg border-2 border-white/10" alt={product.name} />
                  <div>
                    <h4 className="text-xl font-black mb-1 line-clamp-1">{product.name}</h4>
                    <p className="text-neutral-400 text-sm">{product.category}</p>
                    <p className="mt-2 inline-flex items-center px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-neutral-300">Quantity: {quantity}</p>
                  </div>
                </div>

                <div className="space-y-5 border-t border-white/10 pt-8 mt-5">
                  <div className="flex justify-between items-center text-neutral-400">
                    <p className="font-medium">Subtotal</p>
                    <p className="font-black text-white">Rs {subtotalRs.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center text-neutral-400">
                    <p className="font-medium">Delivery ({deliveryMethod})</p>
                    <p className="font-black text-white">Rs {customDeliveryFeeRs.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center pt-5 border-t border-white/20">
                    <p className="text-lg font-bold text-green-400">Total Order</p>
                    <p className="text-3xl font-black">Rs {totalRs.toLocaleString()}</p>
                  </div>
                </div>

                {/* Secure Badge */}
                <div className="mt-10 flex items-center justify-center gap-3 py-4 bg-white/5 rounded-2xl border border-white/5">
                  <ShieldCheck size={18} className="text-green-500" />
                  <p className="text-[10px] uppercase font-black tracking-widest text-neutral-500">256-bit SSL Secure Checkout</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
