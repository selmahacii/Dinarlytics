import { 
  REVENUE_SEGMENTS, 
  RevenueSegment, 
  getRevenueSegment, 
  getSegmentProgress, 
  getNextSegment, 
  getDistanceToNextThreshold 
} from '../types/revenueSegments';
import { COMPANY_TYPES, ACCESS_LEVELS } from '../types/CompanyTypes';
import { PermissionManager, USER_ROLES } from './PermissionManager';

export interface RevenueBasedRecommendation {
  id: string;
  type: 'upgrade' | 'downgrade' | 'warning' | 'opportunity' | 'compliance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: string;
  deadline?: string;
  savings?: number;
  icon: string;
  color: string;
}

export interface AccessConfiguration {
  companyType: string;
  revenue: number;
  segment: RevenueSegment;
  recommendedAccessLevel: string;
  availableModules: string[];
  availableRoles: string[];
  recommendations: RevenueBasedRecommendation[];
  alerts: string[];
  nextMilestone?: {
    threshold: number;
    distance: number;
    percentage: number;
  };
}

export class RevenueBasedAccessManager {
  /**
   * Génère une configuration d'accès complète basée sur le CA
   */
  static generateAccessConfiguration(
    companyType: string,
    revenue: number,
    currentAccessLevel?: string
  ): AccessConfiguration {
    const segment = getRevenueSegment(revenue);
    const recommendations: RevenueBasedRecommendation[] = [];

    // Vérifier si le type d'entreprise est adapté au CA
    const typeRecommendation = this.checkCompanyTypeAlignment(companyType, revenue, segment);
    if (typeRecommendation) {
      recommendations.push(typeRecommendation);
    }

    // Vérifier si le niveau d'accès est adapté
    if (currentAccessLevel) {
      const accessRecommendation = this.checkAccessLevelAlignment(currentAccessLevel, segment, revenue);
      if (accessRecommendation) {
        recommendations.push(accessRecommendation);
      }
    }

    // Recommandations fiscales
    const fiscalRecommendations = this.getFiscalRecommendations(revenue, segment);
    recommendations.push(...fiscalRecommendations);

    // Opportunités d'optimisation
    const optimizationRecommendations = this.getOptimizationRecommendations(revenue, segment);
    recommendations.push(...optimizationRecommendations);

    // Calculer le prochain jalon
    const distance = getDistanceToNextThreshold(revenue);
    const nextSegment = getNextSegment(revenue);
    const nextMilestone = distance !== null && nextSegment ? {
      threshold: segment.maxRevenue!,
      distance: distance,
      percentage: Math.round((distance / revenue) * 100)
    } : undefined;

    return {
      companyType,
      revenue,
      segment,
      recommendedAccessLevel: this.getRecommendedAccessLevel(segment, revenue),
      availableModules: this.getAvailableModules(segment, companyType),
      availableRoles: this.getAvailableRoles(companyType, segment),
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
      alerts: segment.alerts,
      nextMilestone
    };
  }

  /**
   * Vérifie l'alignement du type d'entreprise avec le CA
   */
  private static checkCompanyTypeAlignment(
    companyType: string,
    revenue: number,
    segment: RevenueSegment
  ): RevenueBasedRecommendation | null {
    const isRecommended = segment.recommendedCompanyTypes.includes(companyType);

    if (!isRecommended) {
      // Déterminer le meilleur type recommandé
      const recommendedType = segment.recommendedCompanyTypes[0];
      const recommendedTypeName = COMPANY_TYPES.find(t => t.id === recommendedType)?.name || recommendedType.toUpperCase();
      const currentTypeName = COMPANY_TYPES.find(t => t.id === companyType)?.name || companyType.toUpperCase();

      return {
        id: 'company-type-mismatch',
        type: 'upgrade',
        priority: revenue > 500000000 ? 'critical' : 'high',
        title: `Forme juridique inadaptée pour votre CA`,
        description: `Avec un CA de ${(revenue / 1000000).toFixed(1)}M DA, une structure ${recommendedTypeName} serait plus adaptée que votre ${currentTypeName} actuelle.`,
        action: `Envisager une transformation en ${recommendedTypeName}`,
        impact: 'Meilleure protection juridique, optimisation fiscale, crédibilité renforcée',
        icon: '🏢',
        color: 'orange',
        savings: revenue > 100000000 ? Math.round(revenue * 0.02) : undefined // Estimation 2% d'économies
      };
    }

    return null;
  }

