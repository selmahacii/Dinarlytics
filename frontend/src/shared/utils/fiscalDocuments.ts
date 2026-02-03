/**
 * Documents fiscaux par pays/région
 */

export type Country = 'DZ' | 'FR' | 'DE' | 'IT' | 'US' | 'EU';
export type Devise = 'DZD' | 'EUR' | 'USD';

export interface FiscalDocument {
  id: string;
  code: string;
  name: string;
  nameLocal?: string; // Nom dans la langue locale
  description: string;
  category: 'declaration' | 'attestation' | 'bilan' | 'formulaire' | 'certificat';
  frequency: 'mensuel' | 'trimestriel' | 'annuel' | 'ponctuel';
  deadline?: string; // Échéance (ex: "20 du mois suivant")
  required: boolean;
  forEntity: 'entreprise' | 'particulier' | 'both';
  fields?: FiscalDocumentField[];
  equivalent?: Partial<Record<Country, string>>; // Équivalents dans d'autres pays
}

export interface FiscalDocumentField {
  id: string;
  label: string;
  type: 'number' | 'text' | 'date' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helpText?: string; // Texte d'aide pour le champ
}

/**
 * Documents fiscaux algériens
 */
export const FISCAL_DOCUMENTS_DZ: FiscalDocument[] = [
  {
    id: 'nif-dz',
    code: 'NIF',
    name: 'Numéro d\'Identification Fiscale',
    nameLocal: 'الرقم التعريفي الضريبي',
    description: 'Identifiant fiscal unique et obligatoire attribué par la Direction Générale des Impôts (DGI) à toute personne physique ou morale exerçant une activité économique en Algérie. Le NIF est composé de 15 chiffres et doit figurer sur tous les documents fiscaux et commerciaux. Il est nécessaire pour toutes les opérations fiscales, déclarations et correspondances avec l\'administration fiscale.',
    category: 'certificat',
    frequency: 'ponctuel',
    required: true,
    forEntity: 'both',
    fields: [
      { id: 'numero', label: 'Numéro NIF (15 chiffres)', type: 'text', required: true, placeholder: 'Ex: 123456789012345' },
      { id: 'dateAttribution', label: 'Date d\'attribution', type: 'date', required: false },
      { id: 'organisme', label: 'Organisme d\'attribution', type: 'text', required: false, placeholder: 'Ex: DGI Alger Centre' },
      { id: 'statut', label: 'Statut', type: 'select', required: false, options: [
        { value: 'actif', label: 'Actif' },
        { value: 'suspendu', label: 'Suspendu' },
        { value: 'radie', label: 'Radié' }
      ]}
    ]
  },
  {
    id: 'g50-dz',
    code: 'G50',
    name: 'Déclaration mensuelle globale',
    nameLocal: 'الإقرار الشهري الشامل',
    description: 'Déclaration mensuelle obligatoire regroupant tous les impôts et taxes : TVA, IRG, IBS, TAP. Doit être déposée avant le 20 de chaque mois pour la période précédente. Permet de déclarer simultanément la TVA collectée, la TVA déductible, l\'IRG sur salaires, l\'IBS et la TAP.',
    category: 'declaration',
    frequency: 'mensuel',
    deadline: '20 du mois suivant',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'periode', label: 'Période de déclaration', type: 'date', required: true, placeholder: 'Ex: 2025-01' },
      { id: 'chiffreAffaires', label: 'Chiffre d\'affaires HT', type: 'number', required: true, placeholder: 'Montant en DZD' },
      { id: 'tvaCollectee', label: 'TVA collectée (19%)', type: 'number', required: true, placeholder: 'TVA sur ventes' },
      { id: 'tvaDeductible', label: 'TVA déductible (19%)', type: 'number', required: true, placeholder: 'TVA sur achats' },
      { id: 'tvaAVerser', label: 'TVA nette à verser', type: 'number', required: true, placeholder: 'Collectée - Déductible' },
      { id: 'irg', label: 'IRG sur salaires', type: 'number', required: false, placeholder: 'Retenues IRG' },
      { id: 'ibs', label: 'IBS (Impôt sur les Bénéfices des Sociétés)', type: 'number', required: false, placeholder: '26% du bénéfice' },
      { id: 'tap', label: 'TAP (Taxe sur l\'Activité Professionnelle)', type: 'number', required: false, placeholder: '2% du CA HT' },
      { id: 'observations', label: 'Observations', type: 'textarea', required: false, placeholder: 'Remarques ou justificatifs' }
    ],
    equivalent: {
      FR: 'CA3',
      DE: 'Umsatzsteuererklärung',
      IT: 'Dichiarazione IVA',
      US: 'Sales Tax Return',
      EU: 'VAT Return'
    }
  },
  {
    id: 'g29-dz',
    code: 'G29',
    name: 'Déclaration annuelle de résultats',
    nameLocal: 'الإقرار السنوي للنتائج',
    description: 'Déclaration fiscale annuelle obligatoire qui synthétise les résultats de l\'exercice comptable. Elle comprend le bilan, le compte de résultat et les annexes. Doit être déposée avant le 30 avril de l\'année suivant la clôture de l\'exercice. Permet de déterminer l\'IBS définitif et de régulariser les acomptes versés.',
    category: 'declaration',
    frequency: 'annuel',
    deadline: '30 avril',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'exercice', label: 'Exercice comptable', type: 'text', required: true, placeholder: 'Ex: 2024' },
      { id: 'dateCloture', label: 'Date de clôture', type: 'date', required: true },
      { id: 'chiffreAffaires', label: 'Chiffre d\'affaires HT', type: 'number', required: true, placeholder: 'CA total de l\'exercice' },
      { id: 'achats', label: 'Achats et charges', type: 'number', required: true, placeholder: 'Total des charges' },
      { id: 'resultatBrut', label: 'Résultat brut', type: 'number', required: true, placeholder: 'CA - Charges' },
      { id: 'amortissements', label: 'Amortissements', type: 'number', required: false, placeholder: 'Amortissements comptables' },
      { id: 'resultatNet', label: 'Résultat net imposable', type: 'number', required: true, placeholder: 'Résultat après amortissements' },
      { id: 'ibsAcomptes', label: 'Acomptes IBS versés', type: 'number', required: false, placeholder: 'Acomptes de l\'exercice' },
      { id: 'ibsDu', label: 'IBS dû (26%)', type: 'number', required: true, placeholder: '26% du résultat net' },
      { id: 'ibsSolde', label: 'Solde IBS à payer', type: 'number', required: true, placeholder: 'IBS dû - Acomptes' },
      { id: 'observations', label: 'Observations', type: 'textarea', required: false, placeholder: 'Remarques particulières' }
    ],
    equivalent: {
      FR: 'Liasse fiscale',
      DE: 'Steuererklärung',
      IT: 'Modello Redditi',
      US: 'Form 1120',
      EU: 'Annual Tax Return'
    }
  },
  {
    id: 'attestation-fiscale-dz',
    code: 'ATT-FISC',
    name: 'Attestation fiscale',
    nameLocal: 'شهادة ضريبية',
    description: 'Document officiel délivré par la DGI certifiant que l\'entreprise est en règle vis-à-vis de ses obligations fiscales. Cette attestation est souvent requise pour participer aux appels d\'offres, obtenir des marchés publics, ouvrir un compte bancaire professionnel ou effectuer certaines démarches administratives. Elle atteste que toutes les déclarations sont à jour et que les impôts sont payés.',
    category: 'attestation',
    frequency: 'ponctuel',
    deadline: 'Sur demande',
    required: false,
    forEntity: 'entreprise',
    fields: [
      { id: 'dateEmission', label: 'Date d\'émission', type: 'date', required: true },
      { id: 'dateExpiration', label: 'Date d\'expiration', type: 'date', required: true },
      { id: 'validite', label: 'Validité (en jours)', type: 'number', required: true, placeholder: '90' },
      { id: 'motif', label: 'Motif de la demande', type: 'select', required: false, options: [
        { value: 'marche-public', label: 'Marché public' },
        { value: 'banque', label: 'Ouverture compte bancaire' },
        { value: 'partenariat', label: 'Partenariat commercial' },
        { value: 'autre', label: 'Autre' }
      ]},
      { id: 'observations', label: 'Observations', type: 'textarea', required: false, placeholder: 'Remarques' }
    ]
  },
  {
    id: 'ais-dz',
    code: 'AIS',
    name: 'Avis d\'imposition synthétique',
    nameLocal: 'إشعار الضريبة الإجمالي',
    description: 'Document récapitulatif annuel émis par la DGI qui synthétise l\'ensemble des impôts et taxes dus et payés au cours de l\'année fiscale. L\'AIS regroupe la TVA, l\'IBS, l\'IRG, la TAP et toutes les autres obligations fiscales. Il sert de justificatif fiscal et permet de vérifier la régularité de la situation fiscale de l\'entreprise.',
    category: 'attestation',
    frequency: 'annuel',
    deadline: 'Après clôture de l\'exercice',
    required: true,
    forEntity: 'both',
    fields: [
      { id: 'annee', label: 'Année fiscale', type: 'text', required: true, placeholder: 'Ex: 2024' },
      { id: 'tvaTotale', label: 'TVA totale payée', type: 'number', required: true, placeholder: 'Somme des TVA mensuelles' },
      { id: 'ibsTotal', label: 'IBS total payé', type: 'number', required: true, placeholder: 'IBS de l\'exercice' },
      { id: 'irgTotal', label: 'IRG total payé', type: 'number', required: false, placeholder: 'IRG sur salaires' },
      { id: 'tapTotal', label: 'TAP total payé', type: 'number', required: false, placeholder: 'TAP mensuelles' },
      { id: 'montantTotal', label: 'Montant total des impôts', type: 'number', required: true, placeholder: 'Total général' },
      { id: 'dateEmission', label: 'Date d\'émission', type: 'date', required: false }
    ]
  },
  {
    id: 'bilan-dz',
    code: 'BILAN',
    name: 'Bilan comptable',
    nameLocal: 'الميزانية',
    description: 'Bilan normalisé CNC (Conseil National de la Comptabilité)',
    category: 'bilan',
    frequency: 'annuel',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'exercice', label: 'Exercice', type: 'text', required: true },
      { id: 'dateCloture', label: 'Date de clôture', type: 'date', required: true }
    ]
  }
];

