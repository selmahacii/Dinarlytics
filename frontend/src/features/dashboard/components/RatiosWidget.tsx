import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface RatiosData {
  liquidite: number;
  autonomieFinanciere: number;
  endettement: number;
  solvabilite: number;
}

interface RatioItem {
  nom: string;
  valeur: number;
  cible: number;
  sante: 'bon' | 'moyen' | 'mauvais';
  trend?: 'up' | 'down' | 'stable';
}

interface RatiosWidgetProps {
  data: RatiosData;
  onAnalyseClick?: () => void;
}

const RatiosWidget: React.FC<RatiosWidgetProps> = ({ data, onAnalyseClick }) => {
  const { t } = useTranslation();

  const ratios: RatioItem[] = [
    {
      nom: t('dashboard.widgets.ratios.names.liquidite'),
      valeur: data.liquidite,
      cible: 1.5,
      sante: data.liquidite >= 1.5 ? 'bon' : data.liquidite >= 1.0 ? 'moyen' : 'mauvais',
      trend: data.liquidite > 1.7 ? 'down' : data.liquidite < 1.6 ? 'up' : 'stable'
    },
    {
      nom: t('dashboard.widgets.ratios.names.autonomie'),
      valeur: data.autonomieFinanciere,
      cible: 0.6,
      sante: data.autonomieFinanciere >= 0.6 ? 'bon' : 'mauvais',
      trend: 'stable'
    },
    {
      nom: t('dashboard.widgets.ratios.names.endettement'),
      valeur: data.endettement,
      cible: 0.4,
      sante: data.endettement <= 0.4 ? 'bon' : data.endettement <= 0.6 ? 'moyen' : 'mauvais',
      trend: 'down'
    },
    {
      nom: t('dashboard.widgets.ratios.names.solvabilite'),
      valeur: data.solvabilite,
      cible: 2.0,
      sante: data.solvabilite >= 2.0 ? 'bon' : data.solvabilite >= 1.5 ? 'moyen' : 'mauvais',
      trend: 'up'
    }
  ];

  const getSanteColor = (sante: string) => {
    switch (sante) {
      case 'bon':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-900',
          icon: 'text-emerald-600'
        };
      case 'moyen':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          icon: 'text-amber-600'
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          icon: 'text-red-600'
        };
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.widgets.ratios.title')}</h3>
            <p className="text-sm text-slate-500">{t('dashboard.widgets.ratios.subtitle')}</p>
          </div>
        </div>
        {onAnalyseClick && (
          <button
            onClick={onAnalyseClick}
            className="w-full sm:w-auto px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            {t('dashboard.widgets.ratios.analyse_lia')}
          </button>
        )}
      </div>

      {/* Grille de ratios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ratios.map((ratio, idx) => {
          const colors = getSanteColor(ratio.sante);
          // Un ratio sans passif (ex. aucune dette fournisseur) est plafonné
          // côté backend à 99.99 par convention "excellent/sans dette" —
          // rapporté brut à un objectif de 1.50, ça affichait des écarts
          // absurdes ("+6566% de l'objectif"). Plafonné à un écart lisible.
          const rawEcart = (ratio.valeur - ratio.cible) / ratio.cible * 100;
          const ecart = Math.max(-999, Math.min(999, rawEcart)).toFixed(1);

          return (
            <div key={idx} className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}>
              {/* Titre et trend */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-slate-900">{ratio.nom}</h4>
                <div className="flex items-center gap-2">
                  {getTrendIcon(ratio.trend)}
                </div>
              </div>

              {/* Valeur */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className={`text-2xl font-bold ${colors.text}`}>
                  {ratio.valeur.toFixed(2)}
                </span>
                <span className="text-sm text-slate-600">/ {ratio.cible.toFixed(2)}</span>
              </div>

              {/* Barre de progression */}
              <div className="mb-3">
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      ratio.sante === 'bon'
                        ? 'bg-emerald-500'
                        : ratio.sante === 'moyen'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((ratio.valeur / ratio.cible) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Statut */}
              <div className="flex items-center gap-2">
                {ratio.sante === 'bon' && (
                  <CheckCircleIcon className={`h-4 w-4 ${colors.icon}`} />
                )}
                {ratio.sante === 'moyen' && (
                  <ExclamationTriangleIcon className={`h-4 w-4 ${colors.icon}`} />
                )}
                {ratio.sante === 'mauvais' && (
                  <ExclamationTriangleIcon className={`h-4 w-4 ${colors.icon}`} />
                )}
                <span className={`text-sm font-medium ${colors.text}`}>
                  {t('dashboard.widgets.ratios.target_gap', { percent: ecart })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span>{t('dashboard.widgets.ratios.legend.good')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span>{t('dashboard.widgets.ratios.legend.average')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>{t('dashboard.widgets.ratios.legend.critical')}</span>
        </div>
      </div>
    </div>
  );
};

export default RatiosWidget;
