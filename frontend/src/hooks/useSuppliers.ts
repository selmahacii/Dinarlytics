import { useState, useEffect } from 'react';
import { suppliersService, Supplier } from '../services/modules/suppliersService';

/**
 * Custom Hook for Real-Time Supplier Management
 * Provides CRUD operations with optimistic updates
 */
export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await suppliersService.getAll();
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load suppliers');
      console.error('Supplier loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const createSupplier = async (data: Partial<Supplier>) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticSupplier = { ...data, id: tempId } as Supplier;
    setSuppliers(prev => [optimisticSupplier, ...prev]);

    try {
      const newSupplier = await suppliersService.create(data);
      setSuppliers(prev => prev.map(s => s.id === tempId ? newSupplier : s));
      return newSupplier;
    } catch (err: any) {
      setSuppliers(prev => prev.filter(s => s.id !== tempId));
      setError(err.message);
      throw err;
    }
  };

  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    const originalSuppliers = [...suppliers];
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));

    try {
      const updated = await suppliersService.update(id, data);
      setSuppliers(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err: any) {
      setSuppliers(originalSuppliers);
      setError(err.message);
      throw err;
    }
  };

  const deleteSupplier = async (id: string) => {
    const originalSuppliers = [...suppliers];
    setSuppliers(prev => prev.filter(s => s.id !== id));

    try {
      await suppliersService.delete(id);
    } catch (err: any) {
      setSuppliers(originalSuppliers);
      setError(err.message);
      throw err;
    }
  };

  return {
    suppliers,
    loading,
    error,
    refresh: loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
  };
};
