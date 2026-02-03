import { getRevenueSegment, RevenueSegment } from '../types/revenueSegments';

export interface ComplianceItem {
  id: string;
  category: 'declaration' | 'document' | 'audit' | 'tax' | 'social';
  title: string;
  description: string;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'onDemand';
  deadline?: string;
  status: 'compliant' | 'warning' | 'overdue' | 'upcoming';
  priority: 'critical' | 'high' | 'medium' | 'low';
  lastCompleted?: string;
  nextDue?: string;
  penalty?: number;
  requiredFor: string[]; // segments
}

export interface FiscalCompliance {
  overallStatus: 'compliant' | 'attention' | 'critical';
  complianceScore: number;
  totalItems: number;
  compliantItems: number;
  warningItems: number;
  overdueItems: number;
  items: ComplianceItem[];
  recommendations: string[];
}

export class FiscalComplianceChecker {
  /**
   * Génère la liste complète des obligations fiscales selon le segment
   */
  static getComplianceItems(revenue: number, companyType: string): ComplianceItem[] {
    const segment = getRevenueSegment(revenue);
    const items: ComplianceItem[] = [];

    // Obligations communes à tous
    items.push({
      id: 'g50-declaration',
      category: 'declaration',
      title: 'Déclaration G50 (Série G)',
      description: 'Déclaration mensuelle du chiffre d\'affaires et taxes',
      frequency: 'monthly',
      status: 'compliant',
      priority: 'critical',
      lastCompleted: this.getLastMonth(),
      nextDue: this.getNextDeadline('monthly', 20),
      requiredFor: ['micro', 'small', 'medium', 'large', 'enterprise']
    });

    items.push({
      id: 'tva-payment',
      category: 'tax',
      title: 'Paiement TVA',
      description: 'Versement mensuel de la TVA collectée',
      frequency: 'monthly',
      status: 'upcoming',
      priority: 'critical',
      nextDue: this.getNextDeadline('monthly', 20),
      penalty: 25000,
      requiredFor: ['small', 'medium', 'large', 'enterprise']
    });

    // Obligations spécifiques selon le segment
    if (segment.id !== 'micro') {
      items.push({
        id: 'bilan-annuel',
        category: 'document',
        title: 'Bilan Comptable Annuel',
        description: 'Établissement et dépôt du bilan et compte de résultat',
        frequency: 'annual',
        status: 'compliant',
        priority: 'critical',
        lastCompleted: this.getLastYear(),
        nextDue: this.getNextDeadline('annual', 30, 3),
        requiredFor: ['small', 'medium', 'large', 'enterprise']
      });

      items.push({
        id: 'ibs-declaration',
        category: 'declaration',
        title: 'Déclaration IBS/IRG',
        description: 'Déclaration annuelle de l\'impôt sur les bénéfices',
        frequency: 'annual',
        status: 'upcoming',
        priority: 'high',
        nextDue: this.getNextDeadline('annual', 30, 3),
        requiredFor: ['small', 'medium', 'large', 'enterprise']
      });
    }

    // Obligations pour moyennes et grandes entreprises
    if (segment.id === 'medium' || segment.id === 'large' || segment.id === 'enterprise') {
      items.push({
        id: 'commissaire-rapport',
        category: 'audit',
        title: 'Rapport du Commissaire aux Comptes',
        description: 'Audit annuel obligatoire par un commissaire aux comptes agréé',
        frequency: 'annual',
        status: revenue > 50000000 ? 'warning' : 'compliant',
        priority: 'critical',
        nextDue: this.getNextDeadline('annual', 30, 5),
        penalty: 100000,
        requiredFor: ['medium', 'large', 'enterprise']
      });

      items.push({
        id: 'declarations-sociales',
        category: 'social',
        title: 'Déclarations CNAS/CASNOS',
        description: 'Déclarations mensuelles et trimestrielles de sécurité sociale',
        frequency: 'monthly',
        status: 'compliant',
        priority: 'high',
        lastCompleted: this.getLastMonth(),
        nextDue: this.getNextDeadline('monthly', 10),
        requiredFor: ['medium', 'large', 'enterprise']
      });

      items.push({
        id: 'rapport-gestion',
        category: 'document',
        title: 'Rapport de Gestion',
        description: 'Rapport annuel de gestion pour l\'assemblée générale',
        frequency: 'annual',
        status: 'upcoming',
        priority: 'medium',
        nextDue: this.getNextDeadline('annual', 30, 5),
        requiredFor: ['medium', 'large', 'enterprise']
      });
    }

    // Obligations pour grandes et très grandes entreprises
    if (segment.id === 'large' || segment.id === 'enterprise') {
      items.push({
        id: 'etats-consolides',
        category: 'document',
        title: 'États Financiers Consolidés',
        description: 'Consolidation des comptes si groupe ou filiales',
        frequency: 'annual',
        status: 'warning',
        priority: 'critical',
        nextDue: this.getNextDeadline('annual', 30, 4),
        requiredFor: ['large', 'enterprise']
      });

      items.push({
        id: 'publication-legale',
        category: 'document',
        title: 'Publication Légale des Comptes',
        description: 'Publication au BAOSEM (Bulletin Officiel)',
        frequency: 'annual',
        status: 'upcoming',
        priority: 'high',
        nextDue: this.getNextDeadline('annual', 30, 6),
        penalty: 50000,
        requiredFor: ['large', 'enterprise']
      });

      items.push({
        id: 'comite-audit',
        category: 'audit',
        title: 'Rapport du Comité d\'Audit',
        description: 'Réunions et rapports du comité d\'audit interne',
        frequency: 'quarterly',
        status: 'compliant',
        priority: 'medium',
        lastCompleted: this.getLastQuarter(),
        nextDue: this.getNextDeadline('quarterly', 15),
        requiredFor: ['large', 'enterprise']
      });
    }

    // Obligations spécifiques aux très grandes entreprises
    if (segment.id === 'enterprise') {
      items.push({
        id: 'reporting-groupe',
        category: 'document',
        title: 'Reporting Groupe Consolidé',
        description: 'Reporting financier consolidé mensuel du groupe',
        frequency: 'monthly',
        status: 'compliant',
        priority: 'high',
        lastCompleted: this.getLastMonth(),
        nextDue: this.getNextDeadline('monthly', 15),
        requiredFor: ['enterprise']
      });

      items.push({
        id: 'conformite-internationale',
        category: 'audit',
        title: 'Conformité Réglementaire Internationale',
        description: 'Audit de conformité aux normes internationales (IFRS)',
        frequency: 'annual',
        status: 'upcoming',
        priority: 'medium',
        nextDue: this.getNextDeadline('annual', 30, 6),
        requiredFor: ['enterprise']
      });
    }

    // Filtrer selon le segment actuel
    return items.filter(item => item.requiredFor.includes(segment.id));
  }

