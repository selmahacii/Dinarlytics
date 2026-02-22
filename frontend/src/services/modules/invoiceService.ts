import apiClient from '../apiClient';

export interface InvoiceItem {
    desc: string;
    qty: number;
    pu: number;
    type: 'bien' | 'service';
    tva_rate: number; // Mandatory per item for Algerian market
    line_total_ht: number;
    line_total_tva: number;
    line_total_ttc: number;
}

export interface EntityDetails {
    adresse: string;
    nif: string;
    nis?: string;
    rc: string;
    ai: string;
    rib?: string;
    tel?: string;
    email?: string;
}

export interface AuditLog {
    action: string;
    user: string;
    date: string;
}

export interface Invoice {
    id: string;
    factureId: string;
    type: 'sale' | 'purchase';
    client: string; // Used as entity name (Client or Supplier)
    entityDetails?: EntityDetails;
    date: string;
    echeance: string;
    montant: number;
    montantPaye: number;
    paymentMode: string;
    statut: 'en_cours' | 'payee' | 'en_attente' | 'en_retard' | 'annule';
    retard: number;
    reference?: string;
    items: InvoiceItem[];
    tvaRate?: number;
    secteur?: string;
    audit: AuditLog[];
    totalHT: number;
    totalTVA: number;
    totalTAP: number;
    droitTimbre: number;
    totalTTC: number;
}

const DEMO_INVOICES_KEY = 'demo_invoices';

const getInitialPurchases = (): Invoice[] => [
    {
        id: 'inv-004',
        factureId: 'ACH-2026-001',
        type: 'purchase',
        client: 'Global Logistics Algerie',
        entityDetails: {
            adresse: 'Zone Industrielle, Oued Smar',
            nif: '000116109000101',
            rc: '16/00-123456B16',
            ai: '16123456789'
        },
        date: '2026-01-12',
        echeance: '2026-02-12',
        montant: 85000,
        montantPaye: 85000,
        paymentMode: 'virement',
        statut: 'payee',
        retard: 0,
        items: [
            {
                desc: 'Transport de marchandises (Lot #4)',
                qty: 1,
                pu: 85000,
                type: 'service',
                tva_rate: 19,
                line_total_ht: 85000,
                line_total_tva: 85000 * 0.19,
                line_total_ttc: 85000 * 1.19
            }
        ],
        audit: [],
        totalHT: 85000,
        totalTVA: 85000 * 0.19,
        totalTAP: 0,
        droitTimbre: 0,
        totalTTC: 85000 * 1.19
    },
    {
        id: 'inv-005',
        factureId: 'ACH-2026-002',
        type: 'purchase',
        client: 'Sonelgaz SPA',
        date: '2026-01-05',
        echeance: '2026-02-05',
        montant: 45200,
        montantPaye: 0,
        paymentMode: 'cheque',
        statut: 'en_attente',
        retard: 0,
        items: [
            {
                desc: 'Consommation Électricité Q1',
                qty: 1,
                pu: 45200,
                type: 'service',
                tva_rate: 9,
                line_total_ht: 45200,
                line_total_tva: 45200 * 0.09,
                line_total_ttc: 45200 * 1.09
            }
        ],
        audit: [],
        totalHT: 45200,
        totalTVA: 45200 * 0.09,
        totalTAP: 0,
        droitTimbre: 0,
        totalTTC: 45200 * 1.09
    },
    {
        id: 'inv-006',
        factureId: 'ACH-2026-003',
        type: 'purchase',
        client: 'SNTF (Fret)',
        date: '2026-01-20',
        echeance: '2026-02-20',
        montant: 185000,
        montantPaye: 185000,
        paymentMode: 'virement',
        statut: 'payee',
        retard: 0,
        items: [
            {
                desc: 'Transport ferroviaire matières premières',
                qty: 1,
                pu: 185000,
                type: 'service',
                tva_rate: 19,
                line_total_ht: 185000,
                line_total_tva: 185000 * 0.19,
                line_total_ttc: 185000 * 1.19
            }
        ],
        audit: [],
        totalHT: 185000,
        totalTVA: 185000 * 0.19,
        totalTAP: 0,
        droitTimbre: 0,
        totalTTC: 185000 * 1.19
    },
    {
        id: 'inv-007',
        factureId: 'ACH-2026-004',
        type: 'purchase',
        client: 'TechSolutions SARL',
        date: '2026-01-25',
        echeance: '2026-02-24',
        montant: 320000,
        montantPaye: 150000,
        paymentMode: 'virement',
        statut: 'en_cours',
        retard: 0,
        items: [
            {
                desc: 'Maintenance IT & Support Cloud',
                qty: 1,
                pu: 320000,
                type: 'service',
                tva_rate: 19,
                line_total_ht: 320000,
                line_total_tva: 320000 * 0.19,
                line_total_ttc: 320000 * 1.19
            }
        ],
        audit: [],
        totalHT: 320000,
        totalTVA: 320000 * 0.19,
        totalTAP: 0,
        droitTimbre: 0,
        totalTTC: 320000 * 1.19
    },
    {
        id: 'inv-008',
        factureId: 'ACH-2026-005',
        type: 'purchase',
        client: 'Mobilis SPA',
        date: '2026-02-01',
        echeance: '2026-03-01',
        montant: 12500,
        montantPaye: 0,
        paymentMode: 'especes',
        statut: 'en_retard',
        retard: 2,
        items: [
            {
                desc: 'Abonnements Flotte Mobile',
                qty: 1,
                pu: 12500,
                type: 'service',
                tva_rate: 19,
                line_total_ht: 12500,
                line_total_tva: 12500 * 0.19,
                line_total_ttc: 12500 * 1.19
            }
        ],
        audit: [],
        totalHT: 12500,
        totalTVA: 12500 * 0.19,
        totalTAP: 0,
        droitTimbre: 0,
        totalTTC: 12500 * 1.19
    }
];

