/**
 * Utilitaires pour l'analyse prédictive financière
 * Scénarios de simulation, prévisions, alertes intelligentes
 */

export interface ScenarioSimulation {
  id: string;
  nom: string;
  description: string;
  parametres: {
    variationCA?: number; // Pourcentage de variation du CA
    variationCharges?: number; // Pourcentage de variation des charges
    variationMarge?: number; // Variation de la marge brute
    variationDSO?: number; // Variation du DSO (jours)
    variationDIO?: number; // Variation du DIO (jours)
    variationDPO?: number; // Variation du DPO (jours)
    nouveauTauxInteret?: number; // Nouveau taux d'intérêt
    nouveauTauxTVA?: number; // Nouveau taux de TVA
    investissement?: number; // Montant d'investissement
    croissanceMensuelle?: number; // Croissance mensuelle attendue
  };
  resultats: {
    nouveauCA: number;
    nouveauResultat: number;
    nouveauBFR: number;
    nouveauxRatios: RatiosProjetes;
    impactLiquidite: number;
    impactRentabilite: number;
  };
}

export interface RatiosProjetes {
  dso: number;
  dio: number;
  dpo: number;
  ccc: number;
  margeBrute: number;
  margeNette: number;
  roe: number;
  roa: number;
  liquiditeGenerale: number;
  endettement: number;
}

export interface AlerteFinanciere {
  id: string;
  type: 'critique' | 'avertissement' | 'info' | 'opportunite';
  categorie: 'liquidite' | 'rentabilite' | 'solvabilite' | 'croissance' | 'efficacite' | 'risque';
  titre: string;
  message: string;
  ratioConcerne?: string;
  valeurActuelle: number;
  valeurSeuil: number;
  tendance: 'amelioration' | 'deterioration' | 'stable';
  recommandations: string[];
  priorite: number; // 1-10, 10 étant le plus prioritaire
}

export interface PrevisionFinanciere {
  periode: string; // Format: "2025-01"
  caPrevu: number;
  chargesPrevu: number;
  resultatPrevu: number;
  tresoreriePrevu: number;
  bfrPrevu: number;
  confiance: number; // 0-100, niveau de confiance de la prévision
  scenario: 'optimiste' | 'realiste' | 'pessimiste';
}

/**
 * Simule un scénario financier
 */
export const simulerScenario = (
  donneesActuelles: {
    ca: number;
    charges: number;
    margeBrute: number;
    dso: number;
    dio: number;
    dpo: number;
    tresorerie: number;
    actif: number;
    passif: number;
    capitauxPropres: number;
  },
  parametres: ScenarioSimulation['parametres']
): ScenarioSimulation['resultats'] => {
  // Calculer le nouveau CA
  const nouveauCA = parametres.variationCA
    ? donneesActuelles.ca * (1 + parametres.variationCA / 100)
    : donneesActuelles.ca;
  
  // Calculer les nouvelles charges
  const nouvellesCharges = parametres.variationCharges
    ? donneesActuelles.charges * (1 + parametres.variationCharges / 100)
    : donneesActuelles.charges;
  
  // Calculer la nouvelle marge
  const nouvelleMargeBrute = parametres.variationMarge
    ? donneesActuelles.margeBrute * (1 + parametres.variationMarge / 100)
    : nouveauCA - nouvellesCharges;
  
  const nouveauResultat = nouveauCA - nouvellesCharges;
  
  // Calculer les nouveaux ratios de rotation
  const nouveauDSO = parametres.variationDSO
    ? donneesActuelles.dso + parametres.variationDSO
    : donneesActuelles.dso;
  
  const nouveauDIO = parametres.variationDIO
    ? donneesActuelles.dio + parametres.variationDIO
    : donneesActuelles.dio;
  
  const nouveauDPO = parametres.variationDPO
    ? donneesActuelles.dpo + parametres.variationDPO
    : donneesActuelles.dpo;
  
  const nouveauCCC = nouveauDSO + nouveauDIO - nouveauDPO;
  
  // Calculer le nouveau BFR
  const creancesClients = (nouveauCA / 365) * nouveauDSO;
  const stocks = (nouveauCA * 0.6 / 365) * nouveauDIO; // Estimation: 60% du CA en stocks
  const dettesFournisseurs = (nouveauCA * 0.6 / 365) * nouveauDPO;
  const nouveauBFR = creancesClients + stocks - dettesFournisseurs;
  
  // Calculer les nouveaux ratios
  const nouveauxRatios: RatiosProjetes = {
    dso: nouveauDSO,
    dio: nouveauDIO,
    dpo: nouveauDPO,
    ccc: nouveauCCC,
    margeBrute: (nouvelleMargeBrute / nouveauCA) * 100,
    margeNette: (nouveauResultat / nouveauCA) * 100,
    roe: donneesActuelles.capitauxPropres > 0
      ? (nouveauResultat / donneesActuelles.capitauxPropres) * 100
      : 0,
    roa: donneesActuelles.actif > 0
      ? (nouveauResultat / donneesActuelles.actif) * 100
      : 0,
    liquiditeGenerale: donneesActuelles.passif > 0
      ? (donneesActuelles.actif / donneesActuelles.passif)
      : 0,
    endettement: donneesActuelles.capitauxPropres > 0
      ? (donneesActuelles.passif / donneesActuelles.capitauxPropres) * 100
      : 0
  };
  
  // Calculer l'impact sur la liquidité
  const impactLiquidite = nouveauBFR - (creancesClients + stocks - dettesFournisseurs);
  
  // Calculer l'impact sur la rentabilité
  const impactRentabilite = nouveauResultat - (donneesActuelles.ca - donneesActuelles.charges);
  
  return {
    nouveauCA,
    nouveauResultat,
    nouveauBFR,
    nouveauxRatios,
    impactLiquidite,
    impactRentabilite
  };
};

