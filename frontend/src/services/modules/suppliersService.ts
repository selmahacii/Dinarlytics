import apiClient from '../apiClient';

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
        // MOCK DATA - Algerian Suppliers
        const mockSuppliers: Supplier[] = [
            { id: 'f-001', name: 'Global Logistics Algerie', nif: '000116109000101', rc: '16/00-123456B16', ai: '16123456789', email: 'contact@global-log.dz', phone: '023 45 67 89', address: 'Zone Industrielle, Oued Smar' },
            { id: 'f-002', name: 'Industrie Plastique Nord', nif: '000216109000202', rc: '16/00-789012B16', ai: '16223344556', email: 'sales@ip-nord.dz', phone: '024 12 34 56', address: 'Z.I Rouiba, Alger' },
            { id: 'f-003', name: 'TechSolutions SARL', nif: '000316109000303', rc: '16/00-112233B16', ai: '16334455667', email: 'info@tech-sol.dz', phone: '021 98 76 54', address: 'Sidi Abdellah, Alger' },
            { id: 'f-004', name: 'Papeterie Centrale SPA', nif: '000416109000404', rc: '16/00-445566B16', ai: '16445566778', email: 'order@papeterie.dz', phone: '025 55 44 33', address: 'Bordj El Kiffan, Alger' },
            { id: 'f-005', name: 'Sonelgaz SPA', nif: '000016109000001', rc: '16/00-0000001B16', ai: '16000000001', email: 'contact@sonelgaz.dz', phone: '3303', address: 'Boulevard Krim Belkacem, Alger' },
            { id: 'f-006', name: 'SNTF (Fret)', nif: '000016109000002', rc: '16/00-0000002B16', ai: '16000000002', email: 'fret@sntf.dz', phone: '021 67 33 33', address: '21 Boulevard Mohamed V, Alger' },
            { id: 'f-007', name: 'Mobilis SPA', nif: '000316001234567', rc: '16/00-998877B16', ai: '16998877665', email: 'business@mobilis.dz', phone: '666', address: 'Bab Ezzouar, Alger' }
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
