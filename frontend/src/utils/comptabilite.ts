/**
 * Utilitaires pour la gestion comptable avancée
 * Validation automatique, contrôles comptables, génération d'écritures
 */

export interface LigneEcriture {
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  lettrage?: string;
  tiers?: string;
  piece?: string;
}

export interface EcritureComptable {
  id: string;
  date: string;
  journal: string;
  numeroPiece: string;
  libelle: string;
  lignes: LigneEcriture[];
  totalDebit: number;
  totalCredit: number;
  statut: 'brouillon' | 'validee' | 'pointée' | 'lettree' | 'rejetee';
  dateValidation?: string;
  validateur?: string;
  erreurs?: ErreurValidation[];
}

export interface ErreurValidation {
  type: 'equilibre' | 'compte_inexistant' | 'compte_ferme' | 'date_invalide' | 'journal_invalide' | 'lettrage' | 'coherence';
  message: string;
  ligne?: number;
  compte?: string;
  severite: 'erreur' | 'avertissement' | 'info';
}

export interface ControleComptable {
  id: string;
  nom: string;
  description: string;
  type: 'equilibre' | 'lettrage' | 'coherence' | 'doublon' | 'date' | 'montant';
  statut: 'ok' | 'erreur' | 'avertissement';
  message?: string;
  details?: any;
}

/**
 * Valide une écriture comptable
 */
export const validerEcriture = (
  ecriture: EcritureComptable,
  comptesValides: Set<string> = new Set(),
  dateExercice?: { debut: string; fin: string }
): ErreurValidation[] => {
  const erreurs: ErreurValidation[] = [];
  
  // 1. Vérifier l'équilibre débit/crédit
  const totalDebit = ecriture.lignes.reduce((sum, ligne) => sum + ligne.debit, 0);
  const totalCredit = ecriture.lignes.reduce((sum, ligne) => sum + ligne.credit, 0);
  
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    erreurs.push({
      type: 'equilibre',
      message: `Écriture déséquilibrée : Débit (${totalDebit.toFixed(2)}) ≠ Crédit (${totalCredit.toFixed(2)})`,
      severite: 'erreur'
    });
  }
  
  // 2. Vérifier que chaque ligne a soit un débit soit un crédit (pas les deux)
  ecriture.lignes.forEach((ligne, index) => {
    if (ligne.debit > 0 && ligne.credit > 0) {
      erreurs.push({
        type: 'coherence',
        message: `Ligne ${index + 1} : Une ligne ne peut pas avoir à la fois un débit et un crédit`,
        ligne: index + 1,
        compte: ligne.compte,
        severite: 'erreur'
      });
    }
    
    if (ligne.debit === 0 && ligne.credit === 0) {
      erreurs.push({
        type: 'coherence',
        message: `Ligne ${index + 1} : Une ligne doit avoir au moins un débit ou un crédit`,
        ligne: index + 1,
        compte: ligne.compte,
        severite: 'erreur'
      });
    }
  });
  
  // 3. Vérifier l'existence des comptes
  if (comptesValides.size > 0) {
    ecriture.lignes.forEach((ligne, index) => {
      if (!comptesValides.has(ligne.compte)) {
        erreurs.push({
          type: 'compte_inexistant',
          message: `Ligne ${index + 1} : Le compte ${ligne.compte} n'existe pas dans le plan comptable`,
          ligne: index + 1,
          compte: ligne.compte,
          severite: 'erreur'
        });
      }
    });
  }
  
  // 4. Vérifier la date
  if (dateExercice) {
    const dateEcriture = new Date(ecriture.date);
    const dateDebut = new Date(dateExercice.debut);
    const dateFin = new Date(dateExercice.fin);
    
    if (dateEcriture < dateDebut || dateEcriture > dateFin) {
      erreurs.push({
        type: 'date_invalide',
        message: `La date de l'écriture (${ecriture.date}) est en dehors de l'exercice (${dateExercice.debut} - ${dateExercice.fin})`,
        severite: 'erreur'
      });
    }
  }
  
  // 5. Vérifier le journal
  const journauxValides = ['AC', 'VT', 'OD', 'BQ', 'CA', 'AN', 'BN'];
  if (!journauxValides.includes(ecriture.journal)) {
    erreurs.push({
      type: 'journal_invalide',
      message: `Le journal ${ecriture.journal} n'est pas valide`,
      severite: 'avertissement'
    });
  }
  
  // 6. Vérifier qu'il y a au moins 2 lignes
  if (ecriture.lignes.length < 2) {
    erreurs.push({
      type: 'coherence',
      message: 'Une écriture doit contenir au moins 2 lignes',
      severite: 'erreur'
    });
  }
  
  return erreurs;
};