/**
 * Génère des alertes financières intelligentes basées sur les ratios
 */
export const genererAlertesFinancieres = (
  ratios: RatiosProjetes,
  donneesActuelles: {
    ca: number;
    tresorerie: number;
    bfr: number;
    resultat: number;
  },
  benchmarks: {
    dsoOptimal?: number;
    dioOptimal?: number;
    margeMinimale?: number;
    liquiditeMinimale?: number;
  } = {}
): AlerteFinanciere[] => {
  const alertes: AlerteFinanciere[] = [];
  
  // Alerte DSO élevé
  const dsoSeuil = benchmarks.dsoOptimal || 60;
  if (ratios.dso > dsoSeuil) {
    alertes.push({
      id: 'alerte-dso',
      type: 'avertissement',
      categorie: 'efficacite',
      titre: 'DSO Élevé',
      message: `Le délai de recouvrement des créances (${ratios.dso.toFixed(0)} jours) dépasse le seuil optimal (${dsoSeuil} jours)`,
      ratioConcerne: 'DSO',
      valeurActuelle: ratios.dso,
      valeurSeuil: dsoSeuil,
      tendance: 'deterioration',
      recommandations: [
        'Renforcer le suivi des relances clients',
        'Négocier des délais de paiement plus courts',
        'Proposer des escomptes pour paiement anticipé',
        'Évaluer la solvabilité des clients'
      ],
      priorite: ratios.dso > dsoSeuil * 1.5 ? 9 : 6
    });
  }
  
  // Alerte Liquidité faible
  const liquiditeSeuil = benchmarks.liquiditeMinimale || 1.0;
  if (ratios.liquiditeGenerale < liquiditeSeuil) {
    alertes.push({
      id: 'alerte-liquidite',
      type: 'critique',
      categorie: 'liquidite',
      titre: 'Liquidité Insuffisante',
      message: `Le ratio de liquidité générale (${ratios.liquiditeGenerale.toFixed(2)}) est inférieur au seuil minimal (${liquiditeSeuil})`,
      ratioConcerne: 'Liquidité Générale',
      valeurActuelle: ratios.liquiditeGenerale,
      valeurSeuil: liquiditeSeuil,
      tendance: 'deterioration',
      recommandations: [
        'Augmenter la trésorerie disponible',
        'Renégocier les délais de paiement fournisseurs',
        'Accélérer le recouvrement des créances',
        'Réduire les stocks si possible',
        'Évaluer un financement court terme'
      ],
      priorite: 10
    });
  }
  
  // Alerte Marge faible
  const margeSeuil = benchmarks.margeMinimale || 10;
  if (ratios.margeNette < margeSeuil) {
    alertes.push({
      id: 'alerte-marge',
      type: 'avertissement',
      categorie: 'rentabilite',
      titre: 'Marge Nette Faible',
      message: `La marge nette (${ratios.margeNette.toFixed(1)}%) est inférieure au seuil recommandé (${margeSeuil}%)`,
      ratioConcerne: 'Marge Nette',
      valeurActuelle: ratios.margeNette,
      valeurSeuil: margeSeuil,
      tendance: 'deterioration',
      recommandations: [
        'Réduire les coûts opérationnels',
        'Augmenter les prix de vente si possible',
        'Optimiser le mix produits/services',
        'Négocier de meilleurs prix avec les fournisseurs',
        'Améliorer l\'efficacité opérationnelle'
      ],
      priorite: 8
    });
  }
  
  // Alerte BFR élevé
  if (donneesActuelles.bfr > donneesActuelles.ca * 0.3) {
    alertes.push({
      id: 'alerte-bfr',
      type: 'avertissement',
      categorie: 'liquidite',
      titre: 'Besoin en Fonds de Roulement Élevé',
      message: `Le BFR (${donneesActuelles.bfr.toFixed(0)}) représente plus de 30% du CA`,
      ratioConcerne: 'BFR',
      valeurActuelle: donneesActuelles.bfr,
      valeurSeuil: donneesActuelles.ca * 0.3,
      tendance: 'deterioration',
      recommandations: [
        'Optimiser la gestion des stocks',
        'Réduire les délais de recouvrement clients',
        'Négocier des délais de paiement fournisseurs plus longs',
        'Évaluer un financement du BFR'
      ],
      priorite: 7
    });
  }
  
  // Alerte ROE faible
  if (ratios.roe < 5 && ratios.roe > 0) {
    alertes.push({
      id: 'alerte-roe',
      type: 'info',
      categorie: 'rentabilite',
      titre: 'ROE en Dessous des Attentes',
      message: `Le retour sur capitaux propres (${ratios.roe.toFixed(1)}%) est faible`,
      ratioConcerne: 'ROE',
      valeurActuelle: ratios.roe,
      valeurSeuil: 5,
      tendance: 'deterioration',
      recommandations: [
        'Améliorer la rentabilité opérationnelle',
        'Optimiser la structure financière',
        'Réduire les coûts financiers',
        'Augmenter la productivité des capitaux'
      ],
      priorite: 5
    });
  }
  
  // Alerte Opportunité d'amélioration
  if (ratios.ccc < 0) {
    alertes.push({
      id: 'opportunite-ccc',
      type: 'opportunite',
      categorie: 'efficacite',
      titre: 'Cycle de Conversion de Trésorerie Négatif',
      message: `Excellent ! Le CCC est négatif (${ratios.ccc.toFixed(0)} jours), ce qui signifie que l'entreprise est financée par ses fournisseurs`,
      ratioConcerne: 'CCC',
      valeurActuelle: ratios.ccc,
      valeurSeuil: 0,
      tendance: 'amelioration',
      recommandations: [
        'Maintenir cette position avantageuse',
        'Optimiser encore plus les délais de paiement',
        'Utiliser cette trésorerie pour investir'
      ],
      priorite: 3
    });
  }
  
  // Trier par priorité décroissante
  return alertes.sort((a, b) => b.priorite - a.priorite);
};

