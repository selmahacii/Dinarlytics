import React from 'react';
import { useTranslation } from 'react-i18next';
import { BanknotesIcon, ArrowTrendingUpIcon as TrendingUpIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

interface TresorerieData {
  soldeActuel: number;
  soldeItineraire: number;
  entrees30j: number;
  sorties30j: number;
  fluxNetMensuel: number;
}

interface TresorerieWidgetProps {
  data: TresorerieData;
  devise?: string;
  onAnalyseClick?: () => void;
}

const TresorerieWidget: React.FC<TresorerieWidgetProps> = ({
  data,
  devise = 'DZD',
  onAnalyseClick
}) => {
  const { t, i18n } = useTranslation();
  const isPositifFlux = data.fluxNetMensuel >= 0;

  const formatCurrency = (value: number, currency: string = 'DZD') => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-DZ' : i18n.language === 'en' ? 'en-US' : 'fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BanknotesIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.widgets.tresorerie.title')}</h3>
            <p className="text-sm text-slate-500">{t('dashboard.widgets.tresorerie.subtitle')}</p>
          </div>
        </div>
        {onAnalyseClick && (
          <button
            onClick={onAnalyseClick}
            className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            {t('dashboard.widgets.tresorerie.analyse_lia')}
          </button>
        )}
      </div>

      {/* Soldes principaux */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <p className="text-xs text-slate-600 mb-1">{t('dashboard.widgets.tresorerie.current_balance')}</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.soldeActuel, devise)}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
          <p className="text-xs text-slate-600 mb-1">{t('dashboard.widgets.tresorerie.transit_balance')}</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.soldeItineraire, devise)}</p>
        </div>
      </div>

      {/* Flux cash */}
      <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-slate-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <ArrowDownIcon className="h-4 w-4 text-green-600" />
            <span className="text-xs text-slate-600">{t('dashboard.widgets.tresorerie.inflows')}</span>
          </div>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(data.entrees30j, devise)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <ArrowUpIcon className="h-4 w-4 text-red-600" />
            <span className="text-xs text-slate-600">{t('dashboard.widgets.tresorerie.outflows')}</span>
          </div>
          <p className="text-lg font-semibold text-red-600">{formatCurrency(data.sorties30j, devise)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <TrendingUpIcon className={`h-4 w-4 ${isPositifFlux ? 'text-emerald-600' : 'text-red-600'}`} />
            <span className="text-xs text-slate-600">{t('dashboard.widgets.tresorerie.net_flow')}</span>
          </div>
          <p className={`text-lg font-semibold ${isPositifFlux ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(data.fluxNetMensuel, devise)}
          </p>
        </div>
      </div>

      {/* Alerte */}
      {data.soldeActuel < 5000000 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
          <div className="text-amber-600 mt-0.5">⚠️</div>
          <div>
            <p className="text-sm font-medium text-amber-900">{t('dashboard.widgets.tresorerie.low_cash_alert')}</p>
            <p className="text-xs text-amber-700">{t('dashboard.widgets.tresorerie.corrective_actions')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TresorerieWidget;
