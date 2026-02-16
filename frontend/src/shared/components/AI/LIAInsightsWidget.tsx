import React, { useState, useEffect, useMemo } from 'react';
import { SparklesIcon, LightBulbIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { useLIA } from '@shared/hooks/useLIA';
import { detectAnomalies, comparePeriods } from '@shared/utils/financialAnalysis';

interface LIAInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  question: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface LIAInsightsWidgetProps {
  /**
   * Données de l'entreprise à analyser
   */
  data?: any;
  
  /**
   * Actualisation automatique
   */
  autoRefresh?: boolean;
  
  /**
   * Nombre maximum d'insights à afficher
   */
  maxInsights?: number;
  
  /**
   * Afficher le bouton "Voir plus"
   */
  showMoreButton?: boolean;
  
  /**
   * Classe CSS personnalisée
   */
  className?: string;
}

/**
 * Widget d'insights LIA qui analyse les données et propose des recommandations
 */
const LIAInsightsWidget: React.FC<LIAInsightsWidgetProps> = ({
  data,
  autoRefresh = true,
  maxInsights = 5,
  showMoreButton = true,
  className = ''
}) => {
  const { companyData, formatCurrency } = useApp();
  const { openLIA } = useLIA();
  const [insights, setInsights] = useState<LIAInsight[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const companyDataToAnalyze = data || companyData;

  /**
   * Génère les insights basés sur les données
   */
  const generateInsights = useMemo(() => {
    if (!companyDataToAnalyze) return [];

    const newInsights: LIAInsight[] = [];

    // Analyse de la trésorerie
    const cashBalance = companyDataToAnalyze.cashBalance || 0;
    const revenueMonth = companyDataToAnalyze.revenueMonth || 0;
    const cashRatio = cashBalance / Math.max(1, revenueMonth);

    if (cashRatio < 0.5) {
      newInsights.push({
        id: 'cash-low',
        type: 'warning',
        title: 'Trésorerie faible',
        message: `Votre trésorerie représente ${(cashRatio * 100).toFixed(0)}% de votre CA mensuel. Il est recommandé de maintenir au moins 50%.`,
        question: 'Comment améliorer ma trésorerie ?',
        action: {
          label: 'Voir les recommandations',
          onClick: () => openLIA('Comment améliorer ma trésorerie ?', { section: 'tresorerie' })
        }
      });
    } else if (cashRatio > 2) {
      newInsights.push({
        id: 'cash-high',
        type: 'info',
        title: 'Trésorerie élevée',
        message: `Votre trésorerie est élevée (${(cashRatio * 100).toFixed(0)}% du CA). Envisagez d'investir ou de rembourser des dettes.`,
        question: 'Comment optimiser ma trésorerie excédentaire ?'
      });
    }

    // Analyse des créances clients
    const accountsReceivable = companyDataToAnalyze.accountsReceivable || 0;
    const dso = Math.round((accountsReceivable / Math.max(1, revenueMonth)) * 30);

    if (dso > 45) {
      newInsights.push({
        id: 'dso-high',
        type: 'warning',
        title: 'Délai de recouvrement élevé',
        message: `Vos clients mettent en moyenne ${dso} jours à payer. Cible recommandée : moins de 30 jours.`,
        question: 'Comment réduire mon délai de recouvrement ?',
        action: {
          label: 'Optimiser le recouvrement',
          onClick: () => openLIA('Comment réduire mon délai de recouvrement client ?', { section: 'clients' })
        }
      });
    }

    // Analyse des stocks
    const inventoryValue = companyDataToAnalyze.inventoryValue || 0;
    const stockTurnover = companyDataToAnalyze.stockTurnover || 0;

    if (stockTurnover > 0 && stockTurnover < 4) {
      newInsights.push({
        id: 'stock-slow',
        type: 'warning',
        title: 'Rotation de stock lente',
        message: `Vos stocks tournent ${stockTurnover.toFixed(1)} fois par an. Une rotation plus rapide améliorerait votre trésorerie.`,
        question: 'Comment optimiser la rotation de mes stocks ?'
      });
    }

    // Analyse de la marge
    const profitMargin = companyDataToAnalyze.profitMargin || 0;

    if (profitMargin < 10) {
      newInsights.push({
        id: 'margin-low',
        type: 'critical',
        title: 'Marge bénéficiaire faible',
        message: `Votre marge bénéficiaire est de ${profitMargin.toFixed(1)}%. Analysez vos coûts et optimisez vos prix.`,
        question: 'Comment améliorer ma marge bénéficiaire ?',
        action: {
          label: 'Analyser la marge',
          onClick: () => openLIA('Comment améliorer ma marge bénéficiaire ?', { section: 'finance' })
        }
      });
    } else if (profitMargin > 25) {
      newInsights.push({
        id: 'margin-excellent',
        type: 'success',
        title: 'Marge excellente',
        message: `Félicitations ! Votre marge de ${profitMargin.toFixed(1)}% est excellente. Maintenez cette performance.`,
        question: 'Comment maintenir cette marge élevée ?'
      });
    }

    return newInsights;
  }, [companyDataToAnalyze, openLIA]);

  useEffect(() => {
    setInsights(generateInsights);
  }, [generateInsights]);

  // Actualisation automatique
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setInsights(generateInsights);
    }, 5 * 60 * 1000); // Toutes les 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, generateInsights]);

  const visibleInsights = insights
    .filter(insight => !dismissedInsights.has(insight.id))
    .slice(0, isExpanded ? undefined : maxInsights);

  const handleDismiss = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  const handleAskLIA = (question: string) => {
    openLIA(question);
  };

  if (visibleInsights.length === 0) {
    return null;
  }

  const getTypeStyles = (type: LIAInsight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Insights LIA</h3>
              <p className="text-xs text-slate-600">Recommandations basées sur vos données</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {visibleInsights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border-2 ${getTypeStyles(insight.type)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <LightBulbIcon className="h-4 w-4" />
                  <h4 className="text-sm font-semibold">{insight.title}</h4>
                </div>
                <p className="text-xs mt-1 leading-relaxed">{insight.message}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleAskLIA(insight.question)}
                    className="text-xs font-medium underline hover:no-underline flex items-center gap-1"
                  >
                    Demander à LIA
                    <ArrowRightIcon className="h-3 w-3" />
                  </button>
                  {insight.action && (
                    <>
                      <span className="text-xs">•</span>
                      <button
                        onClick={insight.action.onClick}
                        className="text-xs font-medium underline hover:no-underline"
                      >
                        {insight.action.label}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDismiss(insight.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Masquer cet insight"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {insights.length > maxInsights && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-900 py-2 border-t border-slate-200"
          >
            Voir {insights.length - maxInsights} insight(s) supplémentaire(s)
          </button>
        )}

        {isExpanded && insights.length > maxInsights && (
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-900 py-2 border-t border-slate-200"
          >
            Voir moins
          </button>
        )}
      </div>
    </div>
  );
};

export default LIAInsightsWidget;



