import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageDataUrl: string;
  likes: number;
  comments: string[];
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('elizabeth_products');
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse products', e);
      }
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('elizabeth_products', JSON.stringify(newProducts));
  };

  const addProduct = (product: Omit<Product, 'id' | 'likes' | 'comments'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      likes: 0,
      comments: [],
    };
    saveProducts([...products, newProduct]);
  };

  const likeProduct = (id: string) => {
    const newProducts = products.map(p => 
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    );
    saveProducts(newProducts);
  };

  const addComment = (id: string, comment: string) => {
    const newProducts = products.map(p => 
      p.id === id ? { ...p, comments: [...p.comments, comment] } : p
    );
    saveProducts(newProducts);
  };

  return {
    products,
    addProduct,
    likeProduct,
    addComment,
  };
}