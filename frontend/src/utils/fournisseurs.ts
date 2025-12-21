/**
 * Utilitaires pour la gestion avancée des fournisseurs
 * Analyse de performance, optimisation des coûts, gestion des achats, négociations
 */

export interface AnalysePerformanceFournisseur {
  fournisseurId: string;
  fournisseurNom: string;
  scorePerformance: number; // 0-100
  delaiLivraisonMoyen: number; // en jours
  tauxQualite: number; // 0-100
  tauxService: number; // 0-100
  nombreCommandes: number;
  montantTotal: number;
  margeNette: number; // en pourcentage
  dpoMoyen: number; // Délai de paiement moyen
  classement: 'excellent' | 'bon' | 'moyen' | 'faible' | 'critique';
  pointsForts: string[];
  pointsFaibles: string[];
  recommandations: string[];
}

export interface OptimisationCout {
  fournisseurId: string;
  fournisseurNom: string;
  coutActuel: number;
  coutOptimise: number;
  economiePotentielle: number;
  economiePourcentage: number;
  strategies: Array<{
    type: 'negociation' | 'volume' | 'paiement' | 'qualite' | 'alternatif';
    description: string;
    economie: number;
    difficulte: 'facile' | 'moyenne' | 'difficile';
  }>;
  priorite: 'haute' | 'moyenne' | 'basse';
}

export interface PrevisionAchat {
  fournisseurId: string;
  fournisseurNom: string;
  periode: string; // Format: "2025-01"
  montantPrevu: number;
  probabilite: number; // 0-100
  facteurs: {
    historique: number;
    saisonnalite: number;
    tendance: number;
    besoins: number;
  };
  confiance: 'haute' | 'moyenne' | 'basse';
}

export interface Negociation {
  id: string;
  fournisseurId: string;
  fournisseurNom: string;
  type: 'prix' | 'delai' | 'qualite' | 'volume' | 'paiement';
  objectif: string;
  valeurActuelle: number | string;
  valeurCible: number | string;
  economiePotentielle: number;
  difficulte: 'facile' | 'moyenne' | 'difficile';
  priorite: 'haute' | 'moyenne' | 'basse';
  dateLimite: string;
  statut: 'a_planifier' | 'en_cours' | 'terminee' | 'annulee';
}

export interface RisqueFournisseur {
  fournisseurId: string;
  fournisseurNom: string;
  niveauRisque: 'faible' | 'moyen' | 'eleve' | 'critique';
  scoreRisque: number; // 0-100
  facteursRisque: Array<{
    type: 'financier' | 'qualite' | 'delai' | 'concentration' | 'geographique';
    description: string;
    impact: 'faible' | 'moyen' | 'eleve';
  }>;
  recommandations: string[];
}

/**
 * Analyse la performance des fournisseurs
 */