/**
 * Génère des prévisions financières
 */
export const genererPrevisions = (
  donneesActuelles: {
    ca: number;
    charges: number;
    resultat: number;
    tresorerie: number;
    bfr: number;
  },
  croissanceMensuelle: number,
  nombreMois: number = 12,
  scenario: 'optimiste' | 'realiste' | 'pessimiste' = 'realiste'
): PrevisionFinanciere[] => {
  const previsions: PrevisionFinanciere[] = [];
  const facteurScenario = scenario === 'optimiste' ? 1.1 : scenario === 'pessimiste' ? 0.9 : 1.0;
  
  let caCumule = donneesActuelles.ca;
  let tresorerieCumulee = donneesActuelles.tresorerie;
  
  for (let mois = 1; mois <= nombreMois; mois++) {
    const date = new Date();
    date.setMonth(date.getMonth() + mois);
    const periode = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Calculer le CA prévu avec croissance
    const croissanceAjustee = croissanceMensuelle * facteurScenario;
    caCumule = caCumule * (1 + croissanceAjustee / 100);
    
    // Estimer les charges (proportionnelles au CA avec légère amélioration)
    const ratioCharges = donneesActuelles.charges / donneesActuelles.ca;
    const chargesPrevu = caCumule * ratioCharges * 0.98; // Légère amélioration de 2%
    
    const resultatPrevu = caCumule - chargesPrevu;
    
    // Estimer le BFR (proportionnel au CA)
    const ratioBFR = donneesActuelles.bfr / donneesActuelles.ca;
    const bfrPrevu = caCumule * ratioBFR;
    
    // Estimer la trésorerie (résultat + variation BFR)
    tresorerieCumulee = tresorerieCumulee + resultatPrevu - (bfrPrevu - donneesActuelles.bfr);
    
    // Niveau de confiance diminue avec le temps
    const confiance = Math.max(30, 100 - (mois * 5));
    
    previsions.push({
      periode,
      caPrevu: caCumule,
      chargesPrevu,
      resultatPrevu,
      tresoreriePrevu: tresorerieCumulee,
      bfrPrevu,
      confiance,
      scenario
    });
  }
  
  return previsions;
};

