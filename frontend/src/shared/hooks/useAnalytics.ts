import { useState, useEffect } from 'react';
import { analyticService, FinancialKPIs, ChartPoint, SmartAlert } from '@/services/modules/analyticService';

/**
 * Custom Hook for Real-Time Analytics & KPIs
 * Provides live business intelligence data
 */
export const useAnalytics = () => {
    const [kpis, setKpis] = useState<FinancialKPIs | null>(null);
    const [revenueChart, setRevenueChart] = useState<ChartPoint[]>([]);
    const [alerts, setAlerts] = useState<SmartAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const [kpisData, chartData, alertsData] = await Promise.all([
                analyticService.getHealthKPIs(),
                analyticService.getRevenueChart(6),
                analyticService.getAlerts()
            ]);

            setKpis(kpisData);
            setRevenueChart(chartData);
            setAlerts(alertsData);
        } catch (err: any) {
            setError(err.message || 'Failed to load analytics');
            console.error('Analytics loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();

        // Optional: Set up polling for real-time updates every 30 seconds
        const interval = setInterval(loadAnalytics, 30000);
        return () => clearInterval(interval);
    }, []);

    return {
        kpis,
        revenueChart,
        alerts,
        loading,
        error,
        refresh: loadAnalytics
    };
};

