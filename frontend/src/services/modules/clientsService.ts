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
        // MOCK IMPLEMENTATION
        // const response = await apiClient.get<Client[]>('/clients');
        // return response.data;
        await new Promise(resolve => setTimeout(resolve, 600));
        return [
            {
                id: 'c-001',
                name: 'Sonatrach',
                nom: 'Sonatrach',
                email: 'contact@sonatrach.dz',
                phone: '021 54 80 00',
                address: 'Djenane El Malik, Hydra, Alger',
                tax_number: '000016109000101',
                is_active: true,
                ca: 4500000,
                solde: 1250000,
                dernierAchat: '2023-10-15',
                pourcentage: 36,
                croissance: 12.5,
                secteur: 'Energie',
                risque: 'faible',
                raisonsTop: ['Partenaire stratégique', 'Contrats long terme', 'Paiements rigoureux'],
                metriques: { delaiPaiement: 15, tauxRenouvellement: 100, satisfaction: 4.8, recommandations: 5 }
            },
            {
                id: 'c-002',
                name: 'Cévital SPA',
                nom: 'Cévital SPA',
                email: 'sales@cevital.com',
                phone: '034 21 44 44',
                address: 'Nouveau Port, Bejaia',
                tax_number: '000216109000202',
                is_active: true,
                ca: 3800000,
                solde: 450000,
                dernierAchat: '2023-11-20',
                pourcentage: 28.5,
                croissance: 8.2,
                secteur: 'Agro-industrie',
                risque: 'faible',
                raisonsTop: ['Leader industriel', 'Gros volumes', 'Expertise reconnue'],
                metriques: { delaiPaiement: 30, tauxRenouvellement: 95, satisfaction: 4.6, recommandations: 12 }
            },
            {
                id: 'c-003',
                name: 'Ooredoo Algérie',
                nom: 'Ooredoo Algérie',
                email: 'corporate@ooredoo.dz',
                phone: '0550 00 00 00',
                address: 'Ouled Fayet, Alger',
                tax_number: '000316109000303',
                is_active: true,
                ca: 2900000,
                solde: 0,
                dernierAchat: '2024-01-05',
                pourcentage: 22.1,
                croissance: 15.4,
                secteur: 'Télécom',
                risque: 'faible',
                raisonsTop: ['Innovation tech', 'Paiements automatisés'],
                metriques: { delaiPaiement: 25, tauxRenouvellement: 98, satisfaction: 4.7, recommandations: 4 }
            },
            {
                id: 'c-004',
                name: 'Djezzy',
                nom: 'Djezzy',
                email: 'info@djezzy.dz',
                phone: '0770 85 00 00',
                address: 'Dar El Beida, Alger',
                tax_number: '000416109000404',
                is_active: true,
                ca: 2100000,
                solde: 850000,
                dernierAchat: '2023-09-12',
                pourcentage: 13.4,
                croissance: -5.0,
                secteur: 'Télécom',
                risque: 'moyen',
                raisonsTop: ['Acteur majeur', 'Large couverture'],
                metriques: { delaiPaiement: 45, tauxRenouvellement: 88, satisfaction: 4.2, recommandations: 2 }
            }
        ] as any[];
    },

    getById: async (id: string) => {
        // MOCK IMPLEMENTATION
        // const response = await apiClient.get<Client>(`/clients/${id}`);
        // return response.data;
        await new Promise(resolve => setTimeout(resolve, 300));
        return { id: id, name: 'Client Mock', email: 'mock@client.com', is_active: true } as Client;
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
    },

    getStats: async () => {
        // MOCK IMPLEMENTATION if backend fails
        // try {
        //     const response = await apiClient.get<any>('/clients/stats');
        //     return response.data;
        // } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            total_clients: 4,
            active_clients: 3,
            new_clients_this_month: 1,
            total_revenue: 4800000,
            average_order_value: 1200000,
            top_clients: [
                { name: 'Sonatrach', ca: 4500000 },
                { name: 'Cévital SPA', ca: 3800000 }
            ]
        };
        // }
    },

    getGroups: async () => {
        const response = await apiClient.get<any>('/clients/groups');
        return response.data;
    }
};
