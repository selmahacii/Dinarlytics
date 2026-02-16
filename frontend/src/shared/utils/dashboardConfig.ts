/**
 * Configuration des tableaux de bord selon le rôle, la taille d'entreprise et les besoins
 */

import { User } from '@/types';
import { Country } from './fiscalDocuments';

export type UserRole = 
  | 'admin' 
  | 'comptable' 
  | 'comptable-senior' 
  | 'comptable-junior'
  | 'manager' 
  | 'directeur'
  | 'vendeur'
  | 'auditeur'
  | 'utilisateur';

export type CompanySegment = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

export interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
  icon: string;
  component?: string;
  requiredRole?: UserRole[];
  requiredSegment?: CompanySegment[];
  priority: number; // 1-10, plus élevé = plus important
  category: 'kpi' | 'chart' | 'table' | 'action' | 'alert' | 'summary';
}

export interface DashboardSection {
  id: string;
  title: string;
  description?: string;
  widgets: DashboardWidget[];
  requiredRole?: UserRole[];
  requiredSegment?: CompanySegment[];
  order: number;
}

export interface DashboardConfig {
  role: UserRole;
  segment: CompanySegment;
  companyType: string;
  widgets: DashboardWidget[];
  sections: DashboardSection[];
  quickActions: Array<{
    id: string;
    label: string;
    icon: string;
    path: string;
    requiredRole?: UserRole[];
  }>;
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    action?: string;
    requiredRole?: UserRole[];
  }>;
}

/**
 * Génère la configuration du tableau de bord selon le rôle et la taille
 */
export function generateDashboardConfig(
  user: User | null,
  segment: CompanySegment,
  companyType: string,
  country?: Country
): DashboardConfig {
  const role = (user?.role as UserRole) || 'utilisateur';
  
  // Widgets de base (tous les rôles)
  const baseWidgets: DashboardWidget[] = [
    {
      id: 'ca-overview',
      title: 'Chiffre d\'Affaires',
      description: 'Vue d\'ensemble du CA',
      icon: 'CurrencyDollarIcon',
      category: 'kpi',
      priority: 10
    },
    {
      id: 'tresorerie',
      title: 'Trésorerie',
      description: 'Solde disponible',
      icon: 'BanknotesIcon',
      category: 'kpi',
      priority: 9
    }
  ];

  // Configuration selon le rôle
  let config: DashboardConfig = {
    role,
    segment,
    companyType,
    widgets: [...baseWidgets],
    sections: [],
    quickActions: [],
    alerts: []
  };

  // Configuration par rôle
  switch (role) {
    case 'admin':
      config = getAdminDashboard(segment, companyType, country);
      break;
    case 'comptable':
    case 'comptable-senior':
      config = getComptableDashboard(segment, companyType, country);
      break;
    case 'comptable-junior':
      config = getComptableJuniorDashboard(segment, companyType, country);
      break;
    case 'manager':
    case 'directeur':
      config = getManagerDashboard(segment, companyType, country);
      break;
    case 'vendeur':
      config = getVendeurDashboard(segment, companyType, country);
      break;
    case 'auditeur':
      config = getAuditeurDashboard(segment, companyType, country);
      break;
    default:
      config = getUtilisateurDashboard(segment, companyType, country);
  }

  // Filtrage selon la taille de l'entreprise
  config.widgets = config.widgets.filter(w => 
    !w.requiredSegment || w.requiredSegment.includes(segment)
  );
  config.sections = config.sections.filter(s =>
    !s.requiredSegment || s.requiredSegment.includes(segment)
  );

  return config;
}

/**
 * Dashboard pour Administrateur
 */
