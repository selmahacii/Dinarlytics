/**
 * Utilitaires pour la gestion avancée des clients
 * Segmentation, analyse de valeur client (CLV), CRM, prévisions
 */

export interface SegmentClient {
  id: string;
  nom: string;
  description: string;
  criteres: {
    caMin?: number;
    caMax?: number;
    nombreFacturesMin?: number;
    dsoMax?: number;
    margeMin?: number;
    frequenceAchatMin?: number; // Nombre d'achats par an
  };
  couleur: string;
  priorite: 'faible' | 'moyenne' | 'haute' | 'critique';
}

export interface AnalyseValeurClient {
  clientId: string;
  clientNom: string;
  clv: number; // Customer Lifetime Value
  cac: number; // Customer Acquisition Cost
  ratioClvCac: number;
  margeCumulee: number;
  nombreCommandes: number;
  panierMoyen: number;
  frequenceAchat: number; // Achats par an
  dernierAchat: string;
  segment: string;
  scoreValeur: number; // 0-100
  tendance: 'croissance' | 'stabilite' | 'declin';
  recommandations: string[];
}

export interface PrevisionRevenusClient {
  clientId: string;
  clientNom: string;
  periode: string; // Format: "2025-01"
  revenusPrevu: number;
  probabilite: number; // 0-100
  facteurs: {
    historique: number;
    saisonnalite: number;
    tendance: number;
    activite: number;
  };
  confiance: 'haute' | 'moyenne' | 'basse';
}

export interface InteractionCRM {
  id: string;
  clientId: string;
  type: 'appel' | 'email' | 'reunion' | 'proposition' | 'relance' | 'suivi';
  date: string;
  sujet: string;
  description: string;
  resultat?: 'positif' | 'neutre' | 'negatif';
  prochaineAction?: string;
  dateProchaineAction?: string;
  responsable: string;
}

/**
 * Segmente les clients selon leur valeur
 */
export const segmenterClients = (
  clients: Array<{
    id: string;
    nom: string;
    caTotal: number;
    nombreFactures: number;
    dsoMoyen: number;
    margeMoyenne: number;
    frequenceAchat: number;
  }>
): Map<string, string[]> => {
  const segments: Map<string, string[]> = new Map();
  
  // Définir les segments
  const definitionsSegments: SegmentClient[] = [
    {
      id: 'vip',
      nom: 'Clients VIP',
      description: 'Clients à très haute valeur',
      criteres: {
        caMin: 5000000,
        margeMin: 20,
        frequenceAchatMin: 12
      },
      couleur: 'purple',
      priorite: 'critique'
    },
    {
      id: 'strategique',
      nom: 'Clients Stratégiques',
      description: 'Clients importants avec croissance',
      criteres: {
        caMin: 2000000,
        caMax: 5000000,
        margeMin: 15,
        frequenceAchatMin: 6
      },
      couleur: 'blue',
      priorite: 'haute'
    },
    {
      id: 'reguliers',
      nom: 'Clients Réguliers',
      description: 'Clients fidèles avec CA stable',
      criteres: {
        caMin: 500000,
        caMax: 2000000,
        frequenceAchatMin: 4
      },
      couleur: 'green',
      priorite: 'moyenne'
    },
    {
      id: 'occasionnels',
      nom: 'Clients Occasionnels',
      description: 'Clients avec faible fréquence',
      criteres: {
        caMax: 500000,
        frequenceAchatMin: 0,
        frequenceAchatMax: 3
      },
      couleur: 'yellow',
      priorite: 'faible'
    },
    {
      id: 'a_risque',
      nom: 'Clients à Risque',
      description: 'Clients avec DSO élevé ou marge faible',
      criteres: {
        dsoMax: 90,
        margeMax: 10
      },
      couleur: 'red',
      priorite: 'haute'
    }
  ];
  
  clients.forEach(client => {
    // Vérifier chaque segment
    for (const segment of definitionsSegments) {
      const criteres = segment.criteres;
      let correspond = true;
      
      if (criteres.caMin && client.caTotal < criteres.caMin) correspond = false;
      if (criteres.caMax && client.caTotal > criteres.caMax) correspond = false;
      if (criteres.nombreFacturesMin && client.nombreFactures < criteres.nombreFacturesMin) correspond = false;
      if (criteres.dsoMax && client.dsoMoyen > criteres.dsoMax) correspond = false;
      if (criteres.margeMin && client.margeMoyenne < criteres.margeMin) correspond = false;
      if (criteres.frequenceAchatMin && client.frequenceAchat < criteres.frequenceAchatMin) correspond = false;
      
      if (correspond) {
        if (!segments.has(segment.id)) {
          segments.set(segment.id, []);
        }
        segments.get(segment.id)!.push(client.id);
        break; // Un client ne peut être que dans un segment principal
      }
    }
  });
  
  return segments;
};

