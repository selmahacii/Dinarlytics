/**
 * Utilitaires pour la gestion avancée des factures de vente
 * Relances automatiques, analyse de rentabilité, prévisions de recouvrement
 */

export interface RelanceAutomatique {
  id: string;
  factureId: string;
  numeroFacture: string;
  clientId: string;
  clientNom: string;
  montant: number;
  dateEcheance: string;
  joursRetard: number;
  niveauRelance: 1 | 2 | 3 | 4; // 1: Rappel, 2: 1ère relance, 3: 2ème relance, 4: Mise en demeure
  type: 'rappel' | 'relance' | 'mise_en_demeure' | 'recouvrement';
  priorite: 'faible' | 'moyenne' | 'haute' | 'critique';
  message: string;
  canaux: ('email' | 'sms' | 'telephone' | 'courrier')[];
  dateProchaineRelance?: string;
  historiqueRelances: Array<{
    date: string;
    type: string;
    canal: string;
    statut: 'envoye' | 'lu' | 'ignore';
  }>;
}

export interface AnalyseRentabiliteClient {
  clientId: string;
  clientNom: string;
  periode: string;
  caTotal: number;
  nombreFactures: number;
  factureMoyenne: number;
  dsoMoyen: number; // DSO moyen pour ce client
  tauxRecouvrement: number; // Pourcentage de factures payées à temps
  margeBrute: number;
  margeNette: number;
  rentabilite: 'excellente' | 'bonne' | 'moyenne' | 'faible' | 'negligeable';
  score: number; // 0-100
  tendance: 'amelioration' | 'deterioration' | 'stable';
  creancesEnCours: number;
  creancesEnRetard: number;
  montantEnRetard: number;
  recommandations: string[];
}

export interface PrevisionRecouvrement {
  factureId: string;
  numeroFacture: string;
  clientId: string;
  montant: number;
  dateEcheance: string;
  datePrevisionRecouvrement: string;
  probabiliteRecouvrement: number; // 0-100
  delaiPrevu: number; // Jours
  confiance: 'haute' | 'moyenne' | 'basse';
  facteurs: {
    historiqueClient: number; // Score basé sur l'historique
    delaiRetard: number; // Impact du délai de retard
    montant: number; // Impact du montant
    saisonnalite: number; // Impact de la saisonnalité
  };
}

export interface Escompte {
  id: string;
  factureId: string;
  taux: number; // Pourcentage de remise
  montantRemise: number;
  montantFinal: number;
  conditions: string[];
  dateLimite: string;
  statut: 'propose' | 'accepte' | 'refuse' | 'expire';
}

/**
 * Génère des relances automatiques intelligentes
 */
