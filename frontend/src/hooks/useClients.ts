import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  credit_limit?: number;
  payment_terms?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientStats {
  total_clients: number;
  active_clients: number;
  new_clients_this_month: number;
  total_revenue: number;
  average_order_value: number;
  top_clients: Array<{
    id: string;
    name: string;
    revenue: number;
  }>;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // Fetch clients list
  const fetchClients = async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<Client[]>('/api/v1/clients/', { params });
      setClients(response.data);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch client statistics
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setErrorStats(null);
      const response = await axios.get<ClientStats>('/api/v1/clients/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching client stats:', err);
      setErrorStats(err.response?.data?.detail || 'Erreur lors du chargement des statistiques');
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  // Create a new client
  const createClient = async (clientData: Partial<Client>): Promise<Client | null> => {
    try {
      const response = await axios.post<Client>('/api/v1/clients/', clientData);
      setClients((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      console.error('Error creating client:', err);
      throw new Error(err.response?.data?.detail || 'Erreur lors de la création du client');
    }
  };

  // Update an existing client
  const updateClient = async (clientId: string, clientData: Partial<Client>): Promise<Client | null> => {
    try {
      const response = await axios.put<Client>(`/api/v1/clients/${clientId}`, clientData);
      setClients((prev) => prev.map((c) => (c.id === clientId ? response.data : c)));
      return response.data;
    } catch (err: any) {
      console.error('Error updating client:', err);
      throw new Error(err.response?.data?.detail || 'Erreur lors de la mise à jour du client');
    }
  };

  // Delete a client (soft delete)
  const deleteClient = async (clientId: string): Promise<void> => {
    try {
      await axios.delete(`/api/v1/clients/${clientId}`);
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } catch (err: any) {
      console.error('Error deleting client:', err);
      throw new Error(err.response?.data?.detail || 'Erreur lors de la suppression du client');
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchClients();
    fetchStats();
  }, []);

  return {
    clients,
    stats,
    loading,
    loadingStats,
    error,
    errorStats,
    fetchClients,
    fetchStats,
    createClient,
    updateClient,
    deleteClient,
  };
};