function getAdminDashboard(
  segment: CompanySegment,
  companyType: string,
  country?: Country
): DashboardConfig {
  const declarationName = country === 'DZ' ? 'G50' : country === 'FR' ? 'CA3' : 'fiscale';
  
  return {
    role: 'admin',
    segment,
    companyType,
    widgets: [
      {
        id: 'ca-overview',
        title: 'Chiffre d\'Affaires Global',
        description: 'CA total de toutes les entités',
        icon: 'CurrencyDollarIcon',
        category: 'kpi',
        priority: 10
      },
      {
        id: 'users-overview',
        title: 'Utilisateurs Actifs',
        description: 'Nombre d\'utilisateurs connectés',
        icon: 'UserGroupIcon',
        category: 'kpi',
        priority: 9
      },
      {
        id: 'system-health',
        title: 'Santé du Système',
        description: 'Performance et disponibilité',
        icon: 'CheckCircleIcon',
        category: 'kpi',
        priority: 8
      },
      {
        id: 'security-alerts',
        title: 'Alertes Sécurité',
        description: 'Tentatives d\'accès et anomalies',
        icon: 'ShieldExclamationIcon',
        category: 'alert',
        priority: 9
      },
      {
        id: 'activity-log',
        title: 'Journal d\'Activité',
        description: 'Toutes les actions récentes',
        icon: 'ClockIcon',
        category: 'table',
        priority: 7
      },
      {
        id: 'revenue-trend',
        title: 'Évolution du CA',
        description: 'Tendance sur 12 mois',
        icon: 'ChartBarIcon',
        category: 'chart',
        priority: 8,
        requiredSegment: ['small', 'medium', 'large', 'enterprise']
      },
      {
        id: 'multi-company',
        title: 'Vue Multi-Entreprises',
        description: 'Consolidation des données',
        icon: 'BuildingOfficeIcon',
        category: 'summary',
        priority: 7,
        requiredSegment: ['large', 'enterprise']
      }
    ],
    sections: [
      {
        id: 'system-overview',
        title: 'Vue Système',
        description: 'État général de la plateforme',
        widgets: ['ca-overview', 'users-overview', 'system-health'],
        order: 1
      },
      {
        id: 'security',
        title: 'Sécurité & Conformité',
        description: 'Surveillance de la sécurité',
        widgets: ['security-alerts', 'activity-log'],
        order: 2
      },
      {
        id: 'analytics',
        title: 'Analyses Avancées',
        description: 'Analyses détaillées',
        widgets: ['revenue-trend', 'multi-company'],
        order: 3,
        requiredSegment: ['small', 'medium', 'large', 'enterprise']
      }
    ],
    quickActions: [
      { id: 'manage-users', label: 'Gérer Utilisateurs', icon: 'UserGroupIcon', path: '/gestion-utilisateurs' },
      { id: 'system-settings', label: 'Paramètres Système', icon: 'CogIcon', path: '/parametres' },
      { id: 'view-logs', label: 'Journaux Système', icon: 'DocumentTextIcon', path: '/logs' },
      { id: 'backup', label: 'Sauvegardes', icon: 'CloudArrowUpIcon', path: '/sauvegardes' }
    ],
    alerts: [
      {
        id: 'security-review',
        type: 'warning',
        title: 'Révision Sécurité',
        message: 'Vérifiez les permissions utilisateurs cette semaine'
      }
    ]
  };
}

/**
 * Dashboard pour Comptable Professionnel
 */
