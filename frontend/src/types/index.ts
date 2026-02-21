export interface Client {
  id: string;
  nom: string;
  adresse: string;
  nif: string;
  telephone: string;
  email: string;
  solde: number;
  secteur?: string;
  groupeId?: string;
  limiteCredit?: number;
  delaiPaiement?: number;
  tauxEscompte?: number;
  categorieRisque?: string;
  niveauAcces?: string;
  permissions?: {
    consultation?: boolean;
    modification?: boolean;
    suppression?: boolean;
    export?: boolean;
    analyse?: boolean;
  };
  notes?: string;
}

export interface Fournisseur {
  id: string;
  nom: string;
  adresse: string;
  nif: string;
  telephone: string;
  email: string;
  soldeDu: number;
}

export interface Article {
  id: string;
  nom: string;
  codePCA: string;
  prixUnitaire: number;
  stock: number;
  categorie: string;
  unite?: string;
  description?: string;
}

export interface Facture {
  numero: string;
  date: string;
  client?: string;
  fournisseur?: string;
  articles: FactureArticle[];
  montantHT: number;
  tva: number;
  total: number;
  statut: 'brouillon' | 'validee' | 'payee';
}

export interface FactureArticle {
  articleId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
}

export interface RatioFinancier {
  nom: string;
  valeur: number;
  unite: string;
  description: string;
  categorie: string;
  evolution: number;
  objectif: number;
  performance: number;
  couleur: 'green' | 'orange' | 'red';
  formule: string;
  interpretation: string;
  pageLiee: string;
}

// ========== NOUVELLES INTERFACES POUR SIGNATURE ET QR ==========

