// Types pour le système de filtres avancés

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export type FilterOperator = 
  | 'equals'           // Égal à
  | 'not_equals'       // Différent de
  | 'contains'         // Contient
  | 'not_contains'      // Ne contient pas
  | 'starts_with'      // Commence par
  | 'ends_with'        // Se termine par
  | 'greater_than'     // Supérieur à
  | 'less_than'        // Inférieur à
  | 'greater_equal'    // Supérieur ou égal à
  | 'less_equal'       // Inférieur ou égal à
  | 'between'          // Entre
  | 'in'               // Dans la liste
  | 'not_in'           // Pas dans la liste
  | 'is_empty'         // Est vide
  | 'is_not_empty'     // N'est pas vide
  | 'date_today'       // Aujourd'hui
  | 'date_yesterday'   // Hier
  | 'date_this_week'   // Cette semaine
  | 'date_last_week'   // Semaine dernière
  | 'date_this_month'  // Ce mois
  | 'date_last_month'  // Mois dernier
  | 'date_this_year'   // Cette année
  | 'date_last_year';  // Année dernière

export interface FilterGroup {
  id: string;
  conditions: FilterCondition[];
  operator: 'AND' | 'OR';
  label?: string;
}

export interface SavedView {
  id: string;
  nom: string;
  description?: string;
  icone: string;
  couleur: string;
  filters: FilterGroup[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  columns?: string[];
  isDefault?: boolean;
  isPublic?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  tags?: string[];
}

export interface FilterField {
  id: string;
  nom: string;
  type: FilterFieldType;
  options?: FilterOption[];
  placeholder?: string;
  validation?: FilterValidation;
}

export type FilterFieldType = 
  | 'text'           // Texte libre
  | 'number'         // Nombre
  | 'date'           // Date
  | 'datetime'       // Date et heure
  | 'select'         // Liste déroulante
  | 'multiselect'    // Sélection multiple
  | 'boolean'        // Oui/Non
  | 'range'          // Plage de valeurs
  | 'autocomplete';  // Autocomplétion

export interface FilterOption {
  value: string | number;
  label: string;
  color?: string;
  icon?: string;
}

export interface FilterValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

// Champs de filtres disponibles pour les rapports
export const reportFilterFields: FilterField[] = [
  {
    id: 'nom',
    nom: 'Nom du rapport',
    type: 'text',
    placeholder: 'Rechercher par nom...'
  },
  {
    id: 'type',
    nom: 'Type de rapport',
    type: 'select',
    options: [
      { value: 'ventes', label: 'Ventes', color: 'blue', icon: '📊' },
      { value: 'financier', label: 'Financier', color: 'green', icon: '💰' },
      { value: 'inventaire', label: 'Inventaire', color: 'orange', icon: '📦' },
      { value: 'commercial', label: 'Commercial', color: 'purple', icon: '🎯' }
    ]
  },
  {
    id: 'statut',
    nom: 'Statut',
    type: 'select',
    options: [
      { value: 'actif', label: 'Actif', color: 'green', icon: '✅' },
      { value: 'brouillon', label: 'Brouillon', color: 'yellow', icon: '📝' },
      { value: 'archive', label: 'Archivé', color: 'gray', icon: '📁' }
    ]
  },
  {
    id: 'periode',
    nom: 'Période',
    type: 'date',
    validation: {
      required: true
    }
  },
  {
    id: 'auteur',
    nom: 'Auteur',
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin', color: 'blue' },
      { value: 'comptable', label: 'Comptable', color: 'green' },
      { value: 'commercial', label: 'Commercial', color: 'purple' },
      { value: 'stock', label: 'Responsable Stock', color: 'orange' }
    ]
  },
  {
    id: 'vues',
    nom: 'Nombre de vues',
    type: 'number',
    validation: {
      min: 0
    }
  },
  {
    id: 'score',
    nom: 'Score de qualité',
    type: 'range',
    validation: {
      min: 0,
      max: 100
    }
  },
  {
    id: 'tags',
    nom: 'Tags',
    type: 'multiselect',
    options: [
      { value: 'populaire', label: '🔥 Populaire', color: 'red' },
      { value: 'favori', label: '⭐ Favori', color: 'yellow' },
      { value: 'ia', label: '🤖 IA', color: 'purple' },
      { value: 'temps-reel', label: '⚡ Temps Réel', color: 'blue' },
      { value: 'comptable', label: '📊 Comptable', color: 'green' },
      { value: 'detaille', label: '🔍 Détaillé', color: 'gray' },
      { value: 'brouillon', label: '⚠️ Brouillon', color: 'orange' },
      { value: 'top', label: '🏆 Top', color: 'gold' }
    ]
  },
  {
    id: 'derniereModification',
    nom: 'Dernière modification',
    type: 'date'
  },
  {
    id: 'partages',
    nom: 'Nombre de partages',
    type: 'number',
    validation: {
      min: 0
    }
  }
];

