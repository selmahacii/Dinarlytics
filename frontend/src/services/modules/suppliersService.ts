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
        // MOCK DATA - Algerian Suppliers
        const mockSuppliers: Supplier[] = [
            { id: 'f-001', name: 'Global Logistics Algerie', tax_number: '000116109000101', email: 'contact@global-log.dz', phone: '023 45 67 89', address: 'Zone Industrielle, Oued Smar' },
            { id: 'f-002', name: 'Industrie Plastique Nord', tax_number: '000216109000202', email: 'sales@ip-nord.dz', phone: '024 12 34 56', address: 'Z.I Rouiba, Alger' },
            { id: 'f-003', name: 'Tech Solutions Import', tax_number: '000316109000303', email: 'info@tech-sol.dz', phone: '021 98 76 54', address: 'Sidi Abdellah, Alger' },
            { id: 'f-004', name: 'Papeterie Centrale SPA', tax_number: '000416109000404', email: 'order@papeterie.dz', phone: '025 55 44 33', address: 'Bordj El Kiffan, Alger' }
        ];

        return new Promise<Supplier[]>((resolve) => {
            setTimeout(() => resolve(mockSuppliers), 500);
        });

        /* Real API Call Commented
        const response = await apiClient.get<Supplier[]>('/suppliers');
        return response.data;
        */
    },

    getById: async (id: string) => {
        const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
        return response.data;
    },

    create: async (data: Partial<Supplier>) => {
        // Simulate creation
        return { ...data, id: `f-${Date.now()}` } as Supplier;
        /*
        const response = await apiClient.post<Supplier>('/suppliers', data);
        return response.data;
        */
    },

    update: async (id: string, data: Partial<Supplier>) => {
        // Simulate update
        return { id, ...data } as Supplier;
        /*
        const response = await apiClient.put<Supplier>(`/suppliers/${id}`, data);
        return response.data;
        */
    },

    delete: async (id: string) => {
        // Simulate delete
        return Promise.resolve();
        /*
        await apiClient.delete(`/suppliers/${id}`);
        */
    }
};
