import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '@workspace/api-client-react';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = Pick<Product, 'id' | 'name' | 'price' | 'imageUrl' | 'category'> & { quantity: number };
type ShopContextValue = { cartItems: CartItem[]; wishlist: string[]; cartCount: number; cartTotal: number; addToCart: (product: Product) => void; setQuantity: (id: string, quantity: number) => void; removeFromCart: (id: string) => void; clearCart: () => void; toggleWishlist: (id: string) => void };
const CartContext = createContext<ShopContextValue | null>(null);
const CART_KEY = 'mkenya_cart'; const WISHLIST_KEY = 'mkenya_wishlist';
export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]); const [wishlist, setWishlist] = useState<string[]>([]);
  useEffect(() => { Promise.all([AsyncStorage.getItem(CART_KEY), AsyncStorage.getItem(WISHLIST_KEY)]).then(([cart, saved]) => { if (cart) setCartItems(JSON.parse(cart) as CartItem[]); if (saved) setWishlist(JSON.parse(saved) as string[]); }).catch(() => undefined); }, []);
  useEffect(() => { AsyncStorage.setItem(CART_KEY, JSON.stringify(cartItems)).catch(() => undefined); }, [cartItems]);
  useEffect(() => { AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)).catch(() => undefined); }, [wishlist]);
  const value = useMemo(() => ({
    cartItems, wishlist, cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0), cartTotal: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addToCart: (product: Product) => setCartItems(items => { const current = items.find(item => item.id === product.id); return current ? items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, category: product.category, quantity: 1 }]; }),
    setQuantity: (id: string, quantity: number) => setCartItems(items => quantity < 1 ? items.filter(item => item.id !== id) : items.map(item => item.id === id ? { ...item, quantity } : item)),
    removeFromCart: (id: string) => setCartItems(items => items.filter(item => item.id !== id)), clearCart: () => setCartItems([]), toggleWishlist: (id: string) => setWishlist(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]),
  }), [cartItems, wishlist]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useShop() { const value = useContext(CartContext); if (!value) throw new Error('useShop must be used inside ShopProvider'); return value; }
