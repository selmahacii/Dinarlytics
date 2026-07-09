import apiClient from '../apiClient';

export interface Client {
    id?: string;
    nom: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    nif?: string;
    is_active: boolean;
    ca?: number;
    solde?: number;
    dernierAchat?: string;
    pourcentage?: number;
    croissance?: number;
    secteur?: string;
    risque?: string;
}

const mapClientFromBackend = (c: any): Client => ({
    id: c.id,
    nom: c.name,
    email: c.email,
    telephone: c.phone,
    adresse: c.address,
    nif: c.tax_number || c.tax_id,
    is_active: c.is_active ?? true,
    ca: c.ca || 0,
    solde: c.solde || 0,
    dernierAchat: c.dernier_achat,
    pourcentage: c.pourcentage,
    croissance: c.croissance,
    secteur: c.sector,
    risque: c.risk_category
});

const mapClientToBackend = (c: Partial<Client>): any => {
    const data: any = {};
    if (c.nom !== undefined) data.name = c.nom;
    if (c.email !== undefined) data.email = c.email;
    if (c.telephone !== undefined) data.phone = c.telephone;
    if (c.adresse !== undefined) data.address = c.adresse;
    if (c.nif !== undefined) {
        data.tax_number = c.nif;
        data.tax_id = c.nif;
    }
    if (c.is_active !== undefined) data.is_active = c.is_active;
    if (c.secteur !== undefined) data.sector = c.secteur;
    if (c.risque !== undefined) data.risk_category = c.risque;
    return data;
};

/**
 * Client Service - CRM Domain
 */
export const clientsService = {
    getAll: async () => {
        const response = await apiClient.get<any[]>('/clients');
        return (Array.isArray(response.data) ? response.data : []).map(mapClientFromBackend);
    },

    getById: async (id: string) => {
        const response = await apiClient.get<any>(`/clients/${id}`);
        return mapClientFromBackend(response.data);
    },

    create: async (data: Partial<Client>) => {
        const payload = mapClientToBackend(data);
        const response = await apiClient.post<any>('/clients', payload);
        return mapClientFromBackend(response.data);
    },

    update: async (id: string, data: Partial<Client>) => {
        const payload = mapClientToBackend(data);
        const response = await apiClient.put<any>(`/clients/${id}`, payload);
        return mapClientFromBackend(response.data);
    },

    delete: async (id: string) => {
        await apiClient.delete(`/clients/${id}`);
    },

    getStats: async () => {
        const response = await apiClient.get<any>('/clients/stats');
        return response.data;
    },

    getGroups: async () => {
        const response = await apiClient.get<any>('/clients/groups');
        return response.data;
    }
};
