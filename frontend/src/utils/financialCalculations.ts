/**
 * Centralized Financial Utilities for Dinarlytics (Algerian SCF Compliance)
 * Ensures consistency between Bon de Commande, Facture, and Reports.
 */

export const TVA_RATES = {
    NORMAL: 0.19,
    REDUIT: 0.09,
};

export const TAP_RATE = 0.02;

/**
 * High precision calculations for financial documents
 */
export const financialCalc = {
    /**
     * Calculates TVA and TTC from HT
     */
    fromHT: (ht: number, rate: number = TVA_RATES.NORMAL) => {
        const tva = Math.round(ht * rate * 100) / 100;
        const ttc = Math.round((ht + tva) * 100) / 100;
        return { ht, tva, ttc };
    },

    /**
     * Calculates HT and TVA from TTC
     */
    fromTTC: (ttc: number, rate: number = TVA_RATES.NORMAL) => {
        const ht = Math.round((ttc / (1 + rate)) * 100) / 100;
        const tva = Math.round((ttc - ht) * 100) / 100;
        return { ht, tva, ttc };
    },

    /**
     * Percentage calculation helper
     */
    getPercentage: (value: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 10000) / 100;
    },

    /**
     * Format currency for Algeria (DZD)
     */
    formatDZD: (amount: number) => {
        return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 2,
        }).format(amount);
    }
};

/**
 * G50 Logic (Self-assessment)
 */
export const calculateG50 = (salesHT: number, purchasesHT: number) => {
    const tvaCollected = Math.round(salesHT * TVA_RATES.NORMAL);
    const tvaDeductible = Math.round(purchasesHT * TVA_RATES.NORMAL);
    const tap = Math.round(salesHT * TAP_RATE);
    const tvaToPay = Math.max(0, tvaCollected - tvaDeductible);

    return {
        tvaCollected,
        tvaDeductible,
        tap,
        tvaToPay,
        totalDue: tvaToPay + tap
    };
};