function getComptableDashboard(
  segment: CompanySegment,
  companyType: string,
  country?: Country
): DashboardConfig {
  const declarationName = country === 'DZ' ? 'G50' : country === 'FR' ? 'CA3' : 'fiscale';
  const planComptable = country === 'DZ' ? 'SCF' : 'IFRS/GAAP';
  
  return {
    role: 'comptable',
    segment,
    companyType,
    widgets: [
      {
        id: 'ca-overview',
        title: 'Chiffre d\'Affaires',
        description: 'CA du mois en cours',
        icon: 'CurrencyDollarIcon',
        category: 'kpi',
        priority: 10
      },
      {
        id: 'tresorerie',
        title: 'Trésorerie',
        description: 'Solde disponible',
        icon: 'BanknotesIcon',
        category: 'kpi',
        priority: 9
      },
      {
        id: 'ecritures-pending',
        title: 'Écritures en Attente',
        description: 'Écritures à valider',
        icon: 'DocumentCheckIcon',
        category: 'alert',
        priority: 8
      },
      {
        id: 'balance-comptable',
        title: 'Balance Comptable',
        description: 'Balance générale',
        icon: 'ScaleIcon',
        category: 'table',
        priority: 9
      },
      {
        id: 'tva-status',
        title: `Déclaration ${declarationName}`,
        description: `État de la déclaration ${declarationName}`,
        icon: 'DocumentTextIcon',
        category: 'alert',
        priority: 8
      },
      {
        id: 'compte-resultat',
        title: 'Compte de Résultat',
        description: 'Résultat de l\'exercice',
        icon: 'ChartBarIcon',
        category: 'chart',
        priority: 7
      },
      {
        id: 'rapprochements',
        title: 'Rapprochements Bancaires',
        description: 'Rapprochements à effectuer',
        icon: 'ArrowsRightLeftIcon',
        category: 'action',
        priority: 7,
        requiredSegment: ['small', 'medium', 'large', 'enterprise']
      },
      {
        id: 'cloture-status',
        title: 'État de Clôture',
        description: 'Avancement de la clôture',
        icon: 'CalendarIcon',
        category: 'summary',
        priority: 6,
        requiredSegment: ['medium', 'large', 'enterprise']
      }
    ],
    sections: [
      {
        id: 'kpi-comptable',
        title: 'Indicateurs Comptables',
        description: 'KPIs essentiels pour la gestion comptable',
        widgets: ['ca-overview', 'tresorerie', 'compte-resultat'],
        order: 1
      },
      {
        id: 'taches-comptables',
        title: 'Tâches Comptables',
        description: 'Actions à effectuer',
        widgets: ['ecritures-pending', 'rapprochements', 'cloture-status'],
        order: 2
      },
      {
        id: 'conformite',
        title: 'Conformité & Déclarations',
        description: `Conformité ${planComptable} et déclarations fiscales`,
        widgets: ['balance-comptable', 'tva-status'],
        order: 3
      }
    ],
    quickActions: [
      { id: 'saisie-ecritures', label: 'Saisir Écritures', icon: 'PencilIcon', path: '/gestion-comptable/ecritures' },
      { id: 'balance', label: 'Balance Générale', icon: 'ScaleIcon', path: '/gestion-comptable/balance' },
      { id: 'declarations', label: `Déclaration ${declarationName}`, icon: 'DocumentTextIcon', path: '/rapports/fiscalite-declarations' },
      { id: 'rapprochements', label: 'Rapprochements', icon: 'ArrowsRightLeftIcon', path: '/tresorerie/rapprochements' }
    ],
    alerts: [
      {
        id: 'declaration-due',
        type: 'warning',
        title: `Déclaration ${declarationName} à déposer`,
        message: `Échéance : 20 du mois suivant`,
        action: `Déposer ${declarationName}`
      },
      {
        id: 'ecritures-pending',
        type: 'info',
        title: 'Écritures en attente',
        message: '5 écritures nécessitent votre validation'
      }
    ]
  };
}

/**
 * Dashboard pour Comptable Junior
 */
function getComptableJuniorDashboard(
  segment: CompanySegment,
  companyType: string,
  country?: Country
): DashboardConfig {
  return {
    role: 'comptable-junior',
    segment,
    companyType,
    widgets: [
      {
        id: 'ca-overview',
        title: 'Chiffre d\'Affaires',
        description: 'CA du mois',
        icon: 'CurrencyDollarIcon',
        category: 'kpi',
        priority: 10
      },
      {
        id: 'tresorerie',
        title: 'Trésorerie',
        description: 'Solde disponible',
        icon: 'BanknotesIcon',
        category: 'kpi',
        priority: 9
      },
      {
        id: 'ecritures-simples',
        title: 'Écritures Simples',
        description: 'Écritures à saisir',
        icon: 'PencilIcon',
        category: 'action',
        priority: 8
      },
      {
        id: 'factures-pending',
        title: 'Factures en Attente',
        description: 'Factures à enregistrer',
        icon: 'DocumentTextIcon',
        category: 'alert',
        priority: 7
      }
    ],
    sections: [
      {
        id: 'kpi-basique',
        title: 'Indicateurs de Base',
        description: 'Vue simplifiée des KPIs',
        widgets: ['ca-overview', 'tresorerie'],
        order: 1
      },
      {
        id: 'taches-simples',
        title: 'Tâches Simples',
        description: 'Actions que vous pouvez effectuer',
        widgets: ['ecritures-simples', 'factures-pending'],
        order: 2
      }
    ],
    quickActions: [
      { id: 'saisie-simple', label: 'Saisie Simple', icon: 'PencilIcon', path: '/gestion-comptable/ecritures-simples' },
      { id: 'consulter', label: 'Consulter Données', icon: 'EyeIcon', path: '/gestion-comptable/consultation' }
    ],
    alerts: [
      {
        id: 'approval-needed',
        type: 'info',
        title: 'Validation requise',
        message: 'Certaines actions nécessitent l\'approbation d\'un supérieur'
      }
    ]
  };
}

/**
 * Dashboard pour Manager/Directeur
 */
