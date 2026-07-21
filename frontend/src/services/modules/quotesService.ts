import apiClient from '../apiClient';

export type DevisStatus = 'draft' | 'sent' | 'accepted' | 'refused' | 'expired';

export interface DevisItem {
    articleId?: string;
    designation: string;
    qty: number;
    unitPrice: number;
    tva: number;
}

export interface Devis {
    id: string;
    numero: string;
    client: string;
    clientId?: string;
    clientEmail: string;
    dateCreation: string;
    dateExpiration: string;
    status: DevisStatus;
    montantHT: number;
    montantTVA: number;
    montantTTC: number;
    items: DevisItem[];
    notes: string;
    commercial: string;
}

export interface CreateDevisPayload {
    client_id: string;
    date_creation: string;
    date_expiration?: string;
    notes?: string;
    items: Array<{
        article_id?: string;
        description?: string;
        quantity: number;
        unit_price: number;
        tva_rate?: number;
    }>;
}

const mapDevisFromBackend = (q: any): Devis => ({
    id: q.id,
    numero: q.numero,
    client: q.client,
    clientId: q.clientId || undefined,
    clientEmail: q.clientEmail || '',
    dateCreation: q.dateCreation,
    dateExpiration: q.dateExpiration || '',
    status: q.status,
    montantHT: Number(q.montantHT) || 0,
    montantTVA: Number(q.montantTVA) || 0,
    montantTTC: Number(q.montantTTC) || 0,
    notes: q.notes || '',
    commercial: q.commercial || '',
    items: (q.items || []).map((it: any) => ({
        articleId: it.article_id || undefined,
        designation: it.designation,
        qty: Number(it.qty) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        tva: Number(it.tva) || 0,
    })),
});

export const quotesService = {
    getAll: async (status?: DevisStatus): Promise<Devis[]> => {
        const response = await apiClient.get<any[]>('/quotes/', { params: status ? { status } : undefined });
        return (Array.isArray(response.data) ? response.data : []).map(mapDevisFromBackend);
    },

    getById: async (id: string): Promise<Devis> => {
        const response = await apiClient.get<any>(`/quotes/${id}`);
        return mapDevisFromBackend(response.data);
    },

    create: async (data: CreateDevisPayload): Promise<Devis> => {
        const response = await apiClient.post<any>('/quotes/', data);
        return mapDevisFromBackend(response.data);
    },

    updateStatus: async (id: string, status: DevisStatus): Promise<Devis> => {
        const response = await apiClient.post<any>(`/quotes/${id}/status`, { status });
        return mapDevisFromBackend(response.data);
    },

    convertToInvoice: async (id: string): Promise<{ quote_id: string; invoice_id: string; invoice_number: string }> => {
        const response = await apiClient.post<any>(`/quotes/${id}/convert`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/quotes/${id}`);
    },
};
