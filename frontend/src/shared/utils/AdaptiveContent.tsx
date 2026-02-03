import React from 'react';
import { User, Devise } from '../types';
import { COMPANY_SIZES } from '../types/CompanyTypes';
import { Country } from '../utils/fiscalDocuments';

export interface ContentContext {
  user: User | null;
  segment: string;
  companyType: string;
  role: string;
  hasPermission: (permission: string) => boolean;
  currentDevise?: Devise;
  currentCountry?: Country;
  planComptable?: 'algerien' | 'international';
}

export interface AdaptiveContent {
  title: string;
  subtitle: string;
  description: string;
  tips: string[];
  insights: string[];
  metrics: string[];
  actions: string[];
  lockedMessage?: string;
}

/**
 * Générateur de contenu adaptatif selon le contexte utilisateur
 */
export class AdaptiveContentGenerator {
  /**
   * Génère un contenu adaptatif pour une page
   */
  static generatePageContent(
    pageId: string,
    context: ContentContext
  ): AdaptiveContent {
    const { user, segment, companyType, role, hasPermission, currentDevise, currentCountry, planComptable } = context;
    
    const companySize = COMPANY_SIZES.find(s => s.id === segment) || COMPANY_SIZES[0];
    const revenue = user?.revenue || 0;
    
    // Contenu de base selon la page
    const baseContent = this.getBaseContent(pageId, currentDevise, currentCountry, planComptable);
    
    // Adaptation selon le segment
    const segmentContent = this.adaptBySegment(baseContent, segment, companySize, currentDevise, currentCountry, planComptable);
    
    // Adaptation selon le rôle
    const roleContent = this.adaptByRole(segmentContent, role, hasPermission, planComptable);
    
    // Adaptation selon le type d'entreprise
    const finalContent = this.adaptByCompanyType(roleContent, companyType, currentCountry, planComptable);
    
    return finalContent;
  }

  /**
   * Contenu de base pour chaque page
   */
  private static getBaseContent(
    pageId: string,
    devise?: Devise,
    country?: Country,
    planComptable?: 'algerien' | 'international'
  ): AdaptiveContent {
    const countryName = this.getCountryName(country);
    const planName = planComptable === 'algerien' ? 'SCF' : planComptable === 'international' ? 'IFRS/GAAP' : '';
    const deviseSymbol = devise === 'DZD' ? 'DA' : devise === 'EUR' ? '€' : devise === 'USD' ? '$' : '';
    
    const contents: Record<string, AdaptiveContent> = {
      dashboard: {
        title: 'Tableau de Bord Financier',
        subtitle: 'Vue d\'ensemble de votre activité',
        description: `Analysez vos performances financières en temps réel${planName ? ` selon les normes ${planName}` : ''}${countryName ? ` - Conformité ${countryName}` : ''}`,
        tips: [],
        insights: [],
        metrics: [],
        actions: []
      },
      clients: {
        title: 'Gestion Clients',
        subtitle: 'Analyse et suivi de votre clientèle',
        description: 'Optimisez vos relations clients avec des analyses approfondies',
        tips: [],
        insights: [],
        metrics: [],
        actions: []
      },
      factures: {
        title: 'Facturation',
        subtitle: 'Gestion complète de vos factures',
        description: 'Créez, suivez et analysez vos factures avec des outils avancés',
        tips: [],
        insights: [],
        metrics: [],
        actions: []
      },
      comptabilite: {
        title: 'Comptabilité Générale',
        subtitle: 'Gestion comptable complète',
        description: 'Suivez votre comptabilité avec des outils professionnels',
        tips: [],
        insights: [],
        metrics: [],
        actions: []
      },
      tresorerie: {
        title: 'Trésorerie',
        subtitle: 'Suivi de votre liquidité',
        description: 'Analysez et prévoyez vos flux de trésorerie',
        tips: [],
        insights: [],
        metrics: [],
        actions: []
      },
      rapports: {
        title: 'Rapports & Analyses',
        subtitle: 'Analyses financières approfondies',
        description: 'Générez des rapports détaillés pour prendre des décisions éclairées',
        tips: [],
        insights: [],
        metrics: [],
        actions: []
      },
      inventaire: {
        title: 'Gestion des Stocks',
        subtitle: 'Optimisation de votre inventaire',
        description: 'Suivez vos stocks et optimisez vos rotations',
        tips: [],
        insights: [],
        metrics: [],
        actions: []
      },
      fiscalite: {
        title: 'Fiscalité & Déclarations',
        subtitle: 'Conformité fiscale simplifiée',
        description: 'Gérez vos déclarations fiscales en toute conformité',
        tips: [],
        insights: [],
        metrics: [],
        actions: []
      },
      'gestion-utilisateurs': {
        title: 'Gestion des Utilisateurs',
        subtitle: 'Administration des utilisateurs, rôles et permissions',
        description: 'Gérez les utilisateurs du système, leurs rôles, permissions et accès selon les besoins de votre entreprise',
        tips: [],
        insights: [],
        metrics: [],
        actions: []
      }
    };

    return contents[pageId] || {
      title: 'Page',
      subtitle: '',
      description: '',
      tips: [],
      insights: [],
      metrics: [],
      actions: []
    };
  }

