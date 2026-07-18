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
        try {
            const now = new Date();
            const [dashboardRes, clientStatsRes, journalRes, coaRes, g50Res, articleStatsRes] = await Promise.all([
                apiClient.get<any>('/analytics/dashboard'),
                apiClient.get<any>('/clients/stats').catch(() => ({ data: null as any })),
                apiClient.get<any[]>('/accounting/journal-entries?limit=1000').catch(() => ({ data: [] as any[] })),
                apiClient.get<any[]>('/accounting/chart-of-accounts').catch(() => ({ data: [] as any[] })),
                apiClient.get<any>('/fiscality/g50-summary', { params: { month: now.getMonth() + 1, year: now.getFullYear() } }).catch(() => ({ data: null as any })),
                apiClient.get<any>('/articles/stats').catch(() => ({ data: null as any }))
            ]);

            const data = dashboardRes.data;
            const ca = data.ca_mois_courant || 0;
            const profit = data.profit_mois_courant || 0;
            const marge = ca > 0 ? Math.round((profit / ca) * 100) : 0;

            const clientStats = clientStatsRes.data;
            const entries = journalRes.data || [];
            const validees = entries.filter((e: any) => e.status === 'approved' || e.status === 'validated').length;
            const enAttente = entries.filter((e: any) => e.status === 'draft' || e.status === 'pending').length;

            // Bilan réel : agrégation des soldes du plan comptable par classe.
            const coa = coaRes.data || [];
            const balances: Record<string, number> = {};
            entries.forEach((entry: any) => {
                if (entry.status !== 'approved' && entry.status !== 'validated') return;
                (entry.lines || []).forEach((line: any) => {
                    const code = line.account_code;
                    balances[code] = (balances[code] || 0) + (Number(line.debit_amount || 0) - Number(line.credit_amount || 0));
                });
            });
            // Comptes de contre-actif (amortissements, solde créditeur) en
            // déduction de l'actif — mêmes valeurs de type que le backend
            // (asset/liability/equity/contra_asset), pas les libellés
            // français 'actif'/'passif' qui ne matchaient jamais rien et
            // laissaient le bilan bloqué à 0.
            let actif = 0, passif = 0, capitauxPropres = 0;
            coa.forEach((acc: any) => {
                const bal = balances[acc.account_code] || 0;
                const type = (acc.account_type || '').toLowerCase();
                if (type === 'asset') actif += bal;
                else if (type === 'contra_asset') actif -= Math.abs(bal);
                else if (type === 'liability') passif += Math.abs(bal);
                else if (type === 'equity') capitauxPropres += Math.abs(bal);
            });

            const g50 = g50Res.data;

            // Rotation des stocks = CA HT du mois / valeur du stock actuel
            // (ratio simplifié CA/Stock, faute d'un COGS isolé du reste des
            // charges) — champ auparavant absent de l'objet retourné,
            // toujours affiché vide ("x") côté page.
            const stockValue = Number(articleStatsRes.data?.total_inventory_value) || 0;
            const rotationStock = stockValue > 0 ? Math.round((ca / stockValue) * 10) / 10 : 0;

            return {
                metriques: {
                    ventesTotal: ca,
                    beneficeMensuel: profit,
                    margeBrute: marge,
                    rotationStock,
                    nombreClients: clientStats?.total_clients || 0,
                    nouveauxClients: clientStats?.new_clients_this_month || 0,
                    tauxFidelisation: clientStats?.total_clients > 0
                        ? Math.round((clientStats.active_clients / clientStats.total_clients) * 100)
                        : 0
                },
                ecrituresComptables: { total: entries.length, validees, enAttente },
                tva: g50 ? {
                    aVerser: g50.tva_to_pay || 0,
                    collectee: g50.tva_collected || 0,
                    deductible: g50.tva_deductible || 0,
                    taux: 19
                } : { aVerser: 0, collectee: 0, deductible: 0, taux: 19 },
                indicateursTVA: [],
                bilans: { actif, passif, capitauxPropres, dateDernier: new Date().toISOString().split('T')[0] },
                ratios: [
                    { code: 'LIQ', name: 'Liquidité Générale', value: data.ratios?.liquidite || 0, status: 'normal' },
                    { code: 'AUT', name: 'Autonomie Financière', value: data.ratios?.autonomie_financiere || 0, status: 'good' }
                ],
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
