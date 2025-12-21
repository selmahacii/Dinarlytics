/**
 * Utilitaires pour les insights consolidés du tableau de bord financier
 * Analyses multi-modules, alertes consolidées, recommandations intelligentes
 */

export interface InsightConsolide {
  id: string;
  type: 'alerte' | 'opportunite' | 'recommandation' | 'info';
  priorite: 'critique' | 'haute' | 'moyenne' | 'basse';
  module: 'tresorerie' | 'comptabilite' | 'fiscalite' | 'paie' | 'budget' | 'analyse' | 'global';
  titre: string;
  message: string;
  impact: 'eleve' | 'moyen' | 'faible';
  actions: string[];
  dateDetection: string;
  tendance?: 'amelioration' | 'deterioration' | 'stable';
}

export interface VueEnsemble {
  santeFinanciere: {
    score: number; // 0-100
    classement: 'excellent' | 'bon' | 'moyen' | 'faible' | 'critique';
    tendance: 'amelioration' | 'deterioration' | 'stable';
    pointsFort: string[];
    pointsFaible: string[];
  };
  alertesConsolidees: InsightConsolide[];
  opportunites: InsightConsolide[];
  recommandationsPrioritaires: InsightConsolide[];
  metriquesCles: {
    liquidite: number;
    rentabilite: number;
    solvabilite: number;
    efficacite: number;
  };
}

/**
 * Génère une vue d'ensemble consolidée de la santé financière
 */
