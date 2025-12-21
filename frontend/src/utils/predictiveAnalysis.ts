/**
 * Module d'analyse prédictive avancée pour LIA
 * Inclut : prévisions, détection de patterns, scénarios prédictifs
 */

export interface Forecast {
  period: string;
  date: string;
  value: number;
  confidence: 'high' | 'medium' | 'low';
  min?: number;
  max?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface SeasonalPattern {
  type: 'monthly' | 'quarterly' | 'yearly';
  peakMonth?: number;
  lowMonth?: number;
  seasonalityFactor: number;
  description: string;
}

export interface PredictiveAlert {
  id: string;
  type: 'cash_shortage' | 'revenue_drop' | 'margin_decline' | 'dso_increase' | 'growth_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  predictedDate: string;
  confidence: number;
  recommendation: string;
  impact?: {
    metric: string;
    currentValue: number;
    predictedValue: number;
    changePercent: number;
  };
}

export interface PredictiveScenario {
  name: string;
  description: string;
  probability: number;
  timeframe: string;
  metrics: {
    revenue?: { current: number; projected: number; change: number };
    margin?: { current: number; projected: number; change: number };
    cash?: { current: number; projected: number; change: number };
    dso?: { current: number; projected: number; change: number };
  };
  assumptions: string[];
  risks: string[];
  opportunities: string[];
}

/**
 * Génère des prévisions de trésorerie sur plusieurs périodes
 */
export function forecastCashFlow(
  currentCash: number,
  monthlyRevenue: number,
  monthlyExpenses: number,
  accountsReceivable: number,
  accountsPayable: number,
  periods: number = 13 // 13 semaines par défaut
): Forecast[] {
  const forecasts: Forecast[] = [];
  const today = new Date();
  
  // Calculer le flux net mensuel moyen
  const netMonthlyFlow = monthlyRevenue - monthlyExpenses;
  
  // Facteurs de saisonnalité (simplifiés)
  const seasonalFactors = [1.0, 0.95, 1.05, 1.1, 1.05, 0.9, 0.85, 0.9, 1.0, 1.1, 1.15, 1.05];
  const currentMonth = today.getMonth();
  
  let runningCash = currentCash;
  
  for (let i = 0; i < periods; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(forecastDate.getDate() + (i * 7)); // Semaines
    
    // Calculer le facteur saisonnier
    const monthIndex = (currentMonth + Math.floor(i / 4.33)) % 12;
    const seasonalFactor = seasonalFactors[monthIndex];
    
    // Flux hebdomadaire ajusté
    const weeklyFlow = (netMonthlyFlow * seasonalFactor) / 4.33;
    
    // Ajustements pour les encaissements/décaissements
    let weeklyInflows = (monthlyRevenue * seasonalFactor) / 4.33;
    let weeklyOutflows = (monthlyExpenses * seasonalFactor) / 4.33;
    
    // J+7, J+14, J+21 : encaissements clients (DSO moyen)
    const dsoDays = Math.round((accountsReceivable / monthlyRevenue) * 30);
    if (i % Math.ceil(dsoDays / 7) === 0 && i > 0) {
      weeklyInflows += accountsReceivable * 0.3; // 30% des créances encaissées
    }
    
    // J+10, J+25 : décaissements fournisseurs (DPO moyen)
    const dpoDays = Math.round((accountsPayable / monthlyExpenses) * 30);
    if (i % Math.ceil(dpoDays / 7) === 0 && i > 0) {
      weeklyOutflows += accountsPayable * 0.4; // 40% des dettes payées
    }
    
    const netFlow = weeklyInflows - weeklyOutflows;
    runningCash += netFlow;
    
    // Calculer la confiance (diminue avec le temps)
    let confidence: 'high' | 'medium' | 'low' = 'high';
    if (i > 8) confidence = 'medium';
    if (i > 12) confidence = 'low';
    
    // Calculer min/max avec intervalle de confiance
    const variance = Math.abs(netFlow) * 0.2; // 20% de variance
    const min = Math.max(0, runningCash - variance);
    const max = runningCash + variance;
    
    // Déterminer la tendance
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (i > 0) {
      const prevForecast = forecasts[i - 1];
      const change = runningCash - prevForecast.value;
      if (change > prevForecast.value * 0.05) trend = 'up';
      else if (change < -prevForecast.value * 0.05) trend = 'down';
    }
    
    forecasts.push({
      period: `Semaine ${i + 1}`,
      date: forecastDate.toISOString().split('T')[0],
      value: Math.max(0, runningCash),
      confidence,
      min,
      max,
      trend
    });
  }
  
  return forecasts;
}

/**
 * Génère des prévisions de CA basées sur les tendances historiques
 */
export function forecastRevenue(
  historicalRevenue: number[],
  periods: number = 12 // 12 mois
): Forecast[] {
  if (historicalRevenue.length < 3) {
    // Pas assez de données historiques
    return [];
  }
  
  const forecasts: Forecast[] = [];
  const today = new Date();
  
  // Calculer la tendance linéaire (régression simple)
  const n = historicalRevenue.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  
  historicalRevenue.forEach((value, index) => {
    const x = index + 1;
    sumX += x;
    sumY += value;
    sumXY += x * value;
    sumX2 += x * x;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculer la moyenne et l'écart-type pour la variance
  const avg = historicalRevenue.reduce((a, b) => a + b, 0) / n;
  const variance = historicalRevenue.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  // Dernière valeur historique
  const lastValue = historicalRevenue[historicalRevenue.length - 1];
  
  for (let i = 1; i <= periods; i++) {
    const forecastDate = new Date(today);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    
    // Valeur prédite basée sur la tendance
    const predictedValue = intercept + slope * (n + i);
    
    // Ajuster avec la dernière valeur pour éviter les écarts trop importants
    const adjustedValue = lastValue * 0.7 + predictedValue * 0.3;
    
    // Intervalle de confiance (95%)
    const confidenceInterval = stdDev * 1.96;
    const min = Math.max(0, adjustedValue - confidenceInterval);
    const max = adjustedValue + confidenceInterval;
    
    // Confiance diminue avec le temps
    let confidence: 'high' | 'medium' | 'low' = 'high';
    if (i > 6) confidence = 'medium';
    if (i > 9) confidence = 'low';
    
    // Tendance basée sur la pente
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (slope > lastValue * 0.01) trend = 'up';
    else if (slope < -lastValue * 0.01) trend = 'down';
    
    forecasts.push({
      period: `Mois ${i}`,
      date: forecastDate.toISOString().split('T')[0],
      value: Math.max(0, adjustedValue),
      confidence,
      min,
      max,
      trend
    });
  }
  
  return forecasts;
}

/**
 * Détecte les patterns saisonniers dans les données historiques
 */
export function detectSeasonalPattern(
  historicalData: number[],
  periodType: 'monthly' | 'quarterly' = 'monthly'
): SeasonalPattern | null {
  if (historicalData.length < 12) return null;
  
  // Grouper par mois ou trimestre
  const periods: number[] = [];
  const periodLength = periodType === 'monthly' ? 1 : 3;
  
  for (let i = 0; i < historicalData.length; i += periodLength) {
    const periodData = historicalData.slice(i, i + periodLength);
    const avg = periodData.reduce((a, b) => a + b, 0) / periodData.length;
    periods.push(avg);
  }
  
  if (periods.length < 4) return null;
  
  // Trouver le pic et le creux
  const maxValue = Math.max(...periods);
  const minValue = Math.min(...periods);
  const peakIndex = periods.indexOf(maxValue);
  const lowIndex = periods.indexOf(minValue);
  
  // Calculer le facteur de saisonnalité
  const avg = periods.reduce((a, b) => a + b, 0) / periods.length;
  const seasonalityFactor = (maxValue - minValue) / avg;
  
  // Générer une description
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  let description = '';
  if (seasonalityFactor > 0.3) {
    description = `Saisonnalité marquée détectée. Pic en ${monthNames[peakIndex]}, creux en ${monthNames[lowIndex]}. Variation de ${(seasonalityFactor * 100).toFixed(1)}%.`;
  } else {
    description = `Saisonnalité faible. Activité relativement stable tout au long de l'année.`;
  }
  
  return {
    type: periodType,
    peakMonth: peakIndex,
    lowMonth: lowIndex,
    seasonalityFactor,
    description
  };
}

/**
 * Génère des alertes prédictives basées sur les prévisions
 */
export function generatePredictiveAlerts(
  forecasts: {
    cash?: Forecast[];
    revenue?: Forecast[];
    margin?: number;
  },
  currentData: {
    cash: number;
    revenue: number;
    margin: number;
    dso: number;
  },
  thresholds: {
    minCashMonths?: number;
    revenueDropPercent?: number;
    marginMin?: number;
    dsoMax?: number;
  } = {}
): PredictiveAlert[] {
  const alerts: PredictiveAlert[] = [];
  const {
    minCashMonths = 1,
    revenueDropPercent = 15,
    marginMin = 10,
    dsoMax = 45
  } = thresholds;
  
  // Alerte trésorerie
  if (forecasts.cash && forecasts.cash.length > 0) {
    const criticalWeeks = forecasts.cash.filter(f => {
      const monthlyRevenue = currentData.revenue / 12;
      const cashMonths = f.value / monthlyRevenue;
      return cashMonths < minCashMonths;
    });
    
    if (criticalWeeks.length > 0) {
      const firstCritical = criticalWeeks[0];
      alerts.push({
        id: `alert-cash-${Date.now()}`,
        type: 'cash_shortage',
        severity: firstCritical.value < currentData.cash * 0.5 ? 'critical' : 'high',
        title: 'Risque de pénurie de trésorerie',
        message: `Prévision: trésorerie insuffisante dès ${firstCritical.period} (${firstCritical.date}). Solde prévu: ${firstCritical.value.toLocaleString()} DZD.`,
        predictedDate: firstCritical.date,
        confidence: firstCritical.confidence === 'high' ? 85 : firstCritical.confidence === 'medium' ? 70 : 55,
        recommendation: 'Actions immédiates: accélérer les encaissements, négocier des délais de paiement avec les fournisseurs, ou rechercher un financement court terme.',
        impact: {
          metric: 'Trésorerie',
          currentValue: currentData.cash,
          predictedValue: firstCritical.value,
          changePercent: ((firstCritical.value - currentData.cash) / currentData.cash) * 100
        }
      });
    }
  }
  
  // Alerte baisse de CA
  if (forecasts.revenue && forecasts.revenue.length > 0) {
    const revenueDrops = forecasts.revenue.filter(f => {
      const drop = ((f.value - currentData.revenue) / currentData.revenue) * 100;
      return drop < -revenueDropPercent;
    });
    
    if (revenueDrops.length > 0) {
      const firstDrop = revenueDrops[0];
      alerts.push({
        id: `alert-revenue-${Date.now()}`,
        type: 'revenue_drop',
        severity: 'high',
        title: 'Baisse prévue du chiffre d\'affaires',
        message: `Prévision: baisse de ${Math.abs(((firstDrop.value - currentData.revenue) / currentData.revenue) * 100).toFixed(1)}% prévue pour ${firstDrop.period}.`,
        predictedDate: firstDrop.date,
        confidence: firstDrop.confidence === 'high' ? 80 : firstDrop.confidence === 'medium' ? 65 : 50,
        recommendation: 'Analyser les causes: saisonnalité, perte de clients, concurrence. Mettre en place un plan de relance commerciale.',
        impact: {
          metric: 'Chiffre d\'affaires',
          currentValue: currentData.revenue,
          predictedValue: firstDrop.value,
          changePercent: ((firstDrop.value - currentData.revenue) / currentData.revenue) * 100
        }
      });
    }
  }
  
  // Alerte marge
  if (forecasts.margin !== undefined && forecasts.margin < marginMin) {
    alerts.push({
      id: `alert-margin-${Date.now()}`,
      type: 'margin_decline',
      severity: forecasts.margin < 5 ? 'critical' : 'high',
      title: 'Marge bénéficiaire en déclin',
      message: `Marge prévue: ${forecasts.margin.toFixed(1)}% (seuil minimum: ${marginMin}%).`,
      predictedDate: new Date().toISOString().split('T')[0],
      confidence: 75,
      recommendation: 'Optimiser les coûts, réviser la stratégie tarifaire, analyser la structure des coûts.',
      impact: {
        metric: 'Marge bénéficiaire',
        currentValue: currentData.margin,
        predictedValue: forecasts.margin,
        changePercent: ((forecasts.margin - currentData.margin) / currentData.margin) * 100
      }
    });
  }
  
  // Alerte DSO
  if (currentData.dso > dsoMax) {
    alerts.push({
      id: `alert-dso-${Date.now()}`,
      type: 'dso_increase',
      severity: currentData.dso > 60 ? 'critical' : 'high',
      title: 'Délai de recouvrement élevé',
      message: `DSO actuel: ${currentData.dso} jours (seuil maximum: ${dsoMax} jours). Impact prévu sur la trésorerie future.`,
      predictedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      confidence: 85,
      recommendation: 'Mettre en place un processus de recouvrement proactif, offrir des escomptes pour paiement anticipé, réviser les conditions de paiement.',
      impact: {
        metric: 'DSO',
        currentValue: currentData.dso,
        predictedValue: currentData.dso * 1.1, // Projection si rien n'est fait
        changePercent: 10
      }
    });
  }
  
  return alerts;
}

/**
 * Génère des scénarios prédictifs multiples
 */
export function generatePredictiveScenarios(
  currentData: {
    revenue: number;
    margin: number;
    cash: number;
    dso: number;
    dio: number;
    dpo: number;
  },
  historicalData?: {
    revenue?: number[];
    margin?: number[];
  }
): PredictiveScenario[] {
  const scenarios: PredictiveScenario[] = [];
  
  // Scénario optimiste (croissance +10%)
  const optimisticRevenue = currentData.revenue * 1.1;
  const optimisticMargin = currentData.margin + 2;
  const optimisticCash = currentData.cash * 1.15;
  const optimisticDso = Math.max(20, currentData.dso - 5);
  
  scenarios.push({
    name: 'Scénario Optimiste',
    description: 'Croissance soutenue avec amélioration opérationnelle',
    probability: 30,
    timeframe: '6 mois',
    metrics: {
      revenue: {
        current: currentData.revenue,
        projected: optimisticRevenue,
        change: optimisticRevenue - currentData.revenue
      },
      margin: {
        current: currentData.margin,
        projected: optimisticMargin,
        change: optimisticMargin - currentData.margin
      },
      cash: {
        current: currentData.cash,
        projected: optimisticCash,
        change: optimisticCash - currentData.cash
      },
      dso: {
        current: currentData.dso,
        projected: optimisticDso,
        change: optimisticDso - currentData.dso
      }
    },
    assumptions: [
      'Croissance du marché de +10%',
      'Amélioration du processus de recouvrement',
      'Optimisation des coûts opérationnels',
      'Fidélisation accrue des clients'
    ],
    risks: [
      'Sous-estimation des coûts de croissance',
      'Concurrence accrue',
      'Risque de sur-stockage'
    ],
    opportunities: [
      'Expansion géographique possible',
      'Investissement dans l\'innovation',
      'Recrutement pour soutenir la croissance'
    ]
  });
  
  // Scénario réaliste (stabilité)
  const realisticRevenue = currentData.revenue * 1.02;
  const realisticMargin = currentData.margin;
  const realisticCash = currentData.cash * 1.05;
  
  scenarios.push({
    name: 'Scénario Réaliste',
    description: 'Maintien de la performance actuelle avec légère croissance',
    probability: 50,
    timeframe: '6 mois',
    metrics: {
      revenue: {
        current: currentData.revenue,
        projected: realisticRevenue,
        change: realisticRevenue - currentData.revenue
      },
      margin: {
        current: currentData.margin,
        projected: realisticMargin,
        change: 0
      },
      cash: {
        current: currentData.cash,
        projected: realisticCash,
        change: realisticCash - currentData.cash
      }
    },
    assumptions: [
      'Maintien des conditions de marché actuelles',
      'Pas de changement majeur dans les opérations',
      'Stabilité des relations clients/fournisseurs'
    ],
    risks: [
      'Stagnation possible',
      'Érosion progressive de la marge',
      'Dépendance aux clients existants'
    ],
    opportunities: [
      'Optimisation des processus existants',
      'Amélioration de la productivité',
      'Renforcement de la position concurrentielle'
    ]
  });
  
  // Scénario pessimiste (déclin -10%)
  const pessimisticRevenue = currentData.revenue * 0.9;
  const pessimisticMargin = currentData.margin - 3;
  const pessimisticCash = currentData.cash * 0.7;
  const pessimisticDso = currentData.dso + 10;
  
  scenarios.push({
    name: 'Scénario Pessimiste',
    description: 'Déclin du marché avec pression sur les marges',
    probability: 20,
    timeframe: '6 mois',
    metrics: {
      revenue: {
        current: currentData.revenue,
        projected: pessimisticRevenue,
        change: pessimisticRevenue - currentData.revenue
      },
      margin: {
        current: currentData.margin,
        projected: pessimisticMargin,
        change: pessimisticMargin - currentData.margin
      },
      cash: {
        current: currentData.cash,
        projected: pessimisticCash,
        change: pessimisticCash - currentData.cash
      },
      dso: {
        current: currentData.dso,
        projected: pessimisticDso,
        change: pessimisticDso - currentData.dso
      }
    },
    assumptions: [
      'Récession économique',
      'Pression concurrentielle accrue',
      'Retards de paiement clients',
      'Augmentation des coûts'
    ],
    risks: [
      'Pénurie de trésorerie',
      'Perte de clients',
      'Difficultés de recouvrement',
      'Réduction des marges'
    ],
    opportunities: [
      'Restructuration des coûts',
      'Diversification des revenus',
      'Renégociation avec les fournisseurs',
      'Plan de redressement'
    ]
  });
  
  return scenarios;
}

/**
 * Calcule le risque financier global
 */
export function calculateFinancialRisk(
  currentData: {
    cash: number;
    revenue: number;
    dso: number;
    margin: number;
    debt?: number;
  },
  forecasts?: {
    cash?: Forecast[];
    revenue?: Forecast[];
  }
): {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  factors: Array<{
    factor: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
    impact: number;
    description: string;
  }>;
  recommendation: string;
} {
  const factors: Array<{
    factor: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
    impact: number;
    description: string;
  }> = [];
  
  let totalScore = 0;
  
  // Facteur 1: Ratio de trésorerie
  const cashMonths = currentData.cash / (currentData.revenue / 12);
  let cashRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let cashScore = 0;
  
  if (cashMonths < 0.5) {
    cashRisk = 'critical';
    cashScore = 30;
  } else if (cashMonths < 1) {
    cashRisk = 'high';
    cashScore = 20;
  } else if (cashMonths < 3) {
    cashRisk = 'medium';
    cashScore = 10;
  }
  
  factors.push({
    factor: 'Trésorerie',
    risk: cashRisk,
    impact: cashScore,
    description: `Trésorerie: ${cashMonths.toFixed(1)} mois de CA (recommandé: ≥3 mois)`
  });
  totalScore += cashScore;
  
  // Facteur 2: DSO
  let dsoRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let dsoScore = 0;
  
  if (currentData.dso > 60) {
    dsoRisk = 'critical';
    dsoScore = 25;
  } else if (currentData.dso > 45) {
    dsoRisk = 'high';
    dsoScore = 15;
  } else if (currentData.dso > 35) {
    dsoRisk = 'medium';
    dsoScore = 8;
  }
  
  factors.push({
    factor: 'Délai de recouvrement',
    risk: dsoRisk,
    impact: dsoScore,
    description: `DSO: ${currentData.dso} jours (recommandé: ≤30 jours)`
  });
  totalScore += dsoScore;
  
  // Facteur 3: Marge
  let marginRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let marginScore = 0;
  
  if (currentData.margin < 5) {
    marginRisk = 'critical';
    marginScore = 25;
  } else if (currentData.margin < 10) {
    marginRisk = 'high';
    marginScore = 15;
  } else if (currentData.margin < 15) {
    marginRisk = 'medium';
    marginScore = 8;
  }
  
  factors.push({
    factor: 'Marge bénéficiaire',
    risk: marginRisk,
    impact: marginScore,
    description: `Marge: ${currentData.margin.toFixed(1)}% (recommandé: ≥15%)`
  });
  totalScore += marginScore;
  
  // Facteur 4: Prévisions de trésorerie
  if (forecasts?.cash && forecasts.cash.length > 0) {
    const criticalWeeks = forecasts.cash.filter(f => {
      const monthlyRevenue = currentData.revenue / 12;
      return f.value / monthlyRevenue < 1;
    });
    
    if (criticalWeeks.length > 0) {
      const forecastRisk = criticalWeeks.length > 4 ? 'critical' : criticalWeeks.length > 2 ? 'high' : 'medium';
      const forecastScore = criticalWeeks.length * 3;
      
      factors.push({
        factor: 'Prévisions trésorerie',
        risk: forecastRisk,
        impact: forecastScore,
        description: `${criticalWeeks.length} semaine(s) avec trésorerie insuffisante prévue`
      });
      totalScore += forecastScore;
    }
  }
  
  // Facteur 5: Dette (si disponible)
  if (currentData.debt !== undefined && currentData.debt > 0) {
    const debtToRevenue = currentData.debt / currentData.revenue;
    let debtRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let debtScore = 0;
    
    if (debtToRevenue > 2) {
      debtRisk = 'critical';
      debtScore = 20;
    } else if (debtToRevenue > 1) {
      debtRisk = 'high';
      debtScore = 12;
    } else if (debtToRevenue > 0.5) {
      debtRisk = 'medium';
      debtScore = 6;
    }
    
    factors.push({
      factor: 'Endettement',
      risk: debtRisk,
      impact: debtScore,
      description: `Dette: ${(debtToRevenue * 100).toFixed(1)}% du CA (recommandé: <50%)`
    });
    totalScore += debtScore;
  }
  
  // Déterminer le risque global
  let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (totalScore >= 60) {
    overallRisk = 'critical';
  } else if (totalScore >= 40) {
    overallRisk = 'high';
  } else if (totalScore >= 20) {
    overallRisk = 'medium';
  }
  
  // Générer une recommandation
  let recommendation = '';
  if (overallRisk === 'critical') {
    recommendation = '🚨 RISQUE CRITIQUE: Action immédiate requise. Mettre en place un plan de redressement urgent avec focus sur la trésorerie et le recouvrement.';
  } else if (overallRisk === 'high') {
    recommendation = '⚠️ RISQUE ÉLEVÉ: Surveillance accrue nécessaire. Identifier et traiter les facteurs de risque prioritaires dans les 30 jours.';
  } else if (overallRisk === 'medium') {
    recommendation = '⚡ RISQUE MODÉRÉ: Maintenir la vigilance et optimiser les processus pour réduire les risques.';
  } else {
    recommendation = '✅ RISQUE FAIBLE: Situation financière saine. Maintenir les bonnes pratiques et surveiller les indicateurs clés.';
  }
  
  return {
    overallRisk,
    score: Math.min(100, totalScore),
    factors,
    recommendation
  };
}

