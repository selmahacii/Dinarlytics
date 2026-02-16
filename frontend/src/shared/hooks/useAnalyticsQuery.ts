import { useQuery } from '@tanstack/react-query';
import { analyticService } from '@/services/modules/analyticService';
import { queryKeys } from '../lib/queryClient';

/**
 * React Query Hook for Analytics
 * Provides real-time KPIs with intelligent caching and auto-refresh
 */
export const useAnalyticsQuery = () => {
    // Fetch KPIs with 30-second refetch interval
    const { data: kpis, isLoading: loadingKpis } = useQuery({
        queryKey: queryKeys.analytics.kpis(),
        queryFn: () => analyticService.getHealthKPIs(),
        refetchInterval: 30000, // Auto-refresh every 30 seconds
    });

    // Fetch alerts with 1-minute refetch interval
    const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
        queryKey: queryKeys.analytics.alerts(),
        queryFn: () => analyticService.getAlerts(),
        refetchInterval: 60000, // Auto-refresh every minute
    });

    // Fetch revenue chart
    const { data: revenueChart = [], isLoading: loadingChart } = useQuery({
        queryKey: queryKeys.analytics.revenue(6),
        queryFn: () => analyticService.getRevenueChart(6),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    return {
        kpis,
        alerts,
        revenueChart,
        loading: loadingKpis || loadingAlerts || loadingChart,
        error: null,
    };
};

