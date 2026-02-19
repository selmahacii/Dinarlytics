import apiClient from '../apiClient';

export interface User {
    id: string;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    nom?: string;
    prenom?: string;
    role: string;
    company_id: string;
    companyType: string; // 'eurl' | 'sarl' | 'spa'
    accessLevel: string; // 'starter' | 'professional' | 'enterprise'
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

/**
 * Authentication Service
 */
export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        // MOCK IMPLEMENTATION FOR DEMO/TESTING
        // const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Determine role and company profile based on email
        let role = 'utilisateur';
        let companyType = 'eurl'; // Default to Micro
        let companyId = 'mock-company-micro';
        let accessLevel = 'starter';

        if (email.includes('admin') || email.includes('daf')) {
            role = 'admin'; // or 'daf' if added to types
            companyType = 'spa'; // Large Enterprise
            companyId = 'mock-company-spa';
            accessLevel = 'enterprise';
        }
        else if (email.includes('manager') || email.includes('dg')) {
            role = 'manager';
            companyType = 'sarl'; // SME
            companyId = 'mock-company-sme';
            accessLevel = 'professional';
        }
        else if (email.includes('comptable')) {
            role = 'comptable';
            companyType = 'sarl';
            companyId = 'mock-company-sme';
            accessLevel = 'professional';
        }
        else if (email.includes('entrepreneur') || email.includes('vendeur')) {
            role = 'gerant'; // Owner role
            companyType = 'eurl'; // Micro
            companyId = 'mock-company-micro';
            accessLevel = 'starter';
        }

        const mockUser: User = {
            id: `mock-user-${role}`,
            email: email,
            username: email.split('@')[0],
            first_name: role.charAt(0).toUpperCase() + role.slice(1),
            last_name: 'Demo',
            nom: 'Demo',
            prenom: role.charAt(0).toUpperCase() + role.slice(1),
            role: role,
            company_id: companyId,
            companyType: companyType,
            accessLevel: accessLevel
        };

        const mockResponse: LoginResponse = {
            access_token: `mock-jwt-token-${role}-123456`,
            token_type: 'bearer',
            user: mockUser
        };

        localStorage.setItem('token', mockResponse.access_token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        localStorage.setItem('company_id', mockResponse.user.company_id);

        return mockResponse;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('company_id');
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getDemoUsers: async (): Promise<{ users: any[], credentials: any[] }> => {
        // Mock data for demo purposes since backend is optional
        return {
            users: [], // Not really used directly by frontend logic, focusing on credentials
            credentials: [
                // 1. MICRO-ENTREPRISE (EURL)
                {
                    id: 'micro-1',
                    email: 'entrepreneur@demo.com',
                    password: 'demo123',
                    companyName: 'Boutique Mode EURL',
                    segment: 'micro',
                    prenom: 'Karim',
                    nom: 'Entrepreneur',
                    role: 'gerant',
                    description: 'Vue simplifiée : Trésorerie, Ventes, Caisse'
                },
                {
                    id: 'micro-2',
                    email: 'vendeur@demo.com',
                    password: 'demo123',
                    companyName: 'Boutique Mode EURL',
                    segment: 'micro',
                    prenom: 'Sarah',
                    nom: 'Vendeuse',
                    role: 'vendeur',
                    description: 'Accès limité : Caisse, Tickets, Clients'
                },

                // 2. PME / PMI (SARL)
                {
                    id: 'sme-1',
                    email: 'dg@demo.com',
                    password: 'demo123',
                    companyName: 'TechSolutions SARL',
                    segment: 'small',
                    prenom: 'Ahmed',
                    nom: 'Directeur',
                    role: 'manager',
                    description: 'Pilotage complet, Validation Achats, RH'
                },
                {
                    id: 'sme-2',
                    email: 'manager@demo.com',
                    password: 'demo123',
                    companyName: 'TechSolutions SARL',
                    segment: 'small',
                    prenom: 'Leila',
                    nom: 'Manager Ops',
                    role: 'manager',
                    description: 'Gestion Stocks, Fournisseurs, Planning'
                },
                {
                    id: 'sme-3',
                    email: 'comptable@demo.com',
                    password: 'demo123',
                    companyName: 'TechSolutions SARL',
                    segment: 'small',
                    prenom: 'Samir',
                    nom: 'Comptable',
                    role: 'comptable',
                    description: 'Saisie écritures, Facturation, Déclarations'
                },

                // 3. GRANDE ENTREPRISE (SPA)
                {
                    id: 'spa-1',
                    email: 'admin@demo.com',
                    password: 'demo123',
                    companyName: 'Groupe Industriel SPA',
                    segment: 'enterprise',
                    prenom: 'System',
                    nom: 'Admin',
                    role: 'admin',
                    description: 'Super Administrateur - Accès Illimité'
                },
                {
                    id: 'spa-2',
                    email: 'daf@demo.com',
                    password: 'demo123',
                    companyName: 'Groupe Industriel SPA',
                    segment: 'enterprise',
                    prenom: 'Nadia',
                    nom: 'DAF',
                    role: 'daf',
                    description: 'Reporting Consolidé, Audit, Stratégie'
                },
                {
                    id: 'spa-3',
                    email: 'auditeur@demo.com',
                    password: 'demo123',
                    companyName: 'Groupe Industriel SPA',
                    segment: 'enterprise',
                    prenom: 'Farid',
                    nom: 'Auditeur',
                    role: 'auditeur',
                    description: 'Lecture Seule Globale pour Certification'
                }
            ]
        };
    }
};