const getDemoInvoices = (): Invoice[] => {
    const saved = localStorage.getItem(DEMO_INVOICES_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        // Force inject new purchases if user has an old empty or sales-only list
        if (parsed.filter((i: any) => i.type === 'purchase').length === 0) {
            const initial = getInitialPurchases(); // I will define this helper
            const merged = [...parsed, ...initial];
            localStorage.setItem(DEMO_INVOICES_KEY, JSON.stringify(merged));
            return merged;
        }
        return parsed;
    }

    const initial: Invoice[] = [
        {
            id: 'inv-001',
            factureId: 'FAC-2024-001',
            type: 'sale',
            client: 'Sonatrach SPA',
            entityDetails: {
                adresse: 'Djenane El Malik, Hydra, Alger',
                nif: '000016109000101',
                rc: '16/00-1234567B12',
                ai: '16123456789'
            },
            date: '2024-01-15',
            echeance: '2024-02-15',
            montant: 1250000,
            montantPaye: 1250000,
            paymentMode: 'virement',
            statut: 'payee',
            retard: -5,
            reference: 'VIR-SON-9921',
            items: [
                {
                    desc: 'Audit de sécurité réseau',
                    qty: 1,
                    pu: 1250000,
                    type: 'service',
                    tva_rate: 19,
                    line_total_ht: 1250000,
                    line_total_tva: 1250000 * 0.19,
                    line_total_ttc: 1250000 * 1.19
                }
            ],
            audit: [],
            totalHT: 1250000,
            totalTVA: 1250000 * 0.19,
            totalTAP: 1250000 * 0.01,
            droitTimbre: 0,
            totalTTC: 1250000 * 1.20
        },
        {
            id: 'inv-002',
            factureId: 'FAC-2024-002',
            type: 'sale',
            client: 'Cévital SPA',
            entityDetails: {
                adresse: 'Zone Industrielle Oued Smar, Alger',
                nif: '000516019012345',
                nis: '000516019012345001',
                rc: '16/00-0987654B15',
                ai: '16001234567',
                rib: '001 00016 0123456789 01'
            },
            date: '2024-01-20',
            echeance: '2024-02-20',
            montant: 850000,
            montantPaye: 0,
            paymentMode: 'cheque',
            statut: 'en_retard',
            retard: 15,
            reference: 'CHQ-CEV-8821',
            items: [
                {
                    desc: 'Licences ERP Professional',
                    qty: 10,
                    pu: 85000,
                    type: 'bien',
                    tva_rate: 19,
                    line_total_ht: 850000,
                    line_total_tva: 850000 * 0.19,
                    line_total_ttc: 850000 * 1.19
                }
            ],
            audit: [],
            totalHT: 850000,
            totalTVA: 850000 * 0.19,
            totalTAP: 850000 * 0.01,
            droitTimbre: 0,
            totalTTC: 850000 * 1.20
        },
        {
            id: 'inv-003',
            factureId: 'FAC-2024-003',
            type: 'sale',
            client: 'Ooredoo Algérie',
            date: '2024-02-01',
            echeance: '2024-03-01',
            montant: 450000,
            montantPaye: 200000,
            paymentMode: 'especes',
            statut: 'en_attente',
            retard: 0,
            items: [
                {
                    desc: 'Maintenance serveurs',
                    qty: 1,
                    pu: 450000,
                    type: 'service',
                    tva_rate: 9,
                    line_total_ht: 450000,
                    line_total_tva: 450000 * 0.09,
                    line_total_ttc: 450000 * 1.09
                }
            ],
            audit: [],
            totalHT: 450000,
            totalTVA: 450000 * 0.09,
            totalTAP: 450000 * 0.01,
            droitTimbre: 4500,
            totalTTC: 450000 + (450000 * 0.09) + (450000 * 0.01) + 4500
        },
        ...getInitialPurchases()
    ];
    localStorage.setItem(DEMO_INVOICES_KEY, JSON.stringify(initial));
    return initial;
};