/**
 * Documents fiscaux français
 */
export const FISCAL_DOCUMENTS_FR: FiscalDocument[] = [
  {
    id: 'siret-fr',
    code: 'SIRET',
    name: 'Numéro SIRET',
    description: 'Identifiant unique de l\'entreprise en France',
    category: 'certificat',
    frequency: 'ponctuel',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'numero', label: 'Numéro SIRET', type: 'text', required: true, placeholder: 'Ex: 12345678901234' }
    ]
  },
  {
    id: 'tva-fr',
    code: 'TVA',
    name: 'Numéro TVA intracommunautaire',
    description: 'Numéro TVA pour les opérations intracommunautaires',
    category: 'certificat',
    frequency: 'ponctuel',
    required: false,
    forEntity: 'entreprise',
    fields: [
      { id: 'numero', label: 'Numéro TVA', type: 'text', required: true, placeholder: 'Ex: FR12345678901' }
    ]
  },
  {
    id: 'ca3-fr',
    code: 'CA3',
    name: 'Déclaration TVA CA3',
    description: 'Déclaration mensuelle ou trimestrielle de TVA',
    category: 'declaration',
    frequency: 'mensuel',
    deadline: '24 du mois suivant',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'periode', label: 'Période', type: 'date', required: true },
      { id: 'tvaCollectee', label: 'TVA collectée', type: 'number', required: true },
      { id: 'tvaDeductible', label: 'TVA déductible', type: 'number', required: true },
      { id: 'tvaAVerser', label: 'TVA à verser', type: 'number', required: true }
    ],
    equivalent: {
      DZ: 'G50',
      DE: 'Umsatzsteuererklärung',
      IT: 'Dichiarazione IVA',
      US: 'Sales Tax Return',
      EU: 'VAT Return'
    }
  },
  {
    id: 'liasse-fiscale-fr',
    code: 'LIASSE',
    name: 'Liasse fiscale',
    description: 'Déclaration annuelle (bilan, compte de résultat, annexes)',
    category: 'declaration',
    frequency: 'annuel',
    deadline: 'Mai (selon exercice)',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'exercice', label: 'Exercice', type: 'text', required: true },
      { id: 'chiffreAffaires', label: 'Chiffre d\'affaires', type: 'number', required: true },
      { id: 'resultatNet', label: 'Résultat net', type: 'number', required: true }
    ],
    equivalent: {
      DZ: 'G29',
      DE: 'Steuererklärung',
      IT: 'Modello Redditi',
      US: 'Form 1120',
      EU: 'Annual Tax Return'
    }
  },
  {
    id: '2042-fr',
    code: '2042',
    name: 'Déclaration 2042',
    description: 'Déclaration de revenus des particuliers',
    category: 'declaration',
    frequency: 'annuel',
    deadline: 'Mai',
    required: true,
    forEntity: 'particulier',
    fields: [
      { id: 'annee', label: 'Année', type: 'text', required: true },
      { id: 'revenus', label: 'Revenus', type: 'number', required: true }
    ]
  }
];

