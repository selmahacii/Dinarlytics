// Segments de Chiffre d'Affaires selon normes algériennes
export interface RevenueSegment {
  id: string;
  name: string;
  displayName: string;
  minRevenue: number;
  maxRevenue: number | null;
  description: string;
  fiscalCategory: string;
  requiredModules: string[];
  recommendedAccessLevel: string[];
  recommendedCompanyTypes: string[];
  features: string[];
  color: string;
  icon: string;
  taxBenefits?: string[];
  obligations: string[];
  alerts: string[];
}

// Seuils de CA selon la réglementation algérienne
export const REVENUE_SEGMENTS: RevenueSegment[] = [
  {
    id: 'micro',
    name: 'Micro-entreprise',
    displayName: 'Micro-entreprise',
    minRevenue: 0,
    maxRevenue: 5000000, // 5M DA
    description: 'Très petite entreprise avec CA inférieur à 5M DA',
    fiscalCategory: 'Régime simplifié',
    requiredModules: [
      'comptabilite-basique',
      'facturation-simple',
      'declarations-fiscales-simples'
    ],
    recommendedAccessLevel: ['starter'],
    recommendedCompanyTypes: ['eurl'],
    features: [
      'Comptabilité simplifiée',
      'Facturation de base',
      'Déclarations fiscales essentielles',
      'Gestion de trésorerie basique'
    ],
    color: 'green',
    icon: '🏪',
    taxBenefits: [
      'TVA simplifiée possible',
      'Déclarations trimestrielles',
      'Moins de contrôles fiscaux'
    ],
    obligations: [
      'Déclaration G50 annuelle',
      'Série G mensuelle/trimestrielle',
      'Tenue livre journal'
    ],
    alerts: [
      'Attention : Proche du seuil 5M DA',
      'Considérer passage au régime réel'
    ]
  },
  {
    id: 'small',
    name: 'Petite entreprise',
    displayName: 'Petite Entreprise (PME)',
    minRevenue: 5000001,
    maxRevenue: 50000000, // 50M DA
    description: 'PME en croissance avec CA entre 5M et 50M DA',
    fiscalCategory: 'Régime réel simplifié',
    requiredModules: [
      'comptabilite-complete',
      'facturation-avancee',
      'gestion-stocks',
      'rapports-basiques',
      'tresorerie-avancee'
    ],
    recommendedAccessLevel: ['starter', 'professional'],
    recommendedCompanyTypes: ['eurl', 'sarl'],
    features: [
      'Comptabilité complète',
      'Gestion des stocks',
      'Facturation avancée',
      'Rapports de gestion',
      'Suivi clients/fournisseurs',
      'Analytics basiques'
    ],
    color: 'blue',
    icon: '🏢',
    taxBenefits: [
      'Déductions fiscales standards',
      'Amortissements comptables'
    ],
    obligations: [
      'Bilan et TCR annuels',
      'Déclarations mensuelles G50',
      'Série G mensuelle',
      'Tenue comptabilité complète',
      'Commissaire aux comptes (optionnel)'
    ],
    alerts: [
      'Proche du seuil 50M DA',
      'Prévoir audit comptable',
      'Envisager passage SARL si EURL'
    ]
  },
  {
    id: 'medium',
    name: 'Moyenne entreprise',
    displayName: 'Moyenne Entreprise',
    minRevenue: 50000001,
    maxRevenue: 500000000, // 500M DA
    description: 'Entreprise établie avec CA entre 50M et 500M DA',
    fiscalCategory: 'Régime réel normal',
    requiredModules: [
      'comptabilite-analytique',
      'gestion-stocks-avancee',
      'gestion-paie',
      'consolidation-basique',
      'rapports-avances',
      'analytics-avancees',
      'audit-basique'
    ],
    recommendedAccessLevel: ['professional'],
    recommendedCompanyTypes: ['sarl'],
    features: [
      'Comptabilité analytique',
      'Gestion multi-départements',
      'Gestion de la paie complète',
      'Consolidation inter-sociétés',
      'Business Intelligence basique',
      'Tableaux de bord avancés',
      'Gestion budgétaire',
      'Contrôle de gestion'
    ],
    color: 'purple',
    icon: '🏭',
    taxBenefits: [
      'Optimisation fiscale possible',
      'Crédit d\'impôt recherche',
      'Déductions investissements'
    ],
    obligations: [
      'Bilan certifié obligatoire',
      'Commissaire aux comptes obligatoire',
      'Audit annuel',
      'Déclarations mensuelles complètes',
      'États financiers consolidés',
      'Rapport de gestion annuel'
    ],
    alerts: [
      'Seuil 500M DA critique',
      'Obligations SPA si dépassement',
      'Audit fiscal recommandé',
      'Renforcement contrôle interne'
    ]
  },
  {
    id: 'large',
    name: 'Grande entreprise',
    displayName: 'Grande Entreprise',
    minRevenue: 500000001,
    maxRevenue: 2000000000, // 2Mds DA
    description: 'Grande entreprise avec CA entre 500M et 2Mds DA',
    fiscalCategory: 'Régime réel normal - Grande entreprise',
    requiredModules: [
      'comptabilite-analytique-complete',
      'consolidation-avancee',
      'gestion-multi-entreprises',
      'audit-complet',
      'business-intelligence',
      'gestion-risques',
      'tresorerie-groupe'
    ],
    recommendedAccessLevel: ['professional', 'enterprise'],
    recommendedCompanyTypes: ['sarl', 'spa'],
    features: [
      'Gestion multi-sociétés',
      'Consolidation comptable complète',
      'Audit interne et externe',
      'Gestion des risques',
      'Business Intelligence avancée',
      'Reporting consolidé',
      'Contrôle de gestion groupe',
      'Planification stratégique'
    ],
    color: 'indigo',
    icon: '🏛️',
    taxBenefits: [
      'Optimisation fiscale groupe',
      'Conventions fiscales internationales',
      'Consolidation fiscale'
    ],
    obligations: [
      'États financiers consolidés certifiés',
      'Commissaire aux comptes obligatoire',
      'Audit annuel complet',
      'Rapport de gestion détaillé',
      'Comité d\'audit',
      'Publication des comptes',
      'Contrôles fiscaux réguliers'
    ],
    alerts: [
      'Passage obligatoire en SPA recommandé',
      'Conformité renforcée requise',
      'Gouvernance d\'entreprise exigée'
    ]
  },
  {
    id: 'enterprise',
    name: 'Très grande entreprise',
    displayName: 'Très Grande Entreprise / Groupe',
    minRevenue: 2000000001,
    maxRevenue: null, // Illimité
    description: 'Groupe ou holding avec CA supérieur à 2Mds DA',
    fiscalCategory: 'Régime réel normal - Groupe',
    requiredModules: [
      'gestion-groupe-complet',
      'consolidation-internationale',
      'audit-groupe',
      'business-intelligence-enterprise',
      'gestion-filiales',
      'reporting-reglementaire',
      'conformite-internationale'
    ],
    recommendedAccessLevel: ['enterprise'],
    recommendedCompanyTypes: ['spa'],
    features: [
      'Gestion de groupe multi-pays',
      'Consolidation internationale',
      'Audit groupe complet',
      'BI et analytics enterprise',
      'Gestion des filiales',
      'Reporting réglementaire complet',
      'Conformité internationale',
      'Risk management enterprise',
      'Treasury management groupe'
    ],
    color: 'red',
    icon: '🌐',
    taxBenefits: [
      'Optimisation fiscale groupe internationale',
      'Prix de transfert',
      'Consolidation fiscale groupe'
    ],
    obligations: [
      'Consolidation groupe IFRS/PCN',
      'Commissaires aux comptes multiples',
      'Audits internes permanents',
      'Comités spécialisés (audit, risques)',
      'Publication légale des comptes',
      'Reporting sectoriel',
      'Conformité réglementaire multi-juridictions'
    ],
    alerts: [
      'Structure SPA obligatoire',
      'Gouvernance d\'entreprise stricte',
      'Compliance internationale requise'
    ]
  }
];