  /**
   * Adaptation selon le segment d'entreprise
   */
  private static adaptBySegment(
    content: AdaptiveContent,
    segment: string,
    companySize: typeof COMPANY_SIZES[0],
    devise?: Devise,
    country?: Country,
    planComptable?: 'algerien' | 'international'
  ): AdaptiveContent {
    const adapted = { ...content };
    const countryName = this.getCountryName(country);
    const declarationName = this.getDeclarationName(country);

    switch (segment) {
      case 'micro':
        adapted.description = `Solution professionnelle adaptée aux ${companySize.name.toLowerCase()}. ${content.description}`;
        adapted.tips = [
          'Surveillez quotidiennement vos indicateurs clés de performance : chiffre d\'affaires, trésorerie disponible, et créances clients',
          'Priorisez le suivi de vos 3 à 5 clients principaux représentant 80% de votre activité',
          `Automatisez vos déclarations fiscales (${declarationName}) pour garantir la conformité et optimiser votre temps`,
          'Analysez votre rentabilité mensuelle par produit/service pour identifier les opportunités d\'optimisation tarifaire',
          'Maintenez un suivi rigoureux de votre besoin en fonds de roulement (BFR)',
          'Établissez un tableau de bord de trésorerie prévisionnel sur 13 semaines'
        ];
        adapted.insights = [
          'Votre structure nécessite une gestion financière optimisée et réactive',
          'La croissance de votre chiffre d\'affaires doit être accompagnée d\'un suivi rigoureux de la rentabilité',
          'La trésorerie est le nerf de la guerre : surveillez-la quotidiennement et anticipez les besoins',
          'L\'automatisation des processus administratifs vous libère du temps pour développer votre activité'
        ];
        break;

      case 'small':
        adapted.description = `Solution professionnelle pour ${companySize.name.toLowerCase()}. ${content.description}`;
        adapted.tips = [
          '📊 Analysez la segmentation de votre clientèle pour identifier les opportunités de croissance et optimiser votre mix commercial',
          '💼 Utilisez les rapports de rentabilité par produit/service pour orienter votre stratégie commerciale',
          '⚡ Automatisez vos processus de relance clients pour réduire votre délai moyen de recouvrement (DSO)',
          '📈 Suivez mensuellement vos indicateurs de performance clés (KPI) : marge brute, taux de croissance, rotation des stocks',
          '🔍 Comparez vos performances avec les périodes précédentes et les benchmarks sectoriels',
          `📋 Optimisez votre gestion fiscale avec les déclarations ${declarationName} automatisées`
        ];
        adapted.insights = [
          'Votre entreprise nécessite une gestion financière structurée et des analyses régulières',
          'L\'analyse financière approfondie vous permet de prendre des décisions stratégiques éclairées',
          'L\'optimisation continue de vos processus opérationnels améliore directement votre rentabilité',
          'La maîtrise de votre trésorerie et de votre BFR est essentielle pour votre développement'
        ];
        break;

      case 'medium':
        adapted.description = `Solution avancée pour ${companySize.name.toLowerCase()}. ${content.description}`;
        adapted.tips = [
          '💡 Utilisez les analyses prédictives pour anticiper les tendances',
          '📊 Créez des tableaux de bord personnalisés par département',
          '⚡ Mettez en place des alertes automatiques pour les seuils critiques',
          '📈 Analysez vos ratios financiers pour évaluer votre santé financière',
          '🔍 Utilisez la consolidation multi-entreprises si applicable',
          '📋 Générez des rapports détaillés pour vos investisseurs'
        ];
        adapted.insights = [
          'Votre entreprise nécessite une gestion avancée et des analyses approfondies',
          'Les outils d\'analyse financière sont essentiels pour votre croissance',
          'Optimisez vos processus avec des données en temps réel'
        ];
        break;

      case 'large':
        adapted.description = `Solution enterprise pour ${companySize.name.toLowerCase()}. ${content.description}`;
        adapted.tips = [
          '💡 Utilisez le Business Intelligence pour des analyses stratégiques',
          '📊 Créez des tableaux de bord exécutifs pour la direction',
          '⚡ Mettez en place des workflows d\'approbation automatisés',
          '📈 Analysez vos performances multi-entreprises avec consolidation',
          '🔍 Utilisez l\'audit trail pour la traçabilité complète',
          '📋 Générez des rapports réglementaires automatiques',
          '🎯 Implémentez des analyses prédictives et de l\'IA'
        ];
        adapted.insights = [
          'Votre entreprise nécessite une solution enterprise complète',
          'L\'analyse financière avancée est cruciale pour votre stratégie',
          'Optimisez vos opérations avec des données en temps réel et des prévisions'
        ];
        break;
    }

    return adapted;
  }

