import apiClient from '../apiClient';

export interface Client {
    id?: string;
    nom: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    nif?: string;
    is_active: boolean;
}

const DEMO_CLIENTS_KEY = 'dinarlytics_demo_clients';

const getInitialClients = () => [
    {
        id: 'c-001',
        nom: 'Sonatrach',
        email: 'contact@sonatrach.dz',
        telephone: '021 54 80 00',
        adresse: 'Djenane El Malik, Hydra, Alger',
        nif: '000016109000101',
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
        nom: 'Cévital SPA',
        email: 'sales@cevital.com',
        telephone: '034 21 44 44',
        adresse: 'Nouveau Port, Bejaia',
        nif: '000216109000202',
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
        nom: 'Ooredoo Algérie',
        email: 'corporate@ooredoo.dz',
        telephone: '0550 00 00 00',
        adresse: 'Ouled Fayet, Alger',
        nif: '000316109000303',
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
        nom: 'Djezzy SPA',
        email: 'business@djezzy.dz',
        telephone: '0770 85 00 00',
        adresse: 'Dar El Beida, Alger',
        nif: '000116001234567',
        is_active: true,
        ca: 2100000,
        solde: 150000,
        dernierAchat: '2024-02-10',
        pourcentage: 15.2,
        croissance: 5.4,
        secteur: 'Télécom',
        risque: 'faible',
        metriques: { delaiPaiement: 20, tauxRenouvellement: 99, satisfaction: 4.9, recommandations: 8 }
    },
    {
        id: 'c-005',
        nom: 'Condor Electronics',
        email: 'sales@condor.dz',
        telephone: '035 66 77 88',
        adresse: 'Zone Industrielle, BBA',
        nif: '000534019012345',
        is_active: true,
        ca: 5600000,
        solde: 2800000,
        dernierAchat: '2024-01-25',
        pourcentage: 42.5,
        croissance: 20.1,
        secteur: 'Electronique',
        risque: 'moyen',
        metriques: { delaiPaiement: 45, tauxRenouvellement: 92, satisfaction: 4.2, recommandations: 15 }
    },
    {
        id: 'c-006',
        nom: 'Naftal SPA',
        email: 'contact@naftal.dz',
        telephone: '021 38 13 13',
        adresse: 'Cheraga, Alger',
        nif: '000016109000404',
        is_active: true,
        ca: 8900000,
        solde: 0,
        dernierAchat: '2024-02-15',
        pourcentage: 65,
        croissance: 11.2,
        secteur: 'Energie',
        risque: 'faible',
        metriques: { delaiPaiement: 10, tauxRenouvellement: 100, satisfaction: 4.5, recommandations: 2 }
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
            if (Array.isArray(response.data)) {
                return response.data;
            }
            throw new Error('Invalid API response format (expected array)');
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
                top_clients: clients.slice(0, 2).map(c => ({ name: c.nom, ca: c.ca || 0 }))
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
