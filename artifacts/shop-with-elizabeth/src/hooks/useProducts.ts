import { useState, useEffect } from "react";
import { SEED_PRODUCTS } from "@/lib/seed";

export type Category = "Clothing" | "Accessories" | "Fabric" | "Footwear" | "Jewelry" | "Beauty" | "Other";

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageDataUrl: string;
  category: Category;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  ownerId: string;
  ownerName: string;
  createdAt: string;
}

const STORAGE_KEY = "elizabeth_products_v2";

function migrateProduct(p: Record<string, unknown>): Product {
  const rawComments = (p.comments as unknown[]) ?? [];
  const comments: Comment[] = rawComments.map((c) => {
    if (typeof c === "string") {
      return {
        id: crypto.randomUUID(),
        userId: "unknown",
        username: "Anonymous",
        text: c,
        timestamp: new Date().toISOString(),
      };
    }
    return c as Comment;
  });

  return {
    id: (p.id as string) ?? crypto.randomUUID(),
    name: (p.name as string) ?? "",
    price: (p.price as number) ?? 0,
    imageDataUrl: (p.imageDataUrl as string) ?? "",
    category: (p.category as Category) ?? "Other",
    likes: (p.likes as number) ?? 0,
    likedBy: (p.likedBy as string[]) ?? [],
    comments,
    ownerId: (p.ownerId as string) ?? "system",
    ownerName: (p.ownerName as string) ?? "Elizabeth",
    createdAt: (p.createdAt as string) ?? new Date().toISOString(),
  };
}

function loadProducts(): Product[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as unknown[];
      return (parsed as Record<string, unknown>[]).map(migrateProduct);
    } catch {
      return SEED_PRODUCTS;
    }
  }
  return SEED_PRODUCTS;
}

function saveToStorage(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(loadProducts());
  }, []);

  const update = (next: Product[]) => {
    setProducts(next);
    saveToStorage(next);
  };

  const addProduct = (product: Omit<Product, "id" | "likes" | "likedBy" | "comments" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    update([newProduct, ...products]);
  };

  const deleteProduct = (id: string, userId: string) => {
    const product = products.find((p) => p.id === id);
    if (!product || product.ownerId !== userId) return;
    update(products.filter((p) => p.id !== id));
  };

  const editProduct = (id: string, userId: string, name: string, price: number) => {
    const product = products.find((p) => p.id === id);
    if (!product || product.ownerId !== userId) return;
    update(products.map((p) => (p.id === id ? { ...p, name, price } : p)));
  };

  const toggleLike = (id: string, userId: string) => {
    update(
      products.map((p) => {
        if (p.id !== id) return p;
        const alreadyLiked = p.likedBy.includes(userId);
        return {
          ...p,
          likedBy: alreadyLiked ? p.likedBy.filter((uid) => uid !== userId) : [...p.likedBy, userId],
          likes: alreadyLiked ? p.likes - 1 : p.likes + 1,
        };
      })
    );
  };

  const addComment = (id: string, userId: string, username: string, text: string) => {
    const comment: Comment = {
      id: crypto.randomUUID(),
      userId,
      username,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    update(
      products.map((p) =>
        p.id === id ? { ...p, comments: [...p.comments, comment] } : p
      )
    );
  };

  return {
    products,
    addProduct,
    deleteProduct,
    editProduct,
    toggleLike,
    addComment,
  };
}