/**
 * Documents fiscaux américains
 */
export const FISCAL_DOCUMENTS_US: FiscalDocument[] = [
  {
    id: 'ein-us',
    code: 'EIN',
    name: 'Employer Identification Number',
    description: 'Numéro d\'identification fiscale pour les entreprises',
    category: 'certificat',
    frequency: 'ponctuel',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'numero', label: 'EIN', type: 'text', required: true, placeholder: 'Ex: 12-3456789' }
    ]
  },
  {
    id: 'form-1120-us',
    code: '1120',
    name: 'Form 1120 - Corporate Tax Return',
    description: 'Déclaration d\'impôt sur les sociétés (C-Corporation)',
    category: 'declaration',
    frequency: 'annuel',
    deadline: '15 mars (ou extension)',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'taxYear', label: 'Tax Year', type: 'text', required: true, placeholder: 'Ex: 2024' },
      { id: 'grossReceipts', label: 'Gross Receipts', type: 'number', required: true },
      { id: 'taxableIncome', label: 'Taxable Income', type: 'number', required: true },
      { id: 'taxDue', label: 'Tax Due', type: 'number', required: true }
    ],
    equivalent: {
      DZ: 'G29',
      FR: 'Liasse fiscale',
      DE: 'Steuererklärung',
      IT: 'Modello Redditi',
      EU: 'Annual Tax Return'
    }
  },
  {
    id: 'form-1040-us',
    code: '1040',
    name: 'Form 1040 - Individual Tax Return',
    description: 'Déclaration annuelle d\'impôt pour particuliers',
    category: 'declaration',
    frequency: 'annuel',
    deadline: '15 avril (ou extension)',
    required: true,
    forEntity: 'particulier',
    fields: [
      { id: 'taxYear', label: 'Tax Year', type: 'text', required: true },
      { id: 'wages', label: 'Wages, Salaries, Tips', type: 'number', required: true },
      { id: 'taxableIncome', label: 'Taxable Income', type: 'number', required: true },
      { id: 'taxDue', label: 'Tax Due', type: 'number', required: true }
    ]
  },
  {
    id: 'sales-tax-us',
    code: 'SALES-TAX',
    name: 'Sales Tax Return',
    description: 'Déclaration de taxe de vente (au niveau des États)',
    category: 'declaration',
    frequency: 'mensuel',
    deadline: 'Variable selon État',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'state', label: 'State', type: 'select', required: true, options: [
        { value: 'CA', label: 'California' },
        { value: 'NY', label: 'New York' },
        { value: 'TX', label: 'Texas' },
        { value: 'FL', label: 'Florida' }
      ]},
      { id: 'period', label: 'Period', type: 'date', required: true },
      { id: 'sales', label: 'Total Sales', type: 'number', required: true },
      { id: 'taxCollected', label: 'Tax Collected', type: 'number', required: true }
    ],
    equivalent: {
      DZ: 'G50',
      FR: 'CA3',
      DE: 'Umsatzsteuererklärung',
      IT: 'Dichiarazione IVA',
      EU: 'VAT Return'
    }
  },
  {
    id: 'form-941-us',
    code: '941',
    name: 'Form 941 - Payroll Tax',
    description: 'Déclaration trimestrielle des taxes sur les salaires',
    category: 'declaration',
    frequency: 'trimestriel',
    deadline: 'Fin du mois suivant le trimestre',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'quarter', label: 'Quarter', type: 'select', required: true, options: [
        { value: 'Q1', label: 'Q1 (Jan-Mar)' },
        { value: 'Q2', label: 'Q2 (Apr-Jun)' },
        { value: 'Q3', label: 'Q3 (Jul-Sep)' },
        { value: 'Q4', label: 'Q4 (Oct-Dec)' }
      ]},
      { id: 'wages', label: 'Total Wages', type: 'number', required: true },
      { id: 'federalTax', label: 'Federal Income Tax', type: 'number', required: true },
      { id: 'socialSecurity', label: 'Social Security Tax', type: 'number', required: true }
    ]
  }
];

