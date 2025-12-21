import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierStats {
  total_suppliers: number;
  active_suppliers: number;
  new_suppliers_this_month: number;
  total_purchases: number;
  average_purchase_value: number;
  top_suppliers: Array<{
    id: string;
    name: string;
    purchases: number;
  }>;
}

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // Fetch suppliers list
  const fetchSuppliers = async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<Supplier[]>('/api/v1/suppliers/', { params });
      setSuppliers(response.data);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des fournisseurs');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch supplier statistics
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setErrorStats(null);
      const response = await axios.get<SupplierStats>('/api/v1/suppliers/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching supplier stats:', err);
      setErrorStats(err.response?.data?.detail || 'Erreur lors du chargement des statistiques');
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  // Create a new supplier
  const createSupplier = async (supplierData: Partial<Supplier>): Promise<Supplier | null> => {
    try {
      const response = await axios.post<Supplier>('/api/v1/suppliers/', supplierData);
      setSuppliers((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      console.error('Error creating supplier:', err);
      throw new Error(err.response?.data?.detail || 'Erreur lors de la création du fournisseur');
    }
  };

  // Update an existing supplier
  const updateSupplier = async (supplierId: string, supplierData: Partial<Supplier>): Promise<Supplier | null> => {
    try {
      const response = await axios.put<Supplier>(`/api/v1/suppliers/${supplierId}`, supplierData);
      setSuppliers((prev) => prev.map((s) => (s.id === supplierId ? response.data : s)));
      return response.data;
    } catch (err: any) {
      console.error('Error updating supplier:', err);
      throw new Error(err.response?.data?.detail || 'Erreur lors de la mise à jour du fournisseur');
    }
  };

  // Delete a supplier (soft delete)
  const deleteSupplier = async (supplierId: string): Promise<void> => {
    try {
      await axios.delete(`/api/v1/suppliers/${supplierId}`);
      setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
    } catch (err: any) {
      console.error('Error deleting supplier:', err);
      throw new Error(err.response?.data?.detail || 'Erreur lors de la suppression du fournisseur');
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, []);

  return {
    suppliers,
    stats,
    loading,
    loadingStats,
    error,
    errorStats,
    fetchSuppliers,
    fetchStats,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};
