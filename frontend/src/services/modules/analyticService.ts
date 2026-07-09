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
    getHealthKPIs: async () => {
        const response = await apiClient.get('/analytics/financial-health');
        return response.data;
    },

    getRevenueChart: async (periods: number = 6) => {
        const response = await apiClient.get('/analytics/revenue-chart', { params: { periods } });
        return response.data;
    },

    getAlerts: async () => {
        const response = await apiClient.get('/analytics/alerts');
        return response.data;
    },

    getForecast: async (size?: string) => {
        const response = await apiClient.get('/analytics/forecast');
        return response.data;
    },

    getAIEfficiencyMetrics: async () => {
        // No backend endpoint yet - return empty structure
        return {
            accuracy: { cash_flow_prediction: 0, recovery_success_rate: 0 },
            impact: { total_savings_amount: 0, time_saved_hours: 0, anomalies_detected_count: 0 },
            risk: { fiscal_compliance_score: 0, fraud_risk_level: 'low' }
        };
    },

    getSectorMetrics: async (sector: string) => {
        // No backend endpoint yet - return empty structure
        return {
            summary: '',
            kpis: {},
            charts: { main: { title: '', data: [], type: 'bar' }, secondary: { title: '', data: [], type: 'line' } },
            alerts: [],
            ai_insights: { prediction: '', value: '', confidence: 0, details: '', action: '', full_report: '' }
        };
    },

    getKPIs: async (size?: string) => {
        // Fetch real KPIs from dashboard endpoint
        try {
            const response = await apiClient.get('/analytics/dashboard');
            const data = response.data;
            return {
                metriques: {
                    ventesTotal: data.ca_mois_courant || 0,
                    croissanceCA: 0,
                    margeBrute: 0,
                    rotationStock: 0,
                    nombreClients: 0,
                    nouveauxClients: 0,
                    tauxFidelisation: 0
                },
                ecrituresComptables: { total: 0, validees: 0, enAttente: 0, evolution: 0, parJour: 0 },
                tva: { aVerser: 0, collectee: 0, deductible: 0, taux: 19, evolution: 0 },
                indicateursTVA: [],
                bilans: { actif: 0, passif: 0, capitauxPropres: 0, evolution: 0, dateDernier: '' },
                ratios: [],
                ratiosFinanciers: [],
                journaux: []
            };
        } catch (e) {
            return null;
        }
    },

    getCompanySizeMetrics: async (size: string) => {
        // No backend endpoint yet - return empty structure
        return {
            summary: '',
            kpis: {},
            charts: { main: { title: '', type: 'bar', data: [] }, secondary: { title: '', type: 'line', data: [] } },
            alerts: [],
            ai_insights: { prediction: '', value: '', confidence: 0, details: '', action: '', full_report: '' }
        };
    }
};