export interface DocumentSignature {
  id: string;
  documentType: 'facture' | 'bon-commande' | 'bon-livraison' | 'devis';
  documentId: string;
  signatureData: string; // Base64 encoded signature
  signedBy: string; // Email/ID du signataire
  signedDate: string; // ISO timestamp
  timestamp: number; // Unix timestamp (cryptographique)
  nom: string; // Nom du signataire
  role: string; // Rôle du signataire
  digest?: string; // Hash de validation (SHA-256 du document avant signature)
  metadata?: {
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface DocumentQRMetadata {
  documentType: 'facture' | 'bon-commande' | 'bon-livraison' | 'devis';
  documentId: string;
  numero: string;
  date: string;
  clientNom?: string;
  montantTotal: number;
  signatureId?: string; // Lien vers la signature
  qrVersion: string; // v1.0
}

export interface DocumentWithSignatureQR {
  id: string;
  numero: string;
  type: 'facture' | 'bon-commande' | 'bon-livraison' | 'devis';
  signatures: DocumentSignature[]; // Peut avoir plusieurs signatures (approbation en cascade)
  qrMetadata?: DocumentQRMetadata;
  qrData?: string; // Base64 SVG du QR code
}

// Étendu pour couvrir tous les rôles utilisés par le gestionnaire de permissions et l'UI
export type Role =
  | 'admin'
  | 'gerant'
  | 'dg'
  | 'daf'
  | 'commercial_director'
  | 'commercial'
  | 'hr_director'
  | 'logistics_director'
  | 'production_director'
  | 'comptable_senior'
  | 'comptable'
  | 'controleur_gestion'
  | 'magasinier'
  | 'auditeur'
  | 'tresorier'
  | 'utilisateur'
  | 'manager'
  | 'vendeur'
  | 'comptable-junior'
  | 'analyste'
  | 'invite';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: Role;
  role_display?: string;
  // Données entreprise pour gestion des accès CA
  companyType?: string;
  companyId?: string;
  companyName?: string;
  prenom?: string;
  avatar?: string;
  accessLevel?: 'starter' | 'professional' | 'enterprise';
  secteur?: string;
  adresse?: string;
  anneeCreation?: number;
  licenceCommerciale?: string;
  nif?: string;
  statut?: string;
  revenue?: number;
  employees?: number;
  segment?: string;

  lastLogin?: string;
  permissions?: string[];
}

export interface GroupeClient {
  id: string;
  nom: string;
  description: string;
  type: 'secteur' | 'taille' | 'risque' | 'geographique';
  couleur: string;
  nombreClients: number;
  chiffreAffaires: number;
  soldeMoyen: number;
}

export type Langue = 'fr' | 'ar' | 'en';
export type Devise = 'DZD' | 'EUR' | 'USD';

// Types pour les indicateurs d'équilibre financier instantané
export interface EquilibreFinancierActuel {
  fondsRoulementNet: number;
  besoinFondsRoulement: number;
  tresorerieNette: number;
  actifsCirculants: number;
  passifsCirculants: number;
  stocks: number;
  clients: number;
  fournisseurs: number;
  dateCalcul: string;
}

// Types pour les indicateurs prévisionnels
export interface EquilibreFinancierPrevisionnel {
  frnPrevisionnel: number;
  bfrPrevisionnel: number;
  tnPrevisionnelle: number;
  capaciteAutofinancement: number;
  indiceIndependanceFinanciere: number;
  scenario: 'optimiste' | 'prudent' | 'pessimiste';
  periode: string;
  facteursVariation: {
    hausseVentes: number;
    variationPrixMatierePremiere: number;
    delaiClients: number;
    delaiFournisseurs: number;
  };
}

// Types pour l'évaluation des projets
export interface EvaluationProjet {
  id: string;
  nom: string;
  description: string;
  investissementInitial: number;
  fluxTresorerie: FluxTresorerieProjet[];
  valeurActuelleNette: number;
  tauxRendementInterne: number;
  delaiRecuperation: number;
  statut: 'en_cours' | 'termine' | 'abandonne';
  dateCreation: string;
  tauxActualisation: number;
}

export interface FluxTresorerieProjet {
  periode: number;
  fluxEntree: number;
  fluxSortie: number;
  fluxNet: number;
  fluxNetActualise: number;
}

// Types pour la gestion des risques
export interface GestionRisques {
  risquesMarche: {
    volatilite: number;
    beta: number;
    var: number;
  };
  risquesLiquidite: {
    ratioLiquidite: number;
    delaiPaiement: number;
    rotationStocks: number;
  };
  risquesFinancement: {
    ratioEndettement: number;
    couvertureInterets: number;
    capaciteRemboursement: number;
  };
  risquesExploitation: {
    margeExploitation: number;
    levierOperationnel: number;
    seuilRentabilite: number;
  };
}

export interface ScenarioRisque {
  nom: string;
  type: 'optimiste' | 'prudent' | 'pessimiste';
  probabilite: number;
  impact: number;
  mesuresMitigation: string[];
}

// Types pour le coût du capital et effet de levier
export interface CoutCapital {
  wacc: number;
  coutDette: number;
  coutCapitauxPropres: number;
  structureCapital: {
    dette: number;
    capitauxPropres: number;
  };
  tauxImposition: number;
  primeRisque: number;
  tauxSansRisque: number;
}

export interface EffetLevier {
  levierFinancier: number;
  levierOperationnel: number;
  levierCombined: number;
  impactRentabilite: number;
  impactRisque: number;
}

// Types pour le système d'alerte précoce
export interface AlertePrecoce {
  id: string;
  type: 'liquidite' | 'rentabilite' | 'endettement' | 'exploitation';
  niveau: 'info' | 'attention' | 'critique';
  message: string;
  valeurActuelle: number;
  seuilAlerte: number;
  tendance: 'amelioration' | 'deterioration' | 'stable';
  dateDetection: string;
  actionsRecommandees: string[];
}

// Types pour les indicateurs de performance avancés
export interface IndicateurPerformanceAvance {
  nom: string;
  valeur: number;
  unite: string;
  evolution: number;
  tendance: 'positive' | 'negative' | 'stable';
  benchmark: number;
  interpretation: string;
  recommandations: string[];
}


export interface Employee {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  telephone: string;
  email: string;
  dateEmbauche: string;
  poste: string;
  departement: string;
  typeContrat: 'cdi' | 'cdd' | 'stage' | 'freelance';
  statut: 'actif' | 'inactif' | 'congé' | 'licencié';
  salaireBase: number;
  devise: 'DZD' | 'EUR' | 'USD';
  nif?: string;
  numeroSecuriteSociale?: string;
  numeroCNAS?: string;
  banque?: string;
  rib?: string;
  nombreEnfants: number;
  situationFamiliale: 'célibataire' | 'marié' | 'divorcé' | 'veuf';
  notes?: string;
}

export interface CotisationSociale {
  id: string;
  libelle: string;
  type: 'salariale' | 'patronale' | 'mixte';
  tauxSalarial: number; // en pourcentage
  tauxPatronal: number; // en pourcentage
  basePlafonnee: boolean;
  plafond?: number;
  codeComptable: string;
  obligatoire: boolean;
}

export interface ElementPaie {
  id: string;
  libelle: string;
  type: 'gain' | 'retenue' | 'cotisation';
  categorie: 'salaire' | 'prime' | 'avantage' | 'cotisation_sociale' | 'impot' | 'autre';
  montant: number;
  baseCalcul?: number;
  taux?: number;
  codeComptable?: string;
  ordreAffichage: number;
}

export interface BulletinPaie {
  id: string;
  numero: string;
  employeeId: string;
  employee: Employee;
  periode: string; // Format: "2025-01"
  datePaiement: string;
  dateGeneration: string;
  statut: 'brouillon' | 'validé' | 'payé' | 'annulé';

