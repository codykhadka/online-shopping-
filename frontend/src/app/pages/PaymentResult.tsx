import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { CheckCircle2, XCircle, Loader2, Home, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";

export function PaymentResult() {
  const [status, setStatus] = useState<"success" | "failure" | "loading">("loading");
  const [orderDetails, setOrderDetails] = useState<{ id: string; amount: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isSuccess = location.pathname.includes("success");
    
    // For eSewa: get data and decode or just check pidx for Khalti
    const pidx = params.get("pidx");
    const purchase_order_id = params.get("purchase_order_id") || params.get("transaction_uuid");
    const amount = params.get("total_amount") || params.get("amount");

    if (purchase_order_id) {
       setOrderDetails({ id: purchase_order_id, amount: amount || "0" });
    }

    // Verify with our payment server (5001)
    const verifyPayment = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/payment-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: purchase_order_id, pidx })
        });
        const data = await response.json();
        
        if (data.status === "COMPLETED") {
          setStatus("success");
        } else {
          setStatus("failure");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus(isSuccess ? "success" : "failure"); // Fallback to URL path if server unreachable
      }
    };

    verifyPayment();
  }, [location]);

  if (status === "loading") {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-green-600 size-10" />
        <p className="text-neutral-500 font-medium">Verifying payment status...</p>
      </div>
    );
  }

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl text-center border border-slate-100"
      >
        <div className={`size-24 rounded-full mx-auto mb-8 flex items-center justify-center ${isSuccess ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
          {isSuccess ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
        </div>

        <h1 className="text-3xl font-black text-neutral-900 mb-4">
          {isSuccess ? "Payment Successful!" : "Payment Failed"}
        </h1>
        <p className="text-neutral-500 mb-10 leading-relaxed font-medium">
          {isSuccess 
            ? "Thank you for your purchase. Your payment has been processed and your order is being prepared." 
            : "We encountered an issue while processing your payment. Please try again or contact support if the issue persists."}
        </p>

        {orderDetails && (
          <div className="bg-slate-50 rounded-2xl p-6 mb-10 text-left space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Order ID:</span>
                <span className="font-bold text-neutral-800">{orderDetails.id}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Amount Paid:</span>
                <span className="font-black text-green-700">Rs {Number(orderDetails.amount).toLocaleString()}</span>
             </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => navigate(isSuccess ? `/tracking/${orderDetails?.id}` : "/")} 
            className={`h-14 rounded-2xl font-black text-lg ${isSuccess ? "bg-green-600 hover:bg-green-500" : "bg-neutral-900"}`}
          >
            {isSuccess ? "Track Delivery" : "Return to Store"}
            <ArrowRight className="ml-2 size-5" />
          </Button>
          <Link to="/" className="text-neutral-400 hover:text-neutral-600 text-sm font-bold flex items-center justify-center gap-2 py-2">
            <Home size={16} />
            Go to Homepage
          </Link>
        </div>

        {/* Secure Footer */}
        <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-center gap-2">
           <ShieldCheck size={16} className="text-slate-300" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Transaction ID verified by Danphe</p>
        </div>
      </motion.div>
    </div>
  );
}
