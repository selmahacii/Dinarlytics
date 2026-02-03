import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService, Invoice } from '../services/modules/invoiceService';
import { queryKeys } from '../lib/queryClient';

/**
 * React Query Hook for Invoices
 * Provides intelligent caching, automatic refetching, and optimistic updates
 */
export const useInvoicesQuery = (type?: 'sale' | 'purchase') => {
    const queryClient = useQueryClient();

    // Fetch invoices with automatic caching
    const { data: invoices = [], isLoading, error } = useQuery({
        queryKey: queryKeys.invoices.list(type),
        queryFn: () => invoiceService.getAll(type),
    });

    // Create invoice mutation with optimistic update
    const createMutation = useMutation({
        mutationFn: (data: Partial<Invoice>) => invoiceService.create(data),
        onMutate: async (newInvoice) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.invoices.list(type) });

            // Snapshot previous value
            const previousInvoices = queryClient.getQueryData(queryKeys.invoices.list(type));

            // Optimistically update
            queryClient.setQueryData(queryKeys.invoices.list(type), (old: Invoice[] = []) => [
                { ...newInvoice, id: `temp-${Date.now()}`, statut: 'draft' } as Invoice,
                ...old,
            ]);

            return { previousInvoices };
        },
        onError: (err, newInvoice, context) => {
            // Rollback on error
            if (context?.previousInvoices) {
                queryClient.setQueryData(queryKeys.invoices.list(type), context.previousInvoices);
            }
        },
        onSettled: () => {
            // Refetch after mutation
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.list(type) });
        },
    });

    // Validate invoice mutation
    const validateMutation = useMutation({
        mutationFn: (id: string) => invoiceService.validate(id),
        onSuccess: (updatedInvoice) => {
            // Update cache with validated invoice
            queryClient.setQueryData(queryKeys.invoices.list(type), (old: Invoice[] = []) =>
                old.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
            );
        },
    });

    // Cancel invoice mutation
    const cancelMutation = useMutation({
        mutationFn: (id: string) => invoiceService.cancel(id),
        onSuccess: (_, id) => {
            // Update cache
            queryClient.setQueryData(queryKeys.invoices.list(type), (old: Invoice[] = []) =>
                old.map((inv) => (inv.id === id ? { ...inv, statut: 'cancelled' as const } : inv))
            );
        },
    });

    return {
        invoices,
        loading: isLoading,
        error: error?.message || null,
        createInvoice: createMutation.mutateAsync,
        validateInvoice: validateMutation.mutateAsync,
        cancelInvoice: cancelMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isValidating: validateMutation.isPending,
        isCancelling: cancelMutation.isPending,
    };
};
