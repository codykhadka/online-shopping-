import { Product } from "../data/products";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { PaymentDialog } from "./PaymentDialog";

export interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function Cart({ items, isOpen, onClose, onUpdateQuantity, onRemoveItem }: CartProps) {
  const totalRs = items.reduce((sum, item) => sum + Math.round((item.discountPrice || item.price) * 133) * item.quantity, 0);
  const [checkoutProduct, setCheckoutProduct] = useState<CartItem | null>(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500 mb-2">Your cart is empty</p>
              <Button onClick={onClose}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border rounded-lg p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-20 object-cover rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm mb-1 line-clamp-2">{item.name}</h3>
                    {item.discountPrice ? (
                      <p className="text-sm mb-2">
                        <span className="font-bold text-green-700">Rs {Math.round(item.discountPrice * 133).toLocaleString()}</span>
                        <span className="text-xs text-gray-400 line-through ml-2">Rs {Math.round(item.price * 133).toLocaleString()}</span>
                      </p>
                    ) : (
                      <p className="text-sm mb-2">Rs {Math.round(item.price * 133).toLocaleString()}</p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="text-sm w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="size-4" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto p-1 hover:bg-red-100 rounded text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg">Total:</span>
              <span className="text-2xl">Rs {totalRs.toLocaleString()}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                // Use first item for demo, in real app would handle multiple items
                if (items.length > 0) {
                  setCheckoutProduct(items[0]);
                }
              }}
            >
              Checkout
            </Button>
          </div>
        )}
      </div>

      {checkoutProduct && (
        <PaymentDialog
          product={checkoutProduct}
          quantity={checkoutProduct.quantity}
          isOpen={!!checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
        />
      )}
    </>
  );
}
