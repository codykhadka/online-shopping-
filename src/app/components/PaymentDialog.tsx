import { useState } from "react";
import { useNavigate } from "react-router";
import { Product } from "../data/products";
import { CreditCard, Lock, Truck, Zap, Clock } from "lucide-react";
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

type DeliveryMethod = "standard" | "express" | "sameday" | "cashOnDelivery";

const deliveryOptions = [
  {
    id: "standard" as DeliveryMethod,
    name: "Standard Delivery",
    description: "5-7 business days",
    price: 0,
    icon: Truck,
  },
  {
    id: "express" as DeliveryMethod,
    name: "Express Delivery",
    description: "2-3 business days",
    price: 15,
    icon: Zap,
  },
  {
    id: "sameday" as DeliveryMethod,
    name: "Same Day Delivery",
    description: "Order within 2 hours",
    price: 25,
    icon: Clock,
  },
  {
    id: "cashOnDelivery" as DeliveryMethod,
    name: "Cash on Delivery",
    description: "Pay when you receive",
    price: 5,
    icon: CreditCard,
  },
];

export function PaymentDialog({ product, quantity = 1, isOpen, onClose }: PaymentDialogProps) {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("standard");
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

  const selectedDelivery = deliveryOptions.find(d => d.id === deliveryMethod)!;
  const subtotal = product.price * quantity;
  const deliveryFee = selectedDelivery.price;
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      const orderId = Math.random().toString(36).substring(7).toUpperCase();
      
      // Save real order to persistent storage
      saveOrder({
        id: orderId,
        customerName: formData.cardName || "Guest Customer",
        productName: product.name,
        price: total,
        status: -1, // -1 means PENDING
        timestamp: new Date().toLocaleString(),
        address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
        phone: formData.phone
      });

      const deliveryMsg = deliveryMethod === "cashOnDelivery" 
        ? "Order confirmed! Pay when you receive your delivery."
        : "Payment successful! Order confirmed.";
      toast.success(deliveryMsg);
      onClose();
      
      // Reset form
      setFormData({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
        email: "",
        address: "",
        city: "",
        zipCode: "",
        phone: "",
      });
      setDeliveryMethod("standard");
      
      // Navigate to tracking page
      navigate(`/tracking/${orderId}`);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Secure Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your purchase securely. All transactions are encrypted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Order Summary</h3>
            <div className="flex gap-3 mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="size-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm mb-1">{product.name}</p>
                <p className="text-xs text-gray-600">Quantity: {quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">${subtotal.toFixed(2)}</p>
              </div>
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span>{deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-semibold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Delivery Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deliveryOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDeliveryMethod(option.id)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      deliveryMethod === option.id
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`size-5 mt-0.5 ${deliveryMethod === option.id ? "text-blue-600" : "text-gray-600"}`} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">{option.name}</p>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                      <p className="text-sm font-semibold">
                        {option.price === 0 ? "FREE" : `+$${option.price}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contact Information</h3>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Delivery Address</h3>
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="10001"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Payment Details */}
          {deliveryMethod !== "cashOnDelivery" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="size-4" />
                Payment Details
              </h3>
              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  name="cardName"
                  placeholder="John Doe"
                  value={formData.cardName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    type="password"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={handleChange}
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {deliveryMethod === "cashOnDelivery" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CreditCard className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Cash on Delivery</p>
                  <p className="text-xs text-blue-700">
                    You will pay ${total.toFixed(2)} in cash when your order arrives at your doorstep.
                    Please keep exact change ready for a smooth transaction.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : deliveryMethod === "cashOnDelivery" ? (
                <>Confirm Order</>
              ) : (
                <>Pay ${total.toFixed(2)}</>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            🔒 {deliveryMethod === "cashOnDelivery" 
              ? "Your order is secure and will be confirmed immediately"
              : "Your payment information is encrypted and secure"}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}