/**
 * Utilitaires pour la génération automatique des déclarations fiscales algériennes
 * G50, IBS, IRG, TAP, etc.
 */

export interface DeclarationG50 {
  id: string;
  numero: string;
  periode: string; // Format: "2025-01"
  dateGeneration: string;
  dateEcheance: string;
  statut: 'brouillon' | 'generee' | 'validee' | 'transmise' | 'acquittee';

  // Données de base
  chiffreAffairesHT: number;
  chiffreAffairesTTC: number;
  baseTaxable: number;

  // TVA
  tvaCollectee: number;
  tvaDeductible: number;
  tvaAVerser: number;
  tvaCreditee: number; // Crédit reporté

  // TAP (Taxe sur l'Activité Professionnelle)
  tapBase: number;
  tapTaux: number;
  tapMontant: number;

  // IRG (Impôt sur le Revenu Global)
  irgSalaires: number;
  irgHonoraires: number;

  // IBS (Impôt sur les Bénéfices des Sociétés)
  ibsAcompte?: number;

  // Détails par taux
  ventesTauxNormal: {
    baseHT: number;
    tva: number;
  };
  ventesTauxReduit: {
    baseHT: number;
    tva: number;
  };

  // Achats
  achatsHT: number;
  achatsTTC: number;
  tvaAchatsDeductible: number;

  // Autres informations
  nombreFactures: number;
  nombreClients: number;
  observations?: string;
  dateTransmission?: string;
  numeroQuittance?: string;
  dateVersement?: string;
  montantVerse?: number;
}

export interface DeclarationG29 {
  id: string;
  numero: string;
  exercice: string; // Année: "2025"
  dateGeneration: string;
  dateEcheance: string;
  statut: 'brouillon' | 'generee' | 'validee' | 'transmise' | 'acquittee';

  // État des honoraires, commissions, courtages, etc.
  totalHonoraires: number;
  totalCommissions: number;
  totalCourtages: number;
  totalRistournes: number;
  totalLoyers: number;

  // Retenues à la source (15% en général pour les non-résidents ou certains honoraires)
  totalRetenues: number;

  // Bénéficiaires
  nombreBeneficiaires: number;
  beneficiaires: Array<{
    nom: string;
    nif: string;
    adresse: string;
    nature: string;
    montantBrut: number;
    retenue: number;
    montantNet: number;
  }>;

  observations?: string;
}

export interface DeclarationIBS {
  id: string;
  numero: string;
  exercice: string; // Année: "2025"
  periode: string; // Trimestre: "T1", "T2", "T3", "T4" ou "Annuel"
  dateGeneration: string;
  dateEcheance: string;
  statut: 'brouillon' | 'generee' | 'validee' | 'transmise' | 'acquittee';

  // Résultat fiscal
  chiffreAffaires: number;
  chargesDeductibles: number;
  beneficeBrut: number;
  amortissements: number;
  provisions: number;
  beneficeImposable: number;

  // Calcul IBS
  tauxIBS: number; // 19% ou 26% selon bénéfice
  ibsCalcule: number;
  ibsPaye: number;
  ibsAVerser: number;
  ibsCreditee: number; // Crédit reporté

  // Détails
  nombreSalaries: number;
  masseSalariale: number;
  investissements: number;
  observations?: string;
  dateTransmission?: string;
  numeroQuittance?: string;
  dateVersement?: string;
  montantVerse?: number;
}

export interface DeclarationIRG {
  id: string;
  numero: string;
  exercice: string;
  dateGeneration: string;
  dateEcheance: string;
  statut: 'brouillon' | 'generee' | 'validee' | 'transmise' | 'acquittee';

  // Revenus imposables
  revenusBruts: number;
  abattements: number;
  revenusImposables: number;

  // Calcul IRG selon barème progressif
  irgCalcule: number;
  irgPaye: number;
  irgAVerser: number;

  // Détails par tranche
  tranches: Array<{
    tranche: string;
    base: number;
    taux: number;
    montant: number;
  }>;

  observations?: string;
  dateTransmission?: string;
  numeroQuittance?: string;
  dateVersement?: string;
  montantVerse?: number;
}

export interface DeclarationTAP {
  id: string;
  numero: string;
  exercice: string;
  dateGeneration: string;
  dateEcheance: string;
  statut: 'brouillon' | 'generee' | 'validee' | 'transmise' | 'acquittee';

  // Base de calcul
  chiffreAffairesHT: number;
  tauxTAP: number; // 2% en général
  tapCalcule: number;
  tapPaye: number;
  tapAVerser: number;

  observations?: string;
  dateTransmission?: string;
  numeroQuittance?: string;
  dateVersement?: string;
  montantVerse?: number;
}

export interface CalendrierFiscal {
  id: string;
  type: 'g50' | 'ibs' | 'irg' | 'tap' | 'cnas' | 'cnss';
  libelle: string;
  frequence: 'mensuel' | 'trimestriel' | 'annuel';
  dateEcheance: string;
  joursAvantEcheance: number;
  statut: 'a_venir' | 'proche' | 'en_cours' | 'en_retard' | 'acquitte';
  priorite: 'critique' | 'haute' | 'moyenne' | 'basse';
  montantEstime?: number;
  lienDeclaration?: string;
}

/**
 * Génère automatiquement une déclaration G50
 */
export const genererDeclarationG50 = (
  periode: string,
  donnees: {
    chiffreAffairesHT: number;
    tvaCollectee: number;
    tvaDeductible: number;
    achatsHT?: number;
    nombreFactures?: number;
    nombreClients?: number;
  }
): DeclarationG50 => {
  const [annee, mois] = periode.split('-');
  const dateEcheance = new Date(parseInt(annee), parseInt(mois), 20); // 20 du mois suivant

  const tvaAVerser = donnees.tvaCollectee - donnees.tvaDeductible;
  const chiffreAffairesTTC = donnees.chiffreAffairesHT + donnees.tvaCollectee;

  return {
    id: `g50-${periode}`,
    numero: `G50-${periode}`,
    periode,
    dateGeneration: new Date().toISOString().split('T')[0],
    dateEcheance: dateEcheance.toISOString().split('T')[0],
    statut: 'generee',
    chiffreAffairesHT: donnees.chiffreAffairesHT,
    chiffreAffairesTTC,
    baseTaxable: donnees.chiffreAffairesHT,
    tvaCollectee: donnees.tvaCollectee,
    tvaDeductible: donnees.tvaDeductible,
    tvaAVerser: tvaAVerser > 0 ? tvaAVerser : 0,
    tvaCreditee: tvaAVerser < 0 ? Math.abs(tvaAVerser) : 0,
    tapBase: donnees.chiffreAffairesHT,
    tapTaux: 1, // 1% par défaut selon Loi de Finances récente (Algérie)
    tapMontant: Math.round(donnees.chiffreAffairesHT * 0.01),
    irgSalaires: (donnees.chiffreAffairesHT > 0) ? Math.round(donnees.chiffreAffairesHT * 0.05) : 0, // Mock
    irgHonoraires: 0,
    ibsAcompte: 0,
    ventesTauxNormal: {
      baseHT: donnees.chiffreAffairesHT * 0.9, // Estimation
      tva: donnees.tvaCollectee * 0.9
    },
    ventesTauxReduit: {
      baseHT: donnees.chiffreAffairesHT * 0.1,
      tva: donnees.tvaCollectee * 0.1
    },
    achatsHT: donnees.achatsHT || 0,
    achatsTTC: (donnees.achatsHT || 0) * 1.19,
    tvaAchatsDeductible: donnees.tvaDeductible,
    nombreFactures: donnees.nombreFactures || 0,
    nombreClients: donnees.nombreClients || 0
  };
};

/**
 * Génère automatiquement une déclaration G29
 */