const saveDemoInvoice = (invoice: Invoice) => {
    const invoices = getDemoInvoices();
    const index = invoices.findIndex(i => i.id === invoice.id || i.factureId === invoice.factureId);
    if (index >= 0) {
        invoices[index] = invoice;
    } else {
        invoices.push({ ...invoice, id: invoice.id || `inv-${Date.now()}` });
    }
    localStorage.setItem(DEMO_INVOICES_KEY, JSON.stringify(invoices));
    return invoice;
};

/**
 * Invoice Service - Domain Repository
 */
export const invoiceService = {
    /**
     * Fetches all invoices with server-side filtering & Static Fallback
     */
    getAll: async (type?: 'sale' | 'purchase'): Promise<Invoice[]> => {
        try {
            const response = await apiClient.get<Invoice[]>('/invoices', {
                params: { type }
            });
            if (Array.isArray(response.data)) {
                return response.data;
            }
            throw new Error('Invalid API response format (expected array)');
        } catch (e) {
            console.warn('API Invoices failed, using demo data', e);
            const demo = getDemoInvoices();
            // Since our demo data doesn't have 'type' yet, we return all or could filter by a virtual type
            return demo;
        }
    },

    /**
     * Retrieves a single detailed invoice
     */
    getById: async (id: string): Promise<Invoice> => {
        try {
            const response = await apiClient.get<Invoice>(`/invoices/${id}`);
            return response.data;
        } catch (e) {
            const demo = getDemoInvoices();
            const inv = demo.find(i => i.id === id);
            if (!inv) throw new Error('Invoice not found');
            return inv;
        }
    },

    /**
     * Creates a new invoice
     */
    create: async (data: Partial<Invoice>): Promise<Invoice> => {
        try {
            const response = await apiClient.post<Invoice>('/invoices', data);
            return response.data;
        } catch (e) {
            console.warn('API Create Invoice failed, saving locally', e);
            return saveDemoInvoice(data as Invoice);
        }
    },

    /**
     * Updates an existing invoice
     */
    update: async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
        try {
            const response = await apiClient.put<Invoice>(`/invoices/${id}`, data);
            return response.data;
        } catch (e) {
            const demo = getDemoInvoices();
            const inv = demo.find(i => i.id === id);
            const updated = { ...inv, ...data } as Invoice;
            return saveDemoInvoice(updated);
        }
    },

    /**
     * Validates a draft invoice
     */
    validate: async (id: string): Promise<Invoice> => {
        try {
            const response = await apiClient.patch<Invoice>(`/invoices/${id}/validate`);
            return response.data;
        } catch (e) {
            const demo = getDemoInvoices();
            const inv = demo.find(i => i.id === id);
            if (inv) {
                inv.statut = 'payee'; // Map validated to payee for demo simplicity
                saveDemoInvoice(inv);
            }
            return inv as Invoice;
        }
    },

    /**
     * Cancels an invoice
     */
    cancel: async (id: string) => {
        try {
            const response = await apiClient.post(`/invoices/${id}/cancel`);
            return response.data;
        } catch (e) {
            const demo = getDemoInvoices();
            const inv = demo.find(i => i.id === id);
            if (inv) {
                inv.statut = 'annule';
                saveDemoInvoice(inv);
            }
            return { success: true };
        }
    },

    /**
     * Bulk export as PDF/Excel
     */
    exportReport: async (format: 'pdf' | 'xlsx', period: string) => {
        try {
            const response = await apiClient.get(`/reports/invoices/export`, {
                params: { format, period },
                responseType: 'blob'
            });
            return response.data;
        } catch (e) {
            // Return dummy blob for demo
            return new Blob(['Demo Export Content'], { type: 'text/plain' });
        }
    }
};
