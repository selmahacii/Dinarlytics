/**
 * Utilitaires pour la gestion avancée de trésorerie
 * Prévisions cash flow, alertes de liquidité, scénarios de trésorerie
 */

export interface EcheanceTresorerie {
  id: string;
  date: string;
  libelle: string;
  montant: number;
  type: 'encaissement' | 'decaissement';
  categorie: 'client' | 'fournisseur' | 'salaire' | 'impot' | 'pret' | 'autre';
  statut: 'confirme' | 'probable' | 'incertain';
  compteBancaire?: string;
  tiers?: string;
  reference?: string;
}

export interface PrevisionTresorerie {
  date: string;
  soldeInitial: number;
  encaissements: number;
  decaissements: number;
  soldeFinal: number;
  confiance: 'haute' | 'moyenne' | 'basse';
  alertes?: AlerteLiquidite[];
}

export interface AlerteLiquidite {
  id: string;
  date: string;
  type: 'critique' | 'avertissement' | 'info';
  message: string;
  soldeProjete: number;
  seuilMinimum: number;
  joursAvant: number;
  recommandations: string[];
}

export interface ScenarioTresorerie {
  id: string;
  nom: string;
  description: string;
  parametres: {
    variationCA?: number; // Pourcentage
    variationDelaiClient?: number; // Jours
    variationDelaiFournisseur?: number; // Jours
    nouveauxInvestissements?: number;
    nouveauxEmprunts?: number;
    variationCharges?: number; // Pourcentage
  };
  previsions: PrevisionTresorerie[];
  soldeMinimum: number;
  joursSousSeuil: number;
  risque: 'faible' | 'moyen' | 'eleve' | 'critique';
}

/**
 * Génère des prévisions de trésorerie sur une période
 */
export const genererPrevisionsTresorerie = (
  soldeInitial: number,
  echeances: EcheanceTresorerie[],
  nombreJours: number = 90,
  dateDebut: string = new Date().toISOString().split('T')[0]
): PrevisionTresorerie[] => {
  const previsions: PrevisionTresorerie[] = [];
  const dateStart = new Date(dateDebut);
  let soldeCourant = soldeInitial;
  
  // Grouper les échéances par date
  const echeancesParDate = new Map<string, EcheanceTresorerie[]>();
  echeances.forEach(echeance => {
    const date = echeance.date;
    if (!echeancesParDate.has(date)) {
      echeancesParDate.set(date, []);
    }
    echeancesParDate.get(date)!.push(echeance);
  });
  
  for (let jour = 0; jour < nombreJours; jour++) {
    const date = new Date(dateStart);
    date.setDate(date.getDate() + jour);
    const dateStr = date.toISOString().split('T')[0];
    
    const echeancesJour = echeancesParDate.get(dateStr) || [];
    
    const encaissements = echeancesJour
      .filter(e => e.type === 'encaissement' && (e.statut === 'confirme' || e.statut === 'probable'))
      .reduce((sum, e) => sum + e.montant, 0);
    
    const decaissements = echeancesJour
      .filter(e => e.type === 'decaissement' && (e.statut === 'confirme' || e.statut === 'probable'))
      .reduce((sum, e) => sum + e.montant, 0);
    
    soldeCourant = soldeCourant + encaissements - decaissements;
    
    // Déterminer le niveau de confiance
    let confiance: 'haute' | 'moyenne' | 'basse' = 'haute';
    const echeancesIncertaines = echeancesJour.filter(e => e.statut === 'incertain').length;
    if (echeancesIncertaines > echeancesJour.length * 0.5) {
      confiance = 'basse';
    } else if (echeancesIncertaines > 0) {
      confiance = 'moyenne';
    }
    
    // Ajuster selon la distance temporelle
    if (jour > 60) confiance = 'basse';
    else if (jour > 30) confiance = jour === 31 ? confiance : 'moyenne';
    
    previsions.push({
      date: dateStr,
      soldeInitial: soldeCourant - encaissements + decaissements,
      encaissements,
      decaissements,
      soldeFinal: soldeCourant,
      confiance
    });
  }
  
  return previsions;
};

