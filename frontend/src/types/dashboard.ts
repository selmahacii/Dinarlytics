export interface RealisticMetric {
    id: string;
    nom: string;
    valeur: number;
    unite: string;
    evolution: number;
    evolutionPourcentage: number;
    tendance: 'up' | 'down' | 'stable';
    objectif?: number;
    historique: Array<{ label: string; valeur: number }>;
    details: {
        description: string;
        contexte: string;
        facteurs: string[];
        alertes?: string[];
    };
}

export interface RealisticChartData {
    id: string;
    titre: string;
    description: string;
    type: 'line' | 'bar' | 'doughnut' | 'area' | 'scatter';
    periode: string;
    miseAJour: string;
    donnees: any[];
    options: {
        couleurs: string[];
        animation: boolean;
        showGrid: boolean;
        showLabels: boolean;
        currency?: boolean;
        keys?: string[];
    };
}

export interface RealTimeData {
    id: string;
    type: string;
    valeur: number | string;
    timestamp: string;
    statut: 'success' | 'warning' | 'error' | 'info';
    description: string;
}
