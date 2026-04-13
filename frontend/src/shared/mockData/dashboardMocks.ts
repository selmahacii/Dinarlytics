// Mock data centralisée pour le dashboard financier
// À remplacer par des vraies données de l'API

export interface AlerteFinanciere {
  id: string;
  nom: string;
  description: string;
  statut: 'Déclenchée' | 'Surveillance' | 'Inactive';
  seuil: number;
  valeurActuelle: number;
  unite: string;
  frequence: 'quotidienne' | 'hebdomadaire' | 'temps_reel';
  derniereAlerte: string | null;
  destinataires: string[];
  active: boolean;
}

export const ALERTES_FINANCIERES_MOCK: AlerteFinanciere[] = [
  {
    id: 'ventes',
    nom: 'Seuil de Ventes',
    description: 'Alerte si les ventes mensuelles dépassent 2M DZD',
    statut: 'Déclenchée',
    seuil: 2000000,
    valeurActuelle: 2450000,
    unite: 'DZD',
    frequence: 'quotidienne',
    derniereAlerte: '2024-01-15 14:30',
    destinataires: ['admin@entreprise.dz', 'comptable@entreprise.dz'],
    active: true
  },
  {
    id: 'liquidite',
    nom: 'Ratio de Liquidité',
    description: 'Alerte si le ratio de liquidité descend sous 1.5',
    statut: 'Surveillance',
    seuil: 1.5,
    valeurActuelle: 1.8,
    unite: '',
    frequence: 'hebdomadaire',
    derniereAlerte: null,
    destinataires: ['admin@entreprise.dz'],
    active: true
  },
  {
    id: 'stock',
    nom: 'Rupture de Stock',
    description: 'Alerte si un article atteint le seuil de réapprovisionnement',
    statut: 'Déclenchée',
    seuil: 10,
    valeurActuelle: 5,
    unite: 'unités',
    frequence: 'temps_reel',
    derniereAlerte: '2024-01-15 09:15',
    destinataires: ['stock@entreprise.dz', 'achats@entreprise.dz'],
    active: true
  },
  {
    id: 'factures',
    nom: 'Factures en Retard',
    description: 'Alerte si des factures clients sont en retard de plus de 30 jours',
    statut: 'Déclenchée',
    seuil: 30,
    valeurActuelle: 45,
    unite: 'jours',
    frequence: 'quotidienne',
    derniereAlerte: '2024-01-15 08:00',
    destinataires: ['comptable@entreprise.dz', 'commercial@entreprise.dz'],
    active: true
  }
];

export const INDICATEURS_FINANCIERS_MOCK = {
  tresorerie: {
    soldeActuel: 15750000,
    soldeItineraire: 12500000,
    entrees30j: 5000000,
    sorties30j: 3200000,
    fluxNetMensuel: 1800000
  },
  ventesmois: [
    { mois: 'Jan', valeur: 2100000 },
    { mois: 'Fév', valeur: 2350000 },
    { mois: 'Mar', valeur: 1950000 },
    { mois: 'Avr', valeur: 2550000 },
    { mois: 'Mai', valeur: 2200000 },
    { mois: 'Jun', valeur: 2450000 },
    { mois: 'Jul', valeur: 2600000 },
    { mois: 'Aoû', valeur: 2300000 },
    { mois: 'Sep', valeur: 2800000 },
    { mois: 'Oct', valeur: 2450000 },
    { mois: 'Nov', valeur: 2700000 },
    { mois: 'Déc', valeur: 3100000 }
  ],
  rentabilite: {
    margeNette: 18.5,
    margeCommerciale: 35.2,
    taux_rotation_stock: 12.5,
    taux_debit_client: 65.3
  },
  ratios: {
    liquidite: 1.8,
    autonomieFinanciere: 0.65,
    endettement: 0.35,
    solvabilite: 2.1
  }
};

export const DEPENSES_PAR_CATEGORIE_MOCK = {
  labels: ['Achats', 'Salaires', 'Loyer', 'Utilities', 'Marketing'],
  data: [3500000, 5200000, 800000, 450000, 600000]
};

export const PERFORMANCE_STATS_MOCK = {
  tauxRecouvrement: 85,
  delaiMoyenReponse: 2.3,
  alertesCeMois: 12,
  satisfactionClient: 98
};

export const SCENARIOS_MOCK = [
  {
    id: 1,
    nom: 'Scénario Pessimiste',
    ca_mois6: 12000000,
    profit_mois6: 1800000,
    tresorerie_mois6: 8000000,
    risque: 'HAUTE'
  },
  {
    id: 2,
    nom: 'Scénario Réaliste',
    ca_mois6: 15000000,
    profit_mois6: 2700000,
    tresorerie_mois6: 12000000,
    risque: 'MOYEN'
  },
  {
    id: 3,
    nom: 'Scénario Optimiste',
    ca_mois6: 18000000,
    profit_mois6: 3600000,
    tresorerie_mois6: 16000000,
    risque: 'FAIBLE'
  }
];

export const PRODUITS_SERVICES_MOCK = [
  { nom: 'Produit A', ventes: 2500000, marge: 35 },
  { nom: 'Produit B', ventes: 1800000, marge: 28 },
  { nom: 'Service C', ventes: 1200000, marge: 42 },
  { nom: 'Maintenance', ventes: 900000, marge: 55 }
];

export const HISTORIQUE_ALERTES_MOCK = [
  {
    id: 1,
    type: 'Alerte Trésorerie',
    message: 'Solde critique détecté',
    date: '2024-01-15 14:30',
    statut: 'Résolue'
  },
  {
    id: 2,
    type: 'Alerte Ventes',
    message: 'Dépassement de seuil',
    date: '2024-01-15 10:15',
    statut: 'En cours'
  }
];