// Vues sauvegardées par défaut
export const defaultSavedViews: SavedView[] = [
  {
    id: 'view-all',
    nom: 'Tous les rapports',
    description: 'Vue par défaut montrant tous les rapports',
    icone: '📋',
    couleur: 'blue',
    filters: [],
    sortBy: 'derniereModification',
    sortOrder: 'desc',
    isDefault: true,
    isPublic: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    usageCount: 0,
    tags: ['défaut']
  },
  {
    id: 'view-active',
    nom: 'Rapports actifs',
    description: 'Seulement les rapports actifs',
    icone: '✅',
    couleur: 'green',
    filters: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'filter-1',
            field: 'statut',
            operator: 'equals',
            value: 'actif'
          }
        ],
        operator: 'AND'
      }
    ],
    sortBy: 'nom',
    sortOrder: 'asc',
    isPublic: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    usageCount: 0,
    tags: ['actif', 'défaut']
  },
  {
    id: 'view-popular',
    nom: 'Rapports populaires',
    description: 'Rapports avec le plus de vues',
    icone: '🔥',
    couleur: 'red',
    filters: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'filter-1',
            field: 'vues',
            operator: 'greater_than',
            value: 20
          }
        ],
        operator: 'AND'
      }
    ],
    sortBy: 'vues',
    sortOrder: 'desc',
    isPublic: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    usageCount: 0,
    tags: ['populaire', 'défaut']
  },
  {
    id: 'view-recent',
    nom: 'Rapports récents',
    description: 'Rapports modifiés cette semaine',
    icone: '🕒',
    couleur: 'blue',
    filters: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'filter-1',
            field: 'derniereModification',
            operator: 'date_this_week',
            value: null
          }
        ],
        operator: 'AND'
      }
    ],
    sortBy: 'derniereModification',
    sortOrder: 'desc',
    isPublic: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    usageCount: 0,
    tags: ['récent', 'défaut']
  },
  {
    id: 'view-ai',
    nom: 'Rapports IA',
    description: 'Rapports utilisant l\'intelligence artificielle',
    icone: ' ',
    couleur: 'purple',
    filters: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'filter-1',
            field: 'tags',
            operator: 'contains',
            value: 'ia'
          }
        ],
        operator: 'AND'
      }
    ],
    sortBy: 'score',
    sortOrder: 'desc',
    isPublic: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    usageCount: 0,
    tags: ['ia', 'défaut']
  }
];

// Opérateurs disponibles selon le type de champ
export const getOperatorsForFieldType = (fieldType: FilterFieldType): FilterOperator[] => {
  switch (fieldType) {
    case 'text':
    case 'autocomplete':
      return ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'];
    
    case 'number':
    case 'range':
      return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between', 'is_empty', 'is_not_empty'];
    
    case 'date':
    case 'datetime':
      return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between', 'date_today', 'date_yesterday', 'date_this_week', 'date_last_week', 'date_this_month', 'date_last_month', 'date_this_year', 'date_last_year', 'is_empty', 'is_not_empty'];
    
    case 'select':
    case 'multiselect':
      return ['equals', 'not_equals', 'in', 'not_in', 'is_empty', 'is_not_empty'];
    
    case 'boolean':
      return ['equals', 'not_equals'];
    
    default:
      return ['equals', 'not_equals', 'is_empty', 'is_not_empty'];
  }
};

// Labels des opérateurs
export const operatorLabels: Record<FilterOperator, string> = {
  equals: 'Égal à',
  not_equals: 'Différent de',
  contains: 'Contient',
  not_contains: 'Ne contient pas',
  starts_with: 'Commence par',
  ends_with: 'Se termine par',
  greater_than: 'Supérieur à',
  less_than: 'Inférieur à',
  greater_equal: 'Supérieur ou égal à',
  less_equal: 'Inférieur ou égal à',
  between: 'Entre',
  in: 'Dans la liste',
  not_in: 'Pas dans la liste',
  is_empty: 'Est vide',
  is_not_empty: 'N\'est pas vide',
  date_today: 'Aujourd\'hui',
  date_yesterday: 'Hier',
  date_this_week: 'Cette semaine',
  date_last_week: 'Semaine dernière',
  date_this_month: 'Ce mois',
  date_last_month: 'Mois dernier',
  date_this_year: 'Cette année',
  date_last_year: 'Année dernière'
};