/**
 * Calcule le seuil de rentabilité (point mort)
 */
export const calculerSeuilRentabilite = (
  coutsFixes: number,
  margeBrutePourcentage: number
): {
  seuilCA: number;
  pointMortJours: number;
  margeSecurite: number;
  levierOperationnel: number;
} => {
  if (margeBrutePourcentage <= 0) {
    return {
      seuilCA: 0,
      pointMortJours: 365,
      margeSecurite: 0,
      levierOperationnel: 0
    };
  }
  
  const seuilCA = coutsFixes / (margeBrutePourcentage / 100);
  
  // Estimation du point mort en jours (basé sur un CA mensuel moyen)
  const caMensuelMoyen = seuilCA / 12;
  const pointMortJours = Math.ceil((coutsFixes / caMensuelMoyen) * 30);
  
  // Marge de sécurité (à calculer avec le CA réel)
  const margeSecurite = 0; // Sera calculée avec le CA réel
  
  // Levier opérationnel (simplifié)
  const levierOperationnel = 1 / (margeBrutePourcentage / 100);
  
  return {
    seuilCA,
    pointMortJours,
    margeSecurite,
    levierOperationnel
  };
};

/**
 * Compare les ratios avec les benchmarks sectoriels
 */
export const comparerAvecBenchmarks = (
  ratios: RatiosProjetes,
  benchmarks: {
    dso?: { min: number; max: number; median: number };
    margeBrute?: { min: number; max: number; median: number };
    roe?: { min: number; max: number; median: number };
    liquidite?: { min: number; max: number; median: number };
  }
): {
  score: number; // 0-100
  classement: 'excellent' | 'bon' | 'moyen' | 'faible';
  pointsFort: string[];
  pointsFaible: string[];
} => {
  let scoreTotal = 0;
  let nombreCriteres = 0;
  const pointsFort: string[] = [];
  const pointsFaible: string[] = [];
  
  // Évaluer DSO
  if (benchmarks.dso) {
    nombreCriteres++;
    if (ratios.dso <= benchmarks.dso.median) {
      scoreTotal += 100;
      pointsFort.push('DSO excellent');
    } else if (ratios.dso <= benchmarks.dso.max) {
      scoreTotal += 70;
    } else {
      scoreTotal += 30;
      pointsFaible.push('DSO élevé');
    }
  }
  
  // Évaluer Marge Brute
  if (benchmarks.margeBrute) {
    nombreCriteres++;
    if (ratios.margeBrute >= benchmarks.margeBrute.median) {
      scoreTotal += 100;
      pointsFort.push('Marge brute excellente');
    } else if (ratios.margeBrute >= benchmarks.margeBrute.min) {
      scoreTotal += 70;
    } else {
      scoreTotal += 30;
      pointsFaible.push('Marge brute faible');
    }
  }
  
  // Évaluer ROE
  if (benchmarks.roe) {
    nombreCriteres++;
    if (ratios.roe >= benchmarks.roe.median) {
      scoreTotal += 100;
      pointsFort.push('ROE excellent');
    } else if (ratios.roe >= benchmarks.roe.min) {
      scoreTotal += 70;
    } else {
      scoreTotal += 30;
      pointsFaible.push('ROE faible');
    }
  }
  
  // Évaluer Liquidité
  if (benchmarks.liquidite) {
    nombreCriteres++;
    if (ratios.liquiditeGenerale >= benchmarks.liquidite.median) {
      scoreTotal += 100;
      pointsFort.push('Liquidité excellente');
    } else if (ratios.liquiditeGenerale >= benchmarks.liquidite.min) {
      scoreTotal += 70;
    } else {
      scoreTotal += 30;
      pointsFaible.push('Liquidité faible');
    }
  }
  
  const score = nombreCriteres > 0 ? scoreTotal / nombreCriteres : 0;
  
  let classement: 'excellent' | 'bon' | 'moyen' | 'faible';
  if (score >= 85) classement = 'excellent';
  else if (score >= 70) classement = 'bon';
  else if (score >= 50) classement = 'moyen';
  else classement = 'faible';
  
  return {
    score,
    classement,
    pointsFort,
    pointsFaible
  };
};