export const analyserPerformanceFournisseur = (
  historique: Array<{
    fournisseurId: string;
    montant: number;
    delaiLivraison: number;
    qualite: number; // 0-100
    service: number; // 0-100
    date: string;
    dpo: number; // Délai de paiement en jours
  }>
): Map<string, AnalysePerformanceFournisseur> => {
  const analyses = new Map<string, AnalysePerformanceFournisseur>();
  
  // Grouper par fournisseur
  const donneesParFournisseur = new Map<string, typeof historique>();
  historique.forEach(entree => {
    if (!donneesParFournisseur.has(entree.fournisseurId)) {
      donneesParFournisseur.set(entree.fournisseurId, []);
    }
    donneesParFournisseur.get(entree.fournisseurId)!.push(entree);
  });
  
  donneesParFournisseur.forEach((donnees, fournisseurId) => {
    const nombreCommandes = donnees.length;
    const montantTotal = donnees.reduce((sum, d) => sum + d.montant, 0);
    const delaiLivraisonMoyen = donnees.reduce((sum, d) => sum + d.delaiLivraison, 0) / nombreCommandes;
    const tauxQualite = donnees.reduce((sum, d) => sum + d.qualite, 0) / nombreCommandes;
    const tauxService = donnees.reduce((sum, d) => sum + d.service, 0) / nombreCommandes;
    const dpoMoyen = donnees.reduce((sum, d) => sum + d.dpo, 0) / nombreCommandes;
    
    // Calculer le score de performance (0-100)
    let score = 0;
    
    // Score basé sur la qualité (max 30 points)
    if (tauxQualite >= 95) score += 30;
    else if (tauxQualite >= 90) score += 25;
    else if (tauxQualite >= 85) score += 20;
    else if (tauxQualite >= 80) score += 15;
    else score += 10;
    
    // Score basé sur le délai de livraison (max 25 points)
    if (delaiLivraisonMoyen <= 5) score += 25;
    else if (delaiLivraisonMoyen <= 10) score += 20;
    else if (delaiLivraisonMoyen <= 15) score += 15;
    else if (delaiLivraisonMoyen <= 20) score += 10;
    else score += 5;
    
    // Score basé sur le service (max 20 points)
    if (tauxService >= 90) score += 20;
    else if (tauxService >= 80) score += 15;
    else if (tauxService >= 70) score += 10;
    else score += 5;
    
    // Score basé sur le DPO (max 15 points) - plus le DPO est élevé, mieux c'est
    if (dpoMoyen >= 60) score += 15;
    else if (dpoMoyen >= 45) score += 12;
    else if (dpoMoyen >= 30) score += 8;
    else score += 5;
    
    // Score basé sur le volume (max 10 points)
    if (nombreCommandes >= 50) score += 10;
    else if (nombreCommandes >= 30) score += 8;
    else if (nombreCommandes >= 20) score += 6;
    else score += 4;
    
    // Déterminer le classement
    let classement: 'excellent' | 'bon' | 'moyen' | 'faible' | 'critique' = 'moyen';
    if (score >= 85) classement = 'excellent';
    else if (score >= 70) classement = 'bon';
    else if (score >= 50) classement = 'moyen';
    else if (score >= 30) classement = 'faible';
    else classement = 'critique';
    
    // Identifier les points forts et faibles
    const pointsForts: string[] = [];
    const pointsFaibles: string[] = [];
    
    if (tauxQualite >= 90) pointsForts.push('Qualité excellente');
    else if (tauxQualite < 80) pointsFaibles.push('Qualité à améliorer');
    
    if (delaiLivraisonMoyen <= 10) pointsForts.push('Livraisons rapides');
    else if (delaiLivraisonMoyen > 20) pointsFaibles.push('Délais de livraison longs');
    
    if (tauxService >= 85) pointsForts.push('Service client performant');
    else if (tauxService < 70) pointsFaibles.push('Service client à améliorer');
    
    if (dpoMoyen >= 45) pointsForts.push('Délais de paiement favorables');
    else if (dpoMoyen < 30) pointsFaibles.push('Délais de paiement courts');
    
    // Générer des recommandations
    const recommandations: string[] = [];
    if (tauxQualite < 85) {
      recommandations.push('Négocier des critères de qualité plus stricts');
    }
    if (delaiLivraisonMoyen > 15) {
      recommandations.push('Réduire les délais de livraison par contrat');
    }
    if (tauxService < 80) {
      recommandations.push('Améliorer la communication et le suivi');
    }
    if (dpoMoyen < 30) {
      recommandations.push('Négocier des délais de paiement plus longs');
    }
    if (score < 70) {
      recommandations.push('Évaluer des fournisseurs alternatifs');
    }
    
    analyses.set(fournisseurId, {
      fournisseurId,
      fournisseurNom: fournisseurId,
      scorePerformance: score,
      delaiLivraisonMoyen,
      tauxQualite,
      tauxService,
      nombreCommandes,
      montantTotal,
      margeNette: 0, // À calculer séparément
      dpoMoyen,
      classement,
      pointsForts,
      pointsFaibles,
      recommandations
    });
  });
  
  return analyses;
};

/**
 * Optimise les coûts avec les fournisseurs
 */