export const genererDeclarationG29 = (
  exercice: string,
  donnees: {
    beneficiaires: Array<{
      nom: string;
      nif: string;
      adresse: string;
      nature: string;
      montantBrut: number;
    }>;
  }
): DeclarationG29 => {
  const dateEcheance = new Date(parseInt(exercice) + 1, 3, 30); // 30 avril

  const totalHonoraires = donnees.beneficiaires
    .filter(b => b.nature.toLowerCase().includes('honoraire'))
    .reduce((s, b) => s + b.montantBrut, 0);

  const totalCommissions = donnees.beneficiaires
    .filter(b => b.nature.toLowerCase().includes('commission'))
    .reduce((s, b) => s + b.montantBrut, 0);

  const beneficiaires = donnees.beneficiaires.map(b => {
    // Retenue à la source (RAS) : 15% pour honoraires par défaut ou 0 si résident avec NAF
    const retenue = b.montantBrut * 0.15;
    return {
      ...b,
      retenue,
      montantNet: b.montantBrut - retenue
    };
  });

  const totalRetenues = beneficiaires.reduce((s, b) => s + b.retenue, 0);

  return {
    id: `g29-${exercice}`,
    numero: `G29-${exercice}`,
    exercice,
    dateGeneration: new Date().toISOString().split('T')[0],
    dateEcheance: dateEcheance.toISOString().split('T')[0],
    statut: 'generee',
    totalHonoraires,
    totalCommissions,
    totalCourtages: 0,
    totalRistournes: 0,
    totalLoyers: 0,
    totalRetenues,
    nombreBeneficiaires: beneficiaires.length,
    beneficiaires
  };
};

/**
 * Génère automatiquement une déclaration IBS
 */
export const genererDeclarationIBS = (
  exercice: string,
  periode: string,
  donnees: {
    chiffreAffaires: number;
    chargesDeductibles: number;
    amortissements?: number;
    provisions?: number;
    nombreSalaries?: number;
    masseSalariale?: number;
  }
): DeclarationIBS => {
  const beneficeBrut = donnees.chiffreAffaires - donnees.chargesDeductibles;
  const amortissements = donnees.amortissements || 0;
  const provisions = donnees.provisions || 0;
  const beneficeImposable = beneficeBrut - amortissements - provisions;

  // Taux IBS : 19% si bénéfice < 3M DZD, sinon 26%
  const tauxIBS = beneficeImposable < 3000000 ? 0.19 : 0.26;
  const ibsCalcule = beneficeImposable * tauxIBS;

  // Date d'échéance selon la période
  let dateEcheance: Date;
  if (periode === 'Annuel') {
    dateEcheance = new Date(parseInt(exercice) + 1, 2, 31); // 31 mars année suivante
  } else {
    const trimestre = parseInt(periode.replace('T', ''));
    const moisEcheance = trimestre * 3 + 1; // Mois suivant le trimestre
    dateEcheance = new Date(parseInt(exercice), moisEcheance, 30);
  }

  return {
    id: `ibs-${exercice}-${periode}`,
    numero: `IBS-${exercice}-${periode}`,
    exercice,
    periode,
    dateGeneration: new Date().toISOString().split('T')[0],
    dateEcheance: dateEcheance.toISOString().split('T')[0],
    statut: 'generee',
    chiffreAffaires: donnees.chiffreAffaires,
    chargesDeductibles: donnees.chargesDeductibles,
    beneficeBrut,
    amortissements,
    provisions,
    beneficeImposable,
    tauxIBS: tauxIBS * 100,
    ibsCalcule,
    ibsPaye: 0,
    ibsAVerser: ibsCalcule,
    ibsCreditee: 0,
    nombreSalaries: donnees.nombreSalaries || 0,
    masseSalariale: donnees.masseSalariale || 0,
    investissements: 0
  };
};

/**
 * Génère automatiquement une déclaration IRG
 */