/**
 * Détecte les alertes de liquidité
 */
export const detecterAlertesLiquidite = (
  previsions: PrevisionTresorerie[],
  seuilMinimum: number = 0,
  seuilCritique: number = -100000
): AlerteLiquidite[] => {
  const alertes: AlerteLiquidite[] = [];
  const maintenant = new Date();
  
  previsions.forEach((prev, index) => {
    const datePrev = new Date(prev.date);
    const joursAvant = Math.ceil((datePrev.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24));
    
    if (prev.soldeFinal < seuilCritique) {
      alertes.push({
        id: `alerte-critique-${index}`,
        date: prev.date,
        type: 'critique',
        message: `Risque de trésorerie négative critique le ${new Date(prev.date).toLocaleDateString('fr-FR')}`,
        soldeProjete: prev.soldeFinal,
        seuilMinimum: seuilCritique,
        joursAvant,
        recommandations: [
          'Urgent : Organiser un financement court terme',
          'Négocier des délais de paiement avec les fournisseurs',
          'Accélérer le recouvrement des créances clients',
          'Réduire les dépenses non essentielles',
          'Évaluer un découvert bancaire'
        ]
      });
    } else if (prev.soldeFinal < seuilMinimum && prev.soldeFinal >= seuilCritique) {
      alertes.push({
        id: `alerte-avertissement-${index}`,
        date: prev.date,
        type: 'avertissement',
        message: `Trésorerie sous le seuil minimum le ${new Date(prev.date).toLocaleDateString('fr-FR')}`,
        soldeProjete: prev.soldeFinal,
        seuilMinimum,
        joursAvant,
        recommandations: [
          'Planifier des encaissements supplémentaires',
          'Optimiser les délais de paiement',
          'Réduire les dépenses si possible',
          'Prévoir un financement préventif'
        ]
      });
    } else if (prev.soldeFinal < seuilMinimum * 1.5 && prev.soldeFinal >= seuilMinimum) {
      alertes.push({
        id: `alerte-info-${index}`,
        date: prev.date,
        type: 'info',
        message: `Trésorerie proche du seuil minimum le ${new Date(prev.date).toLocaleDateString('fr-FR')}`,
        soldeProjete: prev.soldeFinal,
        seuilMinimum,
        joursAvant,
        recommandations: [
          'Surveiller de près la trésorerie',
          'Anticiper les besoins de financement'
        ]
      });
    }
  });
  
  return alertes.sort((a, b) => {
    // Trier par type (critique > avertissement > info) puis par jours avant
    const typeOrder = { critique: 3, avertissement: 2, info: 1 };
    const typeDiff = typeOrder[b.type] - typeOrder[a.type];
    if (typeDiff !== 0) return typeDiff;
    return a.joursAvant - b.joursAvant;
  });
};

/**
 * Simule un scénario de trésorerie
 */
export const simulerScenarioTresorerie = (
  previsionsBase: PrevisionTresorerie[],
  parametres: ScenarioTresorerie['parametres'],
  echeancesBase: EcheanceTresorerie[]
): ScenarioTresorerie['previsions'] => {
  const previsions: PrevisionTresorerie[] = [];
  
  previsionsBase.forEach((prev, index) => {
    let encaissements = prev.encaissements;
    let decaissements = prev.decaissements;
    
    // Appliquer les variations
    if (parametres.variationCA) {
      encaissements = encaissements * (1 + parametres.variationCA / 100);
    }
    
    if (parametres.variationCharges) {
      decaissements = decaissements * (1 + parametres.variationCharges / 100);
    }
    
    // Ajuster selon les délais (décaler les échéances)
    if (parametres.variationDelaiClient) {
      // Retarder les encaissements
      const facteurRetard = parametres.variationDelaiClient / 30; // Conversion jours en mois
      encaissements = encaissements * (1 - facteurRetard * 0.1); // Réduction progressive
    }
    
    if (parametres.variationDelaiFournisseur) {
      // Avancer les décaissements (négatif = retarder)
      const facteurAvance = -parametres.variationDelaiFournisseur / 30;
      decaissements = decaissements * (1 + facteurAvance * 0.1);
    }
    
    // Ajouter nouveaux investissements/emprunts
    if (parametres.nouveauxInvestissements && index === 0) {
      decaissements += parametres.nouveauxInvestissements;
    }
    
    if (parametres.nouveauxEmprunts && index === 0) {
      encaissements += parametres.nouveauxEmprunts;
    }
    
    const soldeInitial = index === 0 ? prev.soldeInitial : previsions[index - 1].soldeFinal;
    const soldeFinal = soldeInitial + encaissements - decaissements;
    
    previsions.push({
      date: prev.date,
      soldeInitial,
      encaissements,
      decaissements,
      soldeFinal,
      confiance: prev.confiance
    });
  });
  
  return previsions;
};

