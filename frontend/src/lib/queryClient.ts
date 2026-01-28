import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Configuration
 * Provides intelligent caching, automatic refetching, and optimistic updates
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache data for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Refetch on window focus for real-time feel
            refetchOnWindowFocus: true,
            // Refetch on reconnect
            refetchOnReconnect: true,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});

/**
 * Query Keys Factory
 * Centralized query key management for type safety and consistency
 */
export const queryKeys = {
    // Invoices
    invoices: {
        all: ['invoices'] as const,
        lists: () => [...queryKeys.invoices.all, 'list'] as const,
        list: (type?: 'sale' | 'purchase') => [...queryKeys.invoices.lists(), { type }] as const,
        details: () => [...queryKeys.invoices.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
    },

    // Clients
    clients: {
        all: ['clients'] as const,
        lists: () => [...queryKeys.clients.all, 'list'] as const,
        list: (filters?: any) => [...queryKeys.clients.lists(), { filters }] as const,
        details: () => [...queryKeys.clients.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.clients.details(), id] as const,
        stats: () => [...queryKeys.clients.all, 'stats'] as const,
    },

    // Suppliers
    suppliers: {
        all: ['suppliers'] as const,
        lists: () => [...queryKeys.suppliers.all, 'list'] as const,
        list: (filters?: any) => [...queryKeys.suppliers.lists(), { filters }] as const,
        details: () => [...queryKeys.suppliers.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.suppliers.details(), id] as const,
    },

    // Analytics
    analytics: {
        all: ['analytics'] as const,
        kpis: () => [...queryKeys.analytics.all, 'kpis'] as const,
        alerts: () => [...queryKeys.analytics.all, 'alerts'] as const,
        revenue: (periods?: number) => [...queryKeys.analytics.all, 'revenue', { periods }] as const,
    },

    // Audit
    audit: {
        all: ['audit'] as const,
        logs: (limit?: number, entityType?: string) =>
            [...queryKeys.audit.all, 'logs', { limit, entityType }] as const,
        entityHistory: (entityType: string, entityId: string) =>
            [...queryKeys.audit.all, 'entity', entityType, entityId] as const,
    },
};