/**
 * Effectue des contrôles comptables sur un ensemble d'écritures
 */
export const effectuerControlesComptables = (
  ecritures: EcritureComptable[],
  comptesValides: Set<string> = new Set()
): ControleComptable[] => {
  const controles: ControleComptable[] = [];
  
  // Contrôle 1 : Équilibre global
  const totalDebitGlobal = ecritures.reduce((sum, e) => sum + e.totalDebit, 0);
  const totalCreditGlobal = ecritures.reduce((sum, e) => sum + e.totalCredit, 0);
  
  controles.push({
    id: 'controle-equilibre-global',
    nom: 'Équilibre Global',
    description: 'Vérification de l\'équilibre débit/crédit de toutes les écritures',
    type: 'equilibre',
    statut: Math.abs(totalDebitGlobal - totalCreditGlobal) < 0.01 ? 'ok' : 'erreur',
    message: Math.abs(totalDebitGlobal - totalCreditGlobal) < 0.01
      ? 'Équilibre global respecté'
      : `Déséquilibre global : ${Math.abs(totalDebitGlobal - totalCreditGlobal).toFixed(2)}`,
    details: {
      totalDebit: totalDebitGlobal,
      totalCredit: totalCreditGlobal,
      ecart: Math.abs(totalDebitGlobal - totalCreditGlobal)
    }
  });
  
  // Contrôle 2 : Écritures non équilibrées
  const ecrituresNonEquilibrees = ecritures.filter(e => {
    const erreurs = validerEcriture(e, comptesValides);
    return erreurs.some(err => err.type === 'equilibre');
  });
  
  controles.push({
    id: 'controle-ecritures-equilibre',
    nom: 'Écritures Équilibrées',
    description: 'Vérification de l\'équilibre de chaque écriture',
    type: 'equilibre',
    statut: ecrituresNonEquilibrees.length === 0 ? 'ok' : 'erreur',
    message: ecrituresNonEquilibrees.length === 0
      ? 'Toutes les écritures sont équilibrées'
      : `${ecrituresNonEquilibrees.length} écriture(s) non équilibrée(s)`,
    details: {
      nombreEcritures: ecritures.length,
      nombreNonEquilibrees: ecrituresNonEquilibrees.length,
      ecritures: ecrituresNonEquilibrees.map(e => e.numeroPiece)
    }
  });
  
  // Contrôle 3 : Doublons de pièces
  const numerosPieces = ecritures.map(e => e.numeroPiece);
  const doublons = numerosPieces.filter((num, index) => numerosPieces.indexOf(num) !== index);
  
  if (doublons.length > 0) {
    controles.push({
      id: 'controle-doublons',
      nom: 'Détection de Doublons',
      description: 'Vérification des numéros de pièces en double',
      type: 'doublon',
      statut: 'avertissement',
      message: `${doublons.length} numéro(s) de pièce(s) en double détecté(s)`,
      details: {
        doublons: [...new Set(doublons)]
      }
    });
  }
  
  // Contrôle 4 : Lettrage
  const ecrituresLettrees = ecritures.filter(e => 
    e.lignes.some(l => l.lettrage && l.lettrage.trim() !== '')
  );
  
  controles.push({
    id: 'controle-lettrage',
    nom: 'Lettrage',
    description: 'Vérification du lettrage des écritures',
    type: 'lettrage',
    statut: 'ok',
    message: `${ecrituresLettrees.length} écriture(s) lettrée(s) sur ${ecritures.length}`,
    details: {
      totalEcritures: ecritures.length,
      ecrituresLettrees: ecrituresLettrees.length
    }
  });
  
  return controles;
};

/**
 * Génère automatiquement une écriture d'amortissement
 */
export const genererEcritureAmortissement = (
  compteImmobilisation: string,
  compteAmortissement: string,
  montant: number,
  date: string,
  libelle: string = 'Amortissement'
): EcritureComptable => {
  return {
    id: `amort-${Date.now()}`,
    date,
    journal: 'OD',
    numeroPiece: `AMORT-${date}`,
    libelle: `${libelle} - ${date}`,
    lignes: [
      {
        compte: '6811', // Dotations aux amortissements
        libelle: `Amortissement ${libelle}`,
        debit: montant,
        credit: 0
      },
      {
        compte: compteAmortissement,
        libelle: `Amortissement cumulé ${libelle}`,
        debit: 0,
        credit: montant
      }
    ],
    totalDebit: montant,
    totalCredit: montant,
    statut: 'brouillon'
  };
};