function getManagerDashboard(
  segment: CompanySegment,
  companyType: string,
  country?: Country
): DashboardConfig {
  return {
    role: 'manager',
    segment,
    companyType,
    widgets: [
      {
        id: 'ca-overview',
        title: 'Chiffre d\'Affaires',
        description: 'CA mensuel',
        icon: 'CurrencyDollarIcon',
        category: 'kpi',
        priority: 10
      },
      {
        id: 'rentabilite',
        title: 'Rentabilité',
        description: 'Marge et résultat net',
        icon: 'ChartPieIcon',
        category: 'kpi',
        priority: 9
      },
      {
        id: 'tresorerie',
        title: 'Trésorerie',
        description: 'Solde disponible',
        icon: 'BanknotesIcon',
        category: 'kpi',
        priority: 9
      },
      {
        id: 'performance-trend',
        title: 'Tendance de Performance',
        description: 'Évolution sur 12 mois',
        icon: 'ArrowTrendingUpIcon',
        category: 'chart',
        priority: 8
      },
      {
        id: 'clients-top',
        title: 'Top Clients',
        description: 'Clients les plus importants',
        icon: 'UserGroupIcon',
        category: 'table',
        priority: 7
      },
      {
        id: 'alertes-strategiques',
        title: 'Alertes Stratégiques',
        description: 'Points d\'attention importants',
        icon: 'ExclamationTriangleIcon',
        category: 'alert',
        priority: 8
      },
      {
        id: 'ratios-financiers',
        title: 'Ratios Financiers',
        description: 'Indicateurs de santé financière',
        icon: 'CalculatorIcon',
        category: 'summary',
        priority: 7,
        requiredSegment: ['small', 'medium', 'large', 'enterprise']
      },
      {
        id: 'previsions',
        title: 'Prévisions',
        description: 'Projections financières',
        icon: 'ChartBarIcon',
        category: 'chart',
        priority: 6,
        requiredSegment: ['medium', 'large', 'enterprise']
      }
    ],
    sections: [
      {
        id: 'kpi-executif',
        title: 'Indicateurs Exécutifs',
        description: 'KPIs stratégiques pour la direction',
        widgets: ['ca-overview', 'rentabilite', 'tresorerie', 'performance-trend'],
        order: 1
      },
      {
        id: 'analyse-commerciale',
        title: 'Analyse Commerciale',
        description: 'Performance commerciale',
        widgets: ['clients-top', 'alertes-strategiques'],
        order: 2
      },
      {
        id: 'analyse-financiere',
        title: 'Analyse Financière',
        description: 'Analyse approfondie',
        widgets: ['ratios-financiers', 'previsions'],
        order: 3,
        requiredSegment: ['small', 'medium', 'large', 'enterprise']
      }
    ],
    quickActions: [
      { id: 'rapports', label: 'Rapports Détaillés', icon: 'DocumentTextIcon', path: '/rapports-analytics' },
      { id: 'previsions', label: 'Prévisions', icon: 'ChartBarIcon', path: '/rapports/previsions' },
      { id: 'clients', label: 'Analyse Clients', icon: 'UserGroupIcon', path: '/clients' },
      { id: 'tresorerie', label: 'Trésorerie', icon: 'BanknotesIcon', path: '/tresorerie' }
    ],
    alerts: [
      {
        id: 'performance-alert',
        type: 'warning',
        title: 'Performance à surveiller',
        message: 'Certains indicateurs nécessitent votre attention'
      }
    ]
  };
}

/**
 * Dashboard pour Vendeur
 */
