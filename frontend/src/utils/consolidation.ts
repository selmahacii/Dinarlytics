/**
 * Utilitaires pour la consolidation comptable multi-entités
 * Éliminations inter-sociétés, conversion de devises, rapports consolidés
 */

export interface EntrepriseConsolidation {
  id: string;
  nom: string;
  pays: string;
  devise: string;
  tauxChange: number; // Taux de change vers devise de référence
  type: 'mere' | 'filiale' | 'participation' | 'associee';
  pourcentageDetention: number; // Pourcentage de détention (0-100)
  chiffreAffaires: number;
  benefice: number;
  actif: number;
  passif: number;
  tresorerie: number;
  statut: 'consolidated' | 'pending' | 'error';
  dateDerniereMAJ: string;
}

export interface TransactionInterSocietes {
  id: string;
  entrepriseDebit: string; // ID entreprise
  entrepriseCredit: string; // ID entreprise
  montant: number;
  devise: string;
  type: 'vente' | 'prestation' | 'location' | 'pret' | 'dividende' | 'autre';
  description: string;
  date: string;
  statut: 'a_eliminer' | 'elimine' | 'valide';
  compteDebit?: string;
  compteCredit?: string;
}

export interface Elimination {
  id: string;
  transactionId: string;
  type: 'ventes' | 'creances_dettes' | 'dividendes' | 'resultats' | 'stocks' | 'immobilisations';
  montant: number;
  devise: string;
  description: string;
  dateElimination: string;
  statut: 'propose' | 'valide' | 'rejete';
  ecritureElimination?: {
    compte: string;
    libelle: string;
    debit: number;
    credit: number;
  };
}

export interface EcartConversion {
  id: string;
  entrepriseId: string;
  compte: string;
  montantOrigine: number;
  deviseOrigine: string;
  montantConverti: number;
  deviseReference: string;
  tauxChange: number;
  ecart: number;
  date: string;
}

export interface DonneesConsolidees {
  periode: string;
  deviseReference: string;
  dateConsolidation: string;
  entreprises: EntrepriseConsolidation[];
  transactionsInterSocietes: TransactionInterSocietes[];
  eliminations: Elimination[];
  ecartsConversion: EcartConversion[];
  
  // Totaux consolidés
  totalChiffreAffaires: number;
  totalBenefice: number;
  totalActif: number;
  totalPassif: number;
  totalTresorerie: number;
  totalEliminations: number;
  totalEcartConversion: number;
  
  // Métriques
  nombreEntreprises: number;
  nombreTransactionsEliminees: number;
}

/**
 * Convertit un montant d'une devise vers la devise de référence
 */
export const convertirDevise = (
  montant: number,
  deviseOrigine: string,
  deviseReference: string,
  tauxChange: number
): number => {
  if (deviseOrigine === deviseReference) {
    return montant;
  }
  return montant * tauxChange;
};

/**
 * Calcule l'écart de conversion
 */
export const calculerEcartConversion = (
  montantOrigine: number,
  montantConverti: number
): number => {
  return montantConverti - montantOrigine;
};

/**
 * Détecte automatiquement les transactions inter-sociétés à éliminer
 */
export const detecterTransactionsInterSocietes = (
  transactions: TransactionInterSocietes[],
  entreprises: EntrepriseConsolidation[]
): TransactionInterSocietes[] => {
  // Filtrer les transactions entre entreprises du groupe
  const entreprisesIds = new Set(entreprises.map(e => e.id));
  
  return transactions.filter(transaction => {
    const estInterSocietes = 
      entreprisesIds.has(transaction.entrepriseDebit) &&
      entreprisesIds.has(transaction.entrepriseCredit) &&
      transaction.entrepriseDebit !== transaction.entrepriseCredit;
    
    return estInterSocietes && transaction.statut === 'a_eliminer';
  });
};

/**
 * Génère automatiquement les éliminations pour les transactions inter-sociétés
 */
