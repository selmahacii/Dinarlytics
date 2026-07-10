import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  EyeIcon,
  FunnelIcon,
  CalendarIcon,
  InformationCircleIcon,
  LightBulbIcon,
  PresentationChartLineIcon,
  ScaleIcon,
  ShieldCheckIcon,
  StarIcon,
  XCircleIcon,
  CalculatorIcon,
  BookOpenIcon,
  DocumentCheckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useTranslation } from '@shared/hooks/useTranslation';

import { useApp } from '@core/context/AppContext';
import api from '@/services/api';

const IndicateursPerformance: React.FC = () => {
  const { formatCurrency, planComptable } = useApp();
  const { t } = useTranslation();

  // États pour les modals et filtres
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('comprehensive');
  const [reportFormat, setReportFormat] = useState('pdf');

  // Données comptables SCF/IFRS
  const normesComptables = {
    algerien: {
      nom: t('steering.dashboard.accounting.norm_scf'),
      code: 'SCF',
      emoji: '🇩🇿',
      comptes: {
        ventes: `701 - ${t('steering.dashboard.chart_accounts.items.sales_goods')}`,
        tva: `44571 - ${t('steering.dashboard.chart_accounts.items.vat_collected')}`,
        clients: `411 - ${t('steering.dashboard.chart_accounts.items.clients')}`,
        stocks: `31 - ${t('steering.dashboard.chart_accounts.items.inventory')}`,
        produits: `7011 - ${t('steering.dashboard.chart_accounts.items.finished_products')}`,
        charges: `601 - ${t('steering.dashboard.chart_accounts.items.purchase_merchandise')}`,
        immobilisations: `20 - ${t('steering.dashboard.chart_accounts.items.fixed_assets')}`
      }
    },
    international: {
      nom: t('steering.dashboard.accounting.norm_ifrs'),
      code: 'IFRS',
      emoji: '🌍',
      comptes: {
        ventes: t('steering.dashboard.chart_accounts.items.sales_intl'),
        tva: t('steering.dashboard.chart_accounts.items.vat_payable'),
        clients: t('steering.dashboard.chart_accounts.items.trade_receivables'),
        stocks: t('steering.dashboard.chart_accounts.items.inventory_intl'),
        produits: t('steering.dashboard.chart_accounts.items.revenue_intl'),
        charges: t('steering.dashboard.chart_accounts.items.cogs'),
        immobilisations: t('steering.dashboard.chart_accounts.items.ppe')
      }
    }
  };


  // States for dynamic KPIs and financial indicators
  const [kpiComptables, setKpiComptables] = useState<any>(null);
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [financialIndicators, setFinancialIndicators] = useState<any>(null);
  const [loadingIndicators, setLoadingIndicators] = useState(true);
  const [indicatorsError, setIndicatorsError] = useState<string | null>(null);
  const [revenueChart, setRevenueChart] = useState<Array<{ period: string; value: number }>>([]);

  // Load KPIs and financial indicators from backend
  useEffect(() => {
    setLoadingKpi(true);
    api.analytics.getKPIs()
      .then((data: any) => {
        setKpiComptables(data);
      })
      .catch(() => setKpiError('Erreur lors du chargement des KPIs'))
      .finally(() => setLoadingKpi(false));

    setLoadingIndicators(true);
    api.analytics.getHealthKPIs()
      .then((data: any) => {
        setFinancialIndicators(data);
      })
      .catch(() => setIndicatorsError('Erreur lors du chargement des indicateurs financiers'))
      .finally(() => setLoadingIndicators(false));

    api.analytics.getRevenueChart?.(6)
      .then((data: any) => setRevenueChart(Array.isArray(data) ? data : []))
      .catch(() => setRevenueChart([]));
  }, []);

  // Indicateurs financiers réels, dérivés de kpiComptables (bilan agrégé
  // depuis les écritures de journal) et financialIndicators (marge nette,
  // solvabilité — calculés côté backend). Pas de valeurs fixes : quand une
  // donnée n'est pas disponible (ex. EBIT/charges d'intérêts non suivis),
  // le ratio est affiché comme non disponible plutôt qu'inventé.
  const bilans = kpiComptables?.bilans || { actif: 0, passif: 0, capitauxPropres: 0 };
  const caAnnuel = (kpiComptables?.metriques?.ventesTotal || 0) * 12;
  const beneficeAnnuel = (kpiComptables?.metriques?.beneficeMensuel || 0) * 12;
  const netMarginPct = financialIndicators?.margin_net_pct ?? (kpiComptables?.metriques?.margeBrute || 0);
  const roe = bilans.capitauxPropres > 0 ? (beneficeAnnuel / bilans.capitauxPropres) * 100 : null;
  const roa = bilans.actif > 0 ? (beneficeAnnuel / bilans.actif) * 100 : null;
  const currentRatio = bilans.passif > 0 ? bilans.actif / bilans.passif : null;
  const debtRatio = bilans.actif > 0 ? bilans.passif / bilans.actif : null;
  const assetTurnover = bilans.actif > 0 ? caAnnuel / bilans.actif : null;
  const debtToEquity = bilans.capitauxPropres > 0 ? bilans.passif / bilans.capitauxPropres : null;
  const solvencyPct = financialIndicators?.solvency_ratio != null ? financialIndicators.solvency_ratio * 100 : null;

  const statusFor = (value: number | null, benchmark: number, higherIsBetter = true) => {
    if (value == null) return 'default';
    const ratio = higherIsBetter ? value / benchmark : benchmark / Math.max(value, 0.01);
    if (ratio >= 1.2) return 'excellent';
    if (ratio >= 1.0) return 'good';
    if (ratio >= 0.7) return 'warning';
    return 'critical';
  };

  // Alertes générées à partir des ratios réels comparés à des seuils de
  // référence, plutôt qu'un texte fixe citant des chiffres inventés.
  const alertsList: Array<{ id: number; type: 'warning' | 'success' | 'info' | 'critical'; title: string; message: string; action: string; priority: 'high' | 'medium' | 'low' }> = [
    ...(debtRatio != null && debtRatio > 0.6 ? [{
      id: 1, type: 'warning' as const, title: 'Endettement élevé',
      message: `Le ratio d'endettement (${debtRatio.toFixed(2)}x) dépasse le seuil recommandé de 0.5x.`,
      action: 'Revoir la structure de financement', priority: 'medium' as const
    }] : []),
    ...(roe != null && roe >= 15 ? [{
      id: 2, type: 'success' as const, title: 'ROE solide',
      message: `Le ROE de ${roe.toFixed(1)}% dépasse la référence de 15%.`,
      action: 'Maintenir cette performance', priority: 'low' as const
    }] : []),
    ...(currentRatio != null && currentRatio < 1 ? [{
      id: 3, type: 'warning' as const, title: 'Liquidité tendue',
      message: `Le ratio de liquidité courante (${currentRatio.toFixed(2)}x) est inférieur à 1 : l'actif circulant ne couvre pas le passif circulant.`,
      action: 'Surveiller la trésorerie de près', priority: 'medium' as const
    }] : []),
    ...(netMarginPct < 5 ? [{
      id: 4, type: 'warning' as const, title: 'Marge nette faible',
      message: `La marge nette (${netMarginPct.toFixed(1)}%) est sous le seuil de vigilance de 5%.`,
      action: 'Analyser la structure de coûts', priority: 'medium' as const
    }] : [])
  ];

  // Données financières enrichies
  const financialData = {
    // KPIs Financiers Principaux — calculés à partir du bilan réel
    mainKPIs: [
      {
        id: 'roe', title: 'ROE (Return on Equity)', value: roe, unit: '%',
        benchmark: 15.0, status: statusFor(roe, 15.0),
        description: 'Rendement des capitaux propres', formula: 'Bénéfice Net / Capitaux Propres', category: 'rentability'
      },
      {
        id: 'roa', title: 'ROA (Return on Assets)', value: roa, unit: '%',
        benchmark: 10.0, status: statusFor(roa, 10.0),
        description: 'Rendement des actifs', formula: 'Bénéfice Net / Actif Total', category: 'rentability'
      },
      {
        id: 'current_ratio', title: 'Ratio de Liquidité Courante', value: currentRatio, unit: 'x',
        benchmark: 2.0, status: statusFor(currentRatio, 2.0),
        description: 'Capacité à honorer les dettes à court terme', formula: 'Actif Circulant / Passif Circulant', category: 'liquidity'
      },
      {
        id: 'debt_ratio', title: 'Ratio d\'Endettement', value: debtRatio, unit: 'x',
        benchmark: 0.5, status: statusFor(debtRatio, 0.5, false),
        description: 'Niveau d\'endettement', formula: 'Dette Totale / Actif Total', category: 'leverage'
      },
      {
        id: 'net_margin', title: 'Marge Nette', value: netMarginPct, unit: '%',
        benchmark: 12.0, status: statusFor(netMarginPct, 12.0),
        description: 'Rentabilité nette', formula: 'Bénéfice Net / Chiffre d\'Affaires', category: 'rentability'
      },
      {
        id: 'asset_turnover', title: 'Rotation des Actifs', value: assetTurnover, unit: 'x',
        benchmark: 1.5, status: statusFor(assetTurnover, 1.5),
        description: 'Efficacité d\'utilisation des actifs', formula: 'Chiffre d\'Affaires / Actif Total', category: 'efficiency'
      }
    ],

    // Ratios Financiers Avancés — seuls ceux calculables avec les données
    // disponibles (pas d'EBIT/charges financières distinctes en base).
    advancedRatios: [
      {
        id: 'debt_to_equity', title: 'Ratio Dette/Capitaux Propres', value: debtToEquity, unit: 'x',
        benchmark: 0.7, status: statusFor(debtToEquity, 0.7, false),
        description: 'Structure financière', formula: 'Dette Totale / Capitaux Propres'
      },
      {
        id: 'solvency', title: 'Solvabilité', value: solvencyPct, unit: '%',
        benchmark: 30.0, status: statusFor(solvencyPct, 30.0),
        description: 'Capitaux propres / Actif total', formula: 'Capitaux Propres / Actif Total'
      },
      {
        id: 'net_margin_2', title: 'Marge Nette', value: netMarginPct, unit: '%',
        benchmark: 12.0, status: statusFor(netMarginPct, 12.0),
        description: 'Rentabilité nette réelle', formula: 'Résultat Net / Chiffre d\'Affaires'
      }
    ],

    // Données pour graphiques — CA réel des 6 derniers mois facturés
    chartData: {
      revenue: revenueChart.map(p => ({ month: p.period, value: p.value })),
      profitability: [
        { metric: 'Marge Nette', value: netMarginPct, benchmark: 12.0 }
      ],
      liquidity: [
        { metric: 'Ratio Courant', value: currentRatio ?? 0, benchmark: 2.0 }
      ]
    },

    // Alertes générées à partir des ratios réels comparés à des seuils de
    // référence, plutôt qu'un texte fixe citant des chiffres inventés.
    alerts: alertsList,

    // Benchmarking sectoriel : les valeurs "secteur"/"marché" sont des
    // références statiques (comme les benchmarks utilisés ailleurs dans
    // l'app) ; la colonne "company" est désormais la vraie valeur calculée.
    benchmarking: {
      sector: t('analytics.performance.benchmark.sector_generic', { defaultValue: 'Secteur général' }),
      companySize: '',
      region: 'Algérie',
      comparisons: [
        { metric: 'ROE', company: roe ?? 0, sector: 12.0, market: 15.0 },
        { metric: 'ROA', company: roa ?? 0, sector: 8.5, market: 10.0 },
        { metric: 'Marge Nette', company: netMarginPct, sector: 10.0, market: 12.0 },
        { metric: 'Ratio Liquidité', company: currentRatio ?? 0, sector: 1.8, market: 2.0 }
      ]
    }
  };

  // Fonctions utilitaires
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return ExclamationTriangleIcon;
      case 'success': return CheckCircleIcon;
      case 'info': return InformationCircleIcon;
      case 'critical': return XCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  const handleKPIDetails = (kpi: any) => {
    setSelectedKPI(kpi);
    setShowDetailsModal(true);
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  const handleExportReport = () => {
    // Simulation de génération de rapport
    const reportData = {
      type: reportType,
      format: reportFormat,
      period: selectedPeriod,
      date: new Date().toISOString(),
      kpis: financialData.mainKPIs,
      ratios: financialData.advancedRatios,
      benchmarking: financialData.benchmarking
    };

    // Simulation de téléchargement
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-financier-${new Date().toISOString().split('T')[0]}.${reportFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Fermer la modal
    setShowReportModal(false);
    
    // Afficher une notification de succès
    alert(`Rapport ${reportType} généré avec succès en format ${reportFormat.toUpperCase()} !`);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header avec contrôles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            {t('analytics.kpis.title')}
          </h1>
          <p className="text-gray-600">{t('analytics.kpis.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
            aria-label="Sélectionner la période"
            title="Sélectionner la période"
          >
            <option value="3m">3 mois</option>
            <option value="6m">6 mois</option>
            <option value="12m">12 mois</option>
            <option value="24m">24 mois</option>
          </select>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={t('analytics.kpis.actions.refresh')}
            aria-label={t('analytics.kpis.actions.refresh')}
          >
            <ClockIcon className="h-4 w-4 inline mr-2" />
            {t('analytics.kpis.actions.refresh')}
          </button>
          
          <button
            onClick={handleGenerateReport}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            title={t('analytics.kpis.actions.report')}
            aria-label={t('analytics.kpis.actions.report')}
          >
            <DocumentChartBarIcon className="h-4 w-4 inline mr-2" />
            {t('analytics.kpis.actions.report')}
          </button>
        </div>
      </div>

      {/* Dashboard des KPIs Principaux */}
      <Card title={t('analytics.kpis.sections.main')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financialData.mainKPIs.map((kpi) => {
            return (
              <div
                key={kpi.id}
                className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleKPIDetails(kpi)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getStatusColor(kpi.status)}`}>
                    <ChartBarIcon className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="text-sm font-medium text-gray-600 mb-2">{kpi.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {kpi.value != null ? `${kpi.value.toFixed(1)}${kpi.unit}` : '—'}
                </p>
                <p className="text-sm text-gray-500 mb-3">{kpi.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Benchmark: {kpi.benchmark}{kpi.unit}</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Indicateurs Comptables SCF/IFRS */}
      <Card title={t('analytics.kpis.sections.accounting')}>
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                   {t('steering.dashboard.accounting.norm_label')}
                </h3>
                <p className="text-gray-600">
                  <BookOpenIcon className="h-5 w-5 inline mr-2" />
                  {normesComptables[planComptable as keyof typeof normesComptables]?.nom}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Plan Comptable</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {normesComptables[planComptable as keyof typeof normesComptables]?.emoji} {normesComptables[planComptable as keyof typeof normesComptables]?.code}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {loadingKpi ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : kpiComptables ? (
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.widgets.ratios')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(kpiComptables.ratiosFinanciers || []).map((ratio: any) => (
                    <div key={ratio.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${
                          ratio.couleur === 'green' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <ScaleIcon className={`h-6 w-6 ${
                            ratio.couleur === 'green' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <span className={`text-sm font-medium ${
                          ratio.evolution >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {ratio.evolution >= 0 ? '+' : ''}{ratio.evolution}%
                        </span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-1">{ratio.nom}</h5>
                      <p className="text-2xl font-bold text-gray-900">{ratio.valeur}{ratio.unite}</p>
                      <p className="text-xs text-gray-500 mt-2">Objectif: {ratio.objectif}{ratio.unite}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('steering.dashboard.accounting.vat_to_pay')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(kpiComptables.indicateursTVA || []).map((tva: any) => (
                    <div key={tva.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <DocumentCheckIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-xs font-bold text-purple-600">{tva.taux}%</span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-1">{tva.nom}</h5>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(tva.montant)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 p-6 rounded-lg text-red-600 text-center">
              Impossible de charger les indicateurs comptables.
            </div>
          )}
        </div>
      </Card>

      {/* Ratios Financiers Avancés */}
      <Card title={t('analytics.kpis.sections.advanced')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financialData.advancedRatios.map((ratio) => {
            return (
              <div
                key={ratio.id}
                className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleKPIDetails(ratio)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getStatusColor(ratio.status)}`}>
                    <ScaleIcon className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="text-sm font-medium text-gray-600 mb-2">{ratio.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {ratio.value != null ? `${ratio.value.toFixed(1)}${ratio.unit}` : '—'}
                </p>
                <p className="text-sm text-gray-500 mb-3">{ratio.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Benchmark: {ratio.benchmark}{ratio.unit}</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Alertes et Recommandations */}
      <Card title={t('analytics.kpis.sections.alerts')}>
        <div className="space-y-4">
          {financialData.alerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            return (
              <div key={alert.id} className={`p-4 rounded-lg border ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                alert.type === 'success' ? 'bg-green-50 border-green-200' :
                alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <AlertIcon className={`h-5 w-5 mt-0.5 ${
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'success' ? 'text-green-600' :
                    alert.type === 'info' ? 'text-blue-600' :
                    'text-red-600'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Action: {alert.action}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                        alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.priority === 'high' ? 'Priorité Haute' :
                         alert.priority === 'medium' ? 'Priorité Moyenne' : 'Priorité Faible'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Benchmarking Sectoriel */}
      <Card title="🏆 Benchmarking Sectoriel">
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Secteur:</span>
              <span className="font-medium text-gray-900 ml-2">{financialData.benchmarking.sector}</span>
            </div>
            <div>
              <span className="text-gray-600">Taille:</span>
              <span className="font-medium text-gray-900 ml-2">{financialData.benchmarking.companySize}</span>
            </div>
            <div>
              <span className="text-gray-600">Région:</span>
              <span className="font-medium text-gray-900 ml-2">{financialData.benchmarking.region}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Métrique</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Notre Entreprise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Moyenne Secteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Performance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {financialData.benchmarking.comparisons.map((comparison, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comparison.metric}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comparison.company}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comparison.sector}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      comparison.company > comparison.market 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {comparison.company > comparison.market ? 'Au-dessus' : 'Dans les normes'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Détails KPI */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Détails - ${selectedKPI?.title || ''}`}
      >
        {selectedKPI && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                <h4 className="font-semibold text-gray-800 mb-2">Valeur Actuelle</h4>
                <div className="text-4xl font-bold text-gray-900">{selectedKPI.value}{selectedKPI.unit}</div>
              </div>
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                <h4 className="font-semibold text-gray-800 mb-2">Benchmark</h4>
                <div className="text-4xl font-bold text-gray-500">{selectedKPI.benchmark}{selectedKPI.unit}</div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Formule de calcul</h4>
              <code className="text-sm bg-gray-100 p-2 rounded block">{selectedKPI.formula}</code>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Rapport */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Générer un Rapport de KPIs"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de Rapport</label>
            <div className="grid grid-cols-2 gap-4">
              {['comprehensive', 'executive', 'detailed', 'benchmarking'].map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    reportType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {type === 'comprehensive' ? 'Complet' : type === 'executive' ? 'Exécutif' : type === 'detailed' ? 'Détaillé' : 'Benchmarking'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button onClick={() => setShowReportModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Annuler</button>
            <button onClick={handleExportReport} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Générer</button>
          </div>
        </div>
      </Modal>

      {/* Graphiques de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des Revenus */}
        <Card title={t('analytics.kpis.sections.revenue')}>
          <div className="space-y-4">
            {financialData.chartData.revenue.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-6">{t('common.no_data', { defaultValue: 'Aucune donnée' })}</div>
            )}
            {financialData.chartData.revenue.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded border border-gray-100 gap-2">
                <span className="text-sm font-bold text-gray-700">{item.month}</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{formatCurrency(item.value)}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Réalisé</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Graphique de Rentabilité */}
        <Card title={t('analytics.kpis.sections.profitability')}>
          <div className="space-y-4">
            {financialData.chartData.profitability.map((item, index) => (
              <div key={index} className="p-4 bg-white rounded border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                  <span className="text-lg font-bold text-gray-900">{item.value}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Benchmark: {item.benchmark}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IndicateursPerformance;