  /**
   * Vérifie l'alignement du niveau d'accès avec le segment
   */
  private static checkAccessLevelAlignment(
    currentAccessLevel: string,
    segment: RevenueSegment,
    revenue: number
  ): RevenueBasedRecommendation | null {
    const isRecommended = segment.recommendedAccessLevel.includes(currentAccessLevel);

    if (!isRecommended) {
      const recommendedLevel = segment.recommendedAccessLevel[0];
      const recommendedLevelName = ACCESS_LEVELS.find(a => a.id === recommendedLevel)?.name || recommendedLevel;
      const currentLevelName = ACCESS_LEVELS.find(a => a.id === currentAccessLevel)?.name || currentAccessLevel;

      // Déterminer si upgrade ou downgrade
      const accessLevelOrder = ['starter', 'professional', 'enterprise'];
      const currentIndex = accessLevelOrder.indexOf(currentAccessLevel);
      const recommendedIndex = accessLevelOrder.indexOf(recommendedLevel);
      const isUpgrade = recommendedIndex > currentIndex;

      return {
        id: 'access-level-mismatch',
        type: isUpgrade ? 'upgrade' : 'downgrade',
        priority: isUpgrade ? 'high' : 'medium',
        title: isUpgrade 
          ? `Votre plan actuel limite votre croissance` 
          : `Votre plan actuel est surdimensionné`,
        description: `Avec un CA de ${(revenue / 1000000).toFixed(1)}M DA, le plan ${recommendedLevelName} est recommandé (actuellement: ${currentLevelName}).`,
        action: isUpgrade 
          ? `Passer au plan ${recommendedLevelName}` 
          : `Optimiser avec le plan ${recommendedLevelName}`,
        impact: isUpgrade 
          ? 'Débloquer des fonctionnalités essentielles pour votre taille'
          : 'Réduire les coûts sans perdre les fonctionnalités nécessaires',
        icon: isUpgrade ? '📈' : '💰',
        color: isUpgrade ? 'blue' : 'green',
        savings: isUpgrade ? undefined : 5000 // Économie potentielle
      };
    }

    return null;
  }

  /**
   * Génère des recommandations fiscales selon le CA
   */
  private static getFiscalRecommendations(
    revenue: number,
    segment: RevenueSegment
  ): RevenueBasedRecommendation[] {
    const recommendations: RevenueBasedRecommendation[] = [];

    // Proche du seuil TVA (si pertinent)
    if (revenue > 4500000 && revenue < 5000000) {
      recommendations.push({
        id: 'tva-threshold-warning',
        type: 'warning',
        priority: 'high',
        title: 'Attention : Seuil TVA proche',
        description: `Vous approchez du seuil de 5M DA. Au-delà, le régime fiscal change.`,
        action: 'Préparer la transition vers le régime réel',
        impact: 'Éviter les pénalités et optimiser la gestion fiscale',
        deadline: 'Avant fin d\'année fiscale',
        icon: '⚠️',
        color: 'yellow'
      });
    }

    // Obligation commissaire aux comptes
    if (revenue > 45000000 && revenue < 50000000) {
      recommendations.push({
        id: 'auditor-requirement',
        type: 'compliance',
        priority: 'critical',
        title: 'Commissaire aux comptes bientôt obligatoire',
        description: 'Au-delà de 50M DA, un commissaire aux comptes devient obligatoire.',
        action: 'Sélectionner et mandater un commissaire aux comptes',
        impact: 'Conformité légale assurée',
        deadline: 'Dans les 3 mois',
        icon: '📋',
        color: 'red'
      });
    }

    // Optimisation fiscale pour grandes entreprises
    if (revenue > 500000000) {
      recommendations.push({
        id: 'fiscal-optimization',
        type: 'opportunity',
        priority: 'medium',
        title: 'Opportunité d\'optimisation fiscale',
        description: 'Votre taille permet des stratégies d\'optimisation fiscale avancées.',
        action: 'Consulter un expert fiscal pour optimisation groupe',
        impact: 'Économies fiscales potentielles significatives',
        icon: '💡',
        color: 'purple',
        savings: Math.round(revenue * 0.015) // 1.5% d'économies potentielles
      });
    }

    return recommendations;
  }