export const genererEliminations = (
  transactions: TransactionInterSocietes[],
  deviseReference: string
): Elimination[] => {
  const eliminations: Elimination[] = [];
  
  transactions.forEach(transaction => {
    // Convertir le montant en devise de référence
    const montantConverti = convertirDevise(
      transaction.montant,
      transaction.devise,
      deviseReference,
      1 // Taux de change à récupérer depuis les données
    );
    
    let typeElimination: Elimination['type'];
    let compteDebit = '';
    let compteCredit = '';
    let libelle = '';
    
    switch (transaction.type) {
      case 'vente':
      case 'prestation':
        typeElimination = 'ventes';
        compteDebit = '701'; // Ventes
        compteCredit = '601'; // Achats
        libelle = `Élimination ventes inter-sociétés: ${transaction.description}`;
        break;
      case 'pret':
        typeElimination = 'creances_dettes';
        compteDebit = '411'; // Clients
        compteCredit = '401'; // Fournisseurs
        libelle = `Élimination créances/dettes inter-sociétés: ${transaction.description}`;
        break;
      case 'dividende':
        typeElimination = 'dividendes';
        compteDebit = '120'; // Résultat
        compteCredit = '120'; // Résultat
        libelle = `Élimination dividendes inter-sociétés: ${transaction.description}`;
        break;
      default:
        typeElimination = 'autre';
        compteDebit = '471'; // Comptes d'attente
        compteCredit = '471'; // Comptes d'attente
        libelle = `Élimination transaction inter-sociétés: ${transaction.description}`;
    }
    
    eliminations.push({
      id: `elim-${transaction.id}`,
      transactionId: transaction.id,
      type: typeElimination,
      montant: montantConverti,
      devise: deviseReference,
      description: libelle,
      dateElimination: new Date().toISOString().split('T')[0],
      statut: 'propose',
      ecritureElimination: {
        compte: compteDebit,
        libelle: libelle,
        debit: montantConverti,
        credit: montantConverti
      }
    });
  });
  
  return eliminations;
};

/**
 * Calcule les données consolidées complètes
 */