/**
 * Génère automatiquement une écriture de provision
 */
export const genererEcritureProvision = (
  compteCharge: string,
  compteProvision: string,
  montant: number,
  date: string,
  libelle: string = 'Provision'
): EcritureComptable => {
  return {
    id: `prov-${Date.now()}`,
    date,
    journal: 'OD',
    numeroPiece: `PROV-${date}`,
    libelle: `${libelle} - ${date}`,
    lignes: [
      {
        compte: compteCharge, // Ex: 6815 - Provisions pour risques et charges
        libelle: `Provision ${libelle}`,
        debit: montant,
        credit: 0
      },
      {
        compte: compteProvision, // Ex: 151 - Provisions pour risques et charges
        libelle: `Provision ${libelle}`,
        debit: 0,
        credit: montant
      }
    ],
    totalDebit: montant,
    totalCredit: montant,
    statut: 'brouillon'
  };
};

/**
 * Génère automatiquement une écriture de régularisation (clôture)
 */
export const genererEcritureRegularisation = (
  compte: string,
  montant: number,
  date: string,
  type: 'charge' | 'produit'
): EcritureComptable => {
  const compteResultat = type === 'charge' ? '681' : '791';
  
  return {
    id: `regul-${Date.now()}`,
    date,
    journal: 'OD',
    numeroPiece: `REGUL-${date}`,
    libelle: `Régularisation ${type} - ${compte}`,
    lignes: [
      {
        compte: compteResultat,
        libelle: `Résultat - ${type}`,
        debit: type === 'charge' ? montant : 0,
        credit: type === 'produit' ? montant : 0
      },
      {
        compte: compte,
        libelle: `Régularisation ${type}`,
        debit: type === 'produit' ? montant : 0,
        credit: type === 'charge' ? montant : 0
      }
    ],
    totalDebit: montant,
    totalCredit: montant,
    statut: 'brouillon'
  };
};

/**
 * Valide le lettrage d'un compte
 */
export const validerLettrage = (
  ecritures: EcritureComptable[],
  compte: string
): { estLettre: boolean; ecart?: number; message?: string } => {
  const lignesCompte = ecritures
    .flatMap(e => e.lignes)
    .filter(l => l.compte === compte && l.lettrage);
  
  const lettres = new Set(lignesCompte.map(l => l.lettrage).filter(Boolean));
  
  for (const lettre of lettres) {
    const lignesLettre = lignesCompte.filter(l => l.lettrage === lettre);
    const totalDebit = lignesLettre.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lignesLettre.reduce((sum, l) => sum + l.credit, 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return {
        estLettre: false,
        ecart: Math.abs(totalDebit - totalCredit),
        message: `Lettrage ${lettre} non équilibré : écart de ${Math.abs(totalDebit - totalCredit).toFixed(2)}`
      };
    }
  }
  
  return { estLettre: true };
};

/**
 * Suggère un compte comptable basé sur un libellé
 */
export const suggererCompte = (
  libelle: string,
  planComptable: Map<string, { nom: string; type: string }> = new Map()
): string[] => {
  const libelleLower = libelle.toLowerCase();
  const suggestions: string[] = [];
  
  // Règles de suggestion basiques
  if (libelleLower.includes('client') || libelleLower.includes('vente')) {
    suggestions.push('411', '701', '44571');
  }
  if (libelleLower.includes('fournisseur') || libelleLower.includes('achat')) {
    suggestions.push('401', '601', '44566');
  }
  if (libelleLower.includes('banque') || libelleLower.includes('chèque')) {
    suggestions.push('512', '531');
  }
  if (libelleLower.includes('caisse')) {
    suggestions.push('531', '571');
  }
  if (libelleLower.includes('salaire') || libelleLower.includes('paie')) {
    suggestions.push('641', '421', '431');
  }
  if (libelleLower.includes('tva')) {
    suggestions.push('44571', '44566', '44567');
  }
  
  // Recherche dans le plan comptable
  for (const [code, compte] of planComptable.entries()) {
    if (compte.nom.toLowerCase().includes(libelleLower) ||
        libelleLower.includes(compte.nom.toLowerCase())) {
      if (!suggestions.includes(code)) {
        suggestions.push(code);
      }
    }
  }
  
  return suggestions.slice(0, 5); // Retourner max 5 suggestions
};

