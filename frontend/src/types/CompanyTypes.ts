// Types d'entreprises et leurs caractéristiques
export interface CompanyType {
  id: string;
  name: string;
  fullName: string;
  description: string;
  minCapital: number;
  maxCapital?: number;
  maxEmployees: number;
  legalForm: string;
  features: string[];
  requiredModules: string[];
  optionalModules: string[];
  color: string;
  icon: string;
  complexity: 'simple' | 'medium' | 'complex';
  recommendedRevenueRange?: {
    min: number;
    max: number | null;
  };
}

export interface AccessLevel {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  maxCompanies: number;
  features: string[];
  modules: string[];
  price: number;
  currency: string;
  billing: 'monthly' | 'yearly';
}

export interface CompanySize {
  id: string;
  name: string;
  description: string;
  employeeRange: string;
  revenueRange: string;
  features: string[];
  recommendedType: string[];
}

// Types d'entreprises algériennes
export const COMPANY_TYPES: CompanyType[] = [
  {
    id: 'eurl',
    name: 'EURL',
    fullName: 'Entreprise Unipersonnelle à Responsabilité Limitée',
    description: 'Entreprise individuelle avec responsabilité limitée au capital',
    minCapital: 100000, // 100,000 DA
    maxCapital: 1000000, // 1,000,000 DA
    maxEmployees: 5,
    legalForm: 'Personne physique',
    recommendedRevenueRange: {
      min: 0,
      max: 50000000 // 50M DA
    },
    features: [
      'Gestion simplifiée',
      'Comptabilité de base',
      'Facturation simple',
      'Déclarations fiscales essentielles',
      'Gestion de trésorerie basique'
    ],
    requiredModules: [
      'comptabilite-basique',
      'facturation-simple',
      'declarations-fiscales',
      'tresorerie-basique'
    ],
    optionalModules: [
      'inventaire-simple',
      'rapports-basiques'
    ],
    color: 'green',
    icon: '🏪',
    complexity: 'simple'
  },
  {
    id: 'sarl',
    name: 'SARL',
    fullName: 'Société à Responsabilité Limitée',
    description: 'Société commerciale avec associés et responsabilité limitée',
    minCapital: 100000, // 100,000 DA
    maxEmployees: 50,
    legalForm: 'Personne morale',
    recommendedRevenueRange: {
      min: 50000000, // 50M DA
      max: 500000000 // 500M DA
    },
    features: [
      'Gestion multi-associés',
      'Comptabilité complète',
      'Facturation avancée',
      'Gestion des stocks',
      'Déclarations fiscales complètes',
      'Gestion de la paie',
      'Rapports de gestion'
    ],
    requiredModules: [
      'comptabilite-complete',
      'facturation-avancee',
      'gestion-stocks',
      'declarations-fiscales',
      'gestion-paie',
      'rapports-gestion'
    ],
    optionalModules: [
      'analytics-avancees',
      'gestion-projets',
      'crm-basique'
    ],
    color: 'blue',
    icon: '🏢',
    complexity: 'medium'
  },
  {
    id: 'spa',
    name: 'SPA',
    fullName: 'Société par Actions',
    description: 'Société de grande envergure avec actions et conseil d\'administration',
    minCapital: 5000000, // 5,000,000 DA
    maxEmployees: 500,
    legalForm: 'Personne morale',
    recommendedRevenueRange: {
      min: 500000000, // 500M DA
      max: null // Illimité
    },
    features: [
      'Gestion multi-entreprises',
      'Comptabilité analytique',
      'Consolidation comptable',
      'Gestion des investissements',
      'Audit interne',
      'Gestion des risques',
      'Rapports financiers avancés',
      'Gestion des filiales'
    ],
    requiredModules: [
      'comptabilite-analytique',
      'consolidation-comptable',
      'gestion-multi-entreprises',
      'audit-interne',
      'gestion-risques',
      'rapports-financiers',
      'gestion-investissements'
    ],
    optionalModules: [
      'crm-avance',
      'gestion-projets-avancee',
      'business-intelligence',
      'integration-erp'
    ],
    color: 'purple',
    icon: '🏭',
    complexity: 'complex'
  }
];

