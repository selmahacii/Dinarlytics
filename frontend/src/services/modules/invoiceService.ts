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
    totalTAP: number; // For sales
    droitTimbre: number;
    retenueSource?: number; // Withholding tax
    totalTTC: number;
    supplierId?: string; // For purchases
    customerId?: string; // For sales
    fileUrl?: string; // Scan of the invoice
}

export const invoiceService = {
    /**
     * Fetches all invoices with server-side filtering
     */
    getAll: async (type?: 'sale' | 'purchase'): Promise<Invoice[]> => {
        const response = await apiClient.get<Invoice[]>('/invoices', {
            params: { type }
        });
        if (Array.isArray(response.data)) {
            return response.data;
        }
        throw new Error('Invalid API response format (expected array)');
    },

    /**
     * Retrieves a single detailed invoice
     */
    getById: async (id: string): Promise<Invoice> => {
        const response = await apiClient.get<Invoice>(`/invoices/${id}`);
        return response.data;
    },

    /**
     * Creates a new invoice
     */
    create: async (data: Partial<Invoice>): Promise<Invoice> => {
        const response = await apiClient.post<Invoice>('/invoices', data);
        return response.data;
    },

    /**
     * Updates an existing invoice
     */
    update: async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
        const response = await apiClient.put<Invoice>(`/invoices/${id}`, data);
        return response.data;
    },

    /**
     * Validates a draft invoice
     */
    validate: async (id: string): Promise<Invoice> => {
        const response = await apiClient.patch<Invoice>(`/invoices/${id}/validate`);
        return response.data;
    },

    /**
     * Cancels an invoice
     */
    cancel: async (id: string) => {
        const response = await apiClient.post(`/invoices/${id}/cancel`);
        return response.data;
    },

    /**
     * Bulk export as PDF/Excel
     */
    exportReport: async (format: 'pdf' | 'xlsx', period: string) => {
        const response = await apiClient.get(`/reports/invoices/export`, {
            params: { format, period },
            responseType: 'blob'
        });
        return response.data;
    }
};