  /**
   * Calcule le statut global de conformité
   */
  static calculateCompliance(revenue: number, companyType: string): FiscalCompliance {
    const items = this.getComplianceItems(revenue, companyType);
    
    const compliantItems = items.filter(i => i.status === 'compliant').length;
    const warningItems = items.filter(i => i.status === 'warning').length;
    const overdueItems = items.filter(i => i.status === 'overdue').length;
    
    const complianceScore = Math.round((compliantItems / items.length) * 100);
    
    let overallStatus: 'compliant' | 'attention' | 'critical';
    if (overdueItems > 0) {
      overallStatus = 'critical';
    } else if (warningItems > 2) {
      overallStatus = 'attention';
    } else {
      overallStatus = 'compliant';
    }

    const recommendations = this.generateRecommendations(items, revenue);

    return {
      overallStatus,
      complianceScore,
      totalItems: items.length,
      compliantItems,
      warningItems,
      overdueItems,
      items,
      recommendations
    };
  }

  /**
   * Génère des recommandations basées sur la conformité
   */
  private static generateRecommendations(items: ComplianceItem[], revenue: number): string[] {
    const recommendations: string[] = [];
    const segment = getRevenueSegment(revenue);

    // Recommandations pour items en retard
    const overdueItems = items.filter(i => i.status === 'overdue');
    if (overdueItems.length > 0) {
      recommendations.push(
        `⚠️ ${overdueItems.length} obligation(s) en retard. Régularisez rapidement pour éviter des pénalités.`
      );
    }

    // Recommandations pour items en warning
    const warningItems = items.filter(i => i.status === 'warning');
    if (warningItems.length > 0) {
      recommendations.push(
        `📋 ${warningItems.length} obligation(s) nécessitent votre attention dans les prochains jours.`
      );
    }

    // Recommandation commissaire aux comptes
    if (revenue > 45000000 && revenue < 50000000) {
      recommendations.push(
        '🔔 Vous approchez du seuil de 50M DA. Un commissaire aux comptes sera bientôt obligatoire.'
      );
    }

    // Recommandation changement de segment
    if (segment.maxRevenue && revenue > segment.maxRevenue * 0.9) {
      recommendations.push(
        '📈 Vous approchez du prochain segment fiscal. Anticipez les nouvelles obligations.'
      );
    }

    // Recommandation générale
    if (recommendations.length === 0) {
      recommendations.push(
        '✅ Excellente conformité ! Maintenez ce niveau pour éviter toute pénalité.'
      );
    }

    return recommendations;
  }

  /**
   * Utilitaires de dates
   */
  private static getLastMonth(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  private static getLastQuarter(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  }

  private static getLastYear(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  }

  private static getNextDeadline(
    frequency: 'monthly' | 'quarterly' | 'annual',
    day: number,
    month?: number
  ): string {
    const date = new Date();
    
    switch (frequency) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        date.setDate(day);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        date.setDate(day);
        break;
      case 'annual':
        date.setFullYear(date.getFullYear() + 1);
        if (month) date.setMonth(month - 1);
        date.setDate(day);
        break;
    }
    
    return date.toISOString().split('T')[0];
  }

  /**
   * Calcule les pénalités potentielles
   */
  static calculatePotentialPenalties(revenue: number, companyType: string): number {
    const compliance = this.calculateCompliance(revenue, companyType);
    return compliance.items
      .filter(item => item.status === 'overdue' && item.penalty)
      .reduce((total, item) => total + (item.penalty || 0), 0);
  }

  /**
   * Génère un calendrier fiscal pour l'année
   */
  static generateFiscalCalendar(revenue: number, companyType: string) {
    const items = this.getComplianceItems(revenue, companyType);
    
    const calendar = items.map(item => ({
      title: item.title,
      category: item.category,
      frequency: item.frequency,
      nextDue: item.nextDue,
      priority: item.priority,
      status: item.status
    })).sort((a, b) => {
      if (!a.nextDue) return 1;
      if (!b.nextDue) return -1;
      return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
    });

    return calendar;
  }
}