/**
 * Calcule la valeur client (CLV)
 */
export const calculerValeurClient = (
  historique: Array<{
    clientId: string;
    ca: number;
    marge: number;
    date: string;
  }>,
  periode: number = 12 // Nombre de mois pour calculer le CLV
): Map<string, AnalyseValeurClient> => {
  const analyses = new Map<string, AnalyseValeurClient>();
  const maintenant = new Date();
  
  // Grouper par client
  const donneesParClient = new Map<string, typeof historique>();
  historique.forEach(entree => {
    if (!donneesParClient.has(entree.clientId)) {
      donneesParClient.set(entree.clientId, []);
    }
    donneesParClient.get(entree.clientId)!.push(entree);
  });
  
  donneesParClient.forEach((donnees, clientId) => {
    const caTotal = donnees.reduce((sum, d) => sum + d.ca, 0);
    const margeCumulee = donnees.reduce((sum, d) => sum + (d.ca * d.marge / 100), 0);
    const nombreCommandes = donnees.length;
    const panierMoyen = caTotal / nombreCommandes;
    
    // Calculer la fréquence d'achat (achats par an)
    const dates = donnees.map(d => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime());
    const premiereDate = dates[0];
    const derniereDate = dates[dates.length - 1];
    const moisEcoules = Math.max(1, (derniereDate.getTime() - premiereDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const frequenceAchat = (nombreCommandes / moisEcoules) * 12;
    
    // Calculer le CLV (Customer Lifetime Value)
    // CLV = Marge moyenne par transaction × Fréquence d'achat × Durée de vie estimée
    const margeMoyenne = margeCumulee / nombreCommandes;
    const dureeVieEstimee = 36; // 3 ans en moyenne
    const clv = margeMoyenne * frequenceAchat * (dureeVieEstimee / 12);
    
    // Estimer le CAC (Customer Acquisition Cost)
    // Simplifié : 10% du CA total
    const cac = caTotal * 0.1;
    const ratioClvCac = clv / Math.max(1, cac);
    
    // Calculer le score de valeur (0-100)
    let score = 0;
    
    // Score basé sur le CLV (max 30 points)
    if (clv > 5000000) score += 30;
    else if (clv > 2000000) score += 25;
    else if (clv > 1000000) score += 20;
    else if (clv > 500000) score += 15;
    else score += 10;
    
    // Score basé sur le ratio CLV/CAC (max 25 points)
    if (ratioClvCac > 5) score += 25;
    else if (ratioClvCac > 3) score += 20;
    else if (ratioClvCac > 2) score += 15;
    else if (ratioClvCac > 1) score += 10;
    else score += 5;
    
    // Score basé sur la fréquence (max 20 points)
    if (frequenceAchat >= 12) score += 20;
    else if (frequenceAchat >= 6) score += 15;
    else if (frequenceAchat >= 3) score += 10;
    else score += 5;
    
    // Score basé sur le panier moyen (max 15 points)
    if (panierMoyen > 500000) score += 15;
    else if (panierMoyen > 200000) score += 12;
    else if (panierMoyen > 100000) score += 8;
    else score += 5;
    
    // Score basé sur la récence (max 10 points)
    const joursDepuisDernierAchat = Math.floor((maintenant.getTime() - derniereDate.getTime()) / (1000 * 60 * 60 * 24));
    if (joursDepuisDernierAchat <= 30) score += 10;
    else if (joursDepuisDernierAchat <= 60) score += 7;
    else if (joursDepuisDernierAchat <= 90) score += 5;
    else score += 2;
    
    // Déterminer la tendance
    let tendance: 'croissance' | 'stabilite' | 'declin' = 'stabilite';
    if (donnees.length >= 3) {
      const caRecents = donnees.slice(-3).reduce((sum, d) => sum + d.ca, 0);
      const caAnciens = donnees.slice(0, 3).reduce((sum, d) => sum + d.ca, 0);
      if (caRecents > caAnciens * 1.1) tendance = 'croissance';
      else if (caRecents < caAnciens * 0.9) tendance = 'declin';
    }
    
    // Générer des recommandations
    const recommandations: string[] = [];
    if (ratioClvCac < 2) {
      recommandations.push('Réduire le coût d\'acquisition ou augmenter la valeur client');
    }
    if (frequenceAchat < 3) {
      recommandations.push('Augmenter la fréquence d\'achat avec des offres ciblées');
    }
    if (joursDepuisDernierAchat > 90) {
      recommandations.push('Relancer le client - risque de perte');
    }
    if (panierMoyen < 100000) {
      recommandations.push('Augmenter le panier moyen avec des produits complémentaires');
    }
    if (tendance === 'declin') {
      recommandations.push('Analyser les causes de la baisse et proposer des solutions');
    }
    
    analyses.set(clientId, {
      clientId,
      clientNom: clientId, // Sera remplacé par le nom réel
      clv,
      cac,
      ratioClvCac,
      margeCumulee,
      nombreCommandes,
      panierMoyen,
      frequenceAchat,
      dernierAchat: derniereDate.toISOString().split('T')[0],
      segment: 'regulier',
      scoreValeur: score,
      tendance,
      recommandations
    });
  });
  
  return analyses;
};

/**
 * Génère des prévisions de revenus par client
 */
export const genererPrevisionsRevenusClient = (
  historique: Array<{
    clientId: string;
    ca: number;
    date: string;
  }>,
  nombreMois: number = 12
): PrevisionRevenusClient[] => {
  const previsions: PrevisionRevenusClient[] = [];
  
  // Grouper par client
  const donneesParClient = new Map<string, typeof historique>();
  historique.forEach(entree => {
    if (!donneesParClient.has(entree.clientId)) {
      donneesParClient.set(entree.clientId, []);
    }
    donneesParClient.get(entree.clientId)!.push(entree);
  });
  
  donneesParClient.forEach((donnees, clientId) => {
    // Calculer la moyenne mensuelle
    const dates = donnees.map(d => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime());
    const premiereDate = dates[0];
    const derniereDate = dates[dates.length - 1];
    const moisEcoules = Math.max(1, (derniereDate.getTime() - premiereDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const caMensuelMoyen = donnees.reduce((sum, d) => sum + d.ca, 0) / moisEcoules;
    
    // Calculer la tendance
    const caRecents = donnees.slice(-3).reduce((sum, d) => sum + d.ca, 0) / 3;
    const caAnciens = donnees.slice(0, 3).reduce((sum, d) => sum + d.ca, 0) / 3;
    const tauxCroissance = caAnciens > 0 ? ((caRecents - caAnciens) / caAnciens) * 100 : 0;
    
    // Générer les prévisions pour chaque mois
    for (let mois = 1; mois <= nombreMois; mois++) {
      const date = new Date();
      date.setMonth(date.getMonth() + mois);
      const periode = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Calculer le revenu prévu avec croissance
      const revenusPrevu = caMensuelMoyen * (1 + tauxCroissance / 100);
      
      // Calculer les facteurs
      const facteurHistorique = donnees.length >= 6 ? 90 : donnees.length >= 3 ? 70 : 50;
      const facteurSaisonnalite = 85; // À affiner selon les données
      const facteurTendance = tauxCroissance > 5 ? 90 : tauxCroissance > 0 ? 80 : 70;
      const facteurActivite = donnees.length >= 12 ? 90 : donnees.length >= 6 ? 75 : 60;
      
      // Calculer la probabilité
      const probabilite = (
        facteurHistorique * 0.3 +
        facteurSaisonnalite * 0.2 +
        facteurTendance * 0.3 +
        facteurActivite * 0.2
      );
      
      // Déterminer le niveau de confiance
      let confiance: 'haute' | 'moyenne' | 'basse' = 'moyenne';
      if (probabilite >= 80 && donnees.length >= 6) {
        confiance = 'haute';
      } else if (probabilite < 60 || donnees.length < 3) {
        confiance = 'basse';
      }
      
      previsions.push({
        clientId,
        clientNom: clientId,
        periode,
        revenusPrevu,
        probabilite,
        facteurs: {
          historique: facteurHistorique,
          saisonnalite: facteurSaisonnalite,
          tendance: facteurTendance,
          activite: facteurActivite
        },
        confiance
      });
    }
  });
  
  return previsions;
};

/**
 * Génère des interactions CRM recommandées
 */
export const genererInteractionsCRM = (
  clients: Array<{
    id: string;
    nom: string;
    dernierAchat: string;
    caTotal: number;
    scoreValeur: number;
    tendance: 'croissance' | 'stabilite' | 'declin';
  }>,
  responsable: string = 'Équipe Commerciale'
): InteractionCRM[] => {
  const interactions: InteractionCRM[] = [];
  const maintenant = new Date();
  
  clients.forEach(client => {
    const joursDepuisDernierAchat = Math.floor(
      (maintenant.getTime() - new Date(client.dernierAchat).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Interaction pour clients VIP avec déclin
    if (client.scoreValeur >= 80 && client.tendance === 'declin') {
      interactions.push({
        id: `interaction-${client.id}-1`,
        clientId: client.id,
        type: 'reunion',
        date: maintenant.toISOString().split('T')[0],
        sujet: 'Analyse de la relation - Client VIP',
        description: `Client VIP avec tendance à la baisse. Analyse nécessaire pour comprendre les causes et proposer des solutions.`,
        resultat: undefined,
        prochaineAction: 'Organiser une réunion stratégique',
        dateProchaineAction: new Date(maintenant.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        responsable
      });
    }
    
    // Interaction pour clients à risque de perte
    if (joursDepuisDernierAchat > 90 && client.caTotal > 500000) {
      interactions.push({
        id: `interaction-${client.id}-2`,
        clientId: client.id,
        type: 'relance',
        date: maintenant.toISOString().split('T')[0],
        sujet: 'Relance client - Absence d\'activité',
        description: `Aucun achat depuis ${joursDepuisDernierAchat} jours. Risque de perte du client.`,
        resultat: undefined,
        prochaineAction: 'Appel de relance et proposition commerciale',
        dateProchaineAction: maintenant.toISOString().split('T')[0],
        responsable
      });
    }
    
    // Interaction pour clients en croissance
    if (client.tendance === 'croissance' && client.scoreValeur >= 70) {
      interactions.push({
        id: `interaction-${client.id}-3`,
        clientId: client.id,
        type: 'proposition',
        date: maintenant.toISOString().split('T')[0],
        sujet: 'Proposition d\'upsell - Client en croissance',
        description: `Client en croissance. Opportunité d'augmenter la valeur avec des produits/services complémentaires.`,
        resultat: undefined,
        prochaineAction: 'Préparer une proposition commerciale ciblée',
        dateProchaineAction: new Date(maintenant.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        responsable
      });
    }
    
    // Interaction pour nouveaux clients prometteurs
    if (client.scoreValeur >= 60 && joursDepuisDernierAchat <= 30) {
      interactions.push({
        id: `interaction-${client.id}-4`,
        clientId: client.id,
        type: 'suivi',
        date: maintenant.toISOString().split('T')[0],
        sujet: 'Suivi satisfaction - Nouveau client',
        description: `Suivi de satisfaction après le premier achat pour assurer la fidélisation.`,
        resultat: undefined,
        prochaineAction: 'Enquête de satisfaction',
        dateProchaineAction: new Date(maintenant.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        responsable
      });
    }
  });
  
  return interactions.sort((a, b) => {
    // Trier par date de prochaine action
    if (a.dateProchaineAction && b.dateProchaineAction) {
      return new Date(a.dateProchaineAction).getTime() - new Date(b.dateProchaineAction).getTime();
    }
    return 0;
  });
};

/**
 * Calcule les métriques de portefeuille clients
 */
export const calculerMetriquesPortefeuille = (
  clients: Array<{
    caTotal: number;
    margeMoyenne: number;
    dsoMoyen: number;
    scoreValeur: number;
  }>
): {
  caTotal: number;
  nombreClients: number;
  caMoyen: number;
  margeMoyenne: number;
  dsoMoyen: number;
  scoreMoyen: number;
  repartitionSegments: Map<string, number>;
  concentration: number; // Pourcentage du CA représenté par les 20% meilleurs clients
} => {
  const caTotal = clients.reduce((sum, c) => sum + c.caTotal, 0);
  const nombreClients = clients.length;
  const caMoyen = caTotal / nombreClients;
  const margeMoyenne = clients.reduce((sum, c) => sum + c.margeMoyenne, 0) / nombreClients;
  const dsoMoyen = clients.reduce((sum, c) => sum + c.dsoMoyen, 0) / nombreClients;
  const scoreMoyen = clients.reduce((sum, c) => sum + c.scoreValeur, 0) / nombreClients;
  
  // Calculer la concentration (règle 80/20)
  const clientsTries = [...clients].sort((a, b) => b.caTotal - a.caTotal);
  const nombreTopClients = Math.ceil(nombreClients * 0.2);
  const caTopClients = clientsTries.slice(0, nombreTopClients).reduce((sum, c) => sum + c.caTotal, 0);
  const concentration = (caTopClients / caTotal) * 100;
  
  // Répartition par segments (simplifié)
  const repartitionSegments = new Map<string, number>();
  clients.forEach(client => {
    let segment = 'regulier';
    if (client.scoreValeur >= 80) segment = 'vip';
    else if (client.scoreValeur >= 70) segment = 'strategique';
    else if (client.scoreValeur >= 50) segment = 'regulier';
    else segment = 'occasionnel';
    
    repartitionSegments.set(segment, (repartitionSegments.get(segment) || 0) + 1);
  });
  
  return {
    caTotal,
    nombreClients,
    caMoyen,
    margeMoyenne,
    dsoMoyen,
    scoreMoyen,
    repartitionSegments,
    concentration
  };
};

