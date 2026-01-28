import apiClient from '../apiClient';

export interface Client {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    tax_number?: string;
    is_active: boolean;
}

/**
 * Client Service - CRM Domain
 */
export const clientsService = {
    getAll: async () => {
        const response = await apiClient.get<Client[]>('/clients');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<Client>(`/clients/${id}`);
        return response.data;
    },

    create: async (data: Partial<Client>) => {
        const response = await apiClient.post<Client>('/clients', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Client>) => {
        const response = await apiClient.put<Client>(`/clients/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/clients/${id}`);
    }
};
