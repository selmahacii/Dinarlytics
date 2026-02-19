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
                id: '1',
                name: 'Groupe Industriel El-Djazair',
                nom: 'Groupe Industriel El-Djazair', // Alias for dashboards
                email: 'contact@el-djazair-ind.dz',
                phone: '0550112233',
                address: 'Zone Industrielle Rouiba, Alger',
                tax_number: '0011223344',
                is_active: true,
                // Extended Analytics Data
                ca: 4500000,
                pourcentage: 36,
                croissance: 12.5,
                secteur: 'Industrie',
                risque: 'faible',
                raisonsTop: ['Partenaire historique', 'Commandes régulières', 'Paiements < 30j'],
                metriques: { delaiPaiement: 28, tauxRenouvellement: 100, satisfaction: 4.9, recommandations: 3 }
            },
            {
                id: '2',
                name: 'Sarl Tech Solutions',
                nom: 'Sarl Tech Solutions',
                email: 'info@tech-solutions.dz',
                phone: '0660445566',
                address: 'Cyber Parc Sidi Abdellah',
                tax_number: '5566778899',
                is_active: true,
                // Extended Analytics Data
                ca: 2100000,
                pourcentage: 16.8,
                croissance: 45.2,
                secteur: 'Technologie',
                risque: 'moyen',
                raisonsTop: ['Forte croissance', 'Innovation conjointe', 'Ticket moyen élevé'],
                metriques: { delaiPaiement: 45, tauxRenouvellement: 85, satisfaction: 4.5, recommandations: 8 }
            },
            {
                id: '3',
                name: 'Eurl Distribution Express',
                nom: 'Eurl Distribution Express',
                email: 'logistique@distrib-express.dz',
                phone: '0770889900',
                address: 'Oran Centre',
                tax_number: '9988776655',
                is_active: true,
                // Extended Analytics Data
                ca: 1850000,
                pourcentage: 14.2,
                croissance: -2.1,
                secteur: 'Logistique',
                risque: 'élevé',
                raisonsTop: ['Volume important', 'Maillage territorial'],
                metriques: { delaiPaiement: 65, tauxRenouvellement: 60, satisfaction: 3.8, recommandations: 0 }
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
        const response = await apiClient.get<any>('/clients/stats');
        return response.data;
    },

    getGroups: async () => {
        const response = await apiClient.get<any>('/clients/groups');
        return response.data;
    }
};
