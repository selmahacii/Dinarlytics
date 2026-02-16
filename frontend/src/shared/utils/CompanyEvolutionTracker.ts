import { getRevenueSegment, RevenueSegment } from '@/types/revenueSegments';

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  segment: string;
  employees?: number;
  profitMargin?: number;
}

export interface EvolutionMetrics {
  currentRevenue: number;
  previousRevenue: number;
  growthRate: number;
  growthAmount: number;
  trend: 'growing' | 'stable' | 'declining';
  segmentChanged: boolean;
  previousSegment?: string;
  currentSegment: string;
  projectedRevenue12Months: number;
  projectedSegment12Months: string;
  daysToNextThreshold?: number;
  healthTrend: 'improving' | 'stable' | 'declining';
}

export interface Alert {
  id: string;
  type: 'threshold' | 'growth' | 'decline' | 'opportunity';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  date: string;
  acknowledged: boolean;
}

export class CompanyEvolutionTracker {
  /**
   * Génère des données d'historique de CA pour la démo
   */
  static generateDemoHistory(
    currentRevenue: number,
    monthsBack: number = 12,
    growthRate: number = 15
  ): RevenueDataPoint[] {
    const history: RevenueDataPoint[] = [];
    const today = new Date();

    for (let i = monthsBack; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      
      // Calcul du CA avec croissance progressive et variations aléatoires
      const monthlyGrowthRate = growthRate / 12 / 100;
      const monthsFromStart = monthsBack - i;
      const baseRevenue = currentRevenue / Math.pow(1 + monthlyGrowthRate, i);
      
      // Ajouter de la variabilité (±5%)
      const variation = (Math.random() - 0.5) * 0.1;
      const revenue = baseRevenue * (1 + variation);
      
      const segment = getRevenueSegment(revenue);
      
      history.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(revenue),
        segment: segment.id,
        employees: Math.round((revenue / 1000000) * 2 + 2), // Approximation
        profitMargin: 8 + Math.random() * 7 // 8-15%
      });
    }

    return history;
  }

  /**
   * Calcule les métriques d'évolution
   */
  static calculateEvolutionMetrics(history: RevenueDataPoint[]): EvolutionMetrics {
    if (history.length < 2) {
      throw new Error('Au moins 2 points de données sont nécessaires');
    }

    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    const oldestAvailable = history[0];

    const currentRevenue = current.revenue;
    const previousRevenue = previous.revenue;
    
    // Taux de croissance
    const growthAmount = currentRevenue - previousRevenue;
    const growthRate = (growthAmount / previousRevenue) * 100;

    // Tendance
    let trend: 'growing' | 'stable' | 'declining';
    if (growthRate > 2) trend = 'growing';
    else if (growthRate < -2) trend = 'declining';
    else trend = 'stable';

    // Segments
    const currentSegmentInfo = getRevenueSegment(currentRevenue);
    const previousSegmentInfo = getRevenueSegment(previousRevenue);
    const segmentChanged = currentSegmentInfo.id !== previousSegmentInfo.id;

    // Projection à 12 mois (moyenne des 3 derniers mois de croissance)
    const recentHistory = history.slice(-3);
    const avgMonthlyGrowth = recentHistory.reduce((acc, point, idx) => {
      if (idx === 0) return acc;
      return acc + ((point.revenue - recentHistory[idx - 1].revenue) / recentHistory[idx - 1].revenue);
    }, 0) / (recentHistory.length - 1);

    const projectedRevenue12Months = currentRevenue * Math.pow(1 + avgMonthlyGrowth, 12);
    const projectedSegment12Months = getRevenueSegment(projectedRevenue12Months).id;

    // Jours jusqu'au prochain seuil
    let daysToNextThreshold: number | undefined;
    if (currentSegmentInfo.maxRevenue) {
      const remainingRevenue = currentSegmentInfo.maxRevenue - currentRevenue;
      const dailyGrowth = growthAmount / 30; // Approximation mensuelle
      if (dailyGrowth > 0) {
        daysToNextThreshold = Math.round(remainingRevenue / dailyGrowth);
      }
    }

    // Tendance de santé (basée sur la régularité de la croissance)
    const growthRates = history.slice(-6).map((point, idx, arr) => {
      if (idx === 0) return 0;
      return ((point.revenue - arr[idx - 1].revenue) / arr[idx - 1].revenue) * 100;
    }).slice(1);
    
    const growthVariance = this.calculateVariance(growthRates);
    let healthTrend: 'improving' | 'stable' | 'declining';
    if (growthVariance < 50 && growthRate > 0) healthTrend = 'improving';
    else if (growthRate < -5) healthTrend = 'declining';
    else healthTrend = 'stable';

    return {
      currentRevenue,
      previousRevenue,
      growthRate,
      growthAmount,
      trend,
      segmentChanged,
      previousSegment: segmentChanged ? previousSegmentInfo.id : undefined,
      currentSegment: currentSegmentInfo.id,
      projectedRevenue12Months,
      projectedSegment12Months,
      daysToNextThreshold,
      healthTrend
    };
  }

  /**
   * Génère des alertes basées sur l'évolution
   */
  static generateAlerts(
    history: RevenueDataPoint[],
    metrics: EvolutionMetrics
  ): Alert[] {
    const alerts: Alert[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Alerte changement de segment
    if (metrics.segmentChanged) {
      alerts.push({
        id: 'segment-change',
        type: 'threshold',
        severity: 'critical',
        title: 'Changement de segment fiscal',
        message: `Votre entreprise est passée du segment "${metrics.previousSegment}" à "${metrics.currentSegment}". Des obligations supplémentaires peuvent s'appliquer.`,
        date: today,
        acknowledged: false
      });
    }

    // Alerte croissance exceptionnelle
    if (metrics.growthRate > 20) {
      alerts.push({
        id: 'exceptional-growth',
        type: 'growth',
        severity: 'info',
        title: 'Croissance exceptionnelle détectée',
        message: `Votre CA a augmenté de ${metrics.growthRate.toFixed(1)}% ce mois-ci. Excellente performance ! Pensez à adapter votre infrastructure.`,
        date: today,
        acknowledged: false
      });
    }

    // Alerte déclin significatif
    if (metrics.growthRate < -10) {
      alerts.push({
        id: 'significant-decline',
        type: 'decline',
        severity: 'warning',
        title: 'Baisse significative du CA',
        message: `Attention : votre CA a diminué de ${Math.abs(metrics.growthRate).toFixed(1)}% ce mois-ci. Une analyse approfondie est recommandée.`,
        date: today,
        acknowledged: false
      });
    }

    // Alerte proximité seuil
    if (metrics.daysToNextThreshold && metrics.daysToNextThreshold < 180) {
      alerts.push({
        id: 'approaching-threshold',
        type: 'threshold',
        severity: 'warning',
        title: 'Seuil fiscal proche',
        message: `À ce rythme, vous atteindrez le prochain seuil fiscal dans environ ${Math.round(metrics.daysToNextThreshold / 30)} mois. Préparez la transition.`,
        date: today,
        acknowledged: false
      });
    }

    // Alerte changement de segment projeté
    if (metrics.projectedSegment12Months !== metrics.currentSegment) {
      const projectedSegmentInfo = getRevenueSegment(metrics.projectedRevenue12Months);
      alerts.push({
        id: 'projected-segment-change',
        type: 'opportunity',
        severity: 'info',
        title: 'Évolution prévue dans 12 mois',
        message: `Selon votre tendance actuelle, vous devriez atteindre le segment "${projectedSegmentInfo.name}" d'ici 12 mois. Anticipez les changements nécessaires.`,
        date: today,
        acknowledged: false
      });
    }

    return alerts;
  }

  /**
   * Génère des statistiques comparatives
   */
  static generateComparativeStats(history: RevenueDataPoint[]) {
    if (history.length < 2) return null;

    const current = history[history.length - 1];
    const oneYearAgo = history.length >= 12 ? history[history.length - 12] : history[0];
    const sixMonthsAgo = history.length >= 6 ? history[history.length - 6] : history[0];

    return {
      current: {
        revenue: current.revenue,
        segment: current.segment,
        date: current.date
      },
      oneYearAgo: {
        revenue: oneYearAgo.revenue,
        segment: oneYearAgo.segment,
        date: oneYearAgo.date,
        change: ((current.revenue - oneYearAgo.revenue) / oneYearAgo.revenue) * 100
      },
      sixMonthsAgo: {
        revenue: sixMonthsAgo.revenue,
        segment: sixMonthsAgo.segment,
        date: sixMonthsAgo.date,
        change: ((current.revenue - sixMonthsAgo.revenue) / sixMonthsAgo.revenue) * 100
      },
      averageMonthlyGrowth: this.calculateAverageMonthlyGrowth(history),
      bestMonth: this.findBestMonth(history),
      worstMonth: this.findWorstMonth(history)
    };
  }

  /**
   * Calcule la croissance mensuelle moyenne
   */
  private static calculateAverageMonthlyGrowth(history: RevenueDataPoint[]): number {
    if (history.length < 2) return 0;
    
    const growthRates = history.slice(1).map((point, idx) => {
      return ((point.revenue - history[idx].revenue) / history[idx].revenue) * 100;
    });

    return growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
  }

  /**
   * Trouve le meilleur mois
   */
  private static findBestMonth(history: RevenueDataPoint[]): { date: string; revenue: number; growth: number } {
    let bestMonth = history[0];
    let bestGrowth = 0;

    history.forEach((point, idx) => {
      if (idx === 0) return;
      const growth = ((point.revenue - history[idx - 1].revenue) / history[idx - 1].revenue) * 100;
      if (growth > bestGrowth) {
        bestGrowth = growth;
        bestMonth = point;
      }
    });

    return {
      date: bestMonth.date,
      revenue: bestMonth.revenue,
      growth: bestGrowth
    };
  }

  /**
   * Trouve le pire mois
   */
  private static findWorstMonth(history: RevenueDataPoint[]): { date: string; revenue: number; growth: number } {
    let worstMonth = history[0];
    let worstGrowth = 0;

    history.forEach((point, idx) => {
      if (idx === 0) return;
      const growth = ((point.revenue - history[idx - 1].revenue) / history[idx - 1].revenue) * 100;
      if (growth < worstGrowth) {
        worstGrowth = growth;
        worstMonth = point;
      }
    });

    return {
      date: worstMonth.date,
      revenue: worstMonth.revenue,
      growth: worstGrowth
    };
  }

  /**
   * Calcule la variance
   */
  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Génère un rapport complet pour la démo
   */
  static generateDemoEvolutionReport(currentRevenue: number, companyName: string) {
    const history = this.generateDemoHistory(currentRevenue, 12, 15);
    const metrics = this.calculateEvolutionMetrics(history);
    const alerts = this.generateAlerts(history, metrics);
    const comparativeStats = this.generateComparativeStats(history);

    return {
      companyName,
      history,
      metrics,
      alerts,
      comparativeStats,
      generatedAt: new Date().toISOString()
    };
  }
}