  /**
   * Adaptation selon le rôle utilisateur
   */
  private static adaptByRole(
    content: AdaptiveContent,
    role: string,
    hasPermission: (permission: string) => boolean,
    planComptable?: 'algerien' | 'international'
  ): AdaptiveContent {
    const adapted = { ...content };

    switch (role) {
      case 'admin':
        adapted.description = `${content.description} - Accès administrateur complet`;
        adapted.actions = [
          '🔧 Configurez les paramètres système',
          '👥 Gérez les utilisateurs et permissions',
          '📊 Accédez à toutes les analyses',
          '🔐 Contrôlez la sécurité et l\'audit'
        ];
        break;

      case 'comptable':
      case 'comptable-senior':
        const planName = planComptable === 'algerien' ? 'SCF (Système Comptable Financier)' : planComptable === 'international' ? 'IFRS/GAAP' : 'comptable';
        adapted.description = `${content.description} - Interface comptable professionnelle conforme aux normes ${planName}`;
        adapted.actions = [
          '📝 Enregistrez les écritures comptables selon les normes en vigueur',
          '📊 Analysez les comptes, balances et soldes intermédiaires de gestion',
          '📋 Générez les états financiers réglementaires (bilan, compte de résultat, annexes)',
          '✅ Validez les écritures et procédez aux clôtures comptables',
          '🔍 Effectuez les rapprochements bancaires et la révision comptable'
        ];
        adapted.insights = [
          ...adapted.insights,
          'La conformité comptable selon les normes ' + planName + ' est essentielle pour la fiabilité de vos états financiers',
          'Surveillez régulièrement les écarts, anomalies et soldes anormaux pour garantir l\'intégrité comptable',
          'L\'analyse des ratios financiers vous permet d\'évaluer la santé financière de l\'entreprise'
        ];
        break;

      case 'comptable-junior':
        adapted.description = `${content.description} - Vue simplifiée pour assistant`;
        adapted.actions = [
          '📝 Saisissez les écritures simples',
          '👁️ Consultez les données (lecture)',
          '📋 Consultez les rapports de base'
        ];
        adapted.insights = [
          ...adapted.insights,
          'Votre accès est limité - certaines actions nécessitent une approbation'
        ];
        break;

      case 'manager':
        adapted.description = `${content.description} - Vue managériale stratégique`;
        adapted.actions = [
          '📊 Analysez les performances globales',
          '📈 Consultez les tableaux de bord exécutifs',
          '✅ Validez les décisions importantes',
          '📋 Générez des rapports pour la direction'
        ];
        adapted.insights = [
          ...adapted.insights,
          'Focus sur les indicateurs stratégiques',
          'Prenez des décisions basées sur les données'
        ];
        break;

      case 'vendeur':
        adapted.description = `${content.description} - Vue commerciale`;
        adapted.actions = [
          '📝 Créez des factures et devis',
          '👥 Consultez les informations clients',
          '📊 Suivez vos performances de vente'
        ];
        break;

      case 'auditeur':
        adapted.description = `${content.description} - Mode audit (lecture seule)`;
        adapted.actions = [
          '👁️ Consultez toutes les données',
          '📋 Générez des rapports d\'audit',
          '🔍 Analysez les traces et logs'
        ];
        adapted.insights = [
          ...adapted.insights,
          'Mode lecture seule - aucune modification possible'
        ];
        break;
    }

    return adapted;
  }

