import apiClient from '../apiClient';

export interface Supplier {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    tax_number?: string;
}

/**
 * Supplier Service - Procurement Domain
 */
export const suppliersService = {
    getAll: async () => {
        const response = await apiClient.get<Supplier[]>('/suppliers');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
        return response.data;
    },

    create: async (data: Partial<Supplier>) => {
        const response = await apiClient.post<Supplier>('/suppliers', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Supplier>) => {
        const response = await apiClient.put<Supplier>(`/suppliers/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/suppliers/${id}`);
    }
};
