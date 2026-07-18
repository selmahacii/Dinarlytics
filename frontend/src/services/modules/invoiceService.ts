import apiClient from '../apiClient';

export interface InvoiceItem {
    id?: string;
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

// Le backend renvoie snake_case (numero, client_id, total_ht, statut EN
// draft/validated/annulee...) alors que le frontend consomme du camelCase
// avec des statuts français — sans ce mapping, getAll()/create()/update()
// renvoyaient l'objet backend brut : customerId, factureId, totalTTC,
// statut ('en_cours'...) étaient tous `undefined` à l'exécution.
const STATUS_MAP: Record<string, Invoice['statut']> = {
    draft: 'en_attente',
    validated: 'en_cours',
    annulee: 'annule',
    paid: 'payee'
};

function mapInvoiceFromBackend(raw: any): Invoice {
    const items: InvoiceItem[] = (raw.items || []).map((it: any) => ({
        id: it.id,
        desc: it.description || it.designation || '',
        qty: Number(it.quantity ?? it.qty ?? 0),
        pu: Number(it.unit_price_ht ?? it.unitPrice ?? 0),
        type: 'bien',
        tva_rate: Number(it.tva_rate ?? 19),
        line_total_ht: Number(it.total_ht ?? 0),
        line_total_tva: 0,
        line_total_ttc: Number(it.total_ht ?? 0)
    }));

    return {
        id: raw.id,
        factureId: raw.numero || raw.id,
        type: raw.type === 'purchase' ? 'purchase' : 'sale',
        client: raw.client_name || raw.client || '',
        entityDetails: raw.entityDetails,
        date: raw.date_emission || raw.date || '',
        echeance: raw.date_echeance || raw.echeance || '',
        montant: Number(raw.total_ttc ?? raw.montant ?? 0),
        montantPaye: Number(raw.montant_paye ?? raw.montantPaye ?? 0),
        paymentMode: raw.payment_mode || raw.paymentMode || 'virement',
        statut: STATUS_MAP[raw.statut] || raw.statut || 'en_attente',
        retard: Number(raw.retard ?? 0),
        reference: raw.reference,
        items,
        secteur: raw.secteur,
        audit: raw.audit || [],
        totalHT: Number(raw.total_ht ?? 0),
        totalTVA: Number(raw.total_tva ?? 0),
        totalTAP: Number(raw.total_tap ?? 0),
        droitTimbre: Number(raw.timbre_amount ?? 0),
        totalTTC: Number(raw.total_ttc ?? 0),
        supplierId: raw.supplier_id,
        customerId: raw.client_id,
        fileUrl: raw.file_url
    };
}

export const invoiceService = {
    /**
     * Fetches all invoices with server-side filtering
     */
    getAll: async (type?: 'sale' | 'purchase'): Promise<Invoice[]> => {
        const response = await apiClient.get<any[]>('/invoices/', {
            params: { type }
        });
        if (Array.isArray(response.data)) {
            return response.data.map(mapInvoiceFromBackend);
        }
        throw new Error('Invalid API response format (expected array)');
    },

    /**
     * Retrieves a single detailed invoice
     */
    getById: async (id: string): Promise<Invoice> => {
        const response = await apiClient.get<any>(`/invoices/${id}`);
        return mapInvoiceFromBackend(response.data);
    },

    /**
     * Creates a new invoice. `data` must match the backend contract:
     * { client_id, date_emission, date_echeance?, payment_mode, notes?,
     *   items: [{ description, quantity, unit_price, tva_rate (ratio 0-1) }] }
     */
    create: async (data: any): Promise<Invoice> => {
        const response = await apiClient.post<any>('/invoices/', data);
        return mapInvoiceFromBackend(response.data);
    },

    /**
     * Updates a DRAFT invoice (same payload shape as create).
     */
    update: async (id: string, data: any): Promise<Invoice> => {
        const response = await apiClient.put<any>(`/invoices/${id}`, data);
        return mapInvoiceFromBackend(response.data);
    },

    /**
     * Validates a draft invoice (backend route is POST, not PATCH)
     */
    validate: async (id: string): Promise<Invoice> => {
        const response = await apiClient.post<any>(`/invoices/${id}/validate`);
        return mapInvoiceFromBackend(response.data);
    },

    /**
     * Cancels an invoice
     */
    cancel: async (id: string) => {
        const response = await apiClient.post(`/invoices/${id}/cancel`);
        return response.data;
    },

    /**
     * Downloads the UBL 2.1 e-invoice XML (Peppol BIS Billing 3.0) and
     * triggers a browser download.
     */
    downloadUbl: async (id: string, numero?: string) => {
        const response = await apiClient.get(`/invoices/${id}/ubl`, { responseType: 'blob' });
        const url = URL.createObjectURL(response.data as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ubl_${(numero || id).replace(/\//g, '-')}.xml`;
        a.click();
        URL.revokeObjectURL(url);
    }
};