  /**
   * Adaptation selon le type d'entreprise
   */
  private static adaptByCompanyType(
    content: AdaptiveContent,
    companyType: string,
    country?: Country,
    planComptable?: 'algerien' | 'international'
  ): AdaptiveContent {
    const adapted = { ...content };
    const countryName = this.getCountryName(country);
    const declarationName = this.getDeclarationName(country);

    switch (companyType) {
      case 'eurl':
        adapted.description = `${content.description} - Solution optimisée pour EURL${countryName ? ` (${countryName})` : ''}`;
        // Conseils spécifiques EURL - version professionnelle
        adapted.tips = [
          ...adapted.tips,
          'Interface de gestion financière adaptée aux spécificités des EURL',
          `Déclarations fiscales automatisées (${declarationName}) pour garantir la conformité`,
          'Optimisation fiscale légale : suivi des charges déductibles et des amortissements',
          'Tableaux de bord simplifiés pour un pilotage efficace de votre activité'
        ];
        // Insights financiers spécifiques EURL - version professionnelle (éviter les doublons)
        const existingInsights = new Set(adapted.insights);
        const newInsights = [
          'Votre structure nécessite une gestion financière optimisée et réactive',
          'La croissance de votre chiffre d\'affaires doit être accompagnée d\'un suivi rigoureux de la rentabilité',
          'La trésorerie est le nerf de la guerre : surveillez-la quotidiennement et anticipez les besoins',
          'L\'automatisation des processus administratifs vous libère du temps pour développer votre activité'
        ];
        newInsights.forEach(insight => {
          if (!existingInsights.has(insight)) {
            adapted.insights.push(insight);
            existingInsights.add(insight);
          }
        });
        break;

      case 'sarl':
        adapted.description = `${content.description} - Optimisé pour SARL`;
        adapted.tips = [
          ...adapted.tips,
          '🏢 Gestion complète pour SARL',
          '👥 Gestion multi-utilisateurs',
          '📊 Rapports de gestion avancés'
        ];
        break;

      case 'spa':
        adapted.description = `${content.description} - Optimisé pour SPA`;
        adapted.tips = [
          ...adapted.tips,
          '🏢 Solution enterprise pour SPA',
          '🏭 Gestion multi-entreprises',
          '📊 Consolidation comptable',
          '🔍 Audit et conformité avancés'
        ];
        break;
    }

    return adapted;
  }

  /**
   * Génère un message d'aide contextuel
   */
  static generateHelpMessage(
    pageId: string,
    context: ContentContext
  ): string {
    const content = this.generatePageContent(pageId, context);
    return content.description;
  }

