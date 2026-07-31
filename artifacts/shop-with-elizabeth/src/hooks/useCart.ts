import { useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  category: string;
}

const CART_KEY = "elizabeth_cart";

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch {
        setCartItems([]);
      }
    }
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const addToCart = (product: { id: string; name: string; imageUrl: string; price: number; category: string }) => {
    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      saveCart(
        cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      saveCart([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    saveCart(cartItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      saveCart(
        cartItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };
}
