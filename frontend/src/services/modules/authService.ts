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
    role_display?: string;
    company_id: string;
    companyType: string;
    segment?: string;
    accessLevel: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

/**
 * Authentication Service
 */
// Comprehensive Demo Users List matching Backend
const DEMO_USERS = [
    // 1. MICRO-ENTREPRISE (EURL)
    {
        id: "demo-eurl-gerant",
        email: "karim.b@electromenager-plus.dz",
        password: "demo123",
        companyName: "Électroménager Plus (EURL)",
        companyType: "eurl",
        segment: "micro",
        prenom: "Karim",
        nom: "Benali",
        role: "gerant",
        role_display: "Gérant Propriétaire",
        description: "Accès complet, gestion simplifiée trésorerie & ventes",
        permissions: ["all"],
        avatar_color: "bg-blue-100 text-blue-800"
    },

    // 2. MOYENNE ENTREPRISE (SARL)
    {
        id: "demo-sarl-gerant",
        email: "samia.m@mode-moderne.dz",
        password: "demo123",
        companyName: "Mode Moderne SARL",
        companyType: "sarl",
        segment: "small",
        prenom: "Samia",
        nom: "Meziane",
        role: "gerant",
        role_display: "Gérante Associée",
        description: "Vue d'ensemble, validation dépenses, rapports financiers",
        permissions: ["all"],
        avatar_color: "bg-purple-100 text-purple-800"
    },
    {
        id: "demo-sarl-comptable",
        email: "ahmed.k@mode-moderne.dz",
        password: "demo123",
        companyName: "Mode Moderne SARL",
        companyType: "sarl",
        segment: "small",
        prenom: "Ahmed",
        nom: "Khaled",
        role: "comptable",
        role_display: "Comptable Principal",
        description: "Saisie écritures, états financiers, déclarations",
        permissions: ["accounting", "reports"],
        avatar_color: "bg-indigo-100 text-indigo-800"
    },
    {
        id: "demo-sarl-commercial",
        email: "lylia.z@mode-moderne.dz",
        password: "demo123",
        companyName: "Mode Moderne SARL",
        companyType: "sarl",
        segment: "small",
        prenom: "Lylia",
        nom: "Ziani",
        role: "commercial",
        role_display: "Responsable Ventes",
        description: "Gestion clients, devis, facturation, catalogue",
        permissions: ["sales", "crm"],
        avatar_color: "bg-pink-100 text-pink-800"
    },

    // 3. GRANDE ENTREPRISE (SPA)
    {
        id: "demo-spa-dg",
        email: "mourad.ouali@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Mourad",
        nom: "Ouali",
        role: "dg",
        role_display: "Directeur Général (CEO)",
        description: "Vue 360°, validation stratégique, budgets globaux, KPIs groupe.",
        permissions: ["all", "approve_strategic"],
        avatar_color: "bg-slate-900 text-white border-slate-700"
    },
    {
        id: "demo-spa-daf",
        email: "safia.haddad@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Safia",
        nom: "Haddad",
        role: "daf",
        role_display: "Directrice Admin & Financière (CFO)",
        description: "Contrôle financier, trésorerie complexe, consolidation, fiscalité, relation banques.",
        permissions: ["finance_full", "approve_budget", "treasury_manage"],
        avatar_color: "bg-emerald-100 text-emerald-800 border-emerald-300"
    },
    {
        id: "demo-spa-dir-co",
        email: "amine.ziani@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Amine",
        nom: "Ziani",
        role: "commercial_director",
        role_display: "Directeur Commercial",
        description: "Stratégie vente, objectifs équipes, validation gros contrats, analyse revenus.",
        permissions: ["sales_manage", "crm_full", "reports_sales"],
        avatar_color: "bg-blue-600 text-white border-blue-500"
    },
    {
        id: "demo-spa-rh",
        email: "leila.b@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Leila",
        nom: "Bouzidi",
        role: "hr_director",
        role_display: "Directrice RH",
        description: "Gestion paie masse, contrats, recrutement, performance, conformité sociale.",
        permissions: ["hr_full", "payroll_manage"],
        avatar_color: "bg-pink-100 text-pink-800 border-pink-300"
    },
    {
        id: "demo-spa-logistique",
        email: "omar.k@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Omar",
        nom: "Khodja",
        role: "logistics_director",
        role_display: "Directeur Logistique / Supply Chain",
        description: "Gestion stocks multi-dépôts, approvisionnements, livraisons flotte.",
        permissions: ["stock_full", "logistics_manage"],
        avatar_color: "bg-orange-100 text-orange-800 border-orange-300"
    },
    {
        id: "demo-spa-prod",
        email: "rachid.t@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Rachid",
        nom: "Toumi",
        role: "production_director",
        role_display: "Directeur Production",
        description: "Planification production, coûts industriels, maintenance, qualité.",
        permissions: ["production_manage", "costing_view"],
        avatar_color: "bg-zinc-100 text-zinc-800 border-zinc-300"
    },
    {
        id: "demo-spa-comptable-senior",
        email: "nawel.s@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Nawel",
        nom: "Saadi",
        role: "comptable_senior",
        role_display: "Chef Comptable",
        description: "Supervision comptable, clôtures mensuelles, déclarations fiscales.",
        permissions: ["accounting_full", "reports_financial"],
        avatar_color: "bg-indigo-100 text-indigo-800 border-indigo-300"
    },
    {
        id: "demo-spa-controleur",
        email: "fared.m@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Fared",
        nom: "Mansouri",
        role: "controleur_gestion",
        role_display: "Contrôleur de Gestion",
        description: "Analyse écarts budgets, comptabilité analytique, reporting performance.",
        permissions: ["analytics_full", "budget_view", "accounting_read"],
        avatar_color: "bg-cyan-100 text-cyan-800 border-cyan-300"
    },
    {
        id: "demo-spa-auditeur",
        email: "cabinet.expert@audit-externe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Cabinet",
        nom: "Expert Audit",
        role: "auditeur",
        role_display: "Auditeur Externe (CAC)",
        description: "Accès lecture seule audit, vérification états financiers, conformité légale.",
        permissions: ["audit_read", "read_only"],
        avatar_color: "bg-amber-100 text-amber-800 border-amber-300"
    },
    {
        id: "demo-spa-vendeur",
        email: "karim.v@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Karim",
        nom: "Vendeur",
        role: "commercial",
        role_display: "Commercial Terrain",
        description: "Saisie commandes, suivi portefeuille clients, consultation stock.",
        permissions: ["orders_create", "clients_view", "stock_read"],
        avatar_color: "bg-pink-50 text-pink-700 border-pink-200"
    },
    {
        id: "demo-spa-magasinier",
        email: "ali.stock@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Ali",
        nom: "Stock",
        role: "magasinier",
        role_display: "Responsable Entrepôt",
        description: "Réception marchandises, expéditions, inventaire physique.",
        permissions: ["stock_move", "delivery_manage"],
        avatar_color: "bg-yellow-100 text-yellow-800 border-yellow-300"
    },
    {
        id: "demo-spa-tresorier",
        email: "samir.cash@industrie-groupe.dz",
        password: "demo123",
        companyName: "Industrie Groupe SPA",
        companyType: "spa",
        segment: "enterprise",
        prenom: "Samir",
        nom: "Cash",
        role: "tresorier",
        role_display: "Trésorier",
        description: "Gestion liquidités quotidienne, rapprochements bancaires, paiements fournisseurs.",
        permissions: ["treasury_ops", "payments_manage"],
        avatar_color: "bg-green-100 text-green-800 border-green-300"
    }
];

