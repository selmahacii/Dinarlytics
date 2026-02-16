import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersService, Supplier } from '@/services/modules/suppliersService';

export const useSuppliers = () => {
  const queryClient = useQueryClient();

  // Query for Suppliers
  const {
    data: suppliers = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersService.getAll,
    staleTime: 60000,
  });

  // Mutation for Create
  const createMutation = useMutation({
    mutationFn: suppliersService.create,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['suppliers'] });
      const previous = queryClient.getQueryData<Supplier[]>(['suppliers']);

      if (previous) {
        queryClient.setQueryData<Supplier[]>(['suppliers'], [
          ...previous,
          { ...newData, id: `temp-${Date.now()}` } as Supplier
        ]);
      }
      return { previous };
    },
    onError: (err, newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['suppliers'], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  // Mutation for Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) => suppliersService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['suppliers'] });
      const previous = queryClient.getQueryData<Supplier[]>(['suppliers']);

      if (previous) {
        queryClient.setQueryData<Supplier[]>(['suppliers'], previous.map(s =>
          s.id === id ? { ...s, ...data } : s
        ));
      }
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['suppliers'], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  // Mutation for Delete
  const deleteMutation = useMutation({
    mutationFn: suppliersService.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['suppliers'] });
      const previous = queryClient.getQueryData<Supplier[]>(['suppliers']);

      if (previous) {
        queryClient.setQueryData<Supplier[]>(['suppliers'], previous.filter(s => s.id !== id));
      }
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['suppliers'], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  return {
    suppliers,
    loading,
    error: error ? (error as Error).message : null,
    refresh: refetch,
    createSupplier: (data: Partial<Supplier>) => createMutation.mutateAsync(data),
    updateSupplier: (id: string, data: Partial<Supplier>) => updateMutation.mutateAsync({ id, data }),
    deleteSupplier: (id: string) => deleteMutation.mutateAsync(id)
  };
};