  // Période de travail
  joursTravailles: number;
  joursAbsents: number;
  heuresNormales: number;
  heuresSupplementaires: number;

  // Gains
  salaireBase: number;
  primes: number;
  montantHeuresSupplementaires: number;
  avantagesEnNature: number;
  autresGains: number;
  totalBrut: number;

  // Cotisations sociales salariales
  cotisationsSociales: {
    [key: string]: {
      libelle: string;
      base: number;
      taux: number;
      montant: number;
    };
  };
  totalCotisationsSalariales: number;

  // Cotisations patronales (pour information)
  cotisationsPatronales: {
    [key: string]: {
      libelle: string;
      base: number;
      taux: number;
      montant: number;
    };
  };
  totalCotisationsPatronales: number;

  // Impôts
  irg: number;
  autresImpot: number;
  totalImpot: number;

  // Retenues diverses
  retenuesDiverses: number;

  // Net à payer
  netAPayer: number;

  // Détails
  elementsPaie: ElementPaie[];

  // Informations complémentaires
  soldeConge: number;
  soldeCongePris: number;
  observations?: string;
}

export interface DeclarationSociale {
  id: string;
  type: 'cnas' | 'cnss' | 'assurance_chomage';
  periode: string;
  dateDeclaration: string;
  statut: 'brouillon' | 'validé' | 'transmis' | 'acquitté';
  nombreSalaries: number;
  masseSalariale: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  totalCotisations: number;
  montantVerse: number;
  dateVersement?: string;
  numeroQuittance?: string;
  details: {
    employeeId: string;
    employeeNom: string;
    salaireBrut: number;
    cotisationsSalariales: number;
    cotisationsPatronales: number;
  }[];
}

export interface ParametresPaie {
  id: string;
  nom: string;
  periodePaie: 'mensuel' | 'bimensuel' | 'hebdomadaire';
  jourPaiement: number; // Jour du mois (1-31)
  tauxCNAS: number;
  tauxCNSS: number;
  tauxAssuranceChomage: number;
  plafondCNAS: number;
  plafondCNSS: number;
  baremeIRG: {
    tranche: string;
    taux: number;
    montantMin: number;
    montantMax: number;
  }[];
  tauxHeuresSupplementaires: number;
  tauxJoursFeries: number;
  devise: 'DZD' | 'EUR' | 'USD';
  dateDebutExercice: string;
  dateFinExercice: string;
}

export interface CalculPaieResult {
  employeeId: string;
  periode: string;
  salaireBrut: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  irg: number;
  netAPayer: number;
  details: ElementPaie[];
  erreurs?: string[];
  avertissements?: string[];
}

// ========== TYPES POUR LA GESTION BUDGÉTAIRE ==========

export interface LigneBudget {
  id: string;
  code: string;
  libelle: string;
  categorie: 'ventes' | 'achats' | 'charges' | 'investissements' | 'trésorerie' | 'financement' | 'autre';
  type: 'recette' | 'depense';
  compteComptable?: string;
  centreAnalytique?: string;
  centreCout?: string; // Alias pour centreAnalytique
  projet?: string;
  montantBudget: number;
  montantReel: number;
  montantPrevisionnel?: number;
  montantEngage?: number;
  montantDisponible?: number;
  ecart: number;
  ecartPourcentage: number;
  periode: string; // Format: "2025-01" ou "2025" pour annuel
  statut: 'brouillon' | 'validé' | 'approuvé' | 'clôturé' | 'en_cours' | 'atteint' | 'depasse' | 'non_atteint';
  commentaires?: string;
  responsable?: string;
  dateCreation: string;
  dateModification: string;
}

export interface Budget {
  id: string;
  nom: string;
  description?: string;
  exercice: string; // Année: "2025"
  type: 'initial' | 'revise' | 'previsionnel';
  statut: 'brouillon' | 'en_cours' | 'validé' | 'approuvé' | 'clôturé';
  dateDebut: string;
  dateFin: string;
  dateCreation: string;
  dateValidation?: string;
  dateApprobation?: string;
  dateCloture?: string;
  creePar: string;
  validePar?: string;
  approuvePar?: string;
  lignes: LigneBudget[];
  lignesBudget: LigneBudget[]; // Alias pour lignes
  totalRecettes: number;
  totalDepenses: number;
  solde: number;
  soldeBudget: number; // Alias pour solde
  version: number;
  budgetParent?: string; // Pour les budgets révisés
  versionParent?: string; // ID du budget parent si c'est une révision
}

export interface EcartBudget {
  id: string;
  ligneBudgetId: string;
  ligneBudget: LigneBudget;
  periode: string;
  montantBudget: number;
  montantReel: number;
  ecart: number;
  ecartPourcentage: number;
  typeEcart: 'favorable' | 'defavorable' | 'neutre';
  seuilAlerte: number; // Pourcentage d'écart déclenchant une alerte
  niveauAlerte: 'info' | 'attention' | 'critique';
  analyse?: string;
  actionsCorrectives?: string[];
  dateDetection: string;
}

export interface SuiviBudget {
  budgetId: string;
  budget: Budget;
  periode: string;
  totalBudget: number;
  totalReel: number;
  totalPrevisionnel?: number;
  ecartTotal: number;
  ecartPourcentage: number;
  tauxRealisation: number; // Pourcentage de réalisation
  lignes: LigneBudget[];
  ecarts: EcartBudget[];
  tendance: 'amelioration' | 'deterioration' | 'stable';
  alertes: number;
  dateCalcul: string;
}

export interface PrevisionBudget {
  id: string;
  nom: string;
  description?: string;
  exercice: string;
  scenario: 'optimiste' | 'realiste' | 'pessimiste';
  methode: 'historique' | 'tendance' | 'regression' | 'expert';
  periode: string;
  dateCreation: string;
  lignes: {
    code: string;
    libelle: string;
    montant: number;
    confiance: number; // Pourcentage de confiance (0-100)
    facteurs: {
      nom: string;
      impact: number; // Impact en pourcentage
      probabilite: number; // Probabilité d'occurrence (0-100)
    }[];
  }[];
  totalRecettes: number;
  totalDepenses: number;
  solde: number;
  probabiliteRealisation: number; // Probabilité globale de réalisation
  commentaires?: string;
}

export interface AnalyseBudget {
  budgetId: string;
  periode: string;
  indicateurs: {
    tauxRealisation: number;
    tauxEcart: number;
    nombreEcartFavorable: number;
    nombreEcartDefavorable: number;
    montantEcartTotal: number;
    topEcart: EcartBudget[];
  };
  tendances: {
    periode: string;
    budget: number;
    reel: number;
    ecart: number;
  }[];
  recommandations: {
    type: 'optimisation' | 'correction' | 'alerte';
    priorite: 'haute' | 'moyenne' | 'basse';
    message: string;
    actions: string[];
  }[];
  dateAnalyse: string;
}

// ========== TYPES POUR LE RAPPROCHEMENT BANCAIRE ==========

export interface LigneReleveBancaire {
  id: string;
  dateOperation: string;
  dateValeur: string;
  libelle: string;
  reference?: string;
  montant: number;
  type: 'debit' | 'credit';
  solde: number;
  categorie?: string;
  numeroCheque?: string;
  iban?: string;
  bic?: string;
  statutRapprochement: 'non_rapproche' | 'rapproche' | 'en_attente' | 'dispute';
  ecritureRapprocheeId?: string;
  scoreConfiance?: number; // Pour le matching automatique (0-100)
}

export interface ReleveBancaire {
  id: string;
  compteBancaireId: string;
  compteBancaire: {
    id: string;
    nom: string;
    banque: string;
    iban: string;
    devise: 'DZD' | 'EUR' | 'USD';
  };
  numeroReleve: string;
  dateDebut: string;
  dateFin: string;
  soldeDebut: number;
  soldeFin: number;
  dateImport: string;
  formatFichier: 'csv' | 'ofx' | 'xml' | 'pdf' | 'excel' | 'manuel';
  lignes: LigneReleveBancaire[];
  statut: 'brouillon' | 'importe' | 'en_cours' | 'rapproche' | 'cloture';
  nombreLignes: number;
  nombreRapprochees: number;
  nombreNonRapprochees: number;
  tauxRapprochement: number; // Pourcentage
  dateRapprochement?: string;
  rapprochePar?: string;
}

export interface EcritureComptable {
  id: string;
  numero: string;
  date: string;
  libelle: string;
  compte: string;
  compteLibelle: string;
  montant: number;
  type: 'debit' | 'credit';
  sens: 'D' | 'C';
  journal: string;
  piece: string;
  reference?: string;
  statutRapprochement: 'non_rapproche' | 'rapproche' | 'en_attente';
  ligneReleveId?: string;
  scoreMatching?: number; // Pour le matching automatique
}

export interface RapprochementBancaire {
  id: string;
  compteBancaireId: string;
  releveBancaireId: string;
  periode: string; // Format: "2025-01"
  dateDebut: string;
  dateFin: string;
  soldeComptable: number;
  soldeBancaire: number;
  ecarts: {
    type: 'ecart_non_identifie' | 'ecart_timing' | 'ecart_montant' | 'ecart_reference';
    montant: number;
    description: string;
    ligneReleveId?: string;
    ecritureId?: string;
  }[];
  ecartTotal: number;
  statut: 'en_cours' | 'rapproche' | 'dispute' | 'cloture';
  dateRapprochement: string;
  rapprochePar: string;
  correspondances: {
    ligneReleveId: string;
    ecritureId: string;
    scoreConfiance: number;
    methodeMatching: 'montant_date' | 'reference' | 'libelle' | 'manuel';
    dateMatching: string;
  }[];
  ecrituresNonRapprochees: EcritureComptable[];
  lignesReleveNonRapprochees: LigneReleveBancaire[];
  commentaires?: string;
}

export interface RegleRapprochement {
  id: string;
  nom: string;
  description?: string;
  type: 'montant_exact' | 'montant_tolerance' | 'reference' | 'libelle_contient' | 'date_proximite' | 'combinaison';
  parametres: {
    toleranceMontant?: number; // En pourcentage ou montant fixe
    toleranceDate?: number; // En jours
    motsCles?: string[]; // Pour matching par libellé
    comptes?: string[]; // Comptes comptables concernés
  };
  priorite: number; // Ordre d'application (1 = prioritaire)
  actif: boolean;
  dateCreation: string;
  creePar: string;
}

export interface ImportReleveResult {
  success: boolean;
  releveId?: string;
  nombreLignes: number;
  nombreLignesImportees: number;
  erreurs: {
    ligne: number;
    message: string;
    donnees?: any;
  }[];
  avertissements: {
    ligne: number;
    message: string;
  }[];
  formatDetecte?: string;
}

export interface CentreAnalytique {
  id: string;
  code: string;
  libelle: string;
  type: 'service' | 'projet' | 'produit' | 'zone' | 'autre';
  responsable?: string;
  budgetAlloue: number;
  depensesReelles: number;
  ecart: number;
  statut: 'actif' | 'inactif';
  dateCreation: string;
}

export interface Reforecast {
  id: string;
  budgetId: string;
  budgetOriginal: Budget;
  nom: string;
  raison: string;
  dateCreation: string;
  creePar: string;
  statut: 'brouillon' | 'validé' | 'approuvé';
  modifications: {
    ligneId: string;
    montantInitial: number;
    montantRevise: number;
    raison: string;
  }[];
  impactTotal: number;
  version: number;
}

export interface EcartBudget {
  id: string;
  ligneBudgetId: string;
  ligneBudget: LigneBudget;
  periode: string;
  montantEcart: number;
  ecartAbsolu?: number; // Alias pour montantEcart
  pourcentageEcart: number;
  ecartRelatif?: number; // Alias pour pourcentageEcart
  typeEcart: 'favorable' | 'defavorable' | 'neutre';
  gravite?: 'mineur' | 'moyen' | 'majeur' | 'critique';
  cause?: string;
  actionCorrective?: string;
  responsable?: string;
  dateDetection: string;
  dateResolution?: string;
  statut: 'nouveau' | 'en_analyse' | 'corrige' | 'accepte' | 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
}

export interface ScenarioBudget {
  id: string;
  nom: string;
  description?: string;
  type: 'optimiste' | 'realiste' | 'pessimiste' | 'personnalise';
  probabilite: number; // 0-100
  budgetId: string;
  lignesBudget: LigneBudget[];
  totalRecettes: number;
  totalDepenses: number;
  soldeBudget: number;
  dateCreation: string;
  creePar: string;
}

export interface PrevisionFinanciere {
  id: string;
  nom: string;
  description?: string;
  periodeDebut: string;
  periodeFin: string;
  horizon: '1mois' | '3mois' | '6mois' | '12mois' | '24mois' | '36mois';
  methode: 'historique' | 'tendance' | 'regression' | 'ml' | 'manuelle';
  scenarios: ScenarioBudget[];
  scenarioSelectionne?: string;
  dateCreation: string;
  dateMiseAJour: string;
  creePar: string;
  precision?: number; // Pourcentage de précision estimé
}

export interface CentreCout {
  id: string;
  code: string;
  libelle: string;
  description?: string;
  responsable?: string;
  budgetAlloue: number;
  budgetConsomme: number;
  budgetRestant: number;
  statut: 'actif' | 'inactif' | 'cloture';
  dateCreation: string;
}

export interface ProjetBudget {
  id: string;
  nom: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  budgetTotal: number;
  budgetConsomme: number;
  budgetRestant: number;
  pourcentageAvancement: number;
  statut: 'planifie' | 'en_cours' | 'suspendu' | 'termine' | 'annule';
  lignesBudget: LigneBudget[];
}