/**
 * Documents fiscaux allemands
 */
export const FISCAL_DOCUMENTS_DE: FiscalDocument[] = [
  {
    id: 'ust-id-de',
    code: 'UST-ID',
    name: 'Umsatzsteuer-Identifikationsnummer',
    description: 'Numéro d\'identification TVA',
    category: 'certificat',
    frequency: 'ponctuel',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'numero', label: 'UST-ID', type: 'text', required: true, placeholder: 'Ex: DE123456789' }
    ]
  },
  {
    id: 'umsatzsteuer-de',
    code: 'UST',
    name: 'Umsatzsteuererklärung',
    description: 'Déclaration de TVA',
    category: 'declaration',
    frequency: 'mensuel',
    deadline: '10 du mois suivant',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'periode', label: 'Periode', type: 'date', required: true },
      { id: 'tvaCollectee', label: 'Umsatzsteuer', type: 'number', required: true },
      { id: 'tvaDeductible', label: 'Vorsteuer', type: 'number', required: true }
    ],
    equivalent: {
      DZ: 'G50',
      FR: 'CA3',
      IT: 'Dichiarazione IVA',
      US: 'Sales Tax Return',
      EU: 'VAT Return'
    }
  },
  {
    id: 'steuererklarung-de',
    code: 'STEUER',
    name: 'Steuererklärung',
    description: 'Déclaration annuelle d\'impôt',
    category: 'declaration',
    frequency: 'annuel',
    deadline: '31 mai',
    required: true,
    forEntity: 'both',
    fields: [
      { id: 'jahr', label: 'Jahr', type: 'text', required: true },
      { id: 'einkommen', label: 'Einkommen', type: 'number', required: true }
    ],
    equivalent: {
      DZ: 'G29',
      FR: 'Liasse fiscale',
      IT: 'Modello Redditi',
      US: 'Form 1120',
      EU: 'Annual Tax Return'
    }
  }
];

