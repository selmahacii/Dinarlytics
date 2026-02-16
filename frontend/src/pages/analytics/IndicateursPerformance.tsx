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
      nom: 'SCF (Système Comptable Financier)',
      code: 'SCF',
      emoji: '🇩🇿',
      comptes: {
        ventes: '701 - Ventes de biens',
        tva: '44571 - TVA collectée',
        clients: '411 - Clients',
        stocks: '31 - Stocks',
        produits: '7011 - Ventes de produits finis',
        charges: '601 - Achats de marchandises',
        immobilisations: '20 - Immobilisations corporelles'
      }
    },
    international: {
      nom: 'IFRS (International Financial Reporting Standards)',
      code: 'IFRS',
      emoji: '🌍',
      comptes: {
        ventes: 'Revenue - Sales of goods',
        tva: 'VAT Payable',
        clients: 'Trade Receivables',
        stocks: 'Inventory',
        produits: 'Sales Revenue',
        charges: 'Cost of Goods Sold',
        immobilisations: 'Property, Plant & Equipment'
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
  React.useEffect(() => {
    setLoadingKpi(true);
    api.kpis.getKPIs()
      .then(data => {
        setKpiComptables(data);
      })
      .catch(() => setKpiError('Erreur lors du chargement des KPIs'))
      .finally(() => setLoadingKpi(false));

    setLoadingIndicators(true);
    api.kpis.getFinancialIndicators()
      .then(data => {
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
            📊 Analyse Financière Avancée
          </h1>
          <p className="text-gray-600">KPIs, ratios financiers et indicateurs de performance</p>
      </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Sélectionner la période"
            title="Sélectionner la période"
          >
            <option value="3m">3 mois</option>
            <option value="6m">6 mois</option>
            <option value="12m">12 mois</option>
            <option value="24m">24 mois</option>
          </select>
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Sélectionner la métrique"
            title="Sélectionner la métrique"
          >
            <option value="all">Tous les KPIs</option>
            <option value="rentability">Rentabilité</option>
            <option value="liquidity">Liquidité</option>
            <option value="leverage">Endettement</option>
            <option value="efficiency">Efficacité</option>
          </select>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Activer/Désactiver l'auto-refresh"
            aria-label="Activer/Désactiver l'auto-refresh"
          >
            <ClockIcon className="h-4 w-4 inline mr-2" />
            Auto-refresh
          </button>
          
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Générer un rapport"
            aria-label="Générer un rapport"
          >
            <DocumentChartBarIcon className="h-4 w-4 inline mr-2" />
            Générer Rapport
          </button>
        </div>
      </div>

      {/* Dashboard des KPIs Principaux */}
      <Card title="🎯 KPIs Financiers Principaux">
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
                  <button className="text-blue-600 hover:text-blue-800 text-sm" title="Voir les détails du KPI" aria-label="Voir les détails du KPI">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Graphiques de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des Revenus */}
        <Card title="📈 Évolution des Revenus">
          <div className="space-y-4">
            {financialData.chartData.revenue.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <span className="text-sm font-medium text-gray-700">{item.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</div>
                    <div className="text-xs text-gray-500">Réalisé</div>
            </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">{formatCurrency(item.target)}</div>
                    <div className="text-xs text-gray-500">Objectif</div>
            </div>
                  <div className="text-xs text-gray-600">
                    {Math.min((item.value / item.target) * 100, 100).toFixed(0)}% de l'objectif
                  </div>
                </div>
              </div>
            ))}
            </div>
        </Card>

        {/* Graphique de Rentabilité */}
        <Card title="💰 Analyse de Rentabilité">
          <div className="space-y-4">
            {financialData.chartData.profitability.map((item, index) => (
              <div key={index} className="p-4 bg-white rounded border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                  <span className="text-lg font-bold text-gray-900">{item.value}%</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {Math.min((item.value / item.benchmark) * 100, 100).toFixed(0)}% du benchmark
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Benchmark: {item.benchmark}%</span>
                  <span>{((item.value / item.benchmark) * 100).toFixed(0)}% du benchmark</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        </div>

      {/* Indicateurs Comptables SCF/IFRS */}
      <Card title="📚 Indicateurs Comptables">
        <div className="space-y-6">
          {/* En-tête avec norme comptable */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Norme Comptable Active
                </h3>
                <p className="text-gray-600">
                  <BookOpenIcon className="h-5 w-5 inline mr-2" />
                  {normesComptables[planComptable as keyof typeof normesComptables].nom}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Plan Comptable</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {normesComptables[planComptable as keyof typeof normesComptables].emoji} {normesComptables[planComptable as keyof typeof normesComptables].code}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ratios Financiers Comptables */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Ratios Financiers Comptables</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kpiComptables.ratiosFinanciers.map((ratio: any) => (
                <div key={ratio.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      ratio.couleur === 'green' ? 'bg-green-100' :
                      ratio.couleur === 'orange' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      <ScaleIcon className={`h-6 w-6 ${
                        ratio.couleur === 'green' ? 'text-green-600' :
                        ratio.couleur === 'orange' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <span className="text-sm text-gray-500">{ratio.norme}</span>
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-2">{ratio.nom}</h5>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {ratio.valeur}{ratio.unite}
                  </p>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={`font-medium ${
                      ratio.evolution >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {ratio.evolution >= 0 ? '+' : ''}{ratio.evolution}%
                    </span>
                    <span className="text-gray-500">Objectif: {ratio.objectif}{ratio.unite}</span>
                  </div>
                  <p className="text-sm text-gray-600">{ratio.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Indicateurs TVA */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Indicateurs TVA</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kpiComptables.indicateursTVA.map((tva: any) => (
                <div key={tva.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <DocumentCheckIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-500">{tva.taux}%</span>
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-2">{tva.nom}</h5>
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    {formatCurrency(tva.montant)}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">À verser/récupérer:</span>
                      <span className="font-medium">{formatCurrency(tva.aVerser ?? tva.aRecuperer ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Crédit:</span>
                      <span className="font-medium text-green-600">{formatCurrency(tva.credit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Évolution:</span>
                      <span className="font-medium text-green-600">+{tva.evolution}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Écritures Comptables */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Journaux Comptables</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kpiComptables.ecrituresComptables.map((journal: any) => (
                <div key={journal.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      journal.statut === 'Validé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {journal.statut}
                    </span>
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-2">{journal.nom}</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nombre d'écritures:</span>
                      <span className="font-medium">{journal.nombre}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Montant total:</span>
                      <span className="font-medium">{formatCurrency(journal.montant)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Période:</span>
                      <span className="font-medium">{journal.periode}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Codes Comptables */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Codes Comptables Utilisés</h4>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Comptes de Vente</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Ventes de biens</p>
                        <p className="text-sm text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.ventes}</p>
                      </div>
                      <ScaleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Produits finis</p>
                        <p className="text-sm text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.produits}</p>
                      </div>
                      <ScaleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Comptes de Gestion</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">TVA Collectée</p>
                        <p className="text-sm text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.tva}</p>
                      </div>
                      <ScaleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Clients</p>
                        <p className="text-sm text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.clients}</p>
                      </div>
                      <ScaleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Stocks</p>
                        <p className="text-sm text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.stocks}</p>
                      </div>
                      <ScaleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Ratios Financiers Avancés */}
      <Card title="🔍 Ratios Financiers Avancés">
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
                  <button className="text-blue-600 hover:text-blue-800 text-sm" title="Voir les détails du ratio" aria-label="Voir les détails du ratio">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
            </div>
      </Card>

      {/* Alertes et Recommandations */}
      <Card title="⚠️ Alertes et Recommandations">
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métrique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notre Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moyenne Secteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moyenne Marché
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {financialData.benchmarking.comparisons.map((comparison, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {comparison.metric}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {comparison.company}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comparison.sector}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comparison.market}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      comparison.company > comparison.market 
                        ? 'bg-green-100 text-green-800' 
                        : comparison.company > comparison.sector
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comparison.company > comparison.market 
                        ? 'Au-dessus du marché' 
                        : comparison.company > comparison.sector
                        ? 'Au-dessus du secteur'
                        : 'En dessous du secteur'}
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
        title={`Détails - ${selectedKPI?.title}`}
      >
        {selectedKPI && (
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-600 mr-2" />
                  Valeur Actuelle
                </h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {selectedKPI.value}{selectedKPI.unit}
                </div>
                  <div className="flex items-center justify-center space-x-2">
                    {(() => {
                      const TrendIcon = getTrendIcon(selectedKPI.trend);
                      return (
                        <>
                          <TrendIcon className={`h-5 w-5 ${selectedKPI.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={`font-medium ${selectedKPI.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedKPI.change > 0 ? '+' : ''}{selectedKPI.change}{selectedKPI.unit}
                          </span>
                        </>
                      );
                    })()}
                </div>
              </div>
            </div>

              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <ScaleIcon className="h-5 w-5 text-gray-600 mr-2" />
                  Benchmark
                </h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedKPI.benchmark}{selectedKPI.unit}
                </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedKPI.status)}`}>
                    {selectedKPI.status === 'excellent' ? 'Excellent' :
                     selectedKPI.status === 'good' ? 'Bon' :
                     selectedKPI.status === 'warning' ? 'Attention' : 'Critique'}
                </div>
                </div>
              </div>
            </div>

            {/* Description et formule */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-gray-600 mr-2" />
                Informations Détaillées
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-600">{selectedKPI.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formule de Calcul</label>
                  <div className="p-3 bg-gray-50 rounded border border-gray-100">
                    <code className="text-sm text-gray-800">{selectedKPI.formula}</code>
                </div>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <LightBulbIcon className="h-5 w-5 text-gray-600 mr-2" />
                Recommandations
              </h4>
              <div className="space-y-3">
                {selectedKPI.status === 'excellent' && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800">
                      ✅ Excellente performance ! Maintenez cette tendance positive.
              </p>
            </div>
                )}
                {selectedKPI.status === 'good' && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">
                      📈 Bonne performance. Continuez à optimiser pour atteindre l'excellence.
                    </p>
          </div>
                )}
                {selectedKPI.status === 'warning' && (
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Attention requise. Analysez les causes et mettez en place un plan d'amélioration.
              </p>
            </div>
                )}
                {selectedKPI.status === 'critical' && (
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-red-800">
                      🚨 Action immédiate requise. Priorité haute pour l'amélioration.
              </p>
            </div>
                )}
          </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Génération de Rapport */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="📊 Génération de Rapport Financier"
      >
        <div className="space-y-6">
          {/* Type de rapport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Type de Rapport</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  reportType === 'comprehensive' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setReportType('comprehensive')}
                title="Rapport Complet"
                aria-label="Rapport Complet"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={reportType === 'comprehensive'}
                    onChange={() => setReportType('comprehensive')}
                    className="mr-3"
                    title="Rapport Complet"
                    aria-label="Rapport Complet"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">Rapport Complet</h4>
                    <p className="text-sm text-gray-600">Tous les KPIs, ratios et analyses</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  reportType === 'executive' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setReportType('executive')}
                title="Rapport Exécutif"
                aria-label="Rapport Exécutif"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={reportType === 'executive'}
                    onChange={() => setReportType('executive')}
                    className="mr-3"
                    title="Rapport Exécutif"
                    aria-label="Rapport Exécutif"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">Rapport Exécutif</h4>
                    <p className="text-sm text-gray-600">Synthèse des KPIs principaux</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  reportType === 'detailed' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setReportType('detailed')}
                title="Rapport Détaillé"
                aria-label="Rapport Détaillé"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={reportType === 'detailed'}
                    onChange={() => setReportType('detailed')}
                    className="mr-3"
                    title="Rapport Détaillé"
                    aria-label="Rapport Détaillé"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">Rapport Détaillé</h4>
                    <p className="text-sm text-gray-600">Analyse approfondie avec recommandations</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  reportType === 'benchmarking' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setReportType('benchmarking')}
                title="Benchmarking"
                aria-label="Benchmarking"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={reportType === 'benchmarking'}
                    onChange={() => setReportType('benchmarking')}
                    className="mr-3"
                    title="Benchmarking"
                    aria-label="Benchmarking"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">Benchmarking</h4>
                    <p className="text-sm text-gray-600">Comparaison sectorielle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Format de rapport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Format de Rapport</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  reportFormat === 'pdf' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setReportFormat('pdf')}
                title="Format PDF"
                aria-label="Format PDF"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={reportFormat === 'pdf'}
                    onChange={() => setReportFormat('pdf')}
                    className="mr-3"
                    title="Format PDF"
                    aria-label="Format PDF"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">PDF</h4>
                    <p className="text-sm text-gray-600">Document imprimable</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  reportFormat === 'excel' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setReportFormat('excel')}
                title="Format Excel"
                aria-label="Format Excel"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={reportFormat === 'excel'}
                    onChange={() => setReportFormat('excel')}
                    className="mr-3"
                    title="Format Excel"
                    aria-label="Format Excel"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">Excel</h4>
                    <p className="text-sm text-gray-600">Données tabulaires</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  reportFormat === 'json' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setReportFormat('json')}
                title="Format JSON"
                aria-label="Format JSON"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={reportFormat === 'json'}
                    onChange={() => setReportFormat('json')}
                    className="mr-3"
                    title="Format JSON"
                    aria-label="Format JSON"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">JSON</h4>
                    <p className="text-sm text-gray-600">Données structurées</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="period-select">Période d'Analyse</label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Période d'analyse"
              title="Période d'analyse"
            >
              <option value="3m">3 derniers mois</option>
              <option value="6m">6 derniers mois</option>
              <option value="12m">12 derniers mois</option>
              <option value="24m">24 derniers mois</option>
            </select>
          </div>

          {/* Résumé du rapport */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Résumé du Rapport</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">
                  {reportType === 'comprehensive' ? 'Rapport Complet' :
                   reportType === 'executive' ? 'Rapport Exécutif' :
                   reportType === 'detailed' ? 'Rapport Détaillé' : 'Benchmarking'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-medium">{reportFormat.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Période:</span>
                <span className="font-medium">
                  {selectedPeriod === '3m' ? '3 derniers mois' :
                   selectedPeriod === '6m' ? '6 derniers mois' :
                   selectedPeriod === '12m' ? '12 derniers mois' : '24 derniers mois'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>KPIs inclus:</span>
                <span className="font-medium">{financialData.mainKPIs.length + financialData.advancedRatios.length}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowReportModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              title="Annuler"
              aria-label="Annuler"
            >
              Annuler
            </button>
            <button
              onClick={handleExportReport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              title="Générer et Télécharger le rapport"
              aria-label="Générer et Télécharger le rapport"
            >
              <DocumentChartBarIcon className="h-4 w-4 mr-2" />
              Générer et Télécharger
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IndicateursPerformance;


