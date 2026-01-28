import React, { createContext, useContext, useMemo } from 'react';
import type { Article } from '../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesService } from '../services/modules/articlesService';

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
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: ['articles'],
    queryFn: articlesService.getAll,
    staleTime: 60000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Article> }) => articlesService.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      const previous = queryClient.getQueryData<Article[]>(['articles']);
      if (previous) {
        queryClient.setQueryData<Article[]>(['articles'], previous.map(p =>
          p.id === id ? { ...p, ...patch } : p
        ));
      }
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['articles'], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });

  const getById = (id: string) => products.find(p => p.id === id);

  // Legacy support: setProducts treats it as a cache override or simple state (but passing it to backend might be too much)
  // We'll implementing it as updating the query data locally for now.
  const setProducts = (next: Article[]) => {
    queryClient.setQueryData(['articles'], next);
  };

  const updateProduct = (id: string, patch: Partial<Article>) => {
    updateMutation.mutate({ id, patch });
  };

  const adjustStock = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const newStock = Math.max(0, product.stock + delta);
      updateMutation.mutate({ id, patch: { stock: newStock } });
    }
  };

  const refreshProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: ['articles'] });
  };

  const value = useMemo<ProductsContextType>(() => ({
    products,
    loading,
    error: queryError ? (queryError as Error).message : null,
    getById,
    setProducts,
    updateProduct,
    adjustStock,
    refreshProducts
  }), [products, loading, queryError]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

export const useProducts = (): ProductsContextType => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
};