/**
 * Calcule les métriques de trésorerie
 */
export const calculerMetriquesTresorerie = (
  previsions: PrevisionTresorerie[],
  seuilMinimum: number = 0
): {
  soldeMinimum: number;
  soldeMaximum: number;
  soldeMoyen: number;
  joursSousSeuil: number;
  joursNegatifs: number;
  pointBas: { date: string; solde: number };
  pointHaut: { date: string; solde: number };
  volatilite: number;
} => {
  const soldes = previsions.map(p => p.soldeFinal);
  const soldeMinimum = Math.min(...soldes);
  const soldeMaximum = Math.max(...soldes);
  const soldeMoyen = soldes.reduce((sum, s) => sum + s, 0) / soldes.length;
  
  const joursSousSeuil = previsions.filter(p => p.soldeFinal < seuilMinimum).length;
  const joursNegatifs = previsions.filter(p => p.soldeFinal < 0).length;
  
  const pointBas = previsions.find(p => p.soldeFinal === soldeMinimum)!;
  const pointHaut = previsions.find(p => p.soldeFinal === soldeMaximum)!;
  
  // Calculer la volatilité (écart-type)
  const variance = soldes.reduce((sum, s) => sum + Math.pow(s - soldeMoyen, 2), 0) / soldes.length;
  const volatilite = Math.sqrt(variance);
  
  return {
    soldeMinimum,
    soldeMaximum,
    soldeMoyen,
    joursSousSeuil,
    joursNegatifs,
    pointBas: { date: pointBas.date, solde: pointBas.soldeFinal },
    pointHaut: { date: pointHaut.date, solde: pointHaut.soldeFinal },
    volatilite
  };
};

/**
 * Génère des échéances automatiques basées sur les patterns
 */
export const genererEcheancesAutomatiques = (
  donnees: {
    caMensuel: number;
    chargesMensuelles: number;
    dso: number;
    dpo: number;
    dateDebut: string;
    nombreMois: number;
  }
): EcheanceTresorerie[] => {
  const echeances: EcheanceTresorerie[] = [];
  const dateStart = new Date(donnees.dateDebut);
  
  for (let mois = 0; mois < donnees.nombreMois; mois++) {
    const dateMois = new Date(dateStart);
    dateMois.setMonth(dateMois.getMonth() + mois);
    
    // Encaissements clients (basés sur DSO)
    const dateEncaissement = new Date(dateMois);
    dateEncaissement.setDate(dateEncaissement.getDate() + donnees.dso);
    
    echeances.push({
      id: `encaissement-${mois}`,
      date: dateEncaissement.toISOString().split('T')[0],
      libelle: `Encaissement clients - Mois ${mois + 1}`,
      montant: donnees.caMensuel,
      type: 'encaissement',
      categorie: 'client',
      statut: 'probable'
    });
    
    // Décaissements fournisseurs (basés sur DPO)
    const dateDecaissement = new Date(dateMois);
    dateDecaissement.setDate(dateDecaissement.getDate() + donnees.dpo);
    
    echeances.push({
      id: `decaissement-${mois}`,
      date: dateDecaissement.toISOString().split('T')[0],
      libelle: `Paiement fournisseurs - Mois ${mois + 1}`,
      montant: donnees.chargesMensuelles * 0.6, // 60% des charges en fournisseurs
      type: 'decaissement',
      categorie: 'fournisseur',
      statut: 'confirme'
    });
    
    // Salaires (fin de mois)
    const dateSalaire = new Date(dateMois);
    dateSalaire.setMonth(dateSalaire.getMonth() + 1);
    dateSalaire.setDate(0); // Dernier jour du mois
    
    echeances.push({
      id: `salaire-${mois}`,
      date: dateSalaire.toISOString().split('T')[0],
      libelle: `Salaires - Mois ${mois + 1}`,
      montant: donnees.chargesMensuelles * 0.3, // 30% des charges en salaires
      type: 'decaissement',
      categorie: 'salaire',
      statut: 'confirme'
    });
    
    // Impôts et taxes (fin de trimestre)
    if ((mois + 1) % 3 === 0) {
      const dateImpot = new Date(dateMois);
      dateImpot.setMonth(dateImpot.getMonth() + 1);
      dateImpot.setDate(20); // 20 du mois suivant
      
      echeances.push({
        id: `impot-${mois}`,
        date: dateImpot.toISOString().split('T')[0],
        libelle: `Déclarations fiscales - Trimestre ${Math.floor((mois + 1) / 3)}`,
        montant: donnees.caMensuel * 0.05, // Estimation 5% du CA
        type: 'decaissement',
        categorie: 'impot',
        statut: 'confirme'
      });
    }
  }
  
  return echeances;
};

