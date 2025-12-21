/**
 * Utilitaires pour les taux fiscaux selon la devise et le plan comptable
 */

export type Devise = 'DZD' | 'EUR' | 'USD';
export type PlanComptable = 'algerien' | 'international';

export interface FiscalRates {
  tvaNormal: number;      // Taux TVA normal
  tvaReduit: number;       // Taux TVA réduit
  tvaIntermediaire?: number; // Taux TVA intermédiaire (si applicable)
  ibs?: number;           // Impôt sur les bénéfices (Algérie)
  isr?: number;           // Impôt sur le revenu
  corporateTax?: number;  // Corporate Tax (IFRS/GAAP)
  autresTaxes?: Record<string, number>; // Autres taxes spécifiques
  planComptable?: PlanComptable; // Plan comptable associé
}

/**
 * Taux fiscaux par devise et plan comptable
 * PCA (Plan Comptable Algérien) vs IFRS/GAAP
 */
export const FISCAL_RATES_BY_DEVISE_AND_PLAN: Record<Devise, Record<PlanComptable, FiscalRates>> = {
  DZD: {
    algerien: {
      tvaNormal: 0.19,      // 19% en Algérie (PCA)
      tvaReduit: 0.09,      // 9% taux réduit
      ibs: 0.19,            // 19% IBS pour bénéfices < 3M DZD
      isr: 0.20,            // 20% ISR
      autresTaxes: {
        'Taxe professionnelle': 0.01,  // 1% taxe professionnelle
        'Patente': 0.005                // 0.5% patente
      },
      planComptable: 'algerien'
    },
    international: {
      tvaNormal: 0.19,      // 19% (même taux mais normes IFRS)
      tvaReduit: 0.09,      // 9% taux réduit
      corporateTax: 0.19,   // 19% Corporate Tax (IFRS)
      isr: 0.20,            // 20% ISR
      autresTaxes: {
        'Withholding Tax': 0.15,  // 15% WHT sur dividendes
        'Capital Gains Tax': 0.20  // 20% sur plus-values
      },
      planComptable: 'international'
    }
  },
  EUR: {
    algerien: {
      tvaNormal: 0.20,      // 20% (si entreprise algérienne avec EUR)
      tvaReduit: 0.10,      // 10% taux réduit
      ibs: 0.19,            // 19% IBS
      isr: 0.30,            // 30% IR
      planComptable: 'algerien'
    },
    international: {
      tvaNormal: 0.20,      // 20% en France (standard européen)
      tvaReduit: 0.10,      // 10% taux réduit
      tvaIntermediaire: 0.055, // 5.5% taux intermédiaire
      corporateTax: 0.25,   // 25% Corporate Tax (France)
      isr: 0.30,            // 30% IR
      autresTaxes: {
        'CVAE': 0.015,       // 1.5% Contribution sur la valeur ajoutée
        'CFE': 0.002        // 0.2% Cotisation foncière
      },
      planComptable: 'international'
    }
  },
  USD: {
    algerien: {
      tvaNormal: 0.19,      // 19% (si entreprise algérienne avec USD)
      tvaReduit: 0.09,      // 9% taux réduit
      ibs: 0.19,            // 19% IBS
      isr: 0.20,            // 20% ISR
      planComptable: 'algerien'
    },
    international: {
      tvaNormal: 0.10,       // 10% (exemple pour USA - pas de TVA fédérale, mais taxes locales)
      tvaReduit: 0.05,      // 5% taux réduit
      corporateTax: 0.21,    // 21% Corporate Tax (USA)
      isr: 0.25,            // 25% Income Tax
      autresTaxes: {
        'State Tax': 0.05,   // 5% State Tax (exemple)
        'Local Tax': 0.02    // 2% Local Tax
      },
      planComptable: 'international'
    }
  }
};

/**
 * Taux fiscaux par devise (rétrocompatibilité)
 */
export const FISCAL_RATES_BY_DEVISE: Record<Devise, FiscalRates> = {
  DZD: FISCAL_RATES_BY_DEVISE_AND_PLAN.DZD.algerien,
  EUR: FISCAL_RATES_BY_DEVISE_AND_PLAN.EUR.international,
  USD: FISCAL_RATES_BY_DEVISE_AND_PLAN.USD.international
};

/**
 * Obtenir les taux fiscaux pour une devise et un plan comptable donnés
 */
export const getFiscalRates = (
  devise: Devise, 
  planComptable: PlanComptable = 'algerien'
): FiscalRates => {
  const rates = FISCAL_RATES_BY_DEVISE_AND_PLAN[devise]?.[planComptable];
  return rates || FISCAL_RATES_BY_DEVISE_AND_PLAN.DZD.algerien;
};

/**
 * Calculer la TVA selon le taux, la devise et le plan comptable
 */
export const calculateTVA = (
  montantHT: number,
  devise: Devise,
  taux: 'normal' | 'reduit' | 'intermediaire' = 'normal',
  planComptable: PlanComptable = 'algerien'
): number => {
  const rates = getFiscalRates(devise, planComptable);
  let tauxTVA: number;
  
  switch (taux) {
    case 'reduit':
      tauxTVA = rates.tvaReduit;
      break;
    case 'intermediaire':
      tauxTVA = rates.tvaIntermediaire || rates.tvaReduit;
      break;
    case 'normal':
    default:
      tauxTVA = rates.tvaNormal;
      break;
  }
  
  return montantHT * tauxTVA;
};

/**
 * Calculer le montant TTC à partir du HT
 */
export const calculateTTC = (
  montantHT: number,
  devise: Devise,
  taux: 'normal' | 'reduit' | 'intermediaire' = 'normal',
  planComptable: PlanComptable = 'algerien'
): number => {
  const tva = calculateTVA(montantHT, devise, taux, planComptable);
  return montantHT + tva;
};

/**
 * Calculer le montant HT à partir du TTC
 */
export const calculateHT = (
  montantTTC: number,
  devise: Devise,
  taux: 'normal' | 'reduit' | 'intermediaire' = 'normal',
  planComptable: PlanComptable = 'algerien'
): number => {
  const rates = getFiscalRates(devise, planComptable);
  let tauxTVA: number;
  
  switch (taux) {
    case 'reduit':
      tauxTVA = rates.tvaReduit;
      break;
    case 'intermediaire':
      tauxTVA = rates.tvaIntermediaire || rates.tvaReduit;
      break;
    case 'normal':
    default:
      tauxTVA = rates.tvaNormal;
      break;
  }
  
  return montantTTC / (1 + tauxTVA);
};

/**
 * Obtenir le taux TVA en pourcentage pour affichage
 */
export const getTVARatePercent = (
  devise: Devise,
  taux: 'normal' | 'reduit' | 'intermediaire' = 'normal',
  planComptable: PlanComptable = 'algerien'
): number => {
  const rates = getFiscalRates(devise, planComptable);
  
  switch (taux) {
    case 'reduit':
      return rates.tvaReduit * 100;
    case 'intermediaire':
      return (rates.tvaIntermediaire || rates.tvaReduit) * 100;
    case 'normal':
    default:
      return rates.tvaNormal * 100;
  }
};

/**
 * Formater le taux TVA pour affichage
 */
export const formatTVARate = (
  devise: Devise,
  taux: 'normal' | 'reduit' | 'intermediaire' = 'normal',
  planComptable: PlanComptable = 'algerien'
): string => {
  return `${getTVARatePercent(devise, taux, planComptable).toFixed(0)}%`;
};