export const genererVueEnsemble = (
  donnees: {
    ratios: {
      dso: number;
      dio: number;
      dpo: number;
      ccc: number;
      liquiditeGenerale: number;
      margeBrute: number;
      roe: number;
      roa: number;
    };
    tresorerie: {
      solde: number;
      alertes: number;
      joursSousSeuil: number;
    };
    comptabilite: {
      ecrituresEnAttente: number;
      erreurs: number;
    };
    fiscalite: {
      declarationsEnRetard: number;
      echeancesProches: number;
    };
    paie: {
      bulletinsEnAttente: number;
      declarationsEnRetard: number;
    };
    budget: {
      ecartsSignificatifs: number;
      depassements: number;
    };
  }
): VueEnsemble => {
  const insights: InsightConsolide[] = [];
  
  // Analyser la liquidité
  const scoreLiquidite = calculerScoreLiquidite(donnees.ratios, donnees.tresorerie);
  if (scoreLiquidite < 50) {
    insights.push({
      id: 'insight-liquidite',
      type: 'alerte',
      priorite: scoreLiquidite < 30 ? 'critique' : 'haute',
      module: 'tresorerie',
      titre: 'Risque de Liquidité',
      message: `La liquidité est préoccupante. DSO: ${donnees.ratios.dso}j, Solde: ${donnees.tresorerie.solde.toLocaleString()} DZD`,
      impact: 'eleve',
      actions: [
        'Accélérer le recouvrement des créances clients',
        'Négocier des délais de paiement fournisseurs',
        'Évaluer un financement court terme',
        'Réduire les stocks si possible'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'deterioration'
    });
  }
  
  // Analyser la rentabilité
  const scoreRentabilite = calculerScoreRentabilite(donnees.ratios);
  if (scoreRentabilite < 60) {
    insights.push({
      id: 'insight-rentabilite',
      type: 'alerte',
      priorite: scoreRentabilite < 40 ? 'haute' : 'moyenne',
      module: 'analyse',
      titre: 'Rentabilité à Améliorer',
      message: `La marge brute (${donnees.ratios.margeBrute.toFixed(1)}%) et le ROE (${donnees.ratios.roe.toFixed(1)}%) sont en dessous des attentes`,
      impact: 'moyen',
      actions: [
        'Optimiser les coûts opérationnels',
        'Réviser la stratégie de prix',
        'Améliorer le mix produits/services',
        'Augmenter la productivité'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'stable'
    });
  }
  
  // Analyser la comptabilité
  if (donnees.comptabilite.ecrituresEnAttente > 50) {
    insights.push({
      id: 'insight-comptabilite',
      type: 'alerte',
      priorite: donnees.comptabilite.ecrituresEnAttente > 100 ? 'haute' : 'moyenne',
      module: 'comptabilite',
      titre: 'Écritures Comptables en Attente',
      message: `${donnees.comptabilite.ecrituresEnAttente} écritures comptables sont en attente de validation`,
      impact: 'moyen',
      actions: [
        'Valider les écritures en attente',
        'Automatiser la validation des écritures récurrentes',
        'Former l\'équipe sur les règles comptables'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'stable'
    });
  }
  
  // Analyser la fiscalité
  if (donnees.fiscalite.declarationsEnRetard > 0) {
    insights.push({
      id: 'insight-fiscalite',
      type: 'alerte',
      priorite: 'critique',
      module: 'fiscalite',
      titre: 'Déclarations Fiscales en Retard',
      message: `${donnees.fiscalite.declarationsEnRetard} déclaration(s) fiscale(s) en retard. Risque de pénalités.`,
      impact: 'eleve',
      actions: [
        'Urgent : Générer et soumettre les déclarations en retard',
        'Configurer des rappels automatiques',
        'Planifier les prochaines échéances'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'deterioration'
    });
  }
  
  if (donnees.fiscalite.echeancesProches > 0) {
    insights.push({
      id: 'insight-fiscalite-proche',
      type: 'info',
      priorite: 'moyenne',
      module: 'fiscalite',
      titre: 'Échéances Fiscales Proches',
      message: `${donnees.fiscalite.echeancesProches} échéance(s) fiscale(s) dans les 15 prochains jours`,
      impact: 'faible',
      actions: [
        'Préparer les déclarations à l\'avance',
        'Vérifier les montants à déclarer',
        'Planifier les paiements'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'stable'
    });
  }
  
  // Analyser la paie
  if (donnees.paie.bulletinsEnAttente > 0) {
    insights.push({
      id: 'insight-paie',
      type: 'alerte',
      priorite: 'haute',
      module: 'paie',
      titre: 'Bulletins de Paie en Attente',
      message: `${donnees.paie.bulletinsEnAttente} bulletin(s) de paie en attente de traitement`,
      impact: 'moyen',
      actions: [
        'Traiter les bulletins en attente',
        'Automatiser le calcul de la paie',
        'Vérifier les déclarations sociales'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'stable'
    });
  }
  
  // Analyser le budget
  if (donnees.budget.ecartsSignificatifs > 0) {
    insights.push({
      id: 'insight-budget',
      type: 'alerte',
      priorite: donnees.budget.depassements > 0 ? 'haute' : 'moyenne',
      module: 'budget',
      titre: 'Écarts Budgétaires Significatifs',
      message: `${donnees.budget.ecartsSignificatifs} écart(s) budgétaire(s) significatif(s) détecté(s)`,
      impact: 'moyen',
      actions: [
        'Analyser les causes des écarts',
        'Ajuster le budget si nécessaire',
        'Mettre en place des contrôles préventifs'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'stable'
    });
  }
  
  // Opportunités
  if (donnees.ratios.ccc < 0) {
    insights.push({
      id: 'opportunite-ccc',
      type: 'opportunite',
      priorite: 'moyenne',
      module: 'analyse',
      titre: 'Cycle de Conversion de Trésorerie Négatif',
      message: 'Excellent ! Votre CCC est négatif, ce qui signifie que vous êtes financé par vos fournisseurs',
      impact: 'moyen',
      actions: [
        'Maintenir cette position avantageuse',
        'Utiliser cette trésorerie pour investir',
        'Optimiser encore plus les délais'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'amelioration'
    });
  }
  
  if (donnees.ratios.roe > 20) {
    insights.push({
      id: 'opportunite-roe',
      type: 'opportunite',
      priorite: 'basse',
      module: 'analyse',
      titre: 'ROE Excellent',
      message: `Votre ROE (${donnees.ratios.roe.toFixed(1)}%) est excellent. Vous pourriez envisager une croissance accélérée.`,
      impact: 'faible',
      actions: [
        'Évaluer des opportunités d\'investissement',
        'Considérer une expansion',
        'Optimiser la structure financière'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'amelioration'
    });
  }
  
  // Calculer le score global de santé financière
  const scoreGlobal = (
    scoreLiquidite * 0.3 +
    scoreRentabilite * 0.3 +
    (donnees.comptabilite.ecrituresEnAttente === 0 ? 100 : Math.max(0, 100 - donnees.comptabilite.ecrituresEnAttente * 0.5)) * 0.15 +
    (donnees.fiscalite.declarationsEnRetard === 0 ? 100 : 50) * 0.15 +
    (donnees.paie.bulletinsEnAttente === 0 ? 100 : Math.max(0, 100 - donnees.paie.bulletinsEnAttente * 2)) * 0.1
  );
  
  let classement: 'excellent' | 'bon' | 'moyen' | 'faible' | 'critique';
  if (scoreGlobal >= 85) classement = 'excellent';
  else if (scoreGlobal >= 70) classement = 'bon';
  else if (scoreGlobal >= 50) classement = 'moyen';
  else if (scoreGlobal >= 30) classement = 'faible';
  else classement = 'critique';
  
  const alertesConsolidees = insights.filter(i => i.type === 'alerte');
  const opportunites = insights.filter(i => i.type === 'opportunite');
  const recommandationsPrioritaires = insights
    .filter(i => i.priorite === 'critique' || i.priorite === 'haute')
    .sort((a, b) => {
      const prioriteOrder = { critique: 4, haute: 3, moyenne: 2, basse: 1 };
      return prioriteOrder[b.priorite] - prioriteOrder[a.priorite];
    });
  
  return {
    santeFinanciere: {
      score: scoreGlobal,
      classement,
      tendance: scoreGlobal > 70 ? 'amelioration' : scoreGlobal < 50 ? 'deterioration' : 'stable',
      pointsFort: [
        ...(donnees.ratios.roe > 15 ? ['ROE élevé'] : []),
        ...(donnees.ratios.liquiditeGenerale > 1.5 ? ['Liquidité solide'] : []),
        ...(donnees.fiscalite.declarationsEnRetard === 0 ? ['Conformité fiscale'] : []),
        ...(donnees.comptabilite.ecrituresEnAttente < 20 ? ['Comptabilité à jour'] : [])
      ],
      pointsFaible: [
        ...(donnees.ratios.dso > 60 ? ['DSO élevé'] : []),
        ...(donnees.tresorerie.joursSousSeuil > 10 ? ['Trésorerie sous tension'] : []),
        ...(donnees.fiscalite.declarationsEnRetard > 0 ? ['Déclarations en retard'] : []),
        ...(donnees.budget.depassements > 0 ? ['Dépassements budgétaires'] : [])
      ]
    },
    alertesConsolidees,
    opportunites,
    recommandationsPrioritaires,
    metriquesCles: {
      liquidite: scoreLiquidite,
      rentabilite: scoreRentabilite,
      solvabilite: donnees.ratios.roe > 10 ? 80 : 60,
      efficacite: donnees.ratios.ccc < 30 ? 85 : 60
    }
  };
};

/**
 * Calcule le score de liquidité (0-100)
 */
const calculerScoreLiquidite = (
  ratios: { dso: number; liquiditeGenerale: number; ccc: number },
  tresorerie: { solde: number; joursSousSeuil: number }
): number => {
  let score = 100;
  
  // Pénalité pour DSO élevé
  if (ratios.dso > 60) score -= 20;
  else if (ratios.dso > 45) score -= 10;
  
  // Pénalité pour liquidité faible
  if (ratios.liquiditeGenerale < 1.0) score -= 30;
  else if (ratios.liquiditeGenerale < 1.5) score -= 15;
  
  // Pénalité pour CCC élevé
  if (ratios.ccc > 60) score -= 15;
  else if (ratios.ccc > 45) score -= 8;
  
  // Pénalité pour jours sous seuil
  if (tresorerie.joursSousSeuil > 20) score -= 20;
  else if (tresorerie.joursSousSeuil > 10) score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Calcule le score de rentabilité (0-100)
 */
const calculerScoreRentabilite = (ratios: { margeBrute: number; roe: number; roa: number }): number => {
  let score = 100;
  
  // Pénalité pour marge faible
  if (ratios.margeBrute < 10) score -= 25;
  else if (ratios.margeBrute < 15) score -= 12;
  
  // Pénalité pour ROE faible
  if (ratios.roe < 5) score -= 20;
  else if (ratios.roe < 10) score -= 10;
  
  // Pénalité pour ROA faible
  if (ratios.roa < 5) score -= 15;
  else if (ratios.roa < 8) score -= 8;
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Génère des recommandations intelligentes basées sur les données
 */
export const genererRecommandations = (
  vueEnsemble: VueEnsemble,
  contexte: {
    segment: string;
    secteur: string;
    taille: string;
  }
): InsightConsolide[] => {
  const recommandations: InsightConsolide[] = [];
  
  // Recommandations basées sur le score de santé financière
  if (vueEnsemble.santeFinanciere.score < 50) {
    recommandations.push({
      id: 'reco-urgence',
      type: 'recommandation',
      priorite: 'critique',
      module: 'global',
      titre: 'Action Urgente Requise',
      message: 'La santé financière globale nécessite une attention immédiate. Plusieurs domaines critiques nécessitent des actions correctives.',
      impact: 'eleve',
      actions: [
        'Réviser la stratégie financière globale',
        'Prioriser les actions sur la liquidité',
        'Mettre en place un plan de redressement',
        'Consulter un expert-comptable'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'deterioration'
    });
  }
  
  // Recommandations basées sur les métriques clés
  if (vueEnsemble.metriquesCles.liquidite < 50) {
    recommandations.push({
      id: 'reco-liquidite',
      type: 'recommandation',
      priorite: 'haute',
      module: 'tresorerie',
      titre: 'Optimiser la Gestion de Trésorerie',
      message: 'La liquidité est un point d\'attention. Des actions ciblées peuvent améliorer rapidement la situation.',
      impact: 'eleve',
      actions: [
        'Mettre en place un suivi quotidien de la trésorerie',
        'Négocier des délais de paiement avec les fournisseurs',
        'Accélérer le recouvrement des créances',
        'Évaluer des solutions de financement court terme'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'deterioration'
    });
  }
  
  if (vueEnsemble.metriquesCles.rentabilite < 60) {
    recommandations.push({
      id: 'reco-rentabilite',
      type: 'recommandation',
      priorite: 'moyenne',
      module: 'analyse',
      titre: 'Améliorer la Rentabilité',
      message: 'Des opportunités d\'amélioration de la rentabilité existent.',
      impact: 'moyen',
      actions: [
        'Analyser les coûts par activité',
        'Optimiser le mix produits/services',
        'Réviser la stratégie de prix',
        'Améliorer l\'efficacité opérationnelle'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'stable'
    });
  }
  
  // Recommandations spécifiques au secteur
  if (contexte.secteur === 'saas' || contexte.secteur === 'software') {
    recommandations.push({
      id: 'reco-saas',
      type: 'recommandation',
      priorite: 'moyenne',
      module: 'analyse',
      titre: 'Optimiser les Métriques SaaS',
      message: 'Pour les entreprises SaaS, surveiller le MRR, le Churn et le CAC est crucial.',
      impact: 'moyen',
      actions: [
        'Suivre le MRR (Monthly Recurring Revenue)',
        'Réduire le taux de churn',
        'Optimiser le CAC (Customer Acquisition Cost)',
        'Améliorer le LTV (Lifetime Value)'
      ],
      dateDetection: new Date().toISOString().split('T')[0],
      tendance: 'stable'
    });
  }
  
  return recommandations;
};

/**
 * Priorise les insights par urgence et impact
 */
export const prioriserInsights = (insights: InsightConsolide[]): InsightConsolide[] => {
  return insights.sort((a, b) => {
    // Trier par priorité d'abord
    const prioriteOrder = { critique: 4, haute: 3, moyenne: 2, basse: 1 };
    const prioriteDiff = prioriteOrder[b.priorite] - prioriteOrder[a.priorite];
    if (prioriteDiff !== 0) return prioriteDiff;
    
    // Puis par impact
    const impactOrder = { eleve: 3, moyen: 2, faible: 1 };
    const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
    if (impactDiff !== 0) return impactDiff;
    
    // Puis par type (alerte > recommandation > opportunité > info)
    const typeOrder = { alerte: 4, recommandation: 3, opportunite: 2, info: 1 };
    return typeOrder[b.type] - typeOrder[a.type];
  });
};

