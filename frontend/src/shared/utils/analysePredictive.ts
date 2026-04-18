/**
 * analysePredictive.ts
 * Utilitaires pour la simulation financière avancée, alertes, et comparaisons sectorielles.
 * Used by AnalyseFinanciere.tsx
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScenarioSimulation {
  nom: string;
  variationCA: number;          // % variation du CA
  variationCharges: number;     // % variation des charges
  resultatSimule: number;
  margeSimulee: number;
  bfrSimule: number;
  tresorerieSimulee: number;
  scoreImpact: 'positif' | 'neutre' | 'negatif';
}

export interface AlerteFinanciere {
  id: string;
  type: 'critique' | 'avertissement' | 'opportunite' | 'info';
  categorie: 'liquidite' | 'rentabilite' | 'endettement' | 'efficacite';
  titre: string;
  message: string;
  description: string;
  valeurActuelle: number;
  seuilCritique: number;
  recommandations: string[];
  priorite: number;
}

export interface PrevisionFinanciere {
  mois: string;
  caPrevu: number;
  chargesConsommees: number;
  resultatPrevu: number;
  tresorerieProjetee: number;
  tendance: 'hausse' | 'stable' | 'baisse';
}

export interface DonneesRatios {
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

export interface DonneesActuelles {
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
  bfr: number;
  resultat: number;
}

export interface SeuilsAlerte {
  dsoOptimal: number;
  margeMinimale: number;
  liquiditeMinimale: number;
}

export interface BenchmarkSectoriel {
  dso: { min: number; max: number; median: number };
  margeBrute: { min: number; max: number; median: number };
  roe: { min: number; max: number; median: number };
  liquidite: { min: number; max: number; median: number };
}

export interface ComparaisonBenchmark {
  indicateur: string;
  valeurEntreprise: number;
  medianeSectorielle: number;
  ecart: number;
  position: 'au-dessus' | 'dans-la-moyenne' | 'en-dessous';
}

export interface SeuilRentabilite {
  chiffreAffairesMinimum: number;
  pointMort: number; // en jours
  margeSecurite: number; // % au-dessus du seuil
  estAtteint: boolean;
}

// ─── simulerScenario ──────────────────────────────────────────────────────────

/**
 * Simule l'impact d'une variation du CA et des charges sur les indicateurs financiers.
 */
export function simulerScenario(
  donneesActuelles: DonneesActuelles,
  variationCA: number,       // en %
  variationCharges: number   // en %
): ScenarioSimulation {
  const caSimule = donneesActuelles.ca * (1 + variationCA / 100);
  const chargesSimulees = donneesActuelles.charges * (1 + variationCharges / 100);
  const resultatSimule = caSimule - chargesSimulees;
  const margeSimulee = caSimule > 0 ? (resultatSimule / caSimule) * 100 : 0;

  // Estimation simplifiée du BFR simulé
  const dsoSimule = donneesActuelles.dso * (caSimule / donneesActuelles.ca);
  const bfrSimule = ((dsoSimule + donneesActuelles.dio - donneesActuelles.dpo) * caSimule) / 360;
  const tresorerieSimulee = donneesActuelles.tresorerie + resultatSimule - donneesActuelles.resultat - (bfrSimule - donneesActuelles.bfr);

  let scoreImpact: 'positif' | 'neutre' | 'negatif';
  if (resultatSimule > donneesActuelles.resultat * 1.05) scoreImpact = 'positif';
  else if (resultatSimule < donneesActuelles.resultat * 0.95) scoreImpact = 'negatif';
  else scoreImpact = 'neutre';

  return {
    nom: `CA ${variationCA >= 0 ? '+' : ''}${variationCA}% / Charges ${variationCharges >= 0 ? '+' : ''}${variationCharges}%`,
    variationCA,
    variationCharges,
    resultatSimule,
    margeSimulee,
    bfrSimule,
    tresorerieSimulee,
    scoreImpact
  };
}

// ─── genererAlertesFinancieres ────────────────────────────────────────────────

/**
 * Génère une liste d'alertes intelligentes basées sur les ratios et seuils.
 */
