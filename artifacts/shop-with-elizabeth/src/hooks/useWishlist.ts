import { useState, useEffect } from "react";

export interface WishlistProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
}

const WISHLIST_KEY = "elizabeth_wishlist";

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (stored) {
      try {
        setWishlistItems(JSON.parse(stored));
      } catch {
        setWishlistItems([]);
      }
    }
  }, []);

  const saveWishlist = (items: WishlistProduct[]) => {
    setWishlistItems(items);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  };

  const isWishlisted = (id: string) => {
    return wishlistItems.some((item) => item.id === id);
  };

  const toggleWishlist = (product: { id: string; name: string; imageUrl: string; price: number; category: string }) => {
    if (isWishlisted(product.id)) {
      saveWishlist(wishlistItems.filter((item) => item.id !== product.id));
    } else {
      saveWishlist([...wishlistItems, product]);
    }
  };

  const wishlistCount = wishlistItems.length;

  return {
    wishlistItems,
    isWishlisted,
    toggleWishlist,
    wishlistCount,
  };
}
