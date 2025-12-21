import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { Article } from '../types';
import axios from 'axios';

export type ProductsContextType = { 
  products: Article[];
  loading: boolean;
  error: string | null;
  getById: (id: string) => Article | undefined;
  setProducts: (next: Article[]) => void;
  updateProduct: (id: string, patch: Partial<Article>) => void;
  adjustStock: (id: string, delta: number) => void;
  refreshProducts: () => Promise<void>;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [products, setProductsState] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles from API
  const refreshProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/articles');
      setProductsState(response.data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
      setProductsState([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const getById = (id: string) => products.find(p => p.id === id);

  const setProducts = (next: Article[]) => {
    setProductsState(next);
  };
  
  const updateProduct = (id: string, patch: Partial<Article>) => {
    setProductsState(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };
  
  const adjustStock = (id: string, delta: number) => {
    setProductsState(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  const value = useMemo<ProductsContextType>(() => ({ 
    products, 
    loading, 
    error,
    getById, 
    setProducts, 
    updateProduct, 
    adjustStock, 
    refreshProducts 
  }), [products, loading, error]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

export const useProducts = (): ProductsContextType => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
};