export const genererRelancesAutomatiques = (
  factures: Array<{
    id: string;
    numero: string;
    clientId: string;
    clientNom: string;
    montant: number;
    dateEcheance: string;
    statut: string;
  }>,
  historiqueRelances: Array<{
    factureId: string;
    date: string;
    type: string;
    canal: string;
    statut: string;
  }> = []
): RelanceAutomatique[] => {
  const relances: RelanceAutomatique[] = [];
  const maintenant = new Date();
  
  factures.forEach(facture => {
    if (facture.statut === 'payee') return;
    
    const dateEcheance = new Date(facture.dateEcheance);
    const joursRetard = Math.floor((maintenant.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24));
    
    if (joursRetard <= 0) return; // Pas encore en retard
    
    // Récupérer l'historique des relances pour cette facture
    const histoFacture = historiqueRelances.filter(h => h.factureId === facture.id);
    const nombreRelances = histoFacture.length;
    
    // Déterminer le niveau de relance
    let niveauRelance: 1 | 2 | 3 | 4 = 1;
    let type: 'rappel' | 'relance' | 'mise_en_demeure' | 'recouvrement' = 'rappel';
    
    if (joursRetard <= 5 && nombreRelances === 0) {
      niveauRelance = 1;
      type = 'rappel';
    } else if (joursRetard <= 15 && nombreRelances <= 1) {
      niveauRelance = 2;
      type = 'relance';
    } else if (joursRetard <= 30 && nombreRelances <= 2) {
      niveauRelance = 3;
      type = 'relance';
    } else if (joursRetard > 30) {
      niveauRelance = 4;
      type = joursRetard > 60 ? 'recouvrement' : 'mise_en_demeure';
    }
    
    // Déterminer la priorité
    let priorite: 'faible' | 'moyenne' | 'haute' | 'critique' = 'moyenne';
    if (joursRetard > 60 || facture.montant > 1000000) {
      priorite = 'critique';
    } else if (joursRetard > 30 || facture.montant > 500000) {
      priorite = 'haute';
    } else if (joursRetard > 15) {
      priorite = 'moyenne';
    } else {
      priorite = 'faible';
    }
    
    // Générer le message selon le niveau
    let message = '';
    if (niveauRelance === 1) {
      message = `Rappel : Votre facture ${facture.numero} d'un montant de ${facture.montant.toLocaleString()} DZD est arrivée à échéance depuis ${joursRetard} jour(s).`;
    } else if (niveauRelance === 2) {
      message = `1ère relance : Votre facture ${facture.numero} d'un montant de ${facture.montant.toLocaleString()} DZD est en retard de ${joursRetard} jour(s). Merci de procéder au règlement.`;
    } else if (niveauRelance === 3) {
      message = `2ème relance : Votre facture ${facture.numero} d'un montant de ${facture.montant.toLocaleString()} DZD est en retard de ${joursRetard} jour(s). Veuillez régulariser votre situation.`;
    } else {
      message = `Mise en demeure : Votre facture ${facture.numero} d'un montant de ${facture.montant.toLocaleString()} DZD est en retard de ${joursRetard} jour(s). Des mesures de recouvrement pourront être engagées.`;
    }
    
    // Déterminer les canaux selon le niveau
    const canaux: ('email' | 'sms' | 'telephone' | 'courrier')[] = [];
    if (niveauRelance === 1) {
      canaux.push('email');
    } else if (niveauRelance === 2) {
      canaux.push('email', 'sms');
    } else if (niveauRelance === 3) {
      canaux.push('email', 'sms', 'telephone');
    } else {
      canaux.push('email', 'sms', 'telephone', 'courrier');
    }
    
    // Date de la prochaine relance (si applicable)
    const dateProchaineRelance = new Date(maintenant);
    if (niveauRelance < 4) {
      dateProchaineRelance.setDate(dateProchaineRelance.getDate() + 7); // Relance dans 7 jours
    }
    
    relances.push({
      id: `relance-${facture.id}-${niveauRelance}`,
      factureId: facture.id,
      numeroFacture: facture.numero,
      clientId: facture.clientId,
      clientNom: facture.clientNom,
      montant: facture.montant,
      dateEcheance: facture.dateEcheance,
      joursRetard,
      niveauRelance,
      type,
      priorite,
      message,
      canaux,
      dateProchaineRelance: niveauRelance < 4 ? dateProchaineRelance.toISOString().split('T')[0] : undefined,
      historiqueRelances: histoFacture.map(h => ({
        date: h.date,
        type: h.type,
        canal: h.canal,
        statut: h.statut as 'envoye' | 'lu' | 'ignore'
      }))
    });
  });
  
  return relances.sort((a, b) => {
    // Trier par priorité puis par jours de retard
    const prioriteOrder = { critique: 4, haute: 3, moyenne: 2, faible: 1 };
    const prioriteDiff = prioriteOrder[b.priorite] - prioriteOrder[a.priorite];
    if (prioriteDiff !== 0) return prioriteDiff;
    return b.joursRetard - a.joursRetard;
  });
};

/**
 * Analyse la rentabilité par client
 */