export const optimiserCouts = (
  fournisseurs: Array<{
    id: string;
    nom: string;
    coutActuel: number;
    nombreCommandes: number;
    delaiPaiement: number;
    qualite: number;
  }>
): OptimisationCout[] => {
  const optimisations: OptimisationCout[] = [];
  
  fournisseurs.forEach(fournisseur => {
    const strategies: OptimisationCout['strategies'] = [];
    let economieTotale = 0;
    
    // Stratégie 1: Négociation de prix (5-10% d'économie)
    const economieNegociation = fournisseur.coutActuel * 0.07;
    strategies.push({
      type: 'negociation',
      description: 'Négocier une réduction de prix de 7%',
      economie: economieNegociation,
      difficulte: 'moyenne'
    });
    economieTotale += economieNegociation;
    
    // Stratégie 2: Volume (3-5% d'économie)
    if (fournisseur.nombreCommandes >= 20) {
      const economieVolume = fournisseur.coutActuel * 0.04;
      strategies.push({
        type: 'volume',
        description: 'Augmenter les volumes pour bénéficier de remises',
        economie: economieVolume,
        difficulte: 'facile'
      });
      economieTotale += economieVolume;
    }
    
    // Stratégie 3: Paiement anticipé (2-3% d'économie)
    if (fournisseur.delaiPaiement >= 30) {
      const economiePaiement = fournisseur.coutActuel * 0.025;
      strategies.push({
        type: 'paiement',
        description: 'Paiement anticipé pour escompte',
        economie: economiePaiement,
        difficulte: 'facile'
      });
      economieTotale += economiePaiement;
    }
    
    // Stratégie 4: Amélioration qualité (réduction des retours)
    if (fournisseur.qualite < 90) {
      const economieQualite = fournisseur.coutActuel * 0.02;
      strategies.push({
        type: 'qualite',
        description: 'Améliorer la qualité pour réduire les coûts de non-qualité',
        economie: economieQualite,
        difficulte: 'moyenne'
      });
      economieTotale += economieQualite;
    }
    
    // Déterminer la priorité
    const economiePourcentage = (economieTotale / fournisseur.coutActuel) * 100;
    let priorite: 'haute' | 'moyenne' | 'basse' = 'moyenne';
    if (economiePourcentage >= 10 && fournisseur.coutActuel > 1000000) {
      priorite = 'haute';
    } else if (economiePourcentage < 5) {
      priorite = 'basse';
    }
    
    optimisations.push({
      fournisseurId: fournisseur.id,
      fournisseurNom: fournisseur.nom,
      coutActuel: fournisseur.coutActuel,
      coutOptimise: fournisseur.coutActuel - economieTotale,
      economiePotentielle: economieTotale,
      economiePourcentage,
      strategies,
      priorite
    });
  });
  
  return optimisations.sort((a, b) => b.economiePotentielle - a.economiePotentielle);
};

/**
 * Génère des prévisions d'achats
 */
