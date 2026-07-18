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
    requiredFor: ['eurl', 'sarl', 'spa'],
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
    requiredFor: ['eurl', 'sarl', 'spa'],
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
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'facturation-cancel',
    name: 'Annuler les factures',
    description: 'Annuler ou corriger les factures',
    category: 'facturation',
    requiredFor: ['eurl', 'sarl', 'spa'],
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
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'advanced'
  },
  {
    id: 'admin-settings',
    name: 'Paramètres système',
    description: 'Modifier les paramètres du système',
    category: 'administration',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'advanced'
  },
  {
    id: 'admin-backup',
    name: 'Sauvegardes',
    description: 'Gérer les sauvegardes',
    category: 'administration',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'advanced'
  },

  // Audit
  {
    id: 'audit-read',
    name: 'Audit en lecture',
    description: 'Consulter les logs d\'audit',
    category: 'audit',
    requiredFor: ['eurl', 'sarl', 'spa'],
    level: 'intermediate'
  },
  {
    id: 'audit-full',
    name: 'Audit complet',
    description: 'Accès complet aux fonctions d\'audit',
    category: 'audit',
    requiredFor: ['eurl', 'sarl', 'spa'],
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
    requiredFor: ['eurl', 'sarl', 'spa'],
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
    requiredFor: ['eurl', 'sarl', 'spa'],
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
    id: 'fiscalite-declarations',
    name: 'Déclarations fiscales',
    description: 'Gérer et valider les déclarations G50, IBS, TAP',
    category: 'fiscalite',
    requiredFor: ['eurl', 'sarl', 'spa'],
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
      'dashboard-access', 'dashboard-overview', 'dashboard-charts', 'dashboard-calendar', 'dashboard-alerts',
      // Aligné sur backend/app/core/permissions.py ROLE_PERMISSIONS['gerant']
      // (accès complet) — le gérant EST la hiérarchie de son EURL/SARL ;
      // il lui manquait comptabilite-write/validate/close ici, ce qui
      // masquait le bouton "Nouveau compte" du plan comptable alors que
      // le backend acceptait la requête.
      'comptabilite-read', 'comptabilite-write', 'comptabilite-validate', 'comptabilite-close',
      'facturation-read', 'facturation-create', 'facturation-validate', 'facturation-cancel',
      'rapports-tresorerie', 'rapports-basic', 'rapports-advanced', 'rapports-ventes', 'rapports-achats', 'export-data',
      'clients-manage', 'fournisseurs-manage', 'articles-manage',
      'audit-read', 'admin-users',
      'lia-access', 'lia-chatbot', 'lia-analyses', 'fiscalite-declarations'
    ],
    companyTypes: ['eurl', 'sarl'],
    accessLevels: ['starter', 'professional']
  },

  // 2. Directeur Général / CEO (SPA)
  {
    id: 'dg',
    name: 'Directeur Général',
    description: 'Pilotage stratégique, KPIs globaux, validation budgets (Accès Complet en Démo)',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    companyTypes: ['spa', 'sarl', 'eurl'],
    accessLevels: ['starter', 'professional', 'enterprise']
  },

  // 3. DAF (SPA)
  {
    id: 'daf',
    name: 'Directeur Administratif & Financier',
    description: 'Contrôle financier, trésorerie, consolidation et fiscalité',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-charts', 'dashboard-alerts',
      'comptabilite-read', 'comptabilite-write', 'comptabilite-validate', 'comptabilite-close', 'consolidation',
      'facturation-read', 'facturation-validate', 'facturation-cancel',
      'rapports-tresorerie', 'rapports-advanced', 'rapports-create', 'rapports-comptabilite', 'rapports-fiscalite', 'fiscalite-declarations',
      'paie-read', 'paie-validate',
      'audit-read',
      'lia-access', 'lia-analyses', 'lia-train'
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 4. Directeur Commercial (SPA)
  {
    id: 'commercial_director',
    name: 'Directeur Commercial',
    description: 'Stratégie de vente, gestion des équipes et comptes clés',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-charts',
      'clients-manage', 'facturation-read', 'facturation-create', 'facturation-validate',
      'stocks-read',
      'rapports-ventes', 'rapports-basic', 'rapports-advanced', 'rapports-create', 'export-data',
      'lia-access', 'lia-chatbot', 'lia-analyses'
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 5. Commercial / Vendeur (SARL/SPA)
  {
    id: 'commercial',
    name: 'Commercial',
    description: 'Gestion clients, devis et commandes terrain',
    permissions: [
      'dashboard-access', 'dashboard-overview',
      'clients-manage',
      'facturation-read', 'facturation-create',
      'stocks-read',
      'rapports-basic', 'rapports-ventes',
      'lia-access'
    ],
    companyTypes: ['sarl', 'spa'],
    accessLevels: ['professional', 'enterprise']
  },

  // 6. DRH (SPA)
  {
    id: 'hr_director',
    name: 'Directeur Ressources Humaines',
    description: 'Gestion du personnel, paie et conformité sociale',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-alerts',
      'paie-read', 'paie-create', 'paie-validate',
      'admin-users',
      'rapports-basic', 'rapports-advanced', 'export-data',
      'lia-access', 'lia-chatbot'
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 7. Directeur Logistique (SPA)
  {
    id: 'logistics_director',
    name: 'Directeur Logistique',
    description: 'Gestion de la supply chain et des entrepôts multi-sites',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-alerts',
      'stocks-read', 'stocks-move', 'stocks-inventory',
      'fournisseurs-manage', 'articles-manage',
      'rapports-stocks', 'rapports-achats', 'rapports-basic', 'rapports-advanced', 'export-data',
      'lia-access'
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 8. Directeur Production (SPA)
  {
    id: 'production_director',
    name: 'Directeur Production',
    description: 'Pilotage des usines, coûts de revient et qualité',
    permissions: [
      'dashboard-access', 'dashboard-overview',
      'stocks-read', 'stocks-move',
      'rapports-stocks', 'rapports-basic',
      'lia-access'
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 9. Chef Comptable (SPA)
  {
    id: 'comptable_senior',
    name: 'Chef Comptable',
    description: 'Supervision de la comptabilité générale et tiers',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-alerts',
      'comptabilite-read', 'comptabilite-write', 'comptabilite-validate', 'comptabilite-close',
      'facturation-read', 'facturation-create', 'facturation-validate', 'facturation-cancel',
      'paie-read', 'paie-create',
      'stocks-read', 'stocks-move', 'stocks-inventory',
      'rapports-comptabilite', 'rapports-fiscalite', 'fiscalite-declarations', 'rapports-basic', 'rapports-advanced', 'rapports-create', 'export-data',
      'audit-read', 'audit-full',
      'lia-access', 'lia-chatbot', 'lia-analyses', 'lia-train'
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 10. Comptable (SARL/SPA)
  {
    id: 'comptable',
    name: 'Comptable',
    description: 'Saisie comptable, pointage et déclarations',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-alerts',
      'comptabilite-read', 'comptabilite-write',
      'facturation-read', 'facturation-validate',
      'paie-read',
      'rapports-comptabilite', 'fiscalite-declarations', 'rapports-basic',
      'lia-access', 'stocks-read'
    ],
    companyTypes: ['eurl', 'sarl', 'spa'],
    accessLevels: ['professional', 'enterprise']
  },

  // 11. Contrôleur de Gestion (SPA)
  {
    id: 'controleur_gestion',
    name: 'Contrôleur de Gestion',
    description: 'Analyse des coûts, budgets et reporting de performance',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-charts',
      'comptabilite-read',
      'rapports-advanced', 'rapports-create', 'rapports-ventes', 'rapports-achats',
      'lia-access', 'lia-analyses'
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 12. Magasinier (SARL/SPA)
  {
    id: 'magasinier',
    name: 'Magasinier',
    description: 'Réception, expédition et mouvements de stock physiques',
    permissions: [
      'dashboard-access',
      'stocks-read', 'stocks-move',
      'rapports-stocks'
    ],
    companyTypes: ['sarl', 'spa'],
    accessLevels: ['professional', 'enterprise']
  },

  // 13. Auditeur (SPA)
  {
    id: 'auditeur',
    name: 'Auditeur Interne',
    description: 'Contrôle et conformité (Lecture Seule globale)',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-alerts',
      'audit-read', 'audit-full',
      'comptabilite-read', 'facturation-read', 'stocks-read', 'paie-read',
      'rapports-basic', 'rapports-advanced', 'rapports-comptabilite', 'export-data',
      'lia-access', 'lia-analyses'
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 14. Trésorier (SPA)
  {
    id: 'tresorier',
    name: 'Trésorier',
    description: 'Gestion des flux financiers et relations bancaires',
    permissions: [
      'dashboard-access', 'dashboard-overview', 'dashboard-alerts',
      'comptabilite-read', 'comptabilite-write', 'facturation-read',
      'rapports-tresorerie', 'rapports-basic', 'rapports-advanced', 'export-data',
      'lia-access'
    ],
    companyTypes: ['spa'],
    accessLevels: ['enterprise']
  },

  // 15. Admin IT (Toutes)
  {
    id: 'admin',
    name: 'Administrateur IT',
    description: 'Accès système complet (Configuration)',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
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

