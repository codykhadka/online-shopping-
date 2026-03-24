import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CreditCard, ShieldCheck, CheckCircle2, Loader2, Lock, ArrowRight, Wallet, Info } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, total, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<"card" | "processing" | "success">("card");
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });

  useEffect(() => {
    if (isOpen) {
      setStep("card");
      setCardData({ number: "", expiry: "", cvc: "", name: "" });
    }
  }, [isOpen]);

  const handlePay = () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name) {
      toast.error("Please complete all payment fields.");
      return;
    }
    
    setStep("processing");
    
    // Simulate payment processing delay
    setTimeout(() => {
      setStep("success");
      onSuccess();
    }, 2500);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(" ");
    return value;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight">Secure Payment</h3>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-none">Powered by Stripe Protocol</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-8">
            {step === "card" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Order Summary Summary */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Total Amount</p>
                      <p className="text-lg font-black text-neutral-900 leading-tight">${total.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Currency</p>
                    <p className="text-sm font-bold text-neutral-600">USD (Global)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Card Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Card Number</label>
                    <div className="relative group">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                        maxLength={19}
                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-mono text-sm tracking-widest"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Expiry */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        maxLength={5}
                        className="w-full px-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-mono text-sm uppercase tracking-widest"
                      />
                    </div>
                    {/* CVC */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">CVC / CVV</label>
                      <div className="relative group">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                          type="password"
                          placeholder="•••"
                          value={cardData.cvc}
                          onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                          maxLength={3}
                          className="w-full pl-4 pr-10 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-mono text-sm tracking-widest"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="FULL NAME AS ON CARD"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-bold text-xs uppercase tracking-widest"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handlePay}
                    className="w-full py-7 bg-neutral-900 border-none hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-neutral-200 flex items-center justify-center gap-3 group"
                  >
                    Pay ${total.toFixed(2)}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="flex items-center gap-1.5 py-1 px-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                    <Lock size={12} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">End-to-End Encrypted</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 flex flex-col items-center justify-center gap-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                  <Loader2 className="animate-spin text-blue-600 relative z-10" size={48} strokeWidth={3} />
                </div>
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-black text-neutral-900">Validating Credentials</h4>
                  <p className="text-xs text-neutral-500 font-medium px-10">Communicating with banking protocols. Please do not close this window.</p>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center gap-8"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                    className="size-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 relative z-10"
                  >
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                  </motion.div>
                  <div className="absolute inset-0 bg-emerald-500/30 blur-3xl animate-pulse" />
                </div>
                
                <div className="text-center space-y-3">
                  <div>
                    <h4 className="text-2xl font-black text-neutral-900 leading-none">Capture Successful</h4>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mt-2">Authorization Complete</p>
                  </div>
                  <p className="text-sm text-neutral-500 font-medium max-w-[240px] mx-auto leading-relaxed">
                    Transaction ID: <span className="font-mono text-neutral-900">#TXN-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                  </p>
                </div>

                <div className="w-full pt-4">
                  <Button
                    onClick={onClose}
                    className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-200"
                  >
                    Track Your Order
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Info */}
          {step === "card" && (
            <div className="px-8 pb-8 flex items-start gap-3 opacity-60">
              <Info size={14} className="text-neutral-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-neutral-500 leading-relaxed">
                Your payment data is processed by encrypted decentralized protocols. Danphe Organic never stores sensitive credit card credentials on local hardware.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