// Niveaux d'accès selon la taille
export const ACCESS_LEVELS: AccessLevel[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Pour EURL et micro-entreprises',
    maxUsers: 2,
    maxCompanies: 1,
    features: [
      'Comptabilité de base',
      'Facturation simple',
      'Déclarations fiscales',
      'Support email'
    ],
    modules: [
      'comptabilite-basique',
      'facturation-simple',
      'declarations-fiscales'
    ],
    price: 5000, // 5,000 DA
    currency: 'DZD',
    billing: 'monthly'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Pour SARL et PME',
    maxUsers: 10,
    maxCompanies: 3,
    features: [
      'Comptabilité complète',
      'Gestion des stocks',
      'Gestion de la paie',
      'Rapports avancés',
      'Support prioritaire'
    ],
    modules: [
      'comptabilite-complete',
      'gestion-stocks',
      'gestion-paie',
      'rapports-gestion',
      'analytics-basiques'
    ],
    price: 15000, // 15,000 DA
    currency: 'DZD',
    billing: 'monthly'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Pour SPA et grandes entreprises',
    maxUsers: 100,
    maxCompanies: 10,
    features: [
      'Toutes les fonctionnalités',
      'Multi-entreprises',
      'Consolidation comptable',
      'Audit et conformité',
      'Support dédié',
      'Formation personnalisée'
    ],
    modules: [
      'comptabilite-analytique',
      'consolidation-comptable',
      'gestion-multi-entreprises',
      'audit-interne',
      'business-intelligence',
      'integration-erp'
    ],
    price: 50000, // 50,000 DA
    currency: 'DZD',
    billing: 'monthly'
  }
];

// Tailles d'entreprises
export const COMPANY_SIZES: CompanySize[] = [
  {
    id: 'micro',
    name: 'Micro-entreprise',
    description: 'Très petite entreprise',
    employeeRange: '1-5 employés',
    revenueRange: '0 - 5M DA',
    features: [
      'Gestion simplifiée',
      'Comptabilité de base',
      'Facturation simple'
    ],
    recommendedType: ['eurl']
  },
  {
    id: 'small',
    name: 'Petite entreprise',
    description: 'PME en croissance',
    employeeRange: '6-20 employés',
    revenueRange: '5M - 50M DA',
    features: [
      'Gestion structurée',
      'Comptabilité complète',
      'Gestion des stocks',
      'Rapports de gestion'
    ],
    recommendedType: ['eurl', 'sarl']
  },
  {
    id: 'medium',
    name: 'Moyenne entreprise',
    description: 'Entreprise établie',
    employeeRange: '21-100 employés',
    revenueRange: '50M - 500M DA',
    features: [
      'Gestion avancée',
      'Multi-départements',
      'Gestion de la paie',
      'Analytics avancées'
    ],
    recommendedType: ['sarl']
  },
  {
    id: 'large',
    name: 'Grande entreprise',
    description: 'Groupe ou holding',
    employeeRange: '100+ employés',
    revenueRange: '500M+ DA',
    features: [
      'Gestion multi-entreprises',
      'Consolidation comptable',
      'Audit et conformité',
      'Business Intelligence'
    ],
    recommendedType: ['spa']
  }
];

// Modules disponibles
export const AVAILABLE_MODULES = {
  'comptabilite-basique': {
    name: 'Comptabilité de Base',
    description: 'Saisie comptable simplifiée',
    requiredFor: ['eurl'],
    features: ['Plan comptable PCA 2010', 'Saisie des écritures', 'Balance comptable']
  },
  'comptabilite-complete': {
    name: 'Comptabilité Complète',
    description: 'Comptabilité générale complète',
    requiredFor: ['sarl'],
    features: ['Plan comptable complet', 'Analytique', 'Rapprochements bancaires']
  },
  'comptabilite-analytique': {
    name: 'Comptabilité Analytique',
    description: 'Comptabilité analytique avancée',
    requiredFor: ['spa'],
    features: ['Centres de coûts', 'Marges par produit', 'Rentabilité par activité']
  },
  'facturation-simple': {
    name: 'Facturation Simple',
    description: 'Facturation basique',
    requiredFor: ['eurl'],
    features: ['Création factures', 'Relances clients', 'Échéanciers']
  },
  'facturation-avancee': {
    name: 'Facturation Avancée',
    description: 'Facturation complète',
    requiredFor: ['sarl'],
    features: ['Devis', 'Factures', 'Avoirs', 'Règlements', 'Relances automatiques']
  },
  'gestion-stocks': {
    name: 'Gestion des Stocks',
    description: 'Gestion complète des stocks',
    requiredFor: ['sarl'],
    features: ['Inventaire', 'Mouvements', 'Alertes stock', 'Valuation']
  },
  'gestion-paie': {
    name: 'Gestion de la Paie',
    description: 'Paie et déclarations sociales',
    requiredFor: ['sarl'],
    features: ['Bulletins de paie', 'Déclarations CNAS', 'Déclarations fiscales']
  },
  'consolidation-comptable': {
    name: 'Consolidation Comptable',
    description: 'Consolidation multi-entreprises',
    requiredFor: ['spa'],
    features: ['Consolidation automatique', 'Éliminations', 'Rapports consolidés']
  },
  'audit-interne': {
    name: 'Audit Interne',
    description: 'Outils d\'audit et de contrôle',
    requiredFor: ['spa'],
    features: ['Traçabilité', 'Contrôles automatiques', 'Rapports d\'audit']
  }
};

