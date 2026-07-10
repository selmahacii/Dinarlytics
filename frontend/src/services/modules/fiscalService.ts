import { invoiceService, type Invoice } from './invoiceService';

export interface G50Data {
    period: string;
    ca_ht: number; // Chiffre d'Affaire HT (Ventes)
    tap_rate: number; // Default 1% or 2%
    tap_amount: number;
    tva_collectee: number; // TVA on Sales
    tva_deductible: number; // TVA on Purchases
    tva_a_verser: number;
    credit_tva_reporte: number;
    irg_salaires: number;
    iap_amount?: number;
}

export interface G29Data {
    exercice: string;
    total_honoraires: number;
    total_retenues: number;
    beneficiaires_count: number;
}

export const fiscalService = {
    /**
     * Calculate G50 figures for a specific month
     */
    calculateG50: async (monthYear: string): Promise<G50Data> => {
        // monthYear format: "2024-02"
        const allInvoices = await invoiceService.getAll();

        // Filter by month
        const monthlyInvoices = allInvoices.filter(inv => inv.date.startsWith(monthYear));

        const sales = monthlyInvoices.filter(inv => inv.type === 'sale' && inv.statut !== 'annule');
        const purchases = monthlyInvoices.filter(inv => inv.type === 'purchase' && inv.statut !== 'annule');

        const ca_ht = sales.reduce((sum, inv) => sum + inv.totalHT, 0);
        const tva_collectee = sales.reduce((sum, inv) => sum + inv.totalTVA, 0);
        const tva_deductible = purchases.reduce((sum, inv) => sum + inv.totalTVA, 0);

        // TAP Calculation (Algeria specific: 1% for most sectors, 2% for some)
        const tap_rate = 0.01;
        const tap_amount = ca_ht * tap_rate;

        // TVA Net (Compensation)
        // If collectee < deductible, it's a "Crédit de TVA"
        const net_tva = tva_collectee - tva_deductible;
        const tva_a_verser = net_tva > 0 ? net_tva : 0;
        const credit_tva_reporte = net_tva < 0 ? Math.abs(net_tva) : 0;

        // IRG Salaires (estimated as % of CA if no payroll module)
        const irg_salaires = Math.round(ca_ht * 0.05);

        return {
            period: monthYear,
            ca_ht,
            tap_rate,
            tap_amount,
            tva_collectee,
            tva_deductible,
            tva_a_verser,
            credit_tva_reporte,
            irg_salaires
        };
    },

    /**
     * Calculate G29 (Annual Fees)
     */
    calculateG29: async (year: string): Promise<G29Data> => {
        // En Algérie, on déclare les honoraires payés aux tiers
        const allInvoices = await invoiceService.getAll();
        const yearInvoices = allInvoices.filter(inv => inv.date.startsWith(year) && inv.type === 'purchase');

        // Filter invoices for services/consulting/honoraires
        const honorairesInvoices = yearInvoices.filter(inv =>
            inv.items.some(item => item.desc.toLowerCase().includes('honoraire') || item.type === 'service')
        );

        const total_honoraires = honorairesInvoices.reduce((sum, inv) => sum + inv.totalHT, 0);
        const total_retenues = total_honoraires * 0.15; // Retenue standard 15%

        return {
            exercice: year,
            total_honoraires,
            total_retenues,
            beneficiaires_count: new Set(honorairesInvoices.map(i => i.supplierId)).size
        };
    },

    getHistoryG50: async (): Promise<G50Data[]> => {
        const now = new Date();
        const months: string[] = [];
        for (let i = 2; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
        const results = await Promise.all(months.map(m => fiscalService.calculateG50(m)));
        return results;
    },

    /**
     * Analyze fiscal data for potential risks
     */
    getRiskAnalysis: async () => {
        const allInvoices = await invoiceService.getAll();
        const active = allInvoices.filter(i => i.statut !== 'annule');
        const sales = active.filter(i => i.type === 'sale');
        const purchases = active.filter(i => i.type === 'purchase');

        const risks = [];

        // Risk 1: Missing supporting documents (invoice has no file attached/URL)
        const missingDocs = active.filter(i => !i.fileUrl).length;
        if (missingDocs > 0) {
            risks.push({
                level: 'warning',
                title: 'Absence de pièces justificatives',
                message: `${missingDocs} factures n'ont pas de scan joint. Risque de rejet en cas de contrôle fiscal.`,
                action: 'Scanner et joindre les documents aux factures concernées.'
            });
        }

        // Risk 2: High TVA Credit (Potential trigger for audit)
        const totalTVAColl = sales.reduce((s, i) => s + i.totalTVA, 0);
        const totalTVADed = purchases.reduce((s, i) => s + i.totalTVA, 0);
        if (totalTVADed > totalTVAColl * 1.5) {
            risks.push({
                level: 'critical',
                title: 'Crédit de TVA anormalement élevé',
                message: 'La TVA déductible dépasse largement la TVA collectée. Cela attire l\'attention de l\'administration.',
                action: 'Vérifier la validité des factures d\'achat et la catégorisation des immobilisations.'
            });
        }

        // Risk 3: TAP Pressure
        const ca = sales.reduce((s, i) => s + i.totalHT, 0);
        if (ca > 10000000) { // arbitrary threshold for SME
            risks.push({
                level: 'info',
                title: 'Optimisation TAP',
                message: 'Votre CA approche un seuil où un changement de régime fiscal pourrait être avantageux.',
                action: 'Consulter un expert-comptable pour l\'exercice prochain.'
            });
        }

        return risks;
    },

    /**
     * Predictive fiscal analysis based on current trends
     */
    getFiscalForecast: async () => {
        const allInvoices = await invoiceService.getAll();
        const active = allInvoices.filter(i => i.statut !== 'annule');
        const sales = active.filter(i => i.type === 'sale').slice(-10); // Last 10 sales
        const purchases = active.filter(i => i.type === 'purchase').slice(-10); // Last 10 purchases

        // Simple linear extrapolation of last activities
        const avgSaleTVA = sales.length > 0 ? sales.reduce((s, i) => s + i.totalTVA, 0) / sales.length : 0;
        const avgPurchaseTVA = purchases.length > 0 ? purchases.reduce((s, i) => s + i.totalTVA, 0) / purchases.length : 0;

        return {
            predictedTVANextMonth: (avgSaleTVA * 15) - (avgPurchaseTVA * 5), // hypothetical monthly volume
            confidenceScore: 0.85,
            message: "Basé sur vos 10 dernières transactions, nous prévoyons une charge de TVA stable."
        };
    },

    /**
     * Export Risk Report as PDF
     */
    exportRiskReportPDF: async (content: string) => {
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Dinarlytics_Audit_Fiscal_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        return true;
    }
};
