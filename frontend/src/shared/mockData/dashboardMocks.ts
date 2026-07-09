// Mock data removed — use real API endpoints

export interface AlerteFinanciere {
  id: string;
  nom: string;
  description: string;
  statut: 'triggered' | 'monitoring' | 'inactive' | 'Déclenchée' | 'Surveillance' | 'Inactive';
  seuil: number;
  valeurActuelle: number;
  unite: string;
  frequence: 'quotidienne' | 'hebdomadaire' | 'temps_reel';
  derniereAlerte: string | null;
  destinataires: string[];
  active: boolean;
}

export const ALERTES_FINANCIERES_MOCK: AlerteFinanciere[] = [];
export const INDICATEURS_FINANCIERS_MOCK = {
  tresorerie: { soldeActuel: 0, soldeItineraire: 0, entrees30j: 0, sorties30j: 0, fluxNetMensuel: 0 },
  ventesmois: [],
  rentabilite: { margeNette: 0, margeCommerciale: 0, taux_rotation_stock: 0, taux_debit_client: 0 },
  ratios: { liquidite: 0, autonomieFinanciere: 0, endettement: 0, solvabilite: 0 }
};
export const RATIOS_FINANCIERS_MOCK = INDICATEURS_FINANCIERS_MOCK.ratios;
export const DEPENSES_PAR_CATEGORIE_MOCK = { labels: [], data: [] };
export const PERFORMANCE_STATS_MOCK = { tauxRecouvrement: 0, delaiMoyenReponse: 0, alertesCeMois: 0, satisfactionClient: 0 };
export const SCENARIOS_MOCK: any[] = [];
export const PRODUITS_SERVICES_MOCK: any[] = [];
export const HISTORIQUE_ALERTES_MOCK: any[] = [];
