import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Scenario {
  id: number;
  nom: string;
  ca_mois6: number;
  profit_mois6: number;
  tresorerie_mois6: number;
  risque: 'FAIBLE' | 'MOYEN' | 'HAUTE';
}

interface ScenariosWidgetProps {
  scenarios: Scenario[];
  scenarioSelectionne?: number;
  onSelectScenario?: (id: number) => void;
  onAnalyseClick?: () => void;
}

const ScenariosWidget: React.FC<ScenariosWidgetProps> = ({
  scenarios,
  scenarioSelectionne,
  onSelectScenario,
  onAnalyseClick
}) => {
  const { t, i18n } = useTranslation();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-DZ' : i18n.language === 'en' ? 'en-US' : 'fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getRisqueCouleur = (risque: string) => {
    switch (risque) {
      case 'FAIBLE':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' };
      case 'MOYEN':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
      case 'HAUTE':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' };
    }
  };

  const scenarioRealiste = scenarios.find(s => s.id === 2);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <SparklesIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.widgets.scenarios.title')}</h3>
            <p className="text-sm text-slate-500">{t('dashboard.widgets.scenarios.subtitle')}</p>
          </div>
        </div>
        {onAnalyseClick && (
          <button
            onClick={onAnalyseClick}
            className="w-full sm:w-auto px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            {t('dashboard.widgets.scenarios.analyse_lia')}
          </button>
        )}
      </div>

      {/* Comparaison des scénarios */}
      <div className="space-y-3 mb-6">
        {scenarios.map(scenario => {
          const couleur = getRisqueCouleur(scenario.risque);
          const isSelected = scenarioSelectionne === scenario.id;
          const isHovered = hoveredId === scenario.id;

          return (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario?.(scenario.id)}
              onMouseEnter={() => setHoveredId(scenario.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : isHovered
                  ? 'border-slate-300 shadow-md'
                  : couleur.border + ' ' + couleur.bg
              }`}
            >
              {/* Titre et risque */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900">{scenario.nom}</h4>
                  {isSelected && <CheckCircleIcon className="h-5 w-5 text-indigo-600" />}
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${couleur.text} ${couleur.bg}`}>
                  {t('dashboard.widgets.scenarios.risk_label')}: {t(`dashboard.widgets.scenarios.risks.${scenario.risque}`)}
                </span>
              </div>

              {/* Métriques */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-slate-600 mb-1">{t('dashboard.widgets.scenarios.ca_label')}</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(scenario.ca_mois6)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">{t('dashboard.widgets.scenarios.profit_label')}</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(scenario.profit_mois6)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">{t('dashboard.widgets.scenarios.cash_label')}</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(scenario.tresorerie_mois6)}</p>
                </div>
              </div>

              {/* Indice de confiance */}
              {scenario.risque === 'FAIBLE' && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                  <p className="text-xs text-slate-600">{t('dashboard.widgets.scenarios.probable_label')}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommandation */}
      {scenarioRealiste && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-700 mb-2">{t('dashboard.widgets.scenarios.recommendation_title')}</p>
          <p className="text-sm text-slate-700">
            {t('dashboard.widgets.scenarios.recommendation_text', { 
              name: scenarioRealiste.nom, 
              profit: formatCurrency(scenarioRealiste.profit_mois6) 
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default ScenariosWidget;
