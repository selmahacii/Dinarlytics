// Types pour l'éditeur de rapports drag & drop

export interface WidgetElement {
  id: string;
  type: 'graphique' | 'tableau' | 'kpi' | 'texte' | 'image';
  nom: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: WidgetConfig;
}

export interface WidgetConfig {
  // Configuration commune
  titre?: string;
  couleur?: string;
  taillePolice?: number;
  
  // Configuration spécifique aux graphiques
  typeGraphique?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  donnees?: any[];
  
  // Configuration spécifique aux KPIs
  valeur?: string | number;
  unite?: string;
  evolution?: string;
  couleurEvolution?: 'green' | 'red' | 'blue' | 'gray';
  
  // Configuration spécifique aux tableaux
  colonnes?: string[];
  lignes?: any[][];
  
  // Configuration spécifique au texte
  contenu?: string;
  alignement?: 'left' | 'center' | 'right';
}

export interface PaletteElement {
  id: string;
  type: WidgetElement['type'];
  nom: string;
  icone: string;
  description: string;
  couleur: string;
}

export interface RapportTemplate {
  id: string;
  nom: string;
  description: string;
  elements: WidgetElement[];
  grille: {
    colonnes: number;
    lignes: number;
  };
}

// Données de démonstration pour la palette d'éléments
export const paletteElements: PaletteElement[] = [
  {
    id: 'graphique-line',
    type: 'graphique',
    nom: 'Graphique Linéaire',
    icone: '📈',
    description: 'Évolution dans le temps',
    couleur: 'blue'
  },
  {
    id: 'graphique-bar',
    type: 'graphique',
    nom: 'Graphique en Barres',
    icone: '📊',
    description: 'Comparaison de valeurs',
    couleur: 'green'
  },
  {
    id: 'graphique-pie',
    type: 'graphique',
    nom: 'Graphique Circulaire',
    icone: '🥧',
    description: 'Répartition en pourcentages',
    couleur: 'purple'
  },
  {
    id: 'kpi-simple',
    type: 'kpi',
    nom: 'KPI Simple',
    icone: '📋',
    description: 'Indicateur clé de performance',
    couleur: 'orange'
  },
  {
    id: 'tableau-simple',
    type: 'tableau',
    nom: 'Tableau de Données',
    icone: '📋',
    description: 'Données tabulaires',
    couleur: 'gray'
  },
  {
    id: 'texte-titre',
    type: 'texte',
    nom: 'Titre',
    icone: '📝',
    description: 'Titre ou sous-titre',
    couleur: 'indigo'
  },
  {
    id: 'texte-description',
    type: 'texte',
    nom: 'Texte',
    icone: '📄',
    description: 'Bloc de texte',
    couleur: 'slate'
  }
];

// Templates de démonstration
export const rapportTemplates: RapportTemplate[] = [
  {
    id: 'template-executif',
    nom: 'Template Exécutif',
    description: 'Vue d\'ensemble pour la direction',
    grille: { colonnes: 12, lignes: 8 },
    elements: [
      {
        id: 'kpi-ca',
        type: 'kpi',
        nom: 'Chiffre d\'Affaires',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          titre: 'CA Mensuel',
          valeur: '2,450,000',
          unite: 'DZD',
          evolution: '+12.5%',
          couleurEvolution: 'green'
        }
      },
      {
        id: 'kpi-marge',
        type: 'kpi',
        nom: 'Marge Brute',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          titre: 'Marge Brute',
          valeur: '35.2',
          unite: '%',
          evolution: '+2.1%',
          couleurEvolution: 'green'
        }
      },
      {
        id: 'graphique-evolution',
        type: 'graphique',
        nom: 'Évolution CA',
        position: { x: 6, y: 0, w: 6, h: 4 },
        config: {
          titre: 'Évolution du Chiffre d\'Affaires',
          typeGraphique: 'line',
          donnees: [120, 135, 142, 158, 165, 172, 189]
        }
      },
      {
        id: 'tableau-top-clients',
        type: 'tableau',
        nom: 'Top Clients',
        position: { x: 0, y: 2, w: 6, h: 4 },
        config: {
          titre: 'Top 10 Clients',
          colonnes: ['Client', 'CA', 'Évolution'],
          lignes: [
            ['Client A', '450,000 DZD', '+15%'],
            ['Client B', '380,000 DZD', '+8%'],
            ['Client C', '320,000 DZD', '+22%']
          ]
        }
      }
    ]
  },
  {
    id: 'template-commercial',
    nom: 'Template Commercial',
    description: 'Suivi des performances commerciales',
    grille: { colonnes: 12, lignes: 6 },
    elements: [
      {
        id: 'kpi-objectif',
        type: 'kpi',
        nom: 'Objectif CA',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          titre: 'Objectif Mensuel',
          valeur: '2,000,000',
          unite: 'DZD',
          evolution: '+22.5%',
          couleurEvolution: 'green'
        }
      },
      {
        id: 'kpi-conversion',
        type: 'kpi',
        nom: 'Taux Conversion',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          titre: 'Taux de Conversion',
          valeur: '12.3',
          unite: '%',
          evolution: '+1.8%',
          couleurEvolution: 'green'
        }
      },
      {
        id: 'graphique-funnel',
        type: 'graphique',
        nom: 'Funnel de Vente',
        position: { x: 6, y: 0, w: 6, h: 4 },
        config: {
          titre: 'Pipeline Commercial',
          typeGraphique: 'bar',
          donnees: [100, 75, 45, 25, 12]
        }
      }
    ]
  }
];
