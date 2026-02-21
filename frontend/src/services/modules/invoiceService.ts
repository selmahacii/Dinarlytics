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

export interface ClientDetails {
    adresse: string;
    nif: string;
    nis?: string; // Numéro d'Identification Statistique
    rc: string;
    ai: string;
    rib?: string; // Relevé d'Identité Bancaire
}

export interface AuditLog {
    action: string;
    user: string;
    date: string;
}

export interface Invoice {
    id: string;
    factureId: string;
    client: string;
    clientDetails?: ClientDetails;
    date: string;
    echeance: string;
    dateFacture?: string;
    dateEcheance?: string;
    datePaiement?: string;
    montant: number;
    montantPaye: number;
    paymentMode: string;
    modePaiement?: string;
    statut: string;
    retard: number;
    reference?: string;
    items: InvoiceItem[];
    tvaRate?: number; // Kept for default/backward compat
    secteur?: string;
    audit: AuditLog[];
    totalHT: number;
    totalTVA: number;
    totalTAP: number; // Taxe sur l'Activité Professionnelle (1%)
    droitTimbre: number;
    totalTTC: number;
}

const DEMO_INVOICES_KEY = 'demo_invoices';

const getDemoInvoices = (): Invoice[] => {
    const saved = localStorage.getItem(DEMO_INVOICES_KEY);
    if (saved) return JSON.parse(saved);

    const initial: Invoice[] = [
        {
            id: 'inv-001',
            factureId: 'FAC-2024-001',
            client: 'Sonatrach SPA',
            clientDetails: {
                adresse: 'Djenane El Malik, Hydra, Alger',
                nif: '000016109000101',
                rc: '16/00-1234567B12',
                ai: '16123456789'
            },
            date: '2024-01-15',
            echeance: '2024-02-15',
            dateFacture: '2024-01-15',
            dateEcheance: '2024-02-15',
            datePaiement: '2024-02-10',
            montant: 1250000,
            montantPaye: 1250000,
            paymentMode: 'virement',
            modePaiement: 'virement',
            statut: 'paye',
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
            tvaRate: 19,
            audit: [],
            totalHT: 1250000,
            totalTVA: 1250000 * 0.19,
            totalTAP: 1250000 * 0.01,
            droitTimbre: 0,
            totalTTC: 1250000 * 1.20 // HT + TVA + TAP
        },
        {
            id: 'inv-002',
            factureId: 'FAC-2024-002',
            client: 'Cévital SPA',
            clientDetails: {
                adresse: 'Zone Industrielle Oued Smar, Alger',
                nif: '000516019012345',
                nis: '000516019012345001',
                rc: '16/00-0987654B15',
                ai: '16001234567',
                rib: '001 00016 0123456789 01'
            },
            date: '2024-01-20',
            echeance: '2024-02-20',
            dateFacture: '2024-01-20',
            dateEcheance: '2024-02-20',
            montant: 850000,
            montantPaye: 0,
            paymentMode: 'cheque',
            modePaiement: 'cheque',
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
            tvaRate: 19,
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
            client: 'Ooredoo Algérie',
            date: '2024-02-01',
            echeance: '2024-03-01',
            dateFacture: '2024-02-01',
            dateEcheance: '2024-03-01',
            montant: 450000,
            montantPaye: 200000,
            paymentMode: 'especes',
            modePaiement: 'especes',
            statut: 'en_attente',
            retard: 0,
            items: [
                {
                    desc: 'Maintenance serveurs',
                    qty: 1,
                    pu: 450000,
                    type: 'service',
                    tva_rate: 9, // Reduced rate for some services
                    line_total_ht: 450000,
                    line_total_tva: 450000 * 0.09,
                    line_total_ttc: 450000 * 1.09
                }
            ],
            tvaRate: 9,
            audit: [],
            totalHT: 450000,
            totalTVA: 450000 * 0.09,
            totalTAP: 450000 * 0.01,
            droitTimbre: 4500,
            totalTTC: 450000 + (450000 * 0.09) + (450000 * 0.01) + 4500
        }
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
            return response.data;
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
                inv.statut = 'paye'; // Map validated to paye for demo simplicity
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
