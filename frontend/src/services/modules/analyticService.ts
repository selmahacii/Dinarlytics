import apiClient from '../apiClient';

export interface FinancialKPIs {
    total_sales: number;
    accounts_receivable: number;
    collection_rate: number;
    margin_net_pct: number;
    currency: string;
}

export interface ChartPoint {
    period: string;
    value: number;
}

export interface SmartAlert {
    type: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    code: string;
}

/**
 * Analytic Service - Business Intelligence Data
 */
export const analyticService = {
    /**
     * High-level financial KPIs calculated using backend logic
     */
    getHealthKPIs: async () => {
        const response = await apiClient.get<FinancialKPIs>('/analytics/financial-health');
        return response.data;
    },

    /**
     * Revenue history for main dashboard charts
     */
    getRevenueChart: async (periods: number = 6) => {
        const response = await apiClient.get<ChartPoint[]>('/analytics/revenue-chart', {
            params: { periods }
        });
        return response.data;
    },

    /**
     * Real-time smart alerts (AI & Rule based)
     */
    getAlerts: async () => {
        const response = await apiClient.get<SmartAlert[]>('/analytics/alerts');
        return response.data;
    }
};
