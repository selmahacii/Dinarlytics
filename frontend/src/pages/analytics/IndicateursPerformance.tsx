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
  }, []);

  // Données financières enrichies
  const financialData = {
    // KPIs Financiers Principaux
    mainKPIs: [
      {
        id: 'roe',
        title: 'ROE (Return on Equity)',
        value: 18.5,
        unit: '%',
        change: 2.3,
        trend: 'up',
        benchmark: 15.0,
        status: 'excellent',
        description: 'Rendement des capitaux propres',
        formula: 'Bénéfice Net / Capitaux Propres',
        category: 'rentability'
      },
      {
        id: 'roa',
        title: 'ROA (Return on Assets)',
        value: 12.8,
        unit: '%',
        change: 1.7,
        trend: 'up',
        benchmark: 10.0,
        status: 'good',
        description: 'Rendement des actifs',
        formula: 'Bénéfice Net / Actif Total',
        category: 'rentability'
      },
      {
        id: 'current_ratio',
        title: 'Ratio de Liquidité Courante',
        value: 2.1,
        unit: 'x',
        change: 0.2,
        trend: 'up',
        benchmark: 2.0,
        status: 'excellent',
        description: 'Capacité à honorer les dettes à court terme',
        formula: 'Actif Circulant / Passif Circulant',
        category: 'liquidity'
      },
      {
        id: 'debt_ratio',
        title: 'Ratio d\'Endettement',
        value: 0.45,
        unit: 'x',
        change: -0.08,
        trend: 'up',
        benchmark: 0.5,
        status: 'good',
        description: 'Niveau d\'endettement',
        formula: 'Dette Totale / Actif Total',
        category: 'leverage'
      },
      {
        id: 'net_margin',
        title: 'Marge Nette',
        value: 15.2,
        unit: '%',
        change: 1.8,
        trend: 'up',
        benchmark: 12.0,
        status: 'excellent',
        description: 'Rentabilité nette',
        formula: 'Bénéfice Net / Chiffre d\'Affaires',
        category: 'rentability'
      },
      {
        id: 'asset_turnover',
        title: 'Rotation des Actifs',
        value: 1.8,
        unit: 'x',
        change: 0.1,
        trend: 'up',
        benchmark: 1.5,
        status: 'good',
        description: 'Efficacité d\'utilisation des actifs',
        formula: 'Chiffre d\'Affaires / Actif Total',
        category: 'efficiency'
      }
    ],

    // Ratios Financiers Avancés
    advancedRatios: [
      {
        id: 'quick_ratio',
        title: 'Ratio de Liquidité Immédiate',
        value: 1.4,
        unit: 'x',
        change: 0.1,
        trend: 'up',
        benchmark: 1.0,
        status: 'good',
        description: 'Liquidité sans les stocks',
        formula: '(Actif Circulant - Stocks) / Passif Circulant'
      },
      {
        id: 'cash_ratio',
        title: 'Ratio de Trésorerie',
        value: 0.8,
        unit: 'x',
        change: 0.2,
        trend: 'up',
        benchmark: 0.5,
        status: 'excellent',
        description: 'Capacité de paiement immédiate',
        formula: 'Trésorerie / Passif Circulant'
      },
      {
        id: 'debt_to_equity',
        title: 'Ratio Dette/Capitaux Propres',
        value: 0.6,
        unit: 'x',
        change: -0.1,
        trend: 'up',
        benchmark: 0.7,
        status: 'good',
        description: 'Structure financière',
        formula: 'Dette Totale / Capitaux Propres'
      },
      {
        id: 'interest_coverage',
        title: 'Couverture des Intérêts',
        value: 8.5,
        unit: 'x',
        change: 1.2,
        trend: 'up',
        benchmark: 5.0,
        status: 'excellent',
        description: 'Capacité à payer les intérêts',
        formula: 'EBIT / Charges d\'Intérêts'
      },
      {
        id: 'gross_margin',
        title: 'Marge Brute',
        value: 42.3,
        unit: '%',
        change: 2.1,
        trend: 'up',
        benchmark: 35.0,
        status: 'excellent',
        description: 'Rentabilité avant charges',
        formula: 'Marge Brute / Chiffre d\'Affaires'
      },
      {
        id: 'operating_margin',
        title: 'Marge Opérationnelle',
        value: 28.7,
        unit: '%',
        change: 1.5,
        trend: 'up',
        benchmark: 20.0,
        status: 'excellent',
        description: 'Rentabilité opérationnelle',
        formula: 'EBIT / Chiffre d\'Affaires'
      }
    ],

    // Données pour graphiques
    chartData: {
      revenue: [
        { month: 'Jan', value: 280000, target: 300000 },
        { month: 'Fév', value: 320000, target: 310000 },
        { month: 'Mar', value: 350000, target: 320000 },
        { month: 'Avr', value: 380000, target: 330000 },
        { month: 'Mai', value: 420000, target: 340000 },
        { month: 'Jun', value: 450000, target: 350000 }
      ],
      profitability: [
        { metric: 'Marge Brute', value: 42.3, benchmark: 35.0 },
        { metric: 'Marge Opérationnelle', value: 28.7, benchmark: 20.0 },
        { metric: 'Marge Nette', value: 15.2, benchmark: 12.0 }
      ],
      liquidity: [
        { metric: 'Ratio Courant', value: 2.1, benchmark: 2.0 },
        { metric: 'Ratio Immédiat', value: 1.4, benchmark: 1.0 },
        { metric: 'Ratio Trésorerie', value: 0.8, benchmark: 0.5 }
      ]
    },

    // Alertes et recommandations
    alerts: [
      {
        id: 1,
        type: 'warning',
        title: 'Ratio de Rotation des Stocks',
        message: 'Le ratio de rotation des stocks (6.2x) est en dessous de la moyenne du secteur (8.0x)',
        action: 'Optimiser la gestion des stocks',
        priority: 'medium'
      },
      {
        id: 2,
        type: 'success',
        title: 'ROE Excellent',
        message: 'Le ROE de 18.5% dépasse largement la moyenne du secteur (12%)',
        action: 'Maintenir cette performance',
        priority: 'low'
      },
      {
        id: 3,
        type: 'info',
        title: 'Opportunité d\'Investissement',
        message: 'La trésorerie excédentaire pourrait être investie pour améliorer le ROA',
        action: 'Analyser les opportunités d\'investissement',
        priority: 'medium'
      }
    ],

    // Benchmarking sectoriel
    benchmarking: {
      sector: 'Services Financiers',
      companySize: 'PME (10-50 employés)',
      region: 'Algérie',
      comparisons: [
        { metric: 'ROE', company: 18.5, sector: 12.0, market: 15.0 },
        { metric: 'ROA', company: 12.8, sector: 8.5, market: 10.0 },
        { metric: 'Marge Nette', company: 15.2, sector: 10.0, market: 12.0 },
        { metric: 'Ratio Liquidité', company: 2.1, sector: 1.8, market: 2.0 }
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
            const TrendIcon = getTrendIcon(kpi.trend);
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
                  <div className="flex items-center space-x-2">
                    <TrendIcon className={`h-4 w-4 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}{kpi.unit}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-gray-600 mb-2">{kpi.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {kpi.value}{kpi.unit}
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
            const TrendIcon = getTrendIcon(ratio.trend);
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
                  <div className="flex items-center space-x-2">
                    <TrendIcon className={`h-4 w-4 ${ratio.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-sm font-medium ${ratio.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {ratio.change > 0 ? '+' : ''}{ratio.change}{ratio.unit}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-gray-600 mb-2">{ratio.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {ratio.value}{ratio.unit}
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
            {financialData.chartData.revenue.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded border border-gray-100 gap-2">
                <span className="text-sm font-bold text-gray-700">{item.month}</span>
                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(item.value)}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Réalisé</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">{formatCurrency(item.target)}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Objectif</div>
                  </div>
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
