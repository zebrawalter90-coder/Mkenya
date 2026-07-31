import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  const handleCheckout = () => {
    onCheckout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            data-testid="cart-backdrop"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col"
            data-testid="cart-drawer"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Your Cart
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-muted hover:bg-destructive hover:text-white flex items-center justify-center transition-colors"
                data-testid="button-close-cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-foreground mb-1">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">Browse items and add them to your cart</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-card border border-border rounded-2xl p-3 flex gap-3"
                      data-testid={`cart-item-${item.id}`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl bg-muted shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground line-clamp-1 mb-0.5">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 bg-muted rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center transition-colors"
                              data-testid={`button-decrease-${item.id}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold w-6 text-center" data-testid={`quantity-${item.id}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center transition-colors"
                              data-testid={`button-increase-${item.id}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-black text-secondary mt-2" data-testid={`subtotal-${item.id}`}>
                          KES {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-border p-5 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Subtotal</span>
                    <span className="text-sm font-bold text-foreground" data-testid="text-subtotal">
                      KES {cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-black text-foreground">Total</span>
                    <span className="font-black text-secondary" data-testid="text-total">
                      KES {cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-white"
                    data-testid="button-checkout"
                  >
                    Checkout
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