export const calculerConsolidation = (
  entreprises: EntrepriseConsolidation[],
  transactions: TransactionInterSocietes[],
  deviseReference: string,
  periode: string
): DonneesConsolidees => {
  // Convertir toutes les données en devise de référence
  const entreprisesConverties = entreprises.map(entreprise => ({
    ...entreprise,
    chiffreAffairesConverti: convertirDevise(
      entreprise.chiffreAffaires,
      entreprise.devise,
      deviseReference,
      entreprise.tauxChange
    ),
    beneficeConverti: convertirDevise(
      entreprise.benefice,
      entreprise.devise,
      deviseReference,
      entreprise.tauxChange
    ),
    actifConverti: convertirDevise(
      entreprise.actif,
      entreprise.devise,
      deviseReference,
      entreprise.tauxChange
    ),
    passifConverti: convertirDevise(
      entreprise.passif,
      entreprise.devise,
      deviseReference,
      entreprise.tauxChange
    ),
    tresorerieConvertie: convertirDevise(
      entreprise.tresorerie,
      entreprise.devise,
      deviseReference,
      entreprise.tauxChange
    )
  }));
  
  // Détecter et générer les éliminations
  const transactionsInterSocietes = detecterTransactionsInterSocietes(
    transactions,
    entreprises
  );
  const eliminations = genererEliminations(transactionsInterSocietes, deviseReference);
  
  // Calculer les totaux avant éliminations
  let totalChiffreAffaires = entreprisesConverties.reduce(
    (sum, e) => sum + (e.chiffreAffairesConverti * e.pourcentageDetention / 100),
    0
  );
  let totalBenefice = entreprisesConverties.reduce(
    (sum, e) => sum + (e.beneficeConverti * e.pourcentageDetention / 100),
    0
  );
  let totalActif = entreprisesConverties.reduce(
    (sum, e) => sum + (e.actifConverti * e.pourcentageDetention / 100),
    0
  );
  let totalPassif = entreprisesConverties.reduce(
    (sum, e) => sum + (e.passifConverti * e.pourcentageDetention / 100),
    0
  );
  let totalTresorerie = entreprisesConverties.reduce(
    (sum, e) => sum + (e.tresorerieConvertie * e.pourcentageDetention / 100),
    0
  );
  
  // Appliquer les éliminations
  const eliminationsVentes = eliminations.filter(e => e.type === 'ventes');
  const totalEliminationsVentes = eliminationsVentes.reduce(
    (sum, e) => sum + e.montant,
    0
  );
  
  totalChiffreAffaires -= totalEliminationsVentes;
  totalBenefice -= totalEliminationsVentes; // Simplification : ajuster le bénéfice
  
  const totalEliminations = eliminations.reduce((sum, e) => sum + e.montant, 0);
  
  // Calculer les écarts de conversion (simplifié)
  const ecartsConversion: EcartConversion[] = entreprisesConverties.map(entreprise => {
    const ecart = calculerEcartConversion(
      entreprise.chiffreAffaires,
      entreprise.chiffreAffairesConverti
    );
    
    return {
      id: `ecart-${entreprise.id}`,
      entrepriseId: entreprise.id,
      compte: '471', // Comptes d'attente
      montantOrigine: entreprise.chiffreAffaires,
      deviseOrigine: entreprise.devise,
      montantConverti: entreprise.chiffreAffairesConverti,
      deviseReference,
      tauxChange: entreprise.tauxChange,
      ecart,
      date: new Date().toISOString().split('T')[0]
    };
  });
  
  const totalEcartConversion = ecartsConversion.reduce((sum, e) => sum + e.ecart, 0);
  
  return {
    periode,
    deviseReference,
    dateConsolidation: new Date().toISOString().split('T')[0],
    entreprises: entreprisesConverties,
    transactionsInterSocietes,
    eliminations,
    ecartsConversion,
    totalChiffreAffaires,
    totalBenefice,
    totalActif,
    totalPassif,
    totalTresorerie,
    totalEliminations,
    totalEcartConversion,
    nombreEntreprises: entreprises.length,
    nombreTransactionsEliminees: eliminations.length
  };
};

/**
 * Génère un bilan consolidé
 */
export const genererBilanConsolide = (donnees: DonneesConsolidees) => {
  return {
    actif: {
      immobilisations: donnees.entreprises.reduce(
        (sum, e) => sum + (e.actifConverti * 0.4 * e.pourcentageDetention / 100),
        0
      ),
      stocks: donnees.entreprises.reduce(
        (sum, e) => sum + (e.actifConverti * 0.1 * e.pourcentageDetention / 100),
        0
      ),
      creances: donnees.entreprises.reduce(
        (sum, e) => sum + (e.actifConverti * 0.3 * e.pourcentageDetention / 100),
        0
      ),
      tresorerie: donnees.totalTresorerie,
      total: donnees.totalActif
    },
    passif: {
      capital: donnees.entreprises.reduce(
        (sum, e) => sum + (e.actifConverti * 0.3 * e.pourcentageDetention / 100),
        0
      ),
      dettes: donnees.totalPassif,
      resultat: donnees.totalBenefice,
      ecartConversion: donnees.totalEcartConversion,
      total: donnees.totalPassif + donnees.totalBenefice + donnees.totalEcartConversion
    }
  };
};

/**
 * Génère un compte de résultat consolidé
 */
export const genererCompteResultatConsolide = (donnees: DonneesConsolidees) => {
  const eliminationsVentes = donnees.eliminations
    .filter(e => e.type === 'ventes')
    .reduce((sum, e) => sum + e.montant, 0);
  
  return {
    chiffreAffaires: donnees.totalChiffreAffaires - eliminationsVentes,
    charges: donnees.entreprises.reduce(
      (sum, e) => sum + ((e.chiffreAffairesConverti - e.beneficeConverti) * e.pourcentageDetention / 100),
      0
    ),
    resultatAvantEliminations: donnees.totalBenefice,
    eliminations: donnees.totalEliminations,
    resultatNet: donnees.totalBenefice - eliminationsVentes
  };
};