/**
 * Planifie les besoins de financement
 */
export const planifierFinancement = (
  previsions: PrevisionTresorerie[],
  seuilMinimum: number
): {
  besoins: Array<{
    date: string;
    montant: number;
    duree: number; // Jours
    priorite: 'critique' | 'haute' | 'moyenne';
  }>;
  totalBesoins: number;
  periodeCritique: { debut: string; fin: string; duree: number };
} => {
  const besoins: Array<{
    date: string;
    montant: number;
    duree: number;
    priorite: 'critique' | 'haute' | 'moyenne';
  }> = [];
  
  let periodeSousSeuil: { debut: string; fin: string } | null = null;
  let montantMax = 0;
  
  previsions.forEach((prev, index) => {
    if (prev.soldeFinal < seuilMinimum) {
      if (!periodeSousSeuil) {
        periodeSousSeuil = { debut: prev.date, fin: prev.date };
      } else {
        periodeSousSeuil.fin = prev.date;
      }
      
      const deficit = seuilMinimum - prev.soldeFinal;
      if (deficit > montantMax) {
        montantMax = deficit;
      }
    } else if (periodeSousSeuil) {
      // Fin de la période sous seuil
      const dateDebut = new Date(periodeSousSeuil.debut);
      const dateFin = new Date(periodeSousSeuil.fin);
      const duree = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24));
      
      besoins.push({
        date: periodeSousSeuil.debut,
        montant: montantMax,
        duree,
        priorite: montantMax > seuilMinimum * 2 ? 'critique' : montantMax > seuilMinimum ? 'haute' : 'moyenne'
      });
      
      periodeSousSeuil = null;
      montantMax = 0;
    }
  });
  
  // Gérer le cas où la période se termine à la fin des prévisions
  if (periodeSousSeuil) {
    const dateDebut = new Date(periodeSousSeuil.debut);
    const dateFin = new Date(periodeSousSeuil.fin);
    const duree = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24));
    
    besoins.push({
      date: periodeSousSeuil.debut,
      montant: montantMax,
      duree,
      priorite: montantMax > seuilMinimum * 2 ? 'critique' : montantMax > seuilMinimum ? 'haute' : 'moyenne'
    });
  }
  
  const totalBesoins = besoins.reduce((sum, b) => sum + b.montant, 0);
  const periodeCritique = periodeSousSeuil
    ? {
        debut: periodeSousSeuil.debut,
        fin: periodeSousSeuil.fin,
        duree: Math.ceil((new Date(periodeSousSeuil.fin).getTime() - new Date(periodeSousSeuil.debut).getTime()) / (1000 * 60 * 60 * 24))
      }
    : { debut: '', fin: '', duree: 0 };
  
  return {
    besoins,
    totalBesoins,
    periodeCritique
  };
};