export function genererAlertesFinancieres(
  ratios: DonneesRatios,
  donnees: DonneesActuelles,
  seuils: SeuilsAlerte
): AlerteFinanciere[] {
  const alertes: AlerteFinanciere[] = [];

  // Alerte DSO
  if (ratios.dso > seuils.dsoOptimal * 1.3) {
    alertes.push({
      id: 'dso-critique',
      type: 'critique',
      categorie: 'liquidite',
      titre: 'DSO critique — recouvrement client insuffisant',
      message: `Le délai de règlement client est de ${ratios.dso} jours, bien au-dessus du seuil optimal de ${seuils.dsoOptimal} jours.`,
      description: `Le délai de règlement client est de ${ratios.dso} jours, bien au-dessus du seuil optimal de ${seuils.dsoOptimal} jours.`,
      valeurActuelle: ratios.dso,
      seuilCritique: seuils.dsoOptimal,
      recommandations: [
        'Mettre en place des relances automatiques à J+30, J+45 et J+60',
        'Réviser les conditions de paiement accordées',
        'Envisager l\'escompte pour paiement anticipé'
      ],
      priorite: 9
    });
  } else if (ratios.dso > seuils.dsoOptimal) {
    alertes.push({
      id: 'dso-warning',
      type: 'avertissement',
      categorie: 'liquidite',
      titre: 'DSO à surveiller',
      message: `Le délai de règlement client (${ratios.dso}j) dépasse légèrement l'optimal.`,
      description: `Le délai de règlement client (${ratios.dso}j) dépasse légèrement l'optimal.`,
      valeurActuelle: ratios.dso,
      seuilCritique: seuils.dsoOptimal,
      recommandations: ['Renforcer le suivi des relances clients'],
      priorite: 6
    });
  }

  // Alerte marge
  if (ratios.margeBrute < seuils.margeMinimale) {
    alertes.push({
      id: 'marge-faible',
      type: 'critique',
      categorie: 'rentabilite',
      titre: 'Marge brute insuffisante',
      message: `La marge brute de ${ratios.margeBrute.toFixed(1)}% est inférieure au seuil minimum de ${seuils.margeMinimale}%.`,
      description: `La marge brute de ${ratios.margeBrute.toFixed(1)}% est inférieure au seuil minimum de ${seuils.margeMinimale}%.`,
      valeurActuelle: ratios.margeBrute,
      seuilCritique: seuils.margeMinimale,
      recommandations: [
        'Revoir la politique tarifaire',
        'Identifier et réduire les coûts directs',
        'Négocier les achats avec les fournisseurs'
      ],
      priorite: 8
    });
  }

  // Alerte liquidité
  if (ratios.liquiditeGenerale < seuils.liquiditeMinimale) {
    alertes.push({
      id: 'liquidite-faible',
      type: 'critique',
      categorie: 'liquidite',
      titre: 'Risque de liquidité',
      message: `Le ratio de liquidité générale (${ratios.liquiditeGenerale.toFixed(2)}) est inférieur à ${seuils.liquiditeMinimale}.`,
      description: `Le ratio de liquidité générale (${ratios.liquiditeGenerale.toFixed(2)}) est inférieur à ${seuils.liquiditeMinimale}.`,
      valeurActuelle: ratios.liquiditeGenerale,
      seuilCritique: seuils.liquiditeMinimale,
      recommandations: [
        'Accélérer l\'encaissement des créances',
        'Différer les investissements non critiques',
        'Explorer les lignes de crédit disponibles'
      ],
      priorite: 10
    });
  }

  // Alerte endettement
  if (ratios.endettement < 30) {
    alertes.push({
      id: 'autonomie-faible',
      type: 'avertissement',
      categorie: 'endettement',
      titre: 'Autonomie financière limitée',
      message: `L'autonomie financière de ${ratios.endettement.toFixed(1)}% indique une dépendance importante à l'endettement externe.`,
      description: `L'autonomie financière de ${ratios.endettement.toFixed(1)}% indique une dépendance importante à l'endettement externe.`,
      valeurActuelle: ratios.endettement,
      seuilCritique: 30,
      recommandations: [
        'Renforcer les capitaux propres',
        'Envisager une augmentation de capital',
        'Prioriser l\'autofinancement'
      ],
      priorite: 5
    });
  }

  return alertes;
}

// ─── genererPrevisions ────────────────────────────────────────────────────────

/**
 * Génère des prévisions financières sur 6 mois basées sur les données actuelles.
 */
export function genererPrevisions(
  donnees: DonneesActuelles,
  tauxCroissance: number = 2 // % par mois
): PrevisionFinanciere[] {
  const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
  const previsions: PrevisionFinanciere[] = [];

  let caBase = donnees.ca / 12;
  let tresorerieBase = donnees.tresorerie;

  for (let i = 0; i < 6; i++) {
    const facteur = Math.pow(1 + tauxCroissance / 100, i);
    const caMois = caBase * facteur;
    const chargesMois = (donnees.charges / 12) * (1 + (tauxCroissance / 2) / 100 * i);
    const resultatMois = caMois - chargesMois;
    tresorerieBase += resultatMois * 0.7; // approximation flux de trésorerie

    let tendance: 'hausse' | 'stable' | 'baisse';
    if (resultatMois > 0 && tauxCroissance > 1) tendance = 'hausse';
    else if (tauxCroissance < -1) tendance = 'baisse';
    else tendance = 'stable';

    previsions.push({
      mois: moisLabels[i],
      caPrevu: Math.round(caMois),
      chargesConsommees: Math.round(chargesMois),
      resultatPrevu: Math.round(resultatMois),
      tresorerieProjetee: Math.round(tresorerieBase),
      tendance
    });
  }

  return previsions;
}

// ─── calculerSeuilRentabilite ─────────────────────────────────────────────────

/**
 * Calcule le seuil de rentabilité (break-even) et le point mort en jours.
 */