export const genererDeclarationIRG = (
  exercice: string,
  donnees: {
    revenusBruts: number;
    abattements?: number;
  }
): DeclarationIRG => {
  const abattements = donnees.abattements || 0;
  const revenusImposables = donnees.revenusBruts - abattements;

  // Barème IRG progressif algérien
  const barèmeIRG = [
    { tranche: '0-30,000', min: 0, max: 30000, taux: 0 },
    { tranche: '30,001-120,000', min: 30001, max: 120000, taux: 0.20 },
    { tranche: '120,001-240,000', min: 120001, max: 240000, taux: 0.30 },
    { tranche: '240,001+', min: 240001, max: Infinity, taux: 0.35 }
  ];

  let irgCalcule = 0;
  let reste = revenusImposables;
  const tranches: Array<{ tranche: string; base: number; taux: number; montant: number }> = [];

  for (let i = barèmeIRG.length - 1; i >= 0; i--) {
    const tranche = barèmeIRG[i];
    if (reste > tranche.min) {
      const imposable = Math.min(reste, tranche.max) - tranche.min;
      const montant = imposable * tranche.taux;
      irgCalcule += montant;
      tranches.push({
        tranche: tranche.tranche,
        base: imposable,
        taux: tranche.taux * 100,
        montant
      });
      reste = tranche.min;
    }
  }

  const dateEcheance = new Date(parseInt(exercice) + 1, 2, 31); // 31 mars année suivante

  return {
    id: `irg-${exercice}`,
    numero: `IRG-${exercice}`,
    exercice,
    dateGeneration: new Date().toISOString().split('T')[0],
    dateEcheance: dateEcheance.toISOString().split('T')[0],
    statut: 'generee',
    revenusBruts: donnees.revenusBruts,
    abattements,
    revenusImposables,
    irgCalcule: Math.round(irgCalcule),
    irgPaye: 0,
    irgAVerser: Math.round(irgCalcule),
    tranches: tranches.reverse()
  };
};

/**
 * Génère automatiquement une déclaration TAP
 */
export const genererDeclarationTAP = (
  exercice: string,
  donnees: {
    chiffreAffairesHT: number;
    tauxTAP?: number;
  }
): DeclarationTAP => {
  const tauxTAP = donnees.tauxTAP || 0.02; // 2% par défaut
  const tapCalcule = donnees.chiffreAffairesHT * tauxTAP;

  const dateEcheance = new Date(parseInt(exercice) + 1, 2, 31); // 31 mars année suivante

  return {
    id: `tap-${exercice}`,
    numero: `TAP-${exercice}`,
    exercice,
    dateGeneration: new Date().toISOString().split('T')[0],
    dateEcheance: dateEcheance.toISOString().split('T')[0],
    statut: 'generee',
    chiffreAffairesHT: donnees.chiffreAffairesHT,
    tauxTAP: tauxTAP * 100,
    tapCalcule: Math.round(tapCalcule),
    tapPaye: 0,
    tapAVerser: Math.round(tapCalcule)
  };
};

/**
 * Génère le calendrier fiscal pour une année
 */