function getVendeurDashboard(
  segment: CompanySegment,
  companyType: string,
  country?: Country
): DashboardConfig {
  return {
    role: 'vendeur',
    segment,
    companyType,
    widgets: [
      {
        id: 'ventes-mois',
        title: 'Ventes du Mois',
        description: 'Mes ventes personnelles',
        icon: 'ShoppingCartIcon',
        category: 'kpi',
        priority: 10
      },
      {
        id: 'objectif',
        title: 'Objectif',
        description: 'Progression vers l\'objectif',
        icon: 'TargetIcon',
        category: 'kpi',
        priority: 9
      },
      {
        id: 'clients-mes',
        title: 'Mes Clients',
        description: 'Clients assignés',
        icon: 'UserGroupIcon',
        category: 'table',
        priority: 8
      },
      {
        id: 'devis-pending',
        title: 'Devis en Attente',
        description: 'Devis à suivre',
        icon: 'DocumentTextIcon',
        category: 'alert',
        priority: 7
      },
      {
        id: 'performance-vendeur',
        title: 'Ma Performance',
        description: 'Évolution de mes ventes',
        icon: 'ChartBarIcon',
        category: 'chart',
        priority: 7
      }
    ],
    sections: [
      {
        id: 'mes-ventes',
        title: 'Mes Ventes',
        description: 'Performance personnelle',
        widgets: ['ventes-mois', 'objectif', 'performance-vendeur'],
        order: 1
      },
      {
        id: 'mes-clients',
        title: 'Mes Clients',
        description: 'Gestion de ma clientèle',
        widgets: ['clients-mes', 'devis-pending'],
        order: 2
      }
    ],
    quickActions: [
      { id: 'creer-devis', label: 'Créer Devis', icon: 'PlusIcon', path: '/factures/nouveau-devis' },
      { id: 'mes-clients', label: 'Mes Clients', icon: 'UserGroupIcon', path: '/clients' },
      { id: 'mes-ventes', label: 'Mes Ventes', icon: 'ShoppingCartIcon', path: '/rapports/mes-ventes' }
    ],
    alerts: [
      {
        id: 'objectif-alert',
        type: 'info',
        title: 'Objectif mensuel',
        message: 'Vous êtes à X% de votre objectif'
      }
    ]
  };
}

/**
 * Dashboard pour Auditeur
 */
function getAuditeurDashboard(
  segment: CompanySegment,
  companyType: string,
  country?: Country
): DashboardConfig {
  return {
    role: 'auditeur',
    segment,
    companyType,
    widgets: [
      {
        id: 'audit-overview',
        title: 'Vue d\'Audit',
        description: 'État général de l\'audit',
        icon: 'ShieldCheckIcon',
        category: 'kpi',
        priority: 10
      },
      {
        id: 'anomalies',
        title: 'Anomalies Détectées',
        description: 'Points d\'attention',
        icon: 'ExclamationTriangleIcon',
        category: 'alert',
        priority: 9
      },
      {
        id: 'traces',
        title: 'Traces d\'Audit',
        description: 'Journal des modifications',
        icon: 'ClockIcon',
        category: 'table',
        priority: 8
      },
      {
        id: 'conformite',
        title: 'Conformité',
        description: 'Niveau de conformité',
        icon: 'CheckCircleIcon',
        category: 'summary',
        priority: 7
      }
    ],
    sections: [
      {
        id: 'audit-main',
        title: 'Audit Principal',
        description: 'Vue d\'ensemble de l\'audit',
        widgets: ['audit-overview', 'conformite'],
        order: 1
      },
      {
        id: 'anomalies-section',
        title: 'Anomalies & Traces',
        description: 'Points à examiner',
        widgets: ['anomalies', 'traces'],
        order: 2
      }
    ],
    quickActions: [
      { id: 'rapport-audit', label: 'Rapport d\'Audit', icon: 'DocumentTextIcon', path: '/audit/rapport' },
      { id: 'traces', label: 'Traces', icon: 'ClockIcon', path: '/audit/traces' }
    ],
    alerts: [
      {
        id: 'audit-mode',
        type: 'info',
        title: 'Mode Audit',
        message: 'Vous êtes en mode lecture seule - aucune modification possible'
      }
    ]
  };
}

/**
 * Dashboard pour Utilisateur Standard
 */
function getUtilisateurDashboard(
  segment: CompanySegment,
  companyType: string,
  country?: Country
): DashboardConfig {
  return {
    role: 'utilisateur',
    segment,
    companyType,
    widgets: [
      {
        id: 'ca-overview',
        title: 'Chiffre d\'Affaires',
        description: 'CA du mois',
        icon: 'CurrencyDollarIcon',
        category: 'kpi',
        priority: 10
      },
      {
        id: 'tresorerie',
        title: 'Trésorerie',
        description: 'Solde disponible',
        icon: 'BanknotesIcon',
        category: 'kpi',
        priority: 9
      }
    ],
    sections: [
      {
        id: 'kpi-basique',
        title: 'Indicateurs',
        description: 'Vue d\'ensemble',
        widgets: ['ca-overview', 'tresorerie'],
        order: 1
      }
    ],
    quickActions: [
      { id: 'consulter', label: 'Consulter', icon: 'EyeIcon', path: '/dashboard' }
    ],
    alerts: []
  };
}



