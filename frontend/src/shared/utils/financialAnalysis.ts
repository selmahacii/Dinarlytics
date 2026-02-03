/**
 * Utilitaires pour l'analyse financière avancée dans le chatbot LIA
 */

export interface TrendAnalysis {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export interface AnomalyDetection {
  type: 'spike' | 'drop' | 'outlier' | 'pattern';
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  recommendation: string;
}

export interface ScenarioAnalysis {
  scenario: string;
  metric: string;
  currentValue: number;
  projectedValue: number;
  impact: number;
  confidence: number;
  assumptions: string[];
}

/**
 * Analyse comparative (mois/mois, année/année)
 */
export function comparePeriods(
  current: number,
  previous: number,
  metric: string
): TrendAnalysis {
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let status: 'good' | 'warning' | 'critical' = 'good';
  
  if (Math.abs(changePercent) < 2) {
    trend = 'stable';
  } else if (changePercent > 0) {
    trend = 'up';
    // Pour les métriques où "up" est bon (CA, marge)
    if (['revenue', 'profit', 'margin', 'cash'].includes(metric.toLowerCase())) {
      status = changePercent > 10 ? 'good' : changePercent > 5 ? 'good' : 'warning';
    } else {
      // Pour les métriques où "up" est mauvais (DSO, DIO, dettes)
      status = changePercent > 20 ? 'critical' : changePercent > 10 ? 'warning' : 'good';
    }
  } else {
    trend = 'down';
    // Pour les métriques où "down" est bon (DSO, DIO)
    if (['dso', 'dio', 'ccc', 'debt'].includes(metric.toLowerCase())) {
      status = Math.abs(changePercent) > 10 ? 'good' : 'warning';
    } else {
      // Pour les métriques où "down" est mauvais (CA, marge)
      status = Math.abs(changePercent) > 20 ? 'critical' : Math.abs(changePercent) > 10 ? 'warning' : 'good';
    }
  }
  
  return {
    metric,
    current,
    previous,
    change,
    changePercent: Math.round(changePercent * 10) / 10,
    trend,
    status
  };
}

/**
 * Détection d'anomalies dans les données financières
 */
export function detectAnomalies(
  current: number,
  historical: number[],
  metric: string,
  benchmark?: number
): AnomalyDetection | null {
  if (historical.length === 0) return null;
  
  const avg = historical.reduce((a, b) => a + b, 0) / historical.length;
  const stdDev = Math.sqrt(
    historical.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / historical.length
  );
  
  const deviation = current - avg;
  const deviationPercent = avg !== 0 ? (deviation / avg) * 100 : 0;
  const zScore = stdDev !== 0 ? deviation / stdDev : 0;
  
  // Seuils pour détection d'anomalies
  if (Math.abs(zScore) < 2) return null; // Normal
  
  let type: 'spike' | 'drop' | 'outlier' | 'pattern' = 'outlier';
  let severity: 'low' | 'medium' | 'high' = 'medium';
  let explanation = '';
  let recommendation = '';
  
  if (zScore > 2) {
    type = 'spike';
    severity = zScore > 3 ? 'high' : 'medium';
    explanation = `${metric} a augmenté de ${Math.abs(deviationPercent).toFixed(1)}% par rapport à la moyenne historique.`;
    
    if (['revenue', 'profit', 'cash'].includes(metric.toLowerCase())) {
      recommendation = 'Vérifier si cette hausse est durable ou exceptionnelle. Analyser les facteurs de croissance.';
    } else if (['dso', 'dio', 'ccc'].includes(metric.toLowerCase())) {
      recommendation = 'Investigation urgente: cette hausse peut indiquer un problème opérationnel.';
    }
  } else {
    type = 'drop';
    severity = Math.abs(zScore) > 3 ? 'high' : 'medium';
    explanation = `${metric} a chuté de ${Math.abs(deviationPercent).toFixed(1)}% par rapport à la moyenne historique.`;
    
    if (['revenue', 'profit', 'cash'].includes(metric.toLowerCase())) {
      recommendation = 'Action immédiate requise: analyser les causes de la baisse et mettre en place un plan de redressement.';
    } else if (['dso', 'dio', 'ccc'].includes(metric.toLowerCase())) {
      recommendation = 'Amélioration positive, mais vérifier que cela ne cache pas un problème ailleurs.';
    }
  }
  
  // Comparaison avec benchmark si fourni
  if (benchmark !== undefined) {
    const benchmarkDeviation = current - benchmark;
    if (Math.abs(benchmarkDeviation) > benchmark * 0.2) {
      explanation += ` Écart significatif avec le benchmark (${benchmarkDeviation > 0 ? '+' : ''}${((benchmarkDeviation / benchmark) * 100).toFixed(1)}%).`;
    }
  }
  
  return {
    type,
    metric,
    value: current,
    expected: avg,
    deviation,
    severity,
    explanation,
    recommendation
  };
}

/**
 * Analyse de scénarios "what-if"
 */
export function analyzeScenario(
  currentValue: number,
  changePercent: number,
  metric: string,
  dependencies?: { metric: string; impact: number }[]
): ScenarioAnalysis {
  const projectedValue = currentValue * (1 + changePercent / 100);
  const impact = projectedValue - currentValue;
  
  // Calculer la confiance basée sur la complexité
  let confidence = 85;
  if (dependencies && dependencies.length > 0) {
    confidence = Math.max(60, 85 - dependencies.length * 5);
  }
  
  const assumptions: string[] = [
    `Hypothèse: ${metric} ${changePercent > 0 ? 'augmente' : 'diminue'} de ${Math.abs(changePercent)}%`
  ];
  
  if (dependencies) {
    dependencies.forEach(dep => {
      assumptions.push(`${dep.metric} impacte ${metric} de ${dep.impact > 0 ? '+' : ''}${dep.impact}%`);
    });
  }
  
  return {
    scenario: `Scénario: ${changePercent > 0 ? 'hausse' : 'baisse'} de ${Math.abs(changePercent)}% sur ${metric}`,
    metric,
    currentValue,
    projectedValue,
    impact,
    confidence,
    assumptions
  };
}

/**
 * Analyse sectorielle et benchmarking
 */
export function benchmarkAnalysis(
  current: number,
  metric: string,
  sector: string,
  segment: 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
): {
  current: number;
  sectorAvg: number;
  segmentAvg: number;
  percentile: number;
  status: 'excellent' | 'good' | 'average' | 'below' | 'poor';
  recommendation: string;
} {
  // Benchmarks approximatifs par secteur et segment (valeurs de démo)
  const benchmarks: Record<string, Record<string, number>> = {
    revenue: {
      micro: 500000,
      small: 2000000,
      medium: 8000000,
      large: 30000000,
      enterprise: 100000000
    },
    margin: {
      micro: 15,
      small: 18,
      medium: 20,
      large: 22,
      enterprise: 25
    },
    dso: {
      micro: 45,
      small: 40,
      medium: 35,
      large: 30,
      enterprise: 25
    },
    cash: {
      micro: 300000,
      small: 1200000,
      medium: 5000000,
      large: 20000000,
      enterprise: 80000000
    }
  };
  
  const segmentAvg = benchmarks[metric]?.[segment] || current;
  const sectorAvg = segmentAvg * (sector === 'retail' ? 0.95 : sector === 'services' ? 1.05 : 1.0);
  
  // Calculer le percentile (simplifié)
  const ratio = current / segmentAvg;
  let percentile = 50;
  let status: 'excellent' | 'good' | 'average' | 'below' | 'poor' = 'average';
  
  if (['revenue', 'profit', 'margin', 'cash'].includes(metric.toLowerCase())) {
    if (ratio >= 1.2) {
      percentile = 90;
      status = 'excellent';
    } else if (ratio >= 1.1) {
      percentile = 75;
      status = 'good';
    } else if (ratio >= 0.9) {
      percentile = 50;
      status = 'average';
    } else if (ratio >= 0.7) {
      percentile = 25;
      status = 'below';
    } else {
      percentile = 10;
      status = 'poor';
    }
  } else {
    // Pour DSO, DIO, etc. (plus bas = mieux)
    if (ratio <= 0.8) {
      percentile = 90;
      status = 'excellent';
    } else if (ratio <= 0.9) {
      percentile = 75;
      status = 'good';
    } else if (ratio <= 1.1) {
      percentile = 50;
      status = 'average';
    } else if (ratio <= 1.3) {
      percentile = 25;
      status = 'below';
    } else {
      percentile = 10;
      status = 'poor';
    }
  }
  
  let recommendation = '';
  if (status === 'excellent') {
    recommendation = 'Performance exceptionnelle. Maintenir cette position et partager les bonnes pratiques.';
  } else if (status === 'good') {
    recommendation = 'Performance supérieure à la moyenne. Identifier les facteurs de succès pour les renforcer.';
  } else if (status === 'average') {
    recommendation = 'Performance dans la moyenne. Opportunité d\'amélioration pour se démarquer.';
  } else if (status === 'below') {
    recommendation = 'Performance en dessous de la moyenne. Analyse approfondie requise pour identifier les causes.';
  } else {
    recommendation = 'Performance critique. Action immédiate requise avec plan de redressement.';
  }
  
  return {
    current,
    sectorAvg,
    segmentAvg,
    percentile,
    status,
    recommendation
  };
}

/**
 * Génère un résumé d'analyse financière enrichi
 */
export function generateFinancialSummary(
  data: {
    revenue: number;
    margin: number;
    cash: number;
    dso: number;
    dio: number;
    dpo: number;
    ccc: number;
  },
  historical?: {
    revenue?: number[];
    margin?: number[];
    cash?: number[];
    dso?: number[];
  }
): {
  trends: TrendAnalysis[];
  anomalies: AnomalyDetection[];
  insights: string[];
  priorities: string[];
} {
  const trends: TrendAnalysis[] = [];
  const anomalies: AnomalyDetection[] = [];
  const insights: string[] = [];
  const priorities: string[] = [];
  
  // Analyser les tendances si historique disponible
  if (historical) {
    if (historical.revenue && historical.revenue.length > 0) {
      const trend = comparePeriods(data.revenue, historical.revenue[historical.revenue.length - 1], 'revenue');
      trends.push(trend);
      
      const anomaly = detectAnomalies(data.revenue, historical.revenue, 'revenue');
      if (anomaly) anomalies.push(anomaly);
      
      if (trend.status === 'critical') {
        priorities.push('🚨 CA en baisse critique - Plan de redressement urgent');
      } else if (trend.trend === 'up' && trend.changePercent > 10) {
        insights.push(`📈 Croissance solide du CA (+${trend.changePercent}%)`);
      }
    }
    
    if (historical.margin && historical.margin.length > 0) {
      const trend = comparePeriods(data.margin, historical.margin[historical.margin.length - 1], 'margin');
      trends.push(trend);
      
      if (trend.status === 'critical') {
        priorities.push('⚠️ Marge en baisse - Optimiser les coûts et prix');
      }
    }
    
    if (historical.dso && historical.dso.length > 0) {
      const trend = comparePeriods(data.dso, historical.dso[historical.dso.length - 1], 'dso');
      trends.push(trend);
      
      if (trend.status === 'critical') {
        priorities.push('🔴 DSO trop élevé - Accélérer le recouvrement');
      }
    }
  }
  
  // Analyser le CCC
  if (data.ccc > 60) {
    priorities.push('⏱️ Cycle de conversion de trésorerie long - Optimiser DSO/DIO/DPO');
    insights.push(`CCC à ${data.ccc} jours (cible < 40 jours)`);
  } else if (data.ccc < 30) {
    insights.push(`✅ Excellent CCC de ${data.ccc} jours`);
  }
  
  // Analyser la trésorerie
  const cashMonths = data.cash / (data.revenue / 12);
  if (cashMonths < 1) {
    priorities.push('💰 Trésorerie critique - Moins de 1 mois de CA disponible');
  } else if (cashMonths < 3) {
    priorities.push('⚠️ Trésorerie faible - Surveiller les encaissements');
  } else {
    insights.push(`✅ Trésorerie saine: ${cashMonths.toFixed(1)} mois de CA`);
  }
  
  return { trends, anomalies, insights, priorities };
}