/**
 * Documents fiscaux italiens
 */
export const FISCAL_DOCUMENTS_IT: FiscalDocument[] = [
  {
    id: 'piva-it',
    code: 'P.IVA',
    name: 'Partita IVA',
    description: 'Numéro d\'identification TVA italien',
    category: 'certificat',
    frequency: 'ponctuel',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'numero', label: 'Partita IVA', type: 'text', required: true, placeholder: 'Ex: IT12345678901' }
    ]
  },
  {
    id: 'dichiarazione-iva-it',
    code: 'IVA',
    name: 'Dichiarazione IVA',
    description: 'Déclaration de TVA',
    category: 'declaration',
    frequency: 'trimestriel',
    deadline: 'Fin du mois suivant le trimestre',
    required: true,
    forEntity: 'entreprise',
    fields: [
      { id: 'trimestre', label: 'Trimestre', type: 'select', required: true, options: [
        { value: 'Q1', label: 'T1 (Jan-Mar)' },
        { value: 'Q2', label: 'T2 (Apr-Jun)' },
        { value: 'Q3', label: 'T3 (Jul-Sep)' },
        { value: 'Q4', label: 'T4 (Oct-Dec)' }
      ]},
      { id: 'tvaCollectee', label: 'IVA a debito', type: 'number', required: true },
      { id: 'tvaDeductible', label: 'IVA a credito', type: 'number', required: true }
    ],
    equivalent: {
      DZ: 'G50',
      FR: 'CA3',
      DE: 'Umsatzsteuererklärung',
      US: 'Sales Tax Return',
      EU: 'VAT Return'
    }
  },
  {
    id: 'modello-redditi-it',
    code: 'REDDITI',
    name: 'Modello Redditi',
    description: 'Déclaration annuelle de revenus',
    category: 'declaration',
    frequency: 'annuel',
    deadline: '30 septembre',
    required: true,
    forEntity: 'both',
    fields: [
      { id: 'anno', label: 'Anno', type: 'text', required: true },
      { id: 'reddito', label: 'Reddito', type: 'number', required: true }
    ],
    equivalent: {
      DZ: 'G29',
      FR: 'Liasse fiscale',
      DE: 'Steuererklärung',
      US: 'Form 1120',
      EU: 'Annual Tax Return'
    }
  }
];