export const analyserRentabiliteClient = (
  factures: Array<{
    id: string;
    clientId: string;
    clientNom: string;
    montantHT: number;
    montantTTC: number;
    date: string;
    dateEcheance: string;
    datePaiement?: string;
    statut: string;
    margeBrute: number;
  }>,
  periode: { debut: string; fin: string }
): AnalyseRentabiliteClient[] => {
  const clientsMap = new Map<string, AnalyseRentabiliteClient>();
  
  // Filtrer les factures de la période
  const facturesPeriode = factures.filter(f => {
    const dateFacture = new Date(f.date);
    const dateDebut = new Date(periode.debut);
    const dateFin = new Date(periode.fin);
    return dateFacture >= dateDebut && dateFacture <= dateFin;
  });
  
  facturesPeriode.forEach(facture => {
    if (!clientsMap.has(facture.clientId)) {
      clientsMap.set(facture.clientId, {
        clientId: facture.clientId,
        clientNom: facture.clientNom,
        periode: `${periode.debut} - ${periode.fin}`,
        caTotal: 0,
        nombreFactures: 0,
        factureMoyenne: 0,
        dsoMoyen: 0,
        tauxRecouvrement: 0,
        margeBrute: 0,
        margeNette: 0,
        rentabilite: 'moyenne',
        score: 0,
        tendance: 'stable',
        creancesEnCours: 0,
        creancesEnRetard: 0,
        montantEnRetard: 0,
        recommandations: []
      });
    }
    
    const client = clientsMap.get(facture.clientId)!;
    client.caTotal += facture.montantTTC;
    client.nombreFactures += 1;
    client.margeBrute += facture.margeBrute;
    
    // Calculer le DSO pour cette facture
    if (facture.datePaiement) {
      const dateEcheance = new Date(facture.dateEcheance);
      const datePaiement = new Date(facture.datePaiement);
      const dso = Math.floor((datePaiement.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24));
      client.dsoMoyen = (client.dsoMoyen * (client.nombreFactures - 1) + dso) / client.nombreFactures;
    } else if (facture.statut === 'payee') {
      // Facture payée mais sans date de paiement, estimer
      client.dsoMoyen = (client.dsoMoyen * (client.nombreFactures - 1) + 30) / client.nombreFactures;
    }
    
    // Calculer les créances
    if (facture.statut !== 'payee') {
      const maintenant = new Date();
      const dateEcheance = new Date(facture.dateEcheance);
      if (maintenant > dateEcheance) {
        client.creancesEnRetard += 1;
        client.montantEnRetard += facture.montantTTC;
      } else {
        client.creancesEnCours += 1;
      }
    }
  });
  
  // Finaliser les calculs pour chaque client
  const analyses: AnalyseRentabiliteClient[] = [];
  clientsMap.forEach((client, clientId) => {
    client.factureMoyenne = client.caTotal / client.nombreFactures;
    client.margeNette = client.margeBrute / client.caTotal * 100;
    
    // Calculer le taux de recouvrement
    const facturesClient = facturesPeriode.filter(f => f.clientId === clientId);
    const facturesPayees = facturesClient.filter(f => f.statut === 'payee').length;
    client.tauxRecouvrement = (facturesPayees / facturesClient.length) * 100;
    
    // Calculer le score de rentabilité (0-100)
    let score = 0;
    
    // Score basé sur le CA (max 30 points)
    if (client.caTotal > 5000000) score += 30;
    else if (client.caTotal > 2000000) score += 25;
    else if (client.caTotal > 1000000) score += 20;
    else if (client.caTotal > 500000) score += 15;
    else score += 10;
    
    // Score basé sur la marge (max 25 points)
    if (client.margeNette > 30) score += 25;
    else if (client.margeNette > 20) score += 20;
    else if (client.margeNette > 15) score += 15;
    else if (client.margeNette > 10) score += 10;
    else score += 5;
    
    // Score basé sur le DSO (max 25 points)
    if (client.dsoMoyen < 30) score += 25;
    else if (client.dsoMoyen < 45) score += 20;
    else if (client.dsoMoyen < 60) score += 15;
    else if (client.dsoMoyen < 90) score += 10;
    else score += 5;
    
    // Score basé sur le taux de recouvrement (max 20 points)
    if (client.tauxRecouvrement >= 95) score += 20;
    else if (client.tauxRecouvrement >= 85) score += 15;
    else if (client.tauxRecouvrement >= 75) score += 10;
    else score += 5;
    
    client.score = score;
    
    // Déterminer la rentabilité
    if (score >= 85) client.rentabilite = 'excellente';
    else if (score >= 70) client.rentabilite = 'bonne';
    else if (score >= 50) client.rentabilite = 'moyenne';
    else if (score >= 30) client.rentabilite = 'faible';
    else client.rentabilite = 'negligeable';
    
    // Générer des recommandations
    if (client.dsoMoyen > 60) {
      client.recommandations.push('Négocier des délais de paiement plus courts');
      client.recommandations.push('Proposer un escompte pour paiement anticipé');
    }
    if (client.margeNette < 15) {
      client.recommandations.push('Réviser la stratégie de prix pour ce client');
      client.recommandations.push('Analyser les coûts associés à ce client');
    }
    if (client.tauxRecouvrement < 80) {
      client.recommandations.push('Renforcer le suivi des paiements');
      client.recommandations.push('Mettre en place des relances automatiques');
    }
    if (client.creancesEnRetard > 0) {
      client.recommandations.push(`Urgent : ${client.creancesEnRetard} facture(s) en retard`);
    }
    
    analyses.push(client);
  });
  
  return analyses.sort((a, b) => b.score - a.score);
};

/**
 * Génère des prévisions de recouvrement
 */