export const genererPrevisionsAchats = (
  historique: Array<{
    fournisseurId: string;
    montant: number;
    date: string;
  }>,
  nombreMois: number = 6
): PrevisionAchat[] => {
  const previsions: PrevisionAchat[] = [];
  
  // Grouper par fournisseur
  const donneesParFournisseur = new Map<string, typeof historique>();
  historique.forEach(entree => {
    if (!donneesParFournisseur.has(entree.fournisseurId)) {
      donneesParFournisseur.set(entree.fournisseurId, []);
    }
    donneesParFournisseur.get(entree.fournisseurId)!.push(entree);
  });
  
  donneesParFournisseur.forEach((donnees, fournisseurId) => {
    // Calculer la moyenne mensuelle
    const dates = donnees.map(d => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime());
    const premiereDate = dates[0];
    const derniereDate = dates[dates.length - 1];
    const moisEcoules = Math.max(1, (derniereDate.getTime() - premiereDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const montantMensuelMoyen = donnees.reduce((sum, d) => sum + d.montant, 0) / moisEcoules;
    
    // Calculer la tendance
    const montantsRecents = donnees.slice(-3).reduce((sum, d) => sum + d.montant, 0) / 3;
    const montantsAnciens = donnees.slice(0, 3).reduce((sum, d) => sum + d.montant, 0) / 3;
    const tauxCroissance = montantsAnciens > 0 ? ((montantsRecents - montantsAnciens) / montantsAnciens) * 100 : 0;
    
    // Générer les prévisions pour chaque mois
    for (let mois = 1; mois <= nombreMois; mois++) {
      const date = new Date();
      date.setMonth(date.getMonth() + mois);
      const periode = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Calculer le montant prévu avec croissance
      const montantPrevu = montantMensuelMoyen * (1 + tauxCroissance / 100);
      
      // Calculer les facteurs
      const facteurHistorique = donnees.length >= 6 ? 90 : donnees.length >= 3 ? 70 : 50;
      const facteurSaisonnalite = 85;
      const facteurTendance = tauxCroissance > 5 ? 90 : tauxCroissance > 0 ? 80 : 70;
      const facteurBesoins = 80; // À affiner selon les besoins réels
      
      // Calculer la probabilité
      const probabilite = (
        facteurHistorique * 0.3 +
        facteurSaisonnalite * 0.2 +
        facteurTendance * 0.3 +
        facteurBesoins * 0.2
      );
      
      // Déterminer le niveau de confiance
      let confiance: 'haute' | 'moyenne' | 'basse' = 'moyenne';
      if (probabilite >= 80 && donnees.length >= 6) {
        confiance = 'haute';
      } else if (probabilite < 60 || donnees.length < 3) {
        confiance = 'basse';
      }
      
      previsions.push({
        fournisseurId,
        fournisseurNom: fournisseurId,
        periode,
        montantPrevu,
        probabilite,
        facteurs: {
          historique: facteurHistorique,
          saisonnalite: facteurSaisonnalite,
          tendance: facteurTendance,
          besoins: facteurBesoins
        },
        confiance
      });
    }
  });
  
  return previsions;
};

/**
 * Génère des opportunités de négociation
 */
export const genererOpportunitesNegociation = (
  fournisseurs: Array<{
    id: string;
    nom: string;
    coutActuel: number;
    nombreCommandes: number;
    delaiPaiement: number;
    qualite: number;
    delaiLivraison: number;
  }>
): Negociation[] => {
  const negociations: Negociation[] = [];
  const maintenant = new Date();
  
  fournisseurs.forEach(fournisseur => {
    // Négociation de prix
    if (fournisseur.coutActuel > 500000 && fournisseur.nombreCommandes >= 10) {
      const economie = fournisseur.coutActuel * 0.07;
      negociations.push({
        id: `neg-${fournisseur.id}-prix`,
        fournisseurId: fournisseur.id,
        fournisseurNom: fournisseur.nom,
        type: 'prix',
        objectif: 'Réduction de prix de 7%',
        valeurActuelle: fournisseur.coutActuel,
        valeurCible: fournisseur.coutActuel * 0.93,
        economiePotentielle: economie,
        difficulte: 'moyenne',
        priorite: economie > 100000 ? 'haute' : 'moyenne',
        dateLimite: new Date(maintenant.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: 'a_planifier'
      });
    }
    
    // Négociation de délai de paiement
    if (fournisseur.delaiPaiement < 45) {
      negociations.push({
        id: `neg-${fournisseur.id}-dpo`,
        fournisseurId: fournisseur.id,
        fournisseurNom: fournisseur.nom,
        type: 'paiement',
        objectif: 'Augmenter le délai de paiement à 60 jours',
        valeurActuelle: `${fournisseur.delaiPaiement} jours`,
        valeurCible: '60 jours',
        economiePotentielle: 0, // Économie de trésorerie
        difficulte: 'facile',
        priorite: 'moyenne',
        dateLimite: new Date(maintenant.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: 'a_planifier'
      });
    }
    
    // Négociation de délai de livraison
    if (fournisseur.delaiLivraison > 15) {
      negociations.push({
        id: `neg-${fournisseur.id}-delai`,
        fournisseurId: fournisseur.id,
        fournisseurNom: fournisseur.nom,
        type: 'delai',
        objectif: 'Réduire le délai de livraison à 10 jours',
        valeurActuelle: `${fournisseur.delaiLivraison} jours`,
        valeurCible: '10 jours',
        economiePotentielle: 0, // Économie de stock
        difficulte: 'moyenne',
        priorite: 'moyenne',
        dateLimite: new Date(maintenant.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: 'a_planifier'
      });
    }
    
    // Négociation de qualité
    if (fournisseur.qualite < 90) {
      negociations.push({
        id: `neg-${fournisseur.id}-qualite`,
        fournisseurId: fournisseur.id,
        fournisseurNom: fournisseur.nom,
        type: 'qualite',
        objectif: 'Améliorer la qualité à 95%',
        valeurActuelle: `${fournisseur.qualite}%`,
        valeurCible: '95%',
        economiePotentielle: fournisseur.coutActuel * 0.02, // Réduction des retours
        difficulte: 'difficile',
        priorite: 'haute',
        dateLimite: new Date(maintenant.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: 'a_planifier'
      });
    }
  });
  
  return negociations.sort((a, b) => {
    if (a.priorite === 'haute' && b.priorite !== 'haute') return -1;
    if (a.priorite !== 'haute' && b.priorite === 'haute') return 1;
    return b.economiePotentielle - a.economiePotentielle;
  });
};

/**
 * Évalue les risques des fournisseurs
 */
export const evaluerRisquesFournisseurs = (
  fournisseurs: Array<{
    id: string;
    nom: string;
    partCA: number; // Part du CA total
    delaiLivraison: number;
    qualite: number;
    localisation: string;
    nombreCommandes: number;
  }>
): RisqueFournisseur[] => {
  const risques: RisqueFournisseur[] = [];
  
  fournisseurs.forEach(fournisseur => {
    const facteursRisque: RisqueFournisseur['facteursRisque'] = [];
    let scoreRisque = 0;
    
    // Risque de concentration (dépendance)
    if (fournisseur.partCA > 30) {
      facteursRisque.push({
        type: 'concentration',
        description: `Fort dépendance (${fournisseur.partCA.toFixed(1)}% du CA)`,
        impact: 'eleve'
      });
      scoreRisque += 30;
    } else if (fournisseur.partCA > 20) {
      facteursRisque.push({
        type: 'concentration',
        description: `Dépendance modérée (${fournisseur.partCA.toFixed(1)}% du CA)`,
        impact: 'moyen'
      });
      scoreRisque += 15;
    }
    
    // Risque de qualité
    if (fournisseur.qualite < 80) {
      facteursRisque.push({
        type: 'qualite',
        description: `Qualité faible (${fournisseur.qualite}%)`,
        impact: 'eleve'
      });
      scoreRisque += 25;
    } else if (fournisseur.qualite < 85) {
      facteursRisque.push({
        type: 'qualite',
        description: `Qualité moyenne (${fournisseur.qualite}%)`,
        impact: 'moyen'
      });
      scoreRisque += 10;
    }
    
    // Risque de délai
    if (fournisseur.delaiLivraison > 20) {
      facteursRisque.push({
        type: 'delai',
        description: `Délais longs (${fournisseur.delaiLivraison} jours)`,
        impact: 'moyen'
      });
      scoreRisque += 15;
    }
    
    // Risque géographique (simplifié)
    if (fournisseur.localisation && !fournisseur.localisation.includes('Algérie')) {
      facteursRisque.push({
        type: 'geographique',
        description: `Localisation à l'étranger (${fournisseur.localisation})`,
        impact: 'moyen'
      });
      scoreRisque += 10;
    }
    
    // Déterminer le niveau de risque
    let niveauRisque: 'faible' | 'moyen' | 'eleve' | 'critique' = 'faible';
    if (scoreRisque >= 60) niveauRisque = 'critique';
    else if (scoreRisque >= 40) niveauRisque = 'eleve';
    else if (scoreRisque >= 20) niveauRisque = 'moyen';
    
    // Générer des recommandations
    const recommandations: string[] = [];
    if (fournisseur.partCA > 30) {
      recommandations.push('Diversifier les sources d\'approvisionnement');
    }
    if (fournisseur.qualite < 85) {
      recommandations.push('Mettre en place un plan d\'amélioration qualité');
    }
    if (scoreRisque >= 40) {
      recommandations.push('Identifier des fournisseurs alternatifs');
    }
    if (facteursRisque.length > 2) {
      recommandations.push('Réduire la dépendance à ce fournisseur');
    }
    
    risques.push({
      fournisseurId: fournisseur.id,
      fournisseurNom: fournisseur.nom,
      niveauRisque,
      scoreRisque,
      facteursRisque,
      recommandations
    });
  });
  
  return risques.sort((a, b) => b.scoreRisque - a.scoreRisque);
};