/**
 * Authentication Service
 */
export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        // Call backend API /auth/login with username as email (or email directly)
        const response = await apiClient.post<any>('/auth/login', { username: email, password });
        const data = response.data;

        // Find demo user mapping for local UI segment/company config consistency
        const demoUser = DEMO_USERS.find(u => u.email === email);
        let companyType = 'eurl';
        let segment = 'micro';
        let accessLevel = 'starter';
        if (demoUser) {
            companyType = demoUser.companyType;
            segment = demoUser.segment;
            if (demoUser.segment === 'enterprise' || demoUser.segment === 'large') accessLevel = 'enterprise';
            else if (demoUser.segment === 'medium' || demoUser.segment === 'small') accessLevel = 'professional';
        } else if (email.includes('admin') || email.includes('daf')) {
            companyType = 'spa';
            segment = 'enterprise';
            accessLevel = 'enterprise';
        } else if (email.includes('manager') || email.includes('dg')) {
            companyType = 'sarl';
            segment = 'medium';
            accessLevel = 'professional';
        }

        const roles = data.user.roles || [];
        const primaryRole = roles[0] || 'utilisateur';

        const mappedUser: User = {
            id: data.user.user_id,
            email: data.user.email,
            username: data.user.username,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            nom: data.user.last_name,
            prenom: data.user.first_name,
            role: primaryRole,
            role_display: primaryRole === 'admin' ? 'Administrateur' : primaryRole === 'comptable' ? 'Comptable' : 'Utilisateur',
            company_id: data.user.company_id || 'default-company-id',
            companyType: companyType,
            segment: segment,
            accessLevel: accessLevel
        };

        const loginResp: LoginResponse = {
            access_token: data.access_token,
            token_type: data.token_type || 'bearer',
            user: mappedUser
        };

        saveSession(loginResp);
        return loginResp;
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
        return {
            users: [],
            credentials: DEMO_USERS
        };
    }
};

function saveSession(response: LoginResponse) {
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('company_id', response.user.company_id);
}