  /**
   * Génère des recommandations d'optimisation
   */
  private static getOptimizationRecommendations(
    revenue: number,
    segment: RevenueSegment
  ): RevenueBasedRecommendation[] {
    const recommendations: RevenueBasedRecommendation[] = [];

    // Recommandation de modules selon la taille
    if (revenue > 20000000 && segment.id === 'small') {
      recommendations.push({
        id: 'analytics-opportunity',
        type: 'opportunity',
        priority: 'medium',
        title: 'Débloquez l\'analytics pour piloter votre croissance',
        description: 'Avec votre CA actuel, les outils d\'analytics vous aideront à identifier de nouvelles opportunités.',
        action: 'Activer le module Analytics avancé',
        impact: 'Meilleure visibilité sur la performance et les tendances',
        icon: '📊',
        color: 'blue'
      });
    }

    // Consolidation pour entreprises moyennes
    if (revenue > 100000000 && segment.id === 'medium') {
      recommendations.push({
        id: 'consolidation-opportunity',
        type: 'opportunity',
        priority: 'low',
        title: 'Consolidation multi-sociétés disponible',
        description: 'Si vous gérez plusieurs entités, la consolidation automatique vous fera gagner un temps précieux.',
        action: 'Explorer le module de consolidation',
        impact: 'Gain de temps sur le reporting et vision consolidée',
        icon: '🔄',
        color: 'indigo'
      });
    }

    return recommendations;
  }

  /**
   * Détermine le niveau d'accès recommandé
   */
  private static getRecommendedAccessLevel(segment: RevenueSegment, revenue: number): string {
    // Logique fine selon le CA dans le segment
    if (segment.id === 'micro') return 'starter';
    if (segment.id === 'small') {
      return revenue > 25000000 ? 'professional' : 'starter';
    }
    if (segment.id === 'medium') return 'professional';
    return 'enterprise'; // large et enterprise
  }

  /**
   * Obtient les modules disponibles selon segment et type
   */
  private static getAvailableModules(segment: RevenueSegment, companyType: string): string[] {
    const companyTypeInfo = COMPANY_TYPES.find(t => t.id === companyType);
    const segmentModules = segment.requiredModules;
    const typeModules = companyTypeInfo?.requiredModules || [];

    // Union des modules requis par le segment et le type
    return Array.from(new Set([...segmentModules, ...typeModules]));
  }

  /**
   * Obtient les rôles disponibles selon type et segment
   */
  private static getAvailableRoles(companyType: string, segment: RevenueSegment): string[] {
    const accessLevel = segment.recommendedAccessLevel[0];
    const availableRoles = PermissionManager.getAvailableRoles(companyType, accessLevel);
    return availableRoles.map(role => role.id);
  }

  /**
   * Calcule un score de santé de la configuration (0-100)
   */
  static calculateHealthScore(
    companyType: string,
    revenue: number,
    currentAccessLevel: string
  ): number {
    const segment = getRevenueSegment(revenue);
    let score = 100;

    // Pénalité si type inadapté
    if (!segment.recommendedCompanyTypes.includes(companyType)) {
      score -= 30;
    }

    // Pénalité si niveau d'accès inadapté
    if (!segment.recommendedAccessLevel.includes(currentAccessLevel)) {
      score -= 20;
    }

    // Bonus si proche du seuil supérieur (croissance)
    const progress = getSegmentProgress(revenue);
    if (progress > 80) {
      score -= 10; // Légère pénalité car risque de dépassement
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Génère un rapport détaillé pour démo
   */
  static generateDemoReport(companyName: string, companyType: string, revenue: number) {
    const config = this.generateAccessConfiguration(companyType, revenue);
    const healthScore = this.calculateHealthScore(companyType, revenue, config.recommendedAccessLevel);
    const progress = getSegmentProgress(revenue);

    return {
      company: {
        name: companyName,
        type: companyType,
        revenue: revenue,
        revenueFormatted: `${(revenue / 1000000).toFixed(1)}M DA`
      },
      segment: {
        current: config.segment.name,
        progress: progress,
        color: config.segment.color,
        icon: config.segment.icon
      },
      health: {
        score: healthScore,
        status: healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Bon' : healthScore >= 40 ? 'Moyen' : 'À améliorer',
        color: healthScore >= 80 ? 'green' : healthScore >= 60 ? 'blue' : healthScore >= 40 ? 'yellow' : 'red'
      },
      recommendations: config.recommendations,
      nextMilestone: config.nextMilestone,
      configuration: config
    };
  }
}

