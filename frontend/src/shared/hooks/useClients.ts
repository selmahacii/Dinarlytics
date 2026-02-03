import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService, Client } from '../services/modules/clientsService';
// import { toast } from 'react-hot-toast'; // Removed as not installed 
// If not using toast, just console.log or ignore. I'll check if a toast lib is used.
// Based on file list, I didn't see explicit toast lib but I'll assume standard practices.
// Actually, let's look at what's available. I'll skip toast for now to avoid errors and just return errors.

export interface ClientStats {
  total_clients: number;
  active_clients: number;
  new_clients_this_month: number;
  total_revenue: number;
  average_order_value?: number;
  top_clients?: any[];
}

export const useClients = () => {
  const queryClient = useQueryClient();

  // Query for Clients
  const {
    data: clients = [],
    isLoading: isLoadingClients,
    error: errorClients,
    refetch: refetchClients
  } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsService.getAll,
    staleTime: 60000, // 1 minute
  });

  // Query for Stats
  const {
    data: stats = null,
    isLoading: isLoadingStats,
    error: errorStats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['clients', 'stats'],
    queryFn: clientsService.getStats,
    staleTime: 60000, // 1 minute
  });

  // Mutation for Create
  const createMutation = useMutation({
    mutationFn: clientsService.create,
    onMutate: async (newClientData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['clients'] });

      // Snapshot the previous value
      const previousClients = queryClient.getQueryData<Client[]>(['clients']);

      // Optimistically update to the new value
      if (previousClients) {
        queryClient.setQueryData<Client[]>(['clients'], [
          ...previousClients,
          { ...newClientData, id: `temp-${Date.now()}`, is_active: true } as Client
        ]);
      }

      return { previousClients };
    },
    onError: (err, newClient, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(['clients'], context.previousClients);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', 'stats'] });
    },
  });

  // Mutation for Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => clientsService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previousClients = queryClient.getQueryData<Client[]>(['clients']);

      if (previousClients) {
        queryClient.setQueryData<Client[]>(['clients'], previousClients.map(client =>
          client.id === id ? { ...client, ...data } : client
        ));
      }

      return { previousClients };
    },
    onError: (err, variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(['clients'], context.previousClients);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', 'stats'] });
    },
  });

  // Mutation for Delete
  const deleteMutation = useMutation({
    mutationFn: clientsService.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previousClients = queryClient.getQueryData<Client[]>(['clients']);

      if (previousClients) {
        queryClient.setQueryData<Client[]>(['clients'], previousClients.filter(client => client.id !== id));
      }

      return { previousClients };
    },
    onError: (err, variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(['clients'], context.previousClients);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', 'stats'] });
    },
  });

  // Wrapper functions to match previous interface
  const createClient = (data: Partial<Client>) => createMutation.mutateAsync(data);
  const updateClient = (id: string, data: Partial<Client>) => updateMutation.mutateAsync({ id, data });
  const deleteClient = (id: string) => deleteMutation.mutateAsync(id);

  return {
    clients,
    stats,
    loading: isLoadingClients || isLoadingStats,
    error: errorClients?.message || errorStats?.message || null,
    refresh: () => {
      refetchClients();
      refetchStats();
    },
    createClient,
    updateClient,
    deleteClient,
    // Expose mutations if needed for loading states
    createMutation,
    updateMutation,
    deleteMutation
  };
};