export function calculerSeuilRentabilite(
  coutsFixes: number,
  tauxMargeBrute: number // en %
): SeuilRentabilite {
  if (tauxMargeBrute <= 0) {
    return {
      chiffreAffairesMinimum: Infinity,
      pointMort: 365,
      margeSecurite: 0,
      estAtteint: false
    };
  }

  const chiffreAffairesMinimum = coutsFixes / (tauxMargeBrute / 100);
  const pointMort = Math.round((chiffreAffairesMinimum / (chiffreAffairesMinimum * 12)) * 365);
  const margeSecurite = Math.max(0, ((chiffreAffairesMinimum * 1.2 - chiffreAffairesMinimum) / (chiffreAffairesMinimum * 1.2)) * 100);
  const estAtteint = coutsFixes < chiffreAffairesMinimum * (tauxMargeBrute / 100);

  return {
    chiffreAffairesMinimum: Math.round(chiffreAffairesMinimum),
    pointMort: Math.max(1, pointMort),
    margeSecurite: Math.round(margeSecurite * 10) / 10,
    estAtteint
  };
}

// ─── comparerAvecBenchmarks ───────────────────────────────────────────────────

export interface ResultatComparaisonBenchmark {
  details: ComparaisonBenchmark[];
  score: number;
  classement: 'excellent' | 'bon' | 'moyen' | 'insuffisant';
  pointsFort: string[];
  pointsFaible: string[];
}

/**
 * Compare les indicateurs de l'entreprise avec les benchmarks sectoriels.
 */
export function comparerAvecBenchmarks(
  ratios: DonneesRatios,
  benchmarks: BenchmarkSectoriel
): ResultatComparaisonBenchmark {
  const details: ComparaisonBenchmark[] = [];
  const pointsFort: string[] = [];
  const pointsFaible: string[] = [];

  const determinerPosition = (valeur: number, ref: { min: number; max: number; median: number }, inverse = false): 'au-dessus' | 'dans-la-moyenne' | 'en-dessous' => {
    if (inverse) {
      if (valeur < ref.median * 0.9) return 'au-dessus';
      if (valeur > ref.median * 1.1) return 'en-dessous';
      return 'dans-la-moyenne';
    }
    if (valeur > ref.median * 1.1) return 'au-dessus';
    if (valeur < ref.median * 0.9) return 'en-dessous';
    return 'dans-la-moyenne';
  };

  // DSO
  const posDso = determinerPosition(ratios.dso, benchmarks.dso, true);
  details.push({
    indicateur: 'DSO (jours)',
    valeurEntreprise: ratios.dso,
    medianeSectorielle: benchmarks.dso.median,
    ecart: Math.round(((ratios.dso - benchmarks.dso.median) / benchmarks.dso.median) * 100),
    position: posDso
  });
  if (posDso === 'au-dessus') pointsFort.push('Encaissement client rapide');
  else if (posDso === 'en-dessous') pointsFaible.push('Délais clients trop longs');

  // Marge
  const posMarge = determinerPosition(ratios.margeBrute, benchmarks.margeBrute);
  details.push({
    indicateur: 'Marge Brute (%)',
    valeurEntreprise: ratios.margeBrute,
    medianeSectorielle: benchmarks.margeBrute.median,
    ecart: Math.round(((ratios.margeBrute - benchmarks.margeBrute.median) / benchmarks.margeBrute.median) * 100),
    position: posMarge
  });
  if (posMarge === 'au-dessus') pointsFort.push('Excellente rentabilité brute');
  else if (posMarge === 'en-dessous') pointsFaible.push('Marge inférieure au secteur');

  // ROE
  const posRoe = determinerPosition(ratios.roe, benchmarks.roe);
  details.push({
    indicateur: 'ROE (%)',
    valeurEntreprise: ratios.roe,
    medianeSectorielle: benchmarks.roe.median,
    ecart: Math.round(((ratios.roe - benchmarks.roe.median) / benchmarks.roe.median) * 100),
    position: posRoe
  });
  if (posRoe === 'au-dessus') pointsFort.push('Très bon rendement des fonds propres');

  // Liquidité
  const posLiq = determinerPosition(ratios.liquiditeGenerale, benchmarks.liquidite);
  details.push({
    indicateur: 'Liquidité Générale',
    valeurEntreprise: ratios.liquiditeGenerale,
    medianeSectorielle: benchmarks.liquidite.median,
    ecart: Math.round(((ratios.liquiditeGenerale - benchmarks.liquidite.median) / benchmarks.liquidite.median) * 100),
    position: posLiq
  });
  if (posLiq === 'au-dessus') pointsFort.push('Solide position de liquidité');

  // Calcul du score (0-100)
  let score = 50;
  score += pointsFort.length * 15;
  score -= pointsFaible.length * 15;
  score = Math.max(0, Math.min(100, score));

  let classement: 'excellent' | 'bon' | 'moyen' | 'insuffisant' = 'moyen';
  if (score >= 85) classement = 'excellent';
  else if (score >= 70) classement = 'bon';
  else if (score < 40) classement = 'insuffisant';

  return {
    details,
    score,
    classement,
    pointsFort,
    pointsFaible
  };
}

// Fix typo in genererPrevisions (resultatsims should be resultatMois)
// The internal variable is captured via closure correctly above.
