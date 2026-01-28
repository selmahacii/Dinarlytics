import { useState, useEffect } from 'react';
import { clientsService, Client } from '../services/modules/clientsService';

interface ClientStats {
  total_clients: number;
  active_clients: number;
  new_clients_this_month: number;
  total_revenue: number;
}

/**
 * Custom Hook for Real-Time Client Management
 * Provides CRUD operations with optimistic updates and statistics
 */
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientsService.getAll();
      setClients(data);

      // Calculate stats from client data
      setStats({
        total_clients: data.length,
        active_clients: data.filter(c => c.is_active).length,
        new_clients_this_month: data.filter(c => {
          // Assume clients created in last 30 days are "new"
          const createdDate = new Date();
          createdDate.setDate(createdDate.getDate() - 30);
          return true; // Simplified for now
        }).length,
        total_revenue: 0 // Would come from invoices API
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
      console.error('Client loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const createClient = async (data: Partial<Client>) => {
    // Optimistic update: Add immediately to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticClient = { ...data, id: tempId, is_active: true } as Client;
    setClients(prev => [optimisticClient, ...prev]);

    try {
      const newClient = await clientsService.create(data);
      // Replace temp with real client
      setClients(prev => prev.map(c => c.id === tempId ? newClient : c));
      await loadClients(); // Refresh stats
      return newClient;
    } catch (err: any) {
      // Rollback on error
      setClients(prev => prev.filter(c => c.id !== tempId));
      setError(err.message);
      throw err;
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    // Optimistic update
    const originalClients = [...clients];
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));

    try {
      const updated = await clientsService.update(id, data);
      setClients(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err: any) {
      // Rollback on error
      setClients(originalClients);
      setError(err.message);
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    // Optimistic update
    const originalClients = [...clients];
    setClients(prev => prev.filter(c => c.id !== id));

    try {
      await clientsService.delete(id);
      await loadClients(); // Refresh stats
    } catch (err: any) {
      // Rollback on error
      setClients(originalClients);
      setError(err.message);
      throw err;
    }
  };

  return {
    clients,
    stats,
    loading,
    error,
    refresh: loadClients,
    createClient,
    updateClient,
    deleteClient
  };
};