/**
 * Obtenir les documents fiscaux selon le pays
 */
export const getFiscalDocumentsByCountry = (country: Country): FiscalDocument[] => {
  switch (country) {
    case 'DZ':
      return FISCAL_DOCUMENTS_DZ;
    case 'FR':
      return FISCAL_DOCUMENTS_FR;
    case 'DE':
      return FISCAL_DOCUMENTS_DE;
    case 'IT':
      return FISCAL_DOCUMENTS_IT;
    case 'US':
      return FISCAL_DOCUMENTS_US;
    case 'EU':
      return [...FISCAL_DOCUMENTS_FR, ...FISCAL_DOCUMENTS_DE, ...FISCAL_DOCUMENTS_IT];
    default:
      return FISCAL_DOCUMENTS_DZ;
  }
};

/**
 * Obtenir le pays depuis la devise
 */
export const getCountryFromDevise = (devise: Devise): Country => {
  switch (devise) {
    case 'DZD':
      return 'DZ';
    case 'EUR':
      return 'EU'; // Par défaut UE, peut être affiné
    case 'USD':
      return 'US';
    default:
      return 'DZ';
  }
};

/**
 * Obtenir un document fiscal par son ID
 */
export const getFiscalDocumentById = (id: string, country: Country): FiscalDocument | undefined => {
  const documents = getFiscalDocumentsByCountry(country);
  return documents.find(doc => doc.id === id);
};

/**
 * Obtenir l'équivalent d'un document dans un autre pays
 */
export const getDocumentEquivalent = (documentId: string, fromCountry: Country, toCountry: Country): string | undefined => {
  const document = getFiscalDocumentById(documentId, fromCountry);
  if (!document || !document.equivalent) return undefined;
  return document.equivalent[toCountry];
};

