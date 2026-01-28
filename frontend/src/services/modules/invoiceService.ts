import apiClient from '../apiClient';

export interface ArticleItem {
    id?: string;
    designation: string;
    quantite: number;
    prixUnitaire: number;
    tva_rate: number;
    line_total_ht: number;
    line_total_ttc: number;
}

export interface Invoice {
    id?: string;
    numero: string;
    client_id?: string;
    type: 'sale' | 'purchase';
    date_emission: string;
    date_echeance: string;
    total_ht: number;
    total_tva: number;
    total_ttc: number;
    statut: 'draft' | 'validated' | 'paid' | 'cancelled';
    items: ArticleItem[];
}

/**
 * Invoice Service - Domain Repository
 */
export const invoiceService = {
    /**
     * Fetches all invoices with server-side filtering
     */
    getAll: async (type?: 'sale' | 'purchase') => {
        const response = await apiClient.get<Invoice[]>('/invoices', {
            params: { type }
        });
        return response.data;
    },

    /**
     * Retrieves a single detailed invoice
     */
    getById: async (id: string) => {
        const response = await apiClient.get<Invoice>(`/invoices/${id}`);
        return response.data;
    },

    /**
     * Creates a new invoice (Auto-updates totals via backend triggers)
     */
    create: async (data: Partial<Invoice>) => {
        const response = await apiClient.post<Invoice>('/invoices', data);
        return response.data;
    },

    /**
     * Validates a draft invoice (Transition to validated)
     */
    validate: async (id: string) => {
        const response = await apiClient.patch<Invoice>(`/invoices/${id}/validate`);
        return response.data;
    },

    /**
     * Cancels an invoice (Audit trace created automatically)
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
