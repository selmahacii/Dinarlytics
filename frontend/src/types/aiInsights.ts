// Types pour les insights IA de démonstration

export type InsightType = 'anomaly' | 'trend' | 'prediction' | 'optimization' | 'risk' | 'opportunity';
export type InsightCategory = 'sales' | 'financial' | 'inventory' | 'customer' | 'performance' | 'cost';
export type InsightImpact = 'high' | 'medium' | 'low';
export type InsightStatus = 'new' | 'reviewed' | 'dismissed' | 'applied';

export interface InsightData {
  metric?: string;
  currentValue?: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  timeframe?: string;
  chartData?: number[];
  relatedMetrics?: string[];
  [key: string]: unknown;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: InsightImpact;
  effort: InsightImpact;
  impact: InsightImpact;
  timeframe: string;
  expectedBenefit?: string;
  cost?: number;
}

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: InsightImpact;
  category: InsightCategory;
  data: InsightData;
  recommendations: AIRecommendation[];
  createdAt: string;
  status: InsightStatus;
  tags: string[];
}

export const demoAIInsights: AIInsight[] = [
  {
    id: 'insight-1',
    type: 'anomaly',
    title: 'Anomalie détectée sur le CA',
    description: "Baisse inattendue du chiffre d'affaires de 12% sur la dernière semaine.",
    confidence: 82,
    impact: 'high',
    category: 'sales',
    data: {
      metric: "Chiffre d'affaires",
      currentValue: 120000,
      previousValue: 136000,
      change: -16000,
      changePercentage: -12,
      timeframe: 'Semaine dernière',
      chartData: [136000, 132000, 128000, 120000],
      relatedMetrics: ['Profit', 'Volume de ventes']
    },
    recommendations: [
      {
        id: 'rec-1',
        title: 'Analyser la baisse',
        description: 'Examiner les causes possibles de la baisse du CA.',
        action: 'Audit des ventes',
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        timeframe: '1 semaine',
        expectedBenefit: 'Identification des causes et correction rapide'
      }
    ],
    createdAt: '2024-06-01T10:00:00Z',
    status: 'new',
    tags: ['ventes', 'anomalie']
  }
];

export const insightCategories = {
  sales: { color: 'blue', label: 'Ventes' },
  financial: { color: 'green', label: 'Financier' },
  inventory: { color: 'orange', label: 'Inventaire' },
  customer: { color: 'purple', label: 'Clients' },
  performance: { color: 'yellow', label: 'Performance' },
  cost: { color: 'red', label: 'Coûts' }
};

export const insightTypes = {
  anomaly: { color: 'red', label: 'Anomalie' },
  trend: { color: 'blue', label: 'Tendance' },
  prediction: { color: 'purple', label: 'Prédiction' },
  optimization: { color: 'green', label: 'Optimisation' },
  risk: { color: 'orange', label: 'Risque' },
  opportunity: { color: 'yellow', label: 'Opportunité' }
};

export const impactLevels = {
  high: { color: 'red', label: 'Élevé' },
  medium: { color: 'yellow', label: 'Moyen' },
  low: { color: 'green', label: 'Faible' }
};

export const insightStatuses = {
  new: { color: 'blue', label: 'Nouveau' },
  reviewed: { color: 'green', label: 'Examiné' },
  dismissed: { color: 'gray', label: 'Rejeté' },
  applied: { color: 'purple', label: 'Appliqué' }
};