export const genererCalendrierFiscal = (annee: string): CalendrierFiscal[] => {
  const calendrier: CalendrierFiscal[] = [];
  const maintenant = new Date();

  // G50 - Mensuel (échéance le 20 de chaque mois)
  for (let mois = 1; mois <= 12; mois++) {
    const dateEcheance = new Date(parseInt(annee), mois, 20);
    const joursAvant = Math.ceil((dateEcheance.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24));

    calendrier.push({
      id: `g50-${annee}-${mois}`,
      type: 'g50',
      libelle: `Déclaration G50 - ${new Date(parseInt(annee), mois - 1).toLocaleDateString('fr-FR', { month: 'long' })}`,
      frequence: 'mensuel',
      dateEcheance: dateEcheance.toISOString().split('T')[0],
      joursAvantEcheance: joursAvant,
      statut: joursAvant < 0 ? 'en_retard' : joursAvant <= 5 ? 'proche' : 'a_venir',
      priorite: joursAvant <= 5 ? 'critique' : joursAvant <= 10 ? 'haute' : 'moyenne'
    });
  }

  // IBS - Trimestriel (échéance le 30 du mois suivant chaque trimestre)
  for (let trimestre = 1; trimestre <= 4; trimestre++) {
    const moisEcheance = trimestre * 3 + 1;
    const dateEcheance = new Date(parseInt(annee), moisEcheance, 30);
    const joursAvant = Math.ceil((dateEcheance.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24));

    calendrier.push({
      id: `ibs-${annee}-T${trimestre}`,
      type: 'ibs',
      libelle: `Déclaration IBS - Trimestre ${trimestre}`,
      frequence: 'trimestriel',
      dateEcheance: dateEcheance.toISOString().split('T')[0],
      joursAvantEcheance: joursAvant,
      statut: joursAvant < 0 ? 'en_retard' : joursAvant <= 10 ? 'proche' : 'a_venir',
      priorite: joursAvant <= 10 ? 'haute' : 'moyenne'
    });
  }

  // IRG - Annuel (échéance 31 mars année suivante)
  const dateEcheanceIRG = new Date(parseInt(annee) + 1, 2, 31);
  const joursAvantIRG = Math.ceil((dateEcheanceIRG.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24));

  calendrier.push({
    id: `irg-${annee}`,
    type: 'irg',
    libelle: `Déclaration IRG - Exercice ${annee}`,
    frequence: 'annuel',
    dateEcheance: dateEcheanceIRG.toISOString().split('T')[0],
    joursAvantEcheance: joursAvantIRG,
    statut: joursAvantIRG < 0 ? 'en_retard' : joursAvantIRG <= 30 ? 'proche' : 'a_venir',
    priorite: joursAvantIRG <= 30 ? 'haute' : 'moyenne'
  });

  // TAP - Annuel (échéance 31 mars année suivante)
  const dateEcheanceTAP = new Date(parseInt(annee) + 1, 2, 31);
  const joursAvantTAP = Math.ceil((dateEcheanceTAP.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24));

  calendrier.push({
    id: `tap-${annee}`,
    type: 'tap',
    libelle: `Déclaration TAP - Exercice ${annee}`,
    frequence: 'annuel',
    dateEcheance: dateEcheanceTAP.toISOString().split('T')[0],
    joursAvantEcheance: joursAvantTAP,
    statut: joursAvantTAP < 0 ? 'en_retard' : joursAvantTAP <= 30 ? 'proche' : 'a_venir',
    priorite: joursAvantTAP <= 30 ? 'haute' : 'moyenne'
  });

  return calendrier.sort((a, b) => {
    return new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime();
  });
};

/**
 * Calcule les dates d'échéance selon le type de déclaration
 */
export const getDateEcheance = (
  type: 'g50' | 'ibs' | 'irg' | 'tap',
  periode: string
): string => {
  const maintenant = new Date();

  switch (type) {
    case 'g50': {
      // G50 : 20 du mois suivant
      const [annee, mois] = periode.split('-');
      const dateEcheance = new Date(parseInt(annee), parseInt(mois), 20);
      return dateEcheance.toISOString().split('T')[0];
    }
    case 'ibs': {
      // IBS : 30 du mois suivant le trimestre
      const [annee, trimestre] = periode.split('-');
      const trimestreNum = parseInt(trimestre.replace('T', ''));
      const moisEcheance = trimestreNum * 3 + 1;
      const dateEcheance = new Date(parseInt(annee), moisEcheance, 30);
      return dateEcheance.toISOString().split('T')[0];
    }
    case 'irg':
    case 'tap': {
      // IRG/TAP : 31 mars année suivante
      const annee = parseInt(periode);
      const dateEcheance = new Date(annee + 1, 2, 31);
      return dateEcheance.toISOString().split('T')[0];
    }
    default:
      return maintenant.toISOString().split('T')[0];
  }
};

