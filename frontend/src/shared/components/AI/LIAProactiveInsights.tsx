import React, { useMemo } from 'react';
import { 
  LightBulbIcon, 
  SparklesIcon, 
  XMarkIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'opportunity';
  title: string;
  message: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface LIAProactiveInsightsProps {
  page: string;
  data?: any;
  onDismiss?: (insightId: string) => void;
  maxInsights?: number;
}

/**
 * Composant pour afficher des insights proactifs LIA basés sur les données de la page
 */
const LIAProactiveInsights: React.FC<LIAProactiveInsightsProps> = ({
  page,
  data,
  onDismiss,
  maxInsights = 3
}) => {
  const { companyData, formatCurrency } = useApp();

  // Générer des insights basés sur la page et les données
  const insights = useMemo(() => {
    const generated: Insight[] = [];

    // Insights pour le dashboard
    if (page.includes('dashboard')) {
      const cash = companyData?.cashBalance || 0;
      const revenue = companyData?.revenueMonth || 0;
      const profitMargin = companyData?.profitMargin || 0;
      
      if (cash < revenue * 0.3) {
        generated.push({
          id: 'cash-low',
          type: 'warning',
          title: 'Trésorerie faible',
          message: `Votre trésorerie représente ${((cash / revenue) * 100).toFixed(1)}% de votre CA mensuel. Il est recommandé d'avoir au moins 30% en réserve.`,
          action: 'Analyser les flux de trésorerie',
          priority: 'high',
          category: 'finance'
        });
      }
      
      if (profitMargin < 15) {
        generated.push({
          id: 'margin-low',
          type: 'warning',
          title: 'Marge bénéficiaire faible',
          message: `Votre marge de ${profitMargin}% est en dessous du seuil recommandé de 15%. Analysez vos coûts pour améliorer la rentabilité.`,
          action: 'Optimiser les coûts',
          priority: 'medium',
          category: 'finance'
        });
      }
      
      if (profitMargin > 25) {
        generated.push({
          id: 'margin-excellent',
          type: 'success',
          title: 'Excellente marge',
          message: `Félicitations ! Votre marge de ${profitMargin}% est excellente. Vous pouvez envisager d'investir dans la croissance.`,
          action: 'Explorer les opportunités',
          priority: 'low',
          category: 'finance'
        });
      }
    }

    // Insights pour les factures
    if (page.includes('factures') || page.includes('facturation')) {
      if (data?.unpaidInvoices && data.unpaidInvoices.length > 0) {
        const totalUnpaid = data.unpaidInvoices.reduce((sum: number, inv: any) => sum + (inv.montant || 0), 0);
        generated.push({
          id: 'unpaid-invoices',
          type: 'warning',
          title: 'Factures impayées',
          message: `Vous avez ${data.unpaidInvoices.length} facture(s) impayée(s) pour un total de ${formatCurrency(totalUnpaid)}. Activez le recouvrement.`,
          action: 'Lancer le recouvrement',
          priority: 'high',
          category: 'commercial'
        });
      }
    }

    // Insights pour les clients
    if (page.includes('clients')) {
      if (data?.clients && data.clients.length > 0) {
        const avgRevenue = data.clients.reduce((sum: number, c: any) => sum + (c.ca || 0), 0) / data.clients.length;
        if (avgRevenue > 100000) {
          generated.push({
            id: 'high-value-clients',
            type: 'opportunity',
            title: 'Clients à fort potentiel',
            message: `Vos clients génèrent en moyenne ${formatCurrency(avgRevenue)}. Développez des programmes de fidélité pour maximiser la valeur.`,
            action: 'Créer un programme de fidélité',
            priority: 'medium',
            category: 'commercial'
          });
        }
      }
    }

    // Insights pour l'inventaire
    if (page.includes('inventaire') || page.includes('articles')) {
      if (data?.lowStock && data.lowStock.length > 0) {
        generated.push({
          id: 'low-stock',
          type: 'warning',
          title: 'Stocks faibles',
          message: `${data.lowStock.length} article(s) ont un stock faible. Planifiez un réapprovisionnement pour éviter les ruptures.`,
          action: 'Réapprovisionner',
          priority: 'high',
          category: 'logistique'
        });
      }
    }

    // Insights pour la trésorerie
    if (page.includes('tresorerie')) {
      const accountsReceivable = companyData?.accountsReceivable || 0;
      const revenue = companyData?.revenueMonth || 0;
      const dso = revenue > 0 ? (accountsReceivable / revenue) * 30 : 0;
      
      if (dso > 45) {
        generated.push({
          id: 'dso-high',
          type: 'warning',
          title: 'Délai de recouvrement élevé',
          message: `Votre DSO est de ${dso.toFixed(0)} jours, ce qui est élevé. Optimisez votre recouvrement pour améliorer la trésorerie.`,
          action: 'Optimiser le recouvrement',
          priority: 'high',
          category: 'finance'
        });
      }
    }

    return generated
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, maxInsights);
  }, [page, data, companyData, formatCurrency, maxInsights]);

  if (insights.length === 0) return null;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-emerald-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />;
      case 'opportunity':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-slate-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'opportunity':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900">Insights LIA</h3>
        </div>
      </div>
      
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)} transition-all hover:shadow-md`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                    insight.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {insight.priority === 'high' ? 'Prioritaire' : insight.priority === 'medium' ? 'Important' : 'Info'}
                  </span>
                </div>
                <p className="text-sm mb-2">{insight.message}</p>
                {insight.action && (
                  <button className="text-xs font-medium underline hover:no-underline">
                    {insight.action} →
                  </button>
                )}
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(insight.id)}
                className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LIAProactiveInsights;


