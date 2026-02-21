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

const DEMO_CLIENTS_KEY = 'dinarlytics_demo_clients';

const getInitialClients = () => [
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
    }
];

const getDemoClients = (): any[] => {
    const saved = localStorage.getItem(DEMO_CLIENTS_KEY);
    if (saved) return JSON.parse(saved);
    const initial = getInitialClients();
    localStorage.setItem(DEMO_CLIENTS_KEY, JSON.stringify(initial));
    return initial;
};

const saveDemoClients = (clients: any[]) => {
    localStorage.setItem(DEMO_CLIENTS_KEY, JSON.stringify(clients));
};

/**
 * Client Service - CRM Domain
 */
export const clientsService = {
    getAll: async () => {
        try {
            const response = await apiClient.get<Client[]>('/clients');
            return response.data;
        } catch (e) {
            console.warn('API Clients failed, using demo data', e);
            await new Promise(resolve => setTimeout(resolve, 300));
            return getDemoClients();
        }
    },

    getById: async (id: string) => {
        try {
            const response = await apiClient.get<Client>(`/clients/${id}`);
            return response.data;
        } catch (e) {
            const clients = getDemoClients();
            return clients.find(c => c.id === id) || { id, name: 'Client Inconnu', is_active: true };
        }
    },

    create: async (data: Partial<Client>) => {
        try {
            const response = await apiClient.post<Client>('/clients', data);
            return response.data;
        } catch (e) {
            const clients = getDemoClients();
            const newClient = { ...data, id: `c-${Date.now()}`, is_active: true };
            clients.push(newClient);
            saveDemoClients(clients);
            return newClient as Client;
        }
    },

    update: async (id: string, data: Partial<Client>) => {
        try {
            const response = await apiClient.put<Client>(`/clients/${id}`, data);
            return response.data;
        } catch (e) {
            const clients = getDemoClients();
            const idx = clients.findIndex(c => c.id === id);
            if (idx >= 0) {
                clients[idx] = { ...clients[idx], ...data };
                saveDemoClients(clients);
                return clients[idx];
            }
            throw new Error('Client not found');
        }
    },

    delete: async (id: string) => {
        try {
            await apiClient.delete(`/clients/${id}`);
        } catch (e) {
            const clients = getDemoClients();
            saveDemoClients(clients.filter(c => c.id !== id));
        }
    },

    getStats: async () => {
        try {
            const response = await apiClient.get<any>('/clients/stats');
            return response.data;
        } catch (e) {
            const clients = getDemoClients();
            return {
                total_clients: clients.length,
                active_clients: clients.filter(c => c.is_active).length,
                new_clients_this_month: 1,
                total_revenue: 4800000,
                average_order_value: 1200000,
                top_clients: clients.slice(0, 2).map(c => ({ name: c.name, ca: c.ca || 0 }))
            };
        }
    },

    getGroups: async () => {
        try {
            const response = await apiClient.get<any>('/clients/groups');
            return response.data;
        } catch (e) {
            return [];
        }
    }
};
