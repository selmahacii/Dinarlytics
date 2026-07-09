import { invoiceService, type Invoice } from './invoiceService';
import { type AccountingStatementData } from '@shared/hooks/useAccountingStatements';

export const accountingService = {
    getDynamicStatements: async (): Promise<AccountingStatementData> => {
        const allInvoices = await invoiceService.getAll();

        // Filter out canceled ones
        const activeInvoices = allInvoices.filter(inv => inv.statut !== 'annule');

        // TCR Components
        const sales = activeInvoices.filter(inv => inv.type === 'sale');
        const purchases = activeInvoices.filter(inv => inv.type === 'purchase');

        const produits = sales.reduce((sum, inv) => sum + inv.totalHT, 0);
        const charges = purchases.reduce((sum, inv) => sum + inv.totalHT, 0);
        const resultatNet = produits - charges;

        // Simple Balance Sheet Components
        // Assets (Actif)
        const accountsReceivable = sales.reduce((sum, inv) => sum + (inv.totalTTC - inv.montantPaye), 0);
        const cashEquivalent = activeInvoices.reduce((sum, inv) => {
            if (inv.type === 'sale') return sum + inv.montantPaye;
            if (inv.type === 'purchase') return sum - inv.montantPaye;
            return sum;
        }, 0);

        const actifCirculant = accountsReceivable + cashEquivalent;
        const actifImmobilise = 0;
        const actifTotal = actifCirculant + actifImmobilise;

        // Liabilities & Equity (Passif)
        const accountsPayable = purchases.reduce((sum, inv) => sum + (inv.totalTTC - inv.montantPaye), 0);
        const capitauxPropres = actifTotal - accountsPayable;
        const passifTotal = actifTotal;

        // Ratios
        const ratioLiquidite = accountsPayable > 0 ? (actifCirculant / accountsPayable).toFixed(2) : "N/A";
        const ratioRentabilite = produits > 0 ? ((resultatNet / produits) * 100).toFixed(1) : "0";

        return {
            produits,
            charges,
            resultatNet,
            actifTotal,
            actifCirculant,
            actifImmobilise,
            passifTotal,
            capitauxPropres,
            dettes: accountsPayable,
            ratioLiquidite,
            ratioRentabilite,
            ratioAutonomie: "65",
            ratioEndettement: "15",
            repartitionCharges: [
                { type: 'Achats Marchandises', montant: charges * 0.7, part: 70, couleur: 'from-blue-500 to-blue-600' },
                { type: 'Services Extérieurs', montant: charges * 0.2, part: 20, couleur: 'from-purple-500 to-purple-600' },
                { type: 'Autres charges', montant: charges * 0.1, part: 10, couleur: 'from-slate-500 to-slate-600' }
            ]
        };
    },

    getDynamicTreasury: async (): Promise<any> => {
        const allInvoices = await invoiceService.getAll();
        const activeInvoices = allInvoices.filter(inv => inv.statut !== 'annule');

        const sales = activeInvoices.filter(inv => inv.type === 'sale');
        const purchases = activeInvoices.filter(inv => inv.type === 'purchase');

        const fluxEntrants = sales.reduce((sum, inv) => sum + inv.montantPaye, 0);
        const fluxSortants = purchases.reduce((sum, inv) => sum + inv.montantPaye, 0);

        const soldeTotal = fluxEntrants - fluxSortants;

        return {
            soldeBanque: Math.round(soldeTotal * 0.8),
            soldeCaisse: Math.round(soldeTotal * 0.2),
            soldeTotal,
            fluxEntrants,
            fluxSortants,
            soldeNet: fluxEntrants - fluxSortants,
            previsionTresorerie: [
                { mois: 'Prochain mois', solde: fluxEntrants * 1.1 - fluxSortants }
            ],
            repartitionFlux: [
                { type: 'Ventes', montant: fluxEntrants, part: 100, couleur: 'bg-slate-900' }
            ],
            repartitionSorties: [
                { type: 'Achats', montant: fluxSortants, part: 100, couleur: 'bg-slate-700' }
            ]
        };
    },
    getEquilibreFinancier: async (): Promise<any> => {
        const allInvoices = await invoiceService.getAll();
        const activeInvoices = allInvoices.filter(inv => inv.statut !== 'annule');

        const sales = activeInvoices.filter(inv => inv.type === 'sale');
        const purchases = activeInvoices.filter(inv => inv.type === 'purchase');

        const clients = sales.reduce((sum, inv) => sum + (inv.totalTTC - inv.montantPaye), 0);
        const fournisseurs = purchases.reduce((sum, inv) => sum + (inv.totalTTC - inv.montantPaye), 0);
        const stocks = 0;

        const cashBalance = activeInvoices.reduce((sum, inv) => {
            if (inv.type === 'sale') return sum + inv.montantPaye;
            if (inv.type === 'purchase') return sum - inv.montantPaye;
            return sum;
        }, 0);

        const actifsCirculants = cashBalance + clients + stocks;
        const passifsCirculants = fournisseurs; // Simplified for demo

        const frn = actifsCirculants - passifsCirculants;
        const bfr = (stocks + clients) - fournisseurs;
        const tresorerieNette = frn - bfr;

        return {
            fondsRoulementNet: frn,
            besoinFondsRoulement: bfr,
            tresorerieNette,
            actifsCirculants,
            passifsCirculants,
            stocks,
            clients,
            fournisseurs,
            dateCalcul: new Date().toISOString().split('T')[0]
        };
    }
};
