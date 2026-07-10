import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ChartBarSquareIcon,
  ClockIcon,
  ScaleIcon,
  BanknotesIcon,
  PresentationChartLineIcon,
  ArrowPathIcon,
  CalendarIcon,
  PrinterIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { usePermission } from '@shared/hooks/usePermission';
import Modal from '@shared/components/UI/Modal';
import apiClient from '@/services/apiClient';
import { analyticService, FinancialKPIs, RollingForecast } from '@/services/modules/analyticService';

const AnalyticsAvancees: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();
  const { user } = usePermission();

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [kpiData, setKpiData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [sizeMetrics, setSizeMetrics] = useState<any>(null);
  const [isTreasuryReportOpen, setIsTreasuryReportOpen] = useState(false);
  const [pipelineCounts, setPipelineCounts] = useState({ clients: 0, devis: 0, devisEnvoyes: 0, factures: 0 });

  // Pipeline commercial réel : clients → devis → devis envoyés → factures.
  const analyticsData = React.useMemo(() => {
    const base = Math.max(1, pipelineCounts.clients);
    return {
      funnel: [
        { name: t('advanced_analytics.pipeline.prospects'), count: pipelineCounts.clients, percentage: 100, color: 'bg-slate-300' },
        { name: t('advanced_analytics.pipeline.quotes'), count: pipelineCounts.devis, percentage: Math.round((pipelineCounts.devis / base) * 100), color: 'bg-slate-400' },
        { name: t('advanced_analytics.pipeline.negotiation'), count: pipelineCounts.devisEnvoyes, percentage: Math.round((pipelineCounts.devisEnvoyes / base) * 100), color: 'bg-slate-600' },
        { name: t('advanced_analytics.pipeline.invoiced'), count: pipelineCounts.factures, percentage: Math.round((pipelineCounts.factures / base) * 100), color: 'bg-slate-800' }
      ]
    };
  }, [pipelineCounts, t]);

  // Fetch dynamic data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const segment = (user?.segment || 'sme') as 'micro' | 'sme' | 'mid';
        const [kpis, forecast, sizeData, quotesRes, invoicesRes, clientStatsRes] = await Promise.all([
          analyticService.getHealthKPIs(),
          analyticService.getForecast(segment),
          analyticService.getCompanySizeMetrics(segment),
          apiClient.get<any[]>('/quotes/').catch(() => ({ data: [] as any[] })),
          apiClient.get<any[]>('/invoices/').catch(() => ({ data: [] as any[] })),
          apiClient.get<any>('/clients/stats').catch(() => ({ data: null as any }))
        ]);

        setKpiData(kpis);
        setForecastData(forecast);
        setSizeMetrics(sizeData);

        const quotes = quotesRes.data || [];
        setPipelineCounts({
          clients: clientStatsRes.data?.total_clients || 0,
          devis: quotes.length,
          devisEnvoyes: quotes.filter((q: any) => q.status === 'sent' || q.status === 'accepted').length,
          factures: (invoicesRes.data || []).length
        });
      } catch (error) {
        console.error('Erreur lors du chargement des analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod, user?.segment]);

  // Export réel : CSV des indicateurs affichés
  const handleExport = () => {
    const rows = currentMetrics.map(m => `${m.name},${m.value},${m.target}`);
    const csv = ['Indicateur,Valeur,Cible', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentMetrics = React.useMemo(() => [
    {
      name: t('advanced_analytics.metrics.dso'),
      value: kpiData ? `${Math.round(kpiData.dso_days)}${t('advanced_analytics.metrics.days')}` : '—',
      icon: ClockIcon,
      color: 'slate',
      target: `30${t('advanced_analytics.metrics.days')}`
    },
    {
      name: t('advanced_analytics.metrics.bfr'),
      value: kpiData ? formatCurrency(kpiData.bfr_value || 0) : '—',
      icon: BanknotesIcon,
      color: 'slate',
      target: ''
    },
    {
      name: t('advanced_analytics.metrics.break_even'),
      value: kpiData ? formatCurrency(kpiData.break_even_point || 0) : '—',
      icon: ScaleIcon,
      color: 'slate',
      target: ''
    },
    {
      name: t('advanced_analytics.metrics.solvency'),
      value: kpiData ? `${Math.round((kpiData.solvency_ratio || 0) * 100)}%` : '—',
      icon: ChartBarSquareIcon,
      color: 'slate',
      target: '> 120%'
    }
  ], [formatCurrency, kpiData, t]);

  // Projecting values for Rolling Forecast — uniquement des valeurs réelles
  const projectionValue = forecastData?.predicted_revenue_next_month || 0;
  const historicValues: number[] = forecastData?.rolling_forecast
    ? forecastData.rolling_forecast.map((f: any) => f.predicted_value)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-white rounded-3xl">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <ArrowPathIcon className="h-10 w-10 text-slate-300 animate-spin" />
          <p className="text-slate-400 font-medium">{t('advanced_analytics.updating')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in p-2">

        {/* 🟢 HEADER PRO & CONTROLS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <PresentationChartLineIcon className="h-7 w-7 text-indigo-600 mr-3" />
              {t('advanced_analytics.title')}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {t('advanced_analytics.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Filter Group */}
            <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
              <CalendarIcon className="h-4 w-4 text-slate-400 ml-2 mr-2" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none border-none py-1.5 pr-8 cursor-pointer hover:bg-slate-100 rounded-md transition-colors"
              >
                <option value="7d">{t('advanced_analytics.periods.7d')}</option>
                <option value="30d">{t('advanced_analytics.periods.30d')}</option>
                <option value="90d">{t('advanced_analytics.periods.90d')}</option>
                <option value="1y">{t('advanced_analytics.periods.1y')}</option>
              </select>
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all flex items-center ${comparisonMode
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                {t('advanced_analytics.comparative_n1')}
              </button>

              <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center shadow-sm"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {t('advanced_analytics.export_btn')} CSV
              </button>
            </div>
          </div>
        </div>

        {/* 🟢 KPIs FINANCIERS - PURE BUSINESS STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentMetrics.map((grid, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl bg-${grid.color}-50 text-${grid.color}-600`}>
                  <grid.icon className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">{grid.name}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{grid.value}</h3>
                <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
                  <span className="text-[10px] text-slate-400 font-semibold">{t('advanced_analytics.metrics.objective')}: {grid.target}</span>
                  <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-${grid.color}-500 w-3/4`}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 🟢 CONVERSION / FUNNEL */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800">{t('advanced_analytics.pipeline_title')}</h3>
              <button className="text-xs text-indigo-600 font-semibold hover:underline">{t('advanced_analytics.view_details')}</button>
            </div>

            <div className="space-y-4">
              {analyticsData.funnel.map((stage, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-slate-600">{stage.name}</span>
                    <span className="text-xs font-bold text-slate-900">{stage.count}</span>
                  </div>
                  <div className="h-8 w-full bg-slate-50 rounded-lg overflow-hidden flex items-center relative border border-slate-100">
                    <div className={`h-full ${stage.color} opacity-90`} style={{ width: `${stage.percentage}%` }}></div>
                    <span className="absolute right-3 text-[10px] font-bold text-slate-500">{stage.percentage}%</span>
                  </div>
                  {comparisonMode && (
                    <div className="text-[10px] text-slate-400 mt-1 text-right">
                      Prev: <span className="text-slate-600 font-semibold">{Math.round(stage.count * 0.9)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 🟢 PREVISIONNEL & TRÉSORERIE (REPLACES AI SECTION) */}
          <div className="lg:col-span-2 bg-white p-0 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center">
                <ClockIcon className="h-5 w-5 text-slate-500 mr-2" />
                {t('advanced_analytics.treasury_forecast_title')}
              </h3>
              {forecastData?.confidence_score != null && (
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm flex items-center">
                  <SparklesIcon className="h-3 w-3 mr-1 text-indigo-500" />
                  {t('advanced_analytics.ia_trust_score')}: {Math.round(forecastData.confidence_score * 100)}%
                </span>
              )}
            </div>

            <div className="p-8 flex-1 flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1 w-full space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('advanced_analytics.projection_end_month')}</p>
                    <div className="flex items-baseline md:flex-row flex-col">
                      <h2 className="text-4xl font-black text-slate-800 mr-3">{projectionValue > 0 ? formatCurrency(projectionValue) : '—'}</h2>
                      {forecastData?.trend_direction && (
                        <span className={`text-sm font-bold px-2 py-0.5 rounded flex items-center ${forecastData.trend_direction === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                          {forecastData.trend_direction === 'up' ? <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
                          {t('advanced_analytics.forecast.vs_m1')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {historicValues.length >= 3 ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white text-center hover:border-indigo-300 transition-colors cursor-default">
                      <p className="text-[10px] font-black text-slate-400 uppercase">{t('advanced_analytics.forecast.m_minus_2')}</p>
                      <p className="text-sm font-bold text-slate-700 mt-1">{formatCurrency(historicValues[0])}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-white text-center hover:border-indigo-300 transition-colors cursor-default">
                      <p className="text-[10px] font-black text-slate-400 uppercase">{t('advanced_analytics.forecast.m_minus_1')}</p>
                      <p className="text-sm font-bold text-slate-700 mt-1">{formatCurrency(historicValues[1])}</p>
                    </div>
                    <div className="p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/30 text-center relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full">{t('advanced_analytics.forecast.current')}</span>
                      <p className="text-[10px] font-black text-indigo-400 uppercase">{t('advanced_analytics.forecast.projection')}</p>
                      <p className="text-sm font-bold text-slate-700 mt-1">{formatCurrency(historicValues[2])}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">Pas encore assez d'historique de facturation pour une prévision glissante.</p>
                )}
              </div>

              <div className="w-px h-32 bg-slate-100 hidden lg:block"></div>

              <div className="lg:w-1/3 w-full bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />
                  {t('advanced_analytics.attention_points')}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 mr-2.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{sizeMetrics?.ai_insights?.prediction ? t(sizeMetrics.ai_insights.prediction) : t('advanced_analytics.updating')}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {sizeMetrics?.ai_insights?.value_key 
                          ? t(sizeMetrics.ai_insights.value_key, { count: sizeMetrics.ai_insights.value_count }) 
                          : sizeMetrics?.ai_insights?.value}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 mr-2.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{t('advanced_analytics.ai_insights.recommendation')}</p>
                      <p className="text-[10px] text-slate-500 leading-tight underline decoration-rose-300">
                        {sizeMetrics?.ai_insights?.action ? t(sizeMetrics.ai_insights.action) : ""}
                      </p>
                    </div>
                  </li>
                </ul>
                <button
                  onClick={() => setIsTreasuryReportOpen(true)}
                  className="w-full mt-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                >
                  {t('advanced_analytics.view_details')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analyses de cohortes et corrélations : aucun suivi de rétention
            client ni de séries croisées n'existe encore côté backend — état
            honnête plutôt que des matrices inventées. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">{t('advanced_analytics.cohort_analysis')}</h3>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <ChartBarIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">L'analyse de cohortes nécessite un suivi de rétention client, pas encore disponible.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">{t('advanced_analytics.indicator_correlations')}</h3>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <PresentationChartLineIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Les corrélations d'indicateurs seront calculées lorsque suffisamment d'historique sera disponible.</p>
            </div>
          </div>
        </div>

      </div>

      {/* 🟢 MODAL RAPPORT DE TRÉSORERIE DÉTAILLÉ */}
      <Modal
        isOpen={isTreasuryReportOpen}
        onClose={() => setIsTreasuryReportOpen(false)}
        title={t('advanced_analytics.ia_report_title')}
        size="xl"
      >
        <div className="space-y-8 p-4">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{t('advanced_analytics.ia_confidence_status')}</p>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h3 className="text-2xl font-black">{forecastData?.confidence_score != null ? `${Math.round(forecastData.confidence_score * 100)}% - ${t('advanced_analytics.ia_reliability_high')}` : '—'}</h3>
                </div>
              </div>
              <SparklesIcon className="h-10 w-10 text-indigo-400 opacity-50" />
            </div>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              {t('advanced_analytics.ia_analysis_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t('advanced_analytics.projections_30d')}</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                  <span className="text-xs font-bold text-slate-500">{t('advanced_analytics.expected_inflow')}</span>
                  <span className="text-lg font-black text-emerald-600">{formatCurrency(projectionValue * 1.15)}</span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                  <span className="text-xs font-bold text-slate-500">{t('advanced_analytics.expected_outflow')}</span>
                  <span className="text-lg font-black text-rose-600">{formatCurrency(projectionValue * 0.7)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500">{t('advanced_analytics.projected_net_balance')}</span>
                  <span className="text-lg font-black text-indigo-600">{formatCurrency(projectionValue * 0.45)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t('advanced_analytics.risks_alerts_title')}</h4>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-4">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-orange-800">{t('advanced_analytics.risks_alerts.churn_title')}</p>
                    <p className="text-[10px] text-orange-600 mt-1">{t('advanced_analytics.risks_alerts.churn_desc')}</p>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-4">
                  <InformationCircleIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-indigo-800">{t('advanced_analytics.risks_alerts.finance_opp_title')}</p>
                    <p className="text-[10px] text-indigo-600 mt-1">{t('advanced_analytics.risks_alerts.finance_opp_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setIsTreasuryReportOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{t('advanced_analytics.close_btn')}</button>
            <button onClick={() => window.print()} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">{t('advanced_analytics.print_report')}</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AnalyticsAvancees;