  /**
   * Génère des métriques suggérées selon le contexte
   */
  static generateSuggestedMetrics(
    pageId: string,
    context: ContentContext
  ): string[] {
    const { segment, role } = context;

    const metricsByPage: Record<string, Record<string, string[]>> = {
      dashboard: {
        micro: ['CA mensuel', 'Trésorerie', 'Factures impayées'],
        small: ['CA mensuel', 'Trésorerie', 'Rentabilité', 'Croissance'],
        medium: ['CA mensuel', 'EBITDA', 'Rentabilité', 'Croissance', 'Ratios financiers'],
        large: ['CA mensuel', 'EBITDA', 'Rentabilité', 'Croissance', 'Ratios financiers', 'Consolidation']
      },
      clients: {
        micro: ['Nombre clients', 'CA par client', 'Taux fidélisation'],
        small: ['Nombre clients', 'CA par client', 'Taux fidélisation', 'Panier moyen'],
        medium: ['Nombre clients', 'CA par client', 'Taux fidélisation', 'Panier moyen', 'Segmentation'],
        large: ['Nombre clients', 'CA par client', 'Taux fidélisation', 'Panier moyen', 'Segmentation', 'LTV']
      }
    };

    return metricsByPage[pageId]?.[segment] || [];
  }

  /**
   * Obtient le nom du pays
   */
  private static getCountryName(country?: Country): string {
    if (!country) return '';
    switch (country) {
      case 'DZ': return 'Algérie';
      case 'FR': return 'France';
      case 'DE': return 'Allemagne';
      case 'IT': return 'Italie';
      case 'US': return 'États-Unis';
      case 'EU': return 'Europe';
      default: return '';
    }
  }

  /**
   * Obtient le nom de la déclaration fiscale selon le pays
   */
  private static getDeclarationName(country?: Country): string {
    if (!country) return 'fiscales';
    switch (country) {
      case 'DZ': return 'G50';
      case 'FR': return 'CA3';
      case 'DE': return 'Umsatzsteuererklärung';
      case 'IT': return 'Dichiarazione IVA';
      case 'US': return 'Sales Tax Return';
      case 'EU': return 'VAT Return';
      default: return 'fiscales';
    }
  }
}

/**
 * Composant React pour afficher du contenu adaptatif
 */
export const AdaptiveContentDisplay: React.FC<{
  pageId: string;
  context: ContentContext;
  showTips?: boolean;
  showInsights?: boolean;
}> = ({ pageId, context, showTips = true, showInsights = true }) => {
  const content = AdaptiveContentGenerator.generatePageContent(pageId, context);
  
  // Ne pas afficher les conseils/insights sur la page facturation - ils seront en notifications
  const hideTipsOnFacturation = pageId === 'factures' || pageId === 'facturation';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{content.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{content.subtitle}</p>
        <p className="text-slate-700 dark:text-slate-300 mt-2">{content.description}</p>
      </div>

      {!hideTipsOnFacturation && showTips && content.tips.length > 0 && (
        <div className="space-y-2">
          {content.tips.map((tip, index) => {
            // Retirer les emojis du texte
            const cleanTip = tip.replace(/^[^\s]+\s/, '');
            return (
              <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 px-4 py-2 rounded">
                <p className="text-sm text-slate-700 dark:text-slate-300">{cleanTip}</p>
              </div>
            );
          })}
        </div>
      )}

      {!hideTipsOnFacturation && showInsights && content.insights.length > 0 && (
        <div className="space-y-2 mt-4">
          {Array.from(new Set(content.insights)).map((insight, index) => (
            <div key={index} className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 dark:border-emerald-400 px-4 py-2 rounded">
              <p className="text-sm text-slate-700 dark:text-slate-300">{insight}</p>
            </div>
          ))}
        </div>
      )}

      {content.lockedMessage && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">{content.lockedMessage}</p>
        </div>
      )}
    </div>
  );
};

