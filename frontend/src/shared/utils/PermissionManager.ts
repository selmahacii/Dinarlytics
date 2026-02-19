import { COMPANY_TYPES, ACCESS_LEVELS } from '@/types/CompanyTypes';

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredFor: string[];
  level: 'basic' | 'intermediate' | 'advanced';
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  companyTypes: string[];
  accessLevels: string[];
}

// Permissions disponibles
export const AVAILABLE_PERMISSIONS: UserPermission[] = [
  // CRM / Clients
  {
    id: 'clients-manage',
    name: 'Gestion clients',
    description: 'Créer, modifier et consulter les clients',
    category: 'clients',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },

  // Achats / Fournisseurs
  {
    id: 'fournisseurs-manage',
    name: 'Gestion fournisseurs',
    description: 'Créer, modifier et consulter les fournisseurs',
    category: 'achats',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  // Comptabilité
  {
    id: 'comptabilite-read',
    name: 'Lire la comptabilité',
    description: 'Consulter les écritures comptables',
    category: 'comptabilite',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'comptabilite-write',
    name: 'Modifier la comptabilité',
    description: 'Créer et modifier les écritures',
    category: 'comptabilite',
    requiredFor: ['sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'comptabilite-validate',
    name: 'Valider la comptabilité',
    description: 'Valider les écritures comptables',
    category: 'comptabilite',
    requiredFor: ['spa'],
    level: 'advanced'
  },
  {
    id: 'comptabilite-close',
    name: 'Clôturer les exercices',
    description: 'Clôturer les exercices comptables',
    category: 'comptabilite',
    requiredFor: ['sarl', 'spa'],
    level: 'advanced'
  },

  // Facturation
  {
    id: 'facturation-read',
    name: 'Lire les factures',
    description: 'Consulter les factures',
    category: 'facturation',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'facturation-create',
    name: 'Créer des factures',
    description: 'Créer de nouvelles factures',
    category: 'facturation',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'facturation-validate',
    name: 'Valider les factures',
    description: 'Valider les factures avant envoi',
    category: 'facturation',
    requiredFor: ['sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'facturation-cancel',
    name: 'Annuler les factures',
    description: 'Annuler ou corriger les factures',
    category: 'facturation',
    requiredFor: ['sarl', 'spa'],
    level: 'advanced'
  },

  // Gestion des stocks
  {
    id: 'stocks-read',
    name: 'Lire les stocks',
    description: 'Consulter les niveaux de stock',
    category: 'stocks',
    requiredFor: ['sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'stocks-move',
    name: 'Mouvements de stock',
    description: 'Enregistrer les mouvements',
    category: 'stocks',
    requiredFor: ['sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'stocks-inventory',
    name: 'Inventaire',
    description: 'Effectuer les inventaires',
    category: 'stocks',
    requiredFor: ['sarl', 'spa'],
    level: 'intermediate'
  },

  // Gestion de la paie
  {
    id: 'paie-read',
    name: 'Lire la paie',
    description: 'Consulter les bulletins de paie',
    category: 'paie',
    requiredFor: ['sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'paie-create',
    name: 'Créer la paie',
    description: 'Créer les bulletins de paie',
    category: 'paie',
    requiredFor: ['sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'paie-validate',
    name: 'Valider la paie',
    description: 'Valider les bulletins de paie',
    category: 'paie',
    requiredFor: ['spa'],
    level: 'advanced'
  },

  // Rapports
  {
    id: 'rapports-basic',
    name: 'Rapports de base',
    description: 'Consulter les rapports simples',
    category: 'rapports',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'rapports-advanced',
    name: 'Rapports avancés',
    description: 'Consulter les rapports complexes',
    category: 'rapports',
    requiredFor: ['sarl', 'spa'],
    level: 'intermediate'
  },

  // Export
  {
    id: 'export-data',
    name: 'Export données',
    description: 'Exporter les données (CSV, PDF)',
    category: 'rapports',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'rapports-create',
    name: 'Créer des rapports',
    description: 'Créer des rapports personnalisés',
    category: 'rapports',
    requiredFor: ['spa'],
    level: 'advanced'
  },

  // Administration
  {
    id: 'admin-users',
    name: 'Gérer les utilisateurs',
    description: 'Créer et modifier les utilisateurs',
    category: 'administration',
    requiredFor: ['sarl', 'spa'],
    level: 'advanced'
  },
  {
    id: 'admin-settings',
    name: 'Paramètres système',
    description: 'Modifier les paramètres du système',
    category: 'administration',
    requiredFor: ['spa'],
    level: 'advanced'
  },
  {
    id: 'admin-backup',
    name: 'Sauvegardes',
    description: 'Gérer les sauvegardes',
    category: 'administration',
    requiredFor: ['spa'],
    level: 'advanced'
  },

  // Audit
  {
    id: 'audit-read',
    name: 'Audit en lecture',
    description: 'Consulter les logs d\'audit',
    category: 'audit',
    requiredFor: ['sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'audit-full',
    name: 'Audit complet',
    description: 'Accès complet aux fonctions d\'audit',
    category: 'audit',
    requiredFor: ['spa'],
    level: 'advanced'
  },

  // Intelligence Artificielle (LIA)
  {
    id: 'lia-access',
    name: 'Accès LIA',
    description: 'Accès général à l\'intelligence décisionnelle',
    category: 'lia',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'lia-chatbot',
    name: 'Chatbot LIA',
    description: 'Utiliser le chatbot d\'intelligence artificielle',
    category: 'lia',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'lia-analyses',
    name: 'Analyses LIA',
    description: 'Consulter les analyses automatisées',
    category: 'lia',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'lia-train',
    name: 'Entraînement modèle IA',
    description: 'Entraîner et ajuster les modèles IA',
    category: 'lia',
    requiredFor: ['sarl', 'spa'],
    level: 'advanced'
  },

  // Dashboard
  {
    id: 'dashboard-access',
    name: 'Accès tableau de bord',
    description: 'Accès au tableau de bord',
    category: 'dashboard',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'dashboard-overview',
    name: 'Vue d\'ensemble',
    description: 'Voir la vue d\'ensemble du dashboard',
    category: 'dashboard',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'dashboard-charts',
    name: 'Graphiques interactifs',
    description: 'Voir les graphiques du dashboard',
    category: 'dashboard',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'dashboard-alerts',
    name: 'Alertes intelligentes',
    description: 'Voir les alertes automatisées',
    category: 'dashboard',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'dashboard-calendar',
    name: 'Calendrier & Rappels',
    description: 'Voir le calendrier des tâches',
    category: 'dashboard',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },

  // Articles & Inventaire
  {
    id: 'articles-manage',
    name: 'Gestion articles',
    description: 'Créer, modifier et consulter les articles',
    category: 'articles',
    requiredFor: ['sarl', 'spa'],
    level: 'intermediate'
  },

  // Rapports supplémentaires
  {
    id: 'rapports-ventes',
    name: 'Rapports ventes',
    description: 'Consulter les rapports de ventes',
    category: 'rapports',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'rapports-achats',
    name: 'Rapports achats',
    description: 'Consulter les rapports d\'achats',
    category: 'rapports',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'rapports-stocks',
    name: 'Rapports stocks',
    description: 'Consulter les rapports de stocks',
    category: 'rapports',
    requiredFor: ['sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'rapports-tresorerie',
    name: 'Rapports trésorerie',
    description: 'Consulter les rapports de trésorerie',
    category: 'rapports',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'rapports-comptabilite',
    name: 'Rapports comptabilité',
    description: 'Consulter les rapports comptables',
    category: 'rapports',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'basic'
  },
  {
    id: 'rapports-fiscalite',
    name: 'Rapports fiscalité',
    description: 'Consulter les rapports fiscaux',
    category: 'rapports',
    requiredFor: ['sarl', 'spa'],
    level: 'advanced'
  },
  {
    id: 'rapports-personnalises',
    name: 'Rapports personnalisés',
    description: 'Créer des rapports personnalisés',
    category: 'rapports',
    requiredFor: ['sarl', 'spa'],
    level: 'advanced'
  },

  // Consolidation et gestion d'entreprises
  {
    id: 'consolidation',
    name: 'Consolidation comptable',
    description: 'Effectuer des consolidations comptables',
    category: 'comptabilite',
    requiredFor: ['spa'],
    level: 'advanced'
  },
  {
    id: 'gestion-entreprise',
    name: 'Gestion des entreprises',
    description: 'Gérer plusieurs entités d\'entreprise',
    category: 'administration',
    requiredFor: ['spa'],
    level: 'advanced'
  },
  {
    id: 'template-document',
    name: 'Gestion des templates',
    description: 'Créer et gérer les templates de documents',
    category: 'comptabilite',
    requiredFor: ['sarl', 'spa'],
    level: 'intermediate'
  }
];
// RÔLES OFFICIELS (DESIGN HIERARCHIE & DROITS)
export const USER_ROLES: UserRole[] = [
  // 1. Gérant / Propriétaire (EURL)
  {
    id: 'gerant',
    name: 'Gérant (Propriétaire)',
    description: 'Accès complet trésorerie et facturation pour gestion quotidienne',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-charts', 'dashboard-calendar',
      'facturation-read', 'facturation-create', 'facturation-validate', 'facturation-cancel',
      'rapports-tresorerie', 'rapports-basic', 'rapports-ventes', 'rapports-achats',
      'clients-manage', 'fournisseurs-manage',
      'lia-access', 'lia-chatbot' // IA de base
    ],
    companyTypes: ['eurl'],
    accessLevels: ['starter', 'professional']
  },

  // 2. Commercial (SARL/SPA)
  {
    id: 'commercial',
    name: 'Commercial',
    description: 'Gestion clients, devis et commandes',
    permissions: [
      'dashboard-access', 'dashboard-overview',
      'clients-manage',
      'facturation-read', 'facturation-create', // Juste créer des devis/factures
      'stocks-read', // Voir les stocks dispo
      'rapports-basic', 'rapports-ventes', // Voir ses perfs
      'lia-access' // IA pour aide à la vente
    ],
    companyTypes: ['sarl', 'spa'],
    accessLevels: ['professional', 'enterprise']
  },

  // 3. Comptable (Toutes)
  {
    id: 'comptable',
    name: 'Comptable',
    description: 'Saisie comptable et fiscalité',
    permissions: [
      'dashboard-access', 'dashboard-overview',
      'comptabilite-read', 'comptabilite-write',
      'facturation-read', 'facturation-validate',
      'paie-read', 'paie-create',
      'rapports-comptabilite', 'rapports-fiscalite', 'rapports-basic',
      'lia-access', 'lia-analyses' // IA pour anomalies
    ],
    companyTypes: ['eurl', 'sarl', 'spa'],
    accessLevels: ['professional', 'enterprise']
  },

  // 4. Responsable Stock (SARL/SPA)
  {
    id: 'responsable_stock',
    name: 'Responsable Stock',
    description: 'Gestion des entrées/sorties et inventaires',
    permissions: [
      'dashboard-access',
      'stocks-read', 'stocks-move', 'stocks-inventory',
      'fournisseurs-manage',
      'rapports-stocks', 'rapports-achats'
    ],
    companyTypes: ['sarl', 'spa'],
    accessLevels: ['professional', 'enterprise']
  },

  // 5. DAF (SPA)
  {
    id: 'daf',
    name: 'D.A.F',
    description: 'Directeur Admin & Financier - Supervision globale',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-charts', 'dashboard-alerts',
      'comptabilite-read', 'comptabilite-validate', 'comptabilite-close',
      'rapports-tresorerie', 'rapports-advanced', 'rapports-create',
      'paie-read', 'paie-validate',
      'audit-read',
      'lia-access', 'lia-analyses', 'lia-train' // IA avancée
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 6. Auditeur (SPA)
  {
    id: 'auditeur',
    name: 'Auditeur Interne',
    description: 'Contrôle et conformité (Lecture Seule)',
    permissions: [
      'dashboard-access', 'dashboard-overview',
      'audit-read', 'audit-full',
      'comptabilite-read',
      'facturation-read',
      'stocks-read',
      'paie-read',
      'rapports-advanced', 'rapports-comptabilite',
      'lia-access', 'lia-analyses'
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 7. Admin IT (Toutes)
  {
    id: 'admin',
    name: 'Administrateur IT',
    description: 'Accès système complet (Configuration)',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id), // "God Mode"
    companyTypes: ['eurl', 'sarl', 'spa'],
    accessLevels: ['starter', 'professional', 'enterprise']
  }
];

// Gestionnaire de permissions
export class PermissionManager {
  static getUserPermissions(
    userRole: string,
    companyType: string,
    accessLevel: string
  ): string[] {
    const role = USER_ROLES.find(r => r.id === userRole);
    if (!role) return [];

    // ADAPTATION LOGIQUE METIER : L'Admin a toujours accès à tout
    if (userRole === 'admin') {
      return AVAILABLE_PERMISSIONS.map(p => p.id);
    }

    // Vérifier si le rôle est compatible avec le type d'entreprise
    if (!role.companyTypes.includes(companyType)) {
      return [];
    }

    // Vérifier si le rôle est compatible avec le niveau d'accès
    if (!role.accessLevels.includes(accessLevel)) {
      return [];
    }

    // Filtrer les permissions selon le type d'entreprise
    return role.permissions.filter(permissionId => {
      const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
      return permission && permission.requiredFor.includes(companyType);
    });
  }

  static canAccess(
    userRole: string,
    companyType: string,
    accessLevel: string,
    permission: string
  ): boolean {
    const userPermissions = this.getUserPermissions(userRole, companyType, accessLevel);
    return userPermissions.includes(permission);
  }

  static getAvailableRoles(
    companyType: string,
    accessLevel: string
  ): UserRole[] {
    return USER_ROLES.filter(role =>
      role.companyTypes.includes(companyType) &&
      role.accessLevels.includes(accessLevel)
    );
  }

  static getRoleInfo(roleId: string): UserRole | undefined {
    return USER_ROLES.find(role => role.id === roleId);
  }

  static getPermissionInfo(permissionId: string): UserPermission | undefined {
    return AVAILABLE_PERMISSIONS.find(permission => permission.id === permissionId);
  }

  static getPermissionsByCategory(category: string): UserPermission[] {
    return AVAILABLE_PERMISSIONS.filter(permission => permission.category === category);
  }

  static getRequiredPermissionsForCompanyType(companyType: string): string[] {
    const companyTypeInfo = COMPANY_TYPES.find(t => t.id === companyType);
    if (!companyTypeInfo) return [];

    return AVAILABLE_PERMISSIONS
      .filter(permission => permission.requiredFor.includes(companyType))
      .map(permission => permission.id);
  }

  static getRecommendedRoleForCompanyType(
    companyType: string,
    accessLevel: string,
    userCount: number
  ): string {
    const availableRoles = this.getAvailableRoles(companyType, accessLevel);

    if (companyType === 'eurl') {
      return userCount <= 2 ? 'comptable-junior' : 'comptable';
    }

    if (companyType === 'sarl') {
      if (userCount <= 5) return 'comptable';
      return 'comptable-senior';
    }

    if (companyType === 'spa') {
      if (userCount <= 10) return 'comptable-senior';
      return 'admin';
    }

    return 'utilisateur';
  }
}

