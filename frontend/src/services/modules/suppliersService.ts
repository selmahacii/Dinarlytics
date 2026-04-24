import apiClient from '../apiClient';
import { MOCK_DATA } from '../mockData';

export interface Supplier {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address: string;
    nif: string;
    nis?: string;
    rc: string;
    ai: string;
    rib?: string;
}

/**
 * Supplier Service - Procurement Domain
 */
export const suppliersService = {
    getAll: async () => {
        try {
            const response = await apiClient.get<Supplier[]>('/suppliers');
            return response.data;
        } catch (e) {
            console.warn('API Suppliers failed, using demo data', e);
            // Fallback would be handled by apiClient interceptor if configured,
            // but we provide a second layer of insurance here
            return MOCK_DATA['/suppliers'] as Supplier[];
        }
    },

    getById: async (id: string) => {
        try {
            const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
            return response.data;
        } catch (e) {
            const suppliers = MOCK_DATA['/suppliers'] as Supplier[];
            return suppliers.find(s => s.id === id) || { id, name: 'Fournisseur Inconnu', address: 'N/A', nif: '', rc: '', ai: '' } as Supplier;
        }
    },

    create: async (data: Partial<Supplier>) => {
        try {
            const response = await apiClient.post<Supplier>('/suppliers', data);
            return response.data;
        } catch (e) {
            return { ...data, id: `f-${Date.now()}` } as Supplier;
        }
    },

    update: async (id: string, data: Partial<Supplier>) => {
        try {
            const response = await apiClient.put<Supplier>(`/suppliers/${id}`, data);
            return response.data;
        } catch (e) {
            return { id, ...data } as Supplier;
        }
    },

    delete: async (id: string) => {
        try {
            await apiClient.delete(`/suppliers/${id}`);
        } catch (e) {
            console.warn('Delete failed (mock mode)');
        }
    }
};