export const genererPrevisionsRecouvrement = (
  factures: Array<{
    id: string;
    numero: string;
    clientId: string;
    montant: number;
    dateEcheance: string;
    statut: string;
  }>,
  historiqueClients: Array<{
    clientId: string;
    dsoMoyen: number;
    tauxPaiement: number; // Pourcentage de factures payées à temps
    nombreFactures: number;
  }> = []
): PrevisionRecouvrement[] => {
  const previsions: PrevisionRecouvrement[] = [];
  const maintenant = new Date();
  
  factures.forEach(facture => {
    if (facture.statut === 'payee') return;
    
    const dateEcheance = new Date(facture.dateEcheance);
    const joursRetard = Math.floor((maintenant.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24));
    
    // Récupérer l'historique du client
    const histoClient = historiqueClients.find(h => h.clientId === facture.clientId);
    const dsoMoyen = histoClient?.dsoMoyen || 45;
    const tauxPaiement = histoClient?.tauxPaiement || 80;
    
    // Calculer les facteurs
    const facteurHistorique = Math.min(100, tauxPaiement); // 0-100
    const facteurDelai = Math.max(0, 100 - (joursRetard * 2)); // Diminue avec le retard
    const facteurMontant = facture.montant > 1000000 ? 70 : facture.montant > 500000 ? 85 : 95; // Plus le montant est élevé, plus c'est risqué
    const facteurSaisonnalite = 90; // À affiner selon les données
    
    // Calculer la probabilité de recouvrement
    const probabilite = (
      facteurHistorique * 0.4 +
      facteurDelai * 0.3 +
      facteurMontant * 0.2 +
      facteurSaisonnalite * 0.1
    );
    
    // Calculer le délai prévu
    const delaiPrevu = Math.max(0, dsoMoyen + joursRetard);
    
    // Date prévue de recouvrement
    const datePrevision = new Date(maintenant);
    datePrevision.setDate(datePrevision.getDate() + delaiPrevu);
    
    // Déterminer le niveau de confiance
    let confiance: 'haute' | 'moyenne' | 'basse' = 'moyenne';
    if (probabilite >= 80 && histoClient && histoClient.nombreFactures >= 5) {
      confiance = 'haute';
    } else if (probabilite < 50 || joursRetard > 60) {
      confiance = 'basse';
    }
    
    previsions.push({
      factureId: facture.id,
      numeroFacture: facture.numero,
      clientId: facture.clientId,
      montant: facture.montant,
      dateEcheance: facture.dateEcheance,
      datePrevisionRecouvrement: datePrevision.toISOString().split('T')[0],
      probabiliteRecouvrement: probabilite,
      delaiPrevu,
      confiance,
      facteurs: {
        historiqueClient: facteurHistorique,
        delaiRetard: facteurDelai,
        montant: facteurMontant,
        saisonnalite: facteurSaisonnalite
      }
    });
  });
  
  return previsions.sort((a, b) => {
    // Trier par probabilité décroissante
    return b.probabiliteRecouvrement - a.probabiliteRecouvrement;
  });
};

/**
 * Calcule le DSO par client
 */
export const calculerDSOParClient = (
  factures: Array<{
    clientId: string;
    dateEcheance: string;
    datePaiement?: string;
    statut: string;
  }>
): Map<string, number> => {
  const dsoParClient = new Map<string, { total: number; count: number }>();
  
  factures.forEach(facture => {
    if (facture.statut !== 'payee' || !facture.datePaiement) return;
    
    const dateEcheance = new Date(facture.dateEcheance);
    const datePaiement = new Date(facture.datePaiement);
    const dso = Math.floor((datePaiement.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24));
    
    if (!dsoParClient.has(facture.clientId)) {
      dsoParClient.set(facture.clientId, { total: 0, count: 0 });
    }
    
    const client = dsoParClient.get(facture.clientId)!;
    client.total += dso;
    client.count += 1;
  });
  
  const result = new Map<string, number>();
  dsoParClient.forEach((value, clientId) => {
    result.set(clientId, value.total / value.count);
  });
  
  return result;
};

/**
 * Génère des propositions d'escompte
 */
export const genererPropositionsEscompte = (
  factures: Array<{
    id: string;
    numero: string;
    montant: number;
    dateEcheance: string;
    joursRetard: number;
  }>,
  tauxEscompteStandard: number = 2 // 2% pour paiement anticipé
): Escompte[] => {
  const escomptes: Escompte[] = [];
  const maintenant = new Date();
  
  factures.forEach(facture => {
    if (facture.joursRetard <= 0) return; // Pas encore en retard
    
    // Calculer le taux d'escompte selon le retard
    let taux = tauxEscompteStandard;
    if (facture.joursRetard > 30) {
      taux = 5; // 5% pour factures très en retard
    } else if (facture.joursRetard > 15) {
      taux = 3; // 3% pour factures moyennement en retard
    }
    
    const montantRemise = facture.montant * (taux / 100);
    const montantFinal = facture.montant - montantRemise;
    
    // Date limite pour accepter l'escompte (7 jours)
    const dateLimite = new Date(maintenant);
    dateLimite.setDate(dateLimite.getDate() + 7);
    
    escomptes.push({
      id: `escompte-${facture.id}`,
      factureId: facture.id,
      taux,
      montantRemise,
      montantFinal,
      conditions: [
        `Paiement dans les 7 jours`,
        `Réduction de ${taux}% appliquée`,
        `Montant final : ${montantFinal.toLocaleString()} DZD`
      ],
      dateLimite: dateLimite.toISOString().split('T')[0],
      statut: 'propose'
    });
  });
  
  return escomptes;
};