// Fonction pour déterminer le segment selon le CA
export function getRevenueSegment(revenue: number): RevenueSegment {
  return REVENUE_SEGMENTS.find(
    segment => revenue >= segment.minRevenue && 
               (segment.maxRevenue === null || revenue <= segment.maxRevenue)
  ) || REVENUE_SEGMENTS[0];
}

// Fonction pour calculer la position dans le segment (0-100%)
export function getSegmentProgress(revenue: number): number {
  const segment = getRevenueSegment(revenue);
  if (segment.maxRevenue === null) return 100;
  
  const range = segment.maxRevenue - segment.minRevenue;
  const position = revenue - segment.minRevenue;
  return Math.min(Math.round((position / range) * 100), 100);
}

// Fonction pour obtenir le prochain segment
export function getNextSegment(revenue: number): RevenueSegment | null {
  const currentSegment = getRevenueSegment(revenue);
  const currentIndex = REVENUE_SEGMENTS.findIndex(s => s.id === currentSegment.id);
  return currentIndex < REVENUE_SEGMENTS.length - 1 ? REVENUE_SEGMENTS[currentIndex + 1] : null;
}

// Fonction pour calculer la distance au prochain seuil
export function getDistanceToNextThreshold(revenue: number): number | null {
  const segment = getRevenueSegment(revenue);
  if (segment.maxRevenue === null) return null;
  return segment.maxRevenue - revenue;
}

// Données de démo pour entreprises avec différents CA
export const DEMO_COMPANIES_BY_REVENUE = [
  {
    id: 'demo-1',
    name: 'Boutique El Baraka',
    type: 'eurl',
    revenue: 3500000, // 3.5M DA - Micro
    employees: 2,
    segment: 'micro',
    description: 'Petite boutique familiale',
    status: 'active',
    growth: 15
  },
  {
    id: 'demo-2',
    name: 'Café Restaurant Tassili',
    type: 'eurl',
    revenue: 8500000, // 8.5M DA - Petite
    employees: 8,
    segment: 'small',
    description: 'Restaurant en pleine croissance',
    status: 'active',
    growth: 25
  },
  {
    id: 'demo-3',
    name: 'Import-Export Méditerranée SARL',
    type: 'sarl',
    revenue: 75000000, // 75M DA - Moyenne
    employees: 35,
    segment: 'medium',
    description: 'Import-export en expansion',
    status: 'active',
    growth: 18
  },
  {
    id: 'demo-4',
    name: 'Industrie Pharmaceutique Aurès SARL',
    type: 'sarl',
    revenue: 650000000, // 650M DA - Grande
    employees: 120,
    segment: 'large',
    description: 'Laboratoire pharmaceutique majeur',
    status: 'active',
    growth: 12
  },
  {
    id: 'demo-5',
    name: 'Groupe Industriel Sonatrach Services SPA',
    type: 'spa',
    revenue: 3500000000, // 3.5Mds DA - Très grande
    employees: 450,
    segment: 'enterprise',
    description: 'Groupe multi-filiales',
    status: 'active',
    growth: 8
  }
];

