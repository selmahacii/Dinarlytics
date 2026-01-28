import apiClient from '../apiClient';

export interface FinancialKPIs {
    total_sales: number;
    accounts_receivable: number;
    collection_rate: number;
    margin_net_pct: number;
    dso_days: number;
    bfr_value: number;
    break_even_point: number;
    solvency_ratio: number;
    currency: string;
}

export interface RollingForecast {
    predicted_revenue_next_month: number;
    average_monthly: number;
    trend_direction: 'up' | 'down';
    rolling_forecast: Array<{ month: string, predicted_value: number }>;
    confidence_score: number;
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
    },

    /**
     * AI Rolling Plan Forecast
     */
    getForecast: async () => {
        const response = await apiClient.get<RollingForecast>('/analytics/forecast');
        return response.data;
    }
};
