import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  CogIcon,
  BellIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  XMarkIcon,
  CalculatorIcon,
  BookOpenIcon,
  DocumentCheckIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import { useApp } from '../../context/AppContext';
import { formatNumber as fmtNumber } from '../../utils/format';
import { useTranslation } from '../../hooks/useTranslation';
import SalesChart from '../../components/Charts/SalesChart';
import ExpenseChart from '../../components/Charts/ExpenseChart';
import DoughnutChart from '../../components/Charts/DoughnutChart';
import BarChart from '../../components/Charts/BarChart';
import LineChart from '../../components/Charts/LineChart';
import { useAnalytics } from '../../hooks/useAnalytics';

type KPISet = {
  chiffreAffaires: {
    montant: number;
    evolution: number;
    objectif: number;
    realisation: number;
    codeCompte: string;
  };
  tvaCollectee: {
    montant: number;
    taux: number;
    aVerser: number;
    credit: number;
    codeCompte: string;
  };
  creancesClients: {
    montant: number;
    delaiMoyen: number;
    risque: string;
    provision: number;
    codeCompte: string;
  };
  rotationStocks: {
    ratio: number;
    delai: number;
    objectif: number;
    performance: number;
    codeCompte: string;
  };
};

const Dashboard: React.FC = () => {
  const { formatCurrency, planComptable } = useApp();
  const { t } = useTranslation();

  // Real-time analytics hook (replaces static axios calls)
  const { kpis: analyticsKpis, alerts: smartAlerts, loading: loadingAnalytics, error: errorAnalytics } = useAnalytics();


  // Helpers: map percentages/colors to Tailwind classes (no inline styles)
  const WIDTH_CLASSES = [
    'w-[0%]', 'w-[5%]', 'w-[10%]', 'w-[20%]', 'w-[30%]', 'w-[40%]', 'w-[50%]',
    'w-[60%]', 'w-[70%]', 'w-[80%]', 'w-[90%]', 'w-[95%]', 'w-[100%]'
  ] as const;
  const percentToWidth = (percent: number) => {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    if (p >= 98) return 'w-[100%]';
    if (p >= 95) return 'w-[95%]';
    if (p >= 90) return 'w-[90%]';
    if (p >= 80) return 'w-[80%]';
    if (p >= 70) return 'w-[70%]';
    if (p >= 60) return 'w-[60%]';
    if (p >= 50) return 'w-[50%]';
    if (p >= 40) return 'w-[40%]';
    if (p >= 30) return 'w-[30%]';
    if (p >= 20) return 'w-[20%]';
    if (p >= 10) return 'w-[10%]';
    if (p >= 5) return 'w-[5%]';
    return 'w-[0%]';
  };
  // Fixed color mappings for demo (avoid inline style background colors)
  const colorByIndex = (index: number, palette: ('blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'emerald' | 'indigo')[] = ['blue', 'green', 'purple', 'orange', 'red']) => {
    const color = palette[index % palette.length];
    const map: Record<string, string> = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      orange: 'bg-orange-600',
      red: 'bg-red-600',
      yellow: 'bg-yellow-500',
      emerald: 'bg-emerald-600',
      indigo: 'bg-indigo-600',
    };
    return map[color] || 'bg-slate-500';
  };

  // États pour les hooks et interactions
  const [activeTimeframe, setActiveTimeframe] = useState<'day' | 'week' | 'month' | 'quarter'>('month');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');
  const [notifications, setNotifications] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const [quickActions, setQuickActions] = useState<boolean>(true);
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [kpis, setKpis] = useState<KPISet | null>(null);
  const [loadingKpis, setLoadingKpis] = useState<boolean>(true);
  const [errorKpis, setErrorKpis] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(true);
  const [errorAlerts, setErrorAlerts] = useState<string | null>(null);

  // Advanced statistics states
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loadingSystemStats, setLoadingSystemStats] = useState<boolean>(true);
  const [activityMetrics, setActivityMetrics] = useState<any>(null);
  const [loadingActivityMetrics, setLoadingActivityMetrics] = useState<boolean>(true);
  const [businessWeather, setBusinessWeather] = useState<any>(null);
  const [loadingBusinessWeather, setLoadingBusinessWeather] = useState<boolean>(true);

  // Use chart data hook
  const { chartData, loadingCharts, errorCharts } = useChartData();

  const kpiCards = kpis ? [
    {
      name: "Chiffre d'affaires",
      value: kpis.chiffreAffaires.montant,
      unit: 'DZD',
      trend: (kpis.chiffreAffaires.evolution ?? 0) >= 0 ? 'up' : 'down'
    },
    {
      name: 'TVA collectée',
      value: kpis.tvaCollectee.montant,
      unit: 'DZD',
      trend: (kpis.tvaCollectee.taux ?? 0) >= 0 ? 'up' : 'down'
    },
    {
      name: 'Créances clients',
      value: kpis.creancesClients.montant,
      unit: 'DZD',
      trend: (kpis.creancesClients.delaiMoyen ?? 0) >= 0 ? 'up' : 'down'
    },
    {
      name: 'Rotation des stocks',
      value: kpis.rotationStocks.ratio,
      unit: 'x',
      trend: (kpis.rotationStocks.performance ?? 0) >= 0 ? 'up' : 'down'
    }
  ] : [];

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

  // Hook pour l'auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // Rafraîchir toutes les 30 secondes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Récupération des KPIs depuis l'API
  useEffect(() => {
    setLoadingKpis(true);
    axios.get<KPISet>('/api/v1/documents/kpis')
      .then((res) => {
        setKpis(res.data);
        setLoadingKpis(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setErrorKpis('Erreur chargement KPIs');
        setLoadingKpis(false);
      });
  }, []);

  // Récupération des alertes depuis l'API
  useEffect(() => {
    setLoadingAlerts(true);
    axios.get('/api/v1/documents/alerts')
      .then((res) => {
        setAlerts(Array.isArray(res.data) ? res.data : []);
        setErrorAlerts(null);
        setLoadingAlerts(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setErrorAlerts('Erreur chargement alertes');
        setAlerts([]);
        setLoadingAlerts(false);
      });
  }, []);

  // Récupération des statistiques système
  useEffect(() => {
    setLoadingSystemStats(true);
    axios.get('/api/v1/documents/system-stats')
      .then((res) => {
        setSystemStats(res.data);
        setLoadingSystemStats(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setLoadingSystemStats(false);
      });
  }, []);

  // Récupération des métriques d'activité
  useEffect(() => {
    setLoadingActivityMetrics(true);
    axios.get('/api/v1/documents/activity-metrics')
      .then((res) => {
        setActivityMetrics(res.data);
        setLoadingActivityMetrics(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setLoadingActivityMetrics(false);
      });
  }, []);

  // Récupération de la météo des affaires
  useEffect(() => {
    setLoadingBusinessWeather(true);
    axios.get('/api/v1/documents/business-weather')
      .then((res) => {
        setBusinessWeather(res.data);
        setLoadingBusinessWeather(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setLoadingBusinessWeather(false);
      });
  }, []);

  // Fonctions pour gérer les alertes
  const handleAlertAction = (alert: any) => {
    setSelectedAlert(alert);
    setIsAlertModalOpen(true);
  };

  const handleCommander = (alert: any) => {
    alert(`Commande lancée pour: ${alert.message}`);
    setIsAlertModalOpen(false);
  };

  const handleContacter = (alert: any) => {
    alert(`Contact établi pour: ${alert.message}`);
    setIsAlertModalOpen(false);
  };

  const handleInvestiger = (alert: any) => {
    alert(`Investigation lancée pour: ${alert.message}`);
    setIsAlertModalOpen(false);
  };

  const handleMettreAJour = (alert: any) => {
    alert(`Mise à jour lancée pour: ${alert.message}`);
    setIsAlertModalOpen(false);
  };

  // Métriques principales avec animations
  const metriques = {
    revenue: {
      value: 1250000,
      change: 12.5,
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'blue'
    },
    clients: {
      value: 156,
      change: 8.3,
      trend: 'up',
      icon: UserGroupIcon,
      color: 'green'
    },
    products: {
      value: 89,
      change: -2.1,
      trend: 'down',
      icon: CubeIcon,
      color: 'purple'
    },
    orders: {
      value: 1247,
      change: 15.7,
      trend: 'up',
      icon: ChartBarIcon,
      color: 'orange'
    }
  };

  // Mock fallback data for charts when API fails
  const mockChartData = {
    revenueBySector: {
      labels: ['Services', 'Commerce', 'Industrie', 'Technologie', 'Santé'],
      data: [35, 25, 20, 15, 5],
      colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
    },
    monthlyTrends: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      revenue: [120, 135, 142, 138, 155, 168],
      expenses: [95, 102, 98, 105, 112, 118],
      profit: [25, 33, 44, 33, 43, 50]
    },
    clientSatisfaction: {
      excellent: 45,
      good: 35,
      average: 15,
      poor: 5
    },
    performanceMetrics: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      roe: [12.5, 14.2, 13.8, 15.1],
      roa: [8.3, 9.1, 8.9, 9.5],
      margin: [22.1, 24.3, 23.8, 25.2]
    },
    geographicDistribution: {
      regions: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Tlemcen'],
      clients: [45, 32, 28, 19, 12],
      revenue: [520, 380, 320, 210, 140]
    },
    riskAnalysis: {
      categories: ['Faible', 'Moyen', 'Élevé', 'Critique'],
      counts: [89, 45, 18, 4],
      colors: ['#10B981', '#F59E0B', '#F97316', '#EF4444']
    },
    cashFlow: {
      months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      operating: [85, 92, 88, 95, 102, 108],
      investing: [-45, -38, -42, -35, -28, -32],
      financing: [25, 18, 22, 15, 8, 12]
    },
    productivityTrends: {
      metrics: ['Efficacité', 'Qualité', 'Innovation', 'Satisfaction'],
      current: [87, 92, 78, 89],
      target: [90, 95, 85, 92],
      colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']
    },
    marketShare: {
      competitors: ['Nous', 'Concurrent A', 'Concurrent B', 'Concurrent C', 'Autres'],
      share: [35, 28, 22, 12, 3],
      colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#6B7280']
    }
  };

  // Mock alerts fallback
  const mockAlerts = [
    {
      type: 'warning',
      title: 'Stock faible',
      message: 'Produit "Widget Pro" en rupture de stock',
      time: 'Il y a 2h',
      icon: ExclamationTriangleIcon,
      priority: 'high',
      action: 'Commander'
    },
    {
      type: 'info',
      title: 'Nouveau client',
      message: 'Entreprise ABC a rejoint la plateforme',
      time: 'Il y a 4h',
      icon: CheckCircleIcon,
      priority: 'medium',
      action: 'Contacter'
    },
    {
      type: 'success',
      title: 'Objectif atteint',
      message: 'Objectif de vente mensuel dépassé de 15%',
      time: 'Il y a 6h',
      icon: CheckCircleIcon,
      priority: 'low',
      action: 'Célébrer'
    },
    {
      type: 'warning',
      title: 'Performance dégradée',
      message: 'Temps de réponse serveur > 3s',
      time: 'Il y a 1h',
      icon: ExclamationTriangleIcon,
      priority: 'high',
      action: 'Investiger'
    },
    {
      type: 'info',
      title: 'Mise à jour disponible',
      message: 'Nouvelle version 2.1.0 disponible',
      time: 'Il y a 8h',
      icon: CheckCircleIcon,
      priority: 'medium',
      action: 'Mettre à jour'
    }
  ];

  // Widgets interactifs enrichis (dynamiques)
  const widgets = [
    {
      title: 'Activité en Temps Réel',
      content: loadingActivityMetrics ? (
        <div className="text-center text-gray-500 py-4">Chargement...</div>
      ) : activityMetrics ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Visiteurs actifs</span>
            <span className="text-lg font-bold text-green-600">{activityMetrics.active_visitors}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Commandes en cours</span>
            <span className="text-lg font-bold text-blue-600">{activityMetrics.pending_orders}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tickets support</span>
            <span className="text-lg font-bold text-orange-600">{activityMetrics.support_tickets}</span>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">Non disponible</div>
      )
    },
    {
      title: 'Météo des Affaires',
      content: loadingBusinessWeather ? (
        <div className="text-center text-gray-500 py-4">Chargement...</div>
      ) : businessWeather ? (
        <div className="text-center">
          <div className="mb-2">
            <span className={`inline-block w-3 h-3 rounded-full ${businessWeather.status === 'excellent' ? 'bg-green-500' :
                businessWeather.status === 'good' ? 'bg-blue-500' :
                  businessWeather.status === 'average' ? 'bg-yellow-500' :
                    'bg-red-500'
              }`}></span>
          </div>
          <div className={`text-base font-bold ${businessWeather.status === 'excellent' ? 'text-green-600' :
              businessWeather.status === 'good' ? 'text-blue-600' :
                businessWeather.status === 'average' ? 'text-yellow-600' :
                  'text-red-600'
            }`}>{businessWeather.indicator}</div>
          <div className="text-sm text-gray-600">{businessWeather.description}</div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">Non disponible</div>
      )
    },
    {
      title: 'Quick Actions',
      content: (
        <div className="space-y-2">
          <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Nouveau Rapport
          </button>
          <button className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
            Ajouter Client
          </button>
          <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
            Gérer Stock
          </button>
        </div>
      )
    }
  ];

  // Raccourcis rapides
  const quickShortcuts = [
    { name: '📊 Rapports', icon: DocumentTextIcon, color: 'blue', path: '/statistiques' },
    { name: '👥 Clients', icon: UserGroupIcon, color: 'green', path: '/clients' },
    { name: '📦 Inventaire', icon: CubeIcon, color: 'purple', path: '/inventaire' },
    { name: '💰 Factures', icon: CurrencyDollarIcon, color: 'orange', path: '/factures-vente' },
    { name: '🔍 Audit', icon: EyeIcon, color: 'red', path: '/audit' },
    { name: '⚙️ Paramètres', icon: CogIcon, color: 'gray', path: '/parametres' }
  ];

  // Fonction pour la navigation
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const getMetricIcon = (icon: any) => {
    const Icon = icon;
    return <Icon className="h-8 w-8" />;
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
    ) : (
      <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50';
      case 'medium': return 'border-yellow-400 bg-yellow-50';
      case 'low': return 'border-green-400 bg-green-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <FireIcon className="h-4 w-4 text-red-600" />;
      case 'medium': return <BoltIcon className="h-4 w-4 text-yellow-600" />;
      case 'low': return <ShieldCheckIcon className="h-4 w-4 text-green-600" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  // Use API chartData or fallback to mock data
  const displayChartData = chartData || {
    sales: { months: [], revenue: [], target: [] },
    expenses: { categories: [], amounts: [] },
    performanceMetrics: { roe: [], roa: [], margin: [] },
    cashFlow: { months: [], operating: [], investing: [], financing: [] }
  };

  // Extend with mock data for features not yet in API
  const extendedChartData = {
    ...displayChartData,
    ...mockChartData
  };

  return (
    <>
      <div className="space-y-6">
        {/* En-tête avec contrôles */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
            <p className="text-gray-600">Vue d'ensemble de vos performances et activités</p>
          </div>

          {/* Contrôles et hooks */}
          <div className="flex flex-wrap items-center space-x-4">
            {/* Sélecteur de période */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['day', 'week', 'month', 'quarter'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setActiveTimeframe(timeframe)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTimeframe === timeframe
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {timeframe === 'day' && 'Jour'}
                  {timeframe === 'week' && 'Semaine'}
                  {timeframe === 'month' && 'Mois'}
                  {timeframe === 'quarter' && 'Trimestre'}
                </button>
              ))}
            </div>

            {/* Toggle notifications */}
            <button
              onClick={() => setNotifications(!notifications)}
              className={`p-2 rounded-lg transition-colors ${notifications ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              aria-label={notifications ? 'Désactiver les notifications' : 'Activer les notifications'}
              title={notifications ? 'Désactiver les notifications' : 'Activer les notifications'}
            >
              <BellIcon className="h-5 w-5" />
            </button>

            {/* Toggle auto-refresh */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}
              aria-label={autoRefresh ? "Désactiver l'auto-rafraîchissement" : "Activer l'auto-rafraîchissement"}
              title={autoRefresh ? "Désactiver l'auto-rafraîchissement" : "Activer l'auto-rafraîchissement"}
            >
              <CogIcon className="h-5 w-5" />
            </button>

            {/* Dernière mise à jour */}
            <div className="text-sm text-gray-500">
              Dernière MAJ: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Filtres fonctionnels */}
        <Card title="Filtres et Analyses">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="filter-sector" className="block text-sm font-medium text-gray-700 mb-2">Secteur d'activité</label>
              <select
                id="filter-sector"
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les secteurs</option>
                <option value="services">Services</option>
                <option value="commerce">Commerce</option>
                <option value="industrie">Industrie</option>
                <option value="technologie">Technologie</option>
                <option value="sante">Santé</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-region" className="block text-sm font-medium text-gray-700 mb-2">Région géographique</label>
              <select
                id="filter-region"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les régions</option>
                <option value="alger">Alger</option>
                <option value="oran">Oran</option>
                <option value="constantine">Constantine</option>
                <option value="annaba">Annaba</option>
                <option value="tlemcen">Tlemcen</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-risk" className="block text-sm font-medium text-gray-700 mb-2">Niveau de risque</label>
              <select
                id="filter-risk"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les risques</option>
                <option value="faible">Faible</option>
                <option value="moyen">Moyen</option>
                <option value="eleve">Élevé</option>
                <option value="critique">Critique</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filterSector !== 'all' && `Secteur: ${filterSector}`}
              {filterRegion !== 'all' && ` | Région: ${filterRegion}`}
              {filterRisk !== 'all' && ` | Risque: ${filterRisk}`}
            </div>
            <button
              onClick={() => {
                setFilterSector('all');
                setFilterRegion('all');
                setFilterRisk('all');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </Card>

        {/* Raccourcis rapides */}
        <Card title="Raccourcis Rapides">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickShortcuts.map((shortcut, index) => {
              const Icon = shortcut.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(shortcut.path)}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                >
                  <Icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-sm font-medium text-gray-700">{shortcut.name}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Métriques principales dynamiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingKpis ? (
            <Card><div className="text-center text-gray-500">Chargement des KPIs...</div></Card>
          ) : errorKpis ? (
            <Card><div className="text-center text-red-500">{errorKpis}</div></Card>
          ) : kpiCards.length ? (
            kpiCards.map((kpi, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg bg-blue-100`}>
                    <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {kpi.trend === 'up' ? <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" /> : <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />}
                    <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{fmtNumber(kpi.value)} {kpi.unit}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 capitalize">{kpi.name}</p>
                  <p className="text-xl font-bold text-gray-900">{fmtNumber(kpi.value)} {kpi.unit}</p>
                </div>
              </Card>
            ))
          ) : (
            <Card><div className="text-center text-gray-500">Aucun KPI disponible</div></Card>
          )}
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card title="Évolution des Ventes">
            {loadingCharts ? (
              <div className="text-center text-gray-500 py-8">Chargement...</div>
            ) : errorCharts ? (
              <div className="text-center text-red-500 py-8">{errorCharts}</div>
            ) : chartData ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  {chartData.sales.months.map((month, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1">
                      <span>{month}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-blue-600">{fmtNumber(chartData.sales.revenue[idx])} DZD</span>
                        <span className="text-gray-500">Objectif: {fmtNumber(chartData.sales.target[idx])} DZD</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <SalesChart />
            )}
          </Card>
          <Card title="Analyse des Dépenses">
            {loadingCharts ? (
              <div className="text-center text-gray-500 py-8">Chargement...</div>
            ) : errorCharts ? (
              <div className="text-center text-red-500 py-8">{errorCharts}</div>
            ) : chartData ? (
              <div className="space-y-2">
                {chartData.expenses.categories.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{cat}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className={`bg-orange-600 h-2 rounded-full ${percentToWidth((chartData.expenses.amounts[idx] / Math.max(...chartData.expenses.amounts)) * 100)}`}></div>
                      </div>
                      <span className="text-sm font-medium text-orange-600">{fmtNumber(chartData.expenses.amounts[idx])} DZD</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ExpenseChart />
            )}
          </Card>
        </div>

        {/* 6 Nouveaux graphiques avancés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* 1. Graphique de performance financière */}
          <Card title="Performance Financière">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ROE</span>
                <span className="text-sm font-medium text-blue-600">
                  {extendedChartData.performanceMetrics.roe[extendedChartData.performanceMetrics.roe.length - 1]}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-blue-600 h-2 rounded-full transition-all duration-500 ${percentToWidth((extendedChartData.performanceMetrics.roe[extendedChartData.performanceMetrics.roe.length - 1] / 20) * 100)}`}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ROA</span>
                <span className="text-sm font-medium text-green-600">
                  {extendedChartData.performanceMetrics.roa[extendedChartData.performanceMetrics.roa.length - 1]}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-green-600 h-2 rounded-full transition-all duration-500 ${percentToWidth((extendedChartData.performanceMetrics.roa[extendedChartData.performanceMetrics.roa.length - 1] / 15) * 100)}`}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Marge</span>
                <span className="text-sm font-medium text-purple-600">
                  {extendedChartData.performanceMetrics.margin[extendedChartData.performanceMetrics.margin.length - 1]}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-purple-600 h-2 rounded-full transition-all duration-500 ${percentToWidth((extendedChartData.performanceMetrics.margin[extendedChartData.performanceMetrics.margin.length - 1] / 30) * 100)}`}
                ></div>
              </div>
            </div>
          </Card>

          {/* Section Comptable SCF/IFRS */}
          <Card title="Indicateurs Comptables">
            {loadingKpis && <div className="text-gray-500">Chargement des KPIs comptables...</div>}
            {errorKpis && !loadingKpis && <div className="text-red-600">{errorKpis}</div>}
            {!loadingKpis && !errorKpis && kpis && (
              <div className="space-y-6">
                {/* En-tête avec norme comptable */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Norme Comptable Active
                      </h3>
                      <p className="text-gray-600 text-sm">
                        <BookOpenIcon className="h-4 w-4 inline mr-2" />
                        {normesComptables[planComptable].nom}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {normesComptables[planComptable].code}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KPI Comptables */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Chiffre d'Affaires */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-xs text-gray-500">CA 2025</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(kpis.chiffreAffaires.montant)}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 font-medium">
                          +{kpis.chiffreAffaires.evolution}%
                        </span>
                        <span className="text-gray-500">
                          {kpis.chiffreAffaires.realisation}% objectif
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`bg-green-500 h-1.5 rounded-full ${percentToWidth(kpis.chiffreAffaires.realisation)}`}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {kpis.chiffreAffaires.codeCompte}
                      </p>
                    </div>
                  </div>

                  {/* TVA Collectée */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <DocumentCheckIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-xs text-gray-500">TVA</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(kpis.tvaCollectee.montant)}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-600 font-medium">
                          {kpis.tvaCollectee.taux}%
                        </span>
                        <span className="text-gray-500">
                          À verser: {formatCurrency(kpis.tvaCollectee.aVerser)}
                        </span>
                      </div>
                      <p className="text-xs text-green-600">
                        Crédit: {formatCurrency(kpis.tvaCollectee.credit)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {kpis.tvaCollectee.codeCompte}
                      </p>
                    </div>
                  </div>

                  {/* Créances Clients */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserGroupIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-500">Créances</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(kpis.creancesClients.montant)}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-600 font-medium">
                          {kpis.creancesClients.delaiMoyen} jours
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${kpis.creancesClients.risque === 'Faible'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {kpis.creancesClients.risque}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Provision: {formatCurrency(kpis.creancesClients.provision)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {kpis.creancesClients.codeCompte}
                      </p>
                    </div>
                  </div>

                  {/* Rotation des Stocks */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <span className="text-xs text-gray-500">Rotation</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-gray-900">
                        {kpis.rotationStocks.ratio}x
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-orange-600 font-medium">
                          {kpis.rotationStocks.delai} jours
                        </span>
                        <span className="text-gray-500">
                          {kpis.rotationStocks.performance}% objectif
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`bg-orange-500 h-1.5 rounded-full ${percentToWidth(kpis.rotationStocks.performance)}`}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {kpis.rotationStocks.codeCompte}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Comptables Rapides */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                    <DocumentCheckIcon className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-blue-700 text-sm font-medium">Écritures</span>
                  </button>
                  <button className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                    <CalculatorIcon className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-green-700 text-sm font-medium">Calcul TVA</span>
                  </button>
                  <button className="flex items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                    <BookOpenIcon className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-purple-700 text-sm font-medium">Plan Comptable</span>
                  </button>
                  <button className="flex items-center justify-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                    <ScaleIcon className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-orange-700 text-sm font-medium">Bilans</span>
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* 2. Distribution géographique */}
          <Card title="Distribution Géographique">
            <div className="space-y-3">
              {extendedChartData.geographicDistribution.regions.map((region, index) => (
                <div key={region} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 bg-${['blue', 'green', 'purple', 'orange', 'red'][index]}-500`}></div>
                    <span className="text-sm text-gray-700">{region}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {extendedChartData.geographicDistribution.clients[index]} clients
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(extendedChartData.geographicDistribution.revenue[index] * 1000)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 3. Analyse des risques */}
          <Card title="Analyse des Risques">
            <div className="space-y-3">
              {extendedChartData.riskAnalysis.categories.map((category, index) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${colorByIndex(index, ['red', 'yellow', 'green', 'blue', 'purple'])}`}
                    ></div>
                    <span className="text-sm text-gray-700">{category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {extendedChartData.riskAnalysis.counts[index]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {((extendedChartData.riskAnalysis.counts[index] / extendedChartData.riskAnalysis.counts.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 4. Flux de trésorerie */}
          <Card title="Flux de Trésorerie">
            <LineChart
              data={extendedChartData.cashFlow.operating}
              labels={extendedChartData.cashFlow.months}
              title="Flux d'exploitation"
              borderColor="#10B981"
              backgroundColor="rgba(16, 185, 129, 0.1)"
            />
          </Card>

          {/* 5. Tendances de productivité */}
          <Card title="Tendances de Productivité">
            <div className="space-y-4">
              {extendedChartData.productivityTrends.metrics.map((metric, index) => (
                <div key={metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{metric}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {extendedChartData.productivityTrends.current[index]}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${percentToWidth(extendedChartData.productivityTrends.current[index])} ${colorByIndex(index, ['blue', 'green', 'purple', 'orange', 'red', 'emerald', 'indigo'])}`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Objectif: {extendedChartData.productivityTrends.target[index]}%
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 6. Part de marché */}
          <Card title="Part de Marché">
            <div className="space-y-3">
              {extendedChartData.marketShare.competitors.map((competitor, index) => (
                <div key={competitor} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${colorByIndex(index, ['blue', 'green', 'purple', 'orange', 'red'])}`}
                    ></div>
                    <span className="text-sm text-gray-700">{competitor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {extendedChartData.marketShare.share[index]}%
                    </span>
                    <div className="w-16 h-2 rounded-full bg-gray-200">
                      <div className={`h-2 rounded-full ${colorByIndex(index, ['blue', 'green', 'purple', 'orange', 'red'])} ${percentToWidth(extendedChartData.marketShare.share[index])}`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Nouveaux graphiques fonctionnels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Graphique en barres - Évolution des ventes par mois */}
          <Card>
            <BarChart
              data={extendedChartData.monthlyTrends.revenue}
              labels={extendedChartData.monthlyTrends.labels}
              backgroundColor="rgba(59, 130, 246, 0.8)"
              title="Évolution des Ventes Mensuelles"
              yAxisLabel="Revenus (k DZD)"
            />
          </Card>

          {/* Graphique linéaire - Tendances de profitabilité */}
          <Card>
            <LineChart
              data={extendedChartData.monthlyTrends.profit}
              labels={extendedChartData.monthlyTrends.labels}
              borderColor="rgba(34, 197, 94, 1)"
              backgroundColor="rgba(34, 197, 94, 0.1)"
              title="Tendances de Profitabilité"
              yAxisLabel="Bénéfices (k DZD)"
            />
          </Card>

          {/* Graphique en anneau - Répartition des risques */}
          <Card>
            <DoughnutChart
              data={extendedChartData.riskAnalysis.counts}
              labels={extendedChartData.riskAnalysis.categories}
              colors={extendedChartData.riskAnalysis.colors}
              title="Répartition des Risques"
            />
          </Card>

          {/* Graphique en barres - Performance par région */}
          <Card>
            <BarChart
              data={extendedChartData.geographicDistribution.clients}
              labels={extendedChartData.geographicDistribution.regions}
              backgroundColor="rgba(139, 92, 246, 0.8)"
              title="Clients par Région"
              yAxisLabel="Nombre de Clients"
            />
          </Card>

          {/* Graphique linéaire - Flux de trésorerie opérationnel */}
          <Card>
            <LineChart
              data={extendedChartData.cashFlow.operating}
              labels={displayChartData.cashFlow.months}
              borderColor="rgba(16, 185, 129, 1)"
              backgroundColor="rgba(16, 185, 129, 0.1)"
              title="Flux de Trésorerie Opérationnel"
              yAxisLabel="Montants (k DZD)"
            />
          </Card>

          {/* Graphique en anneau - Satisfaction client */}
          <Card>
            <DoughnutChart
              data={[extendedChartData.clientSatisfaction.excellent, extendedChartData.clientSatisfaction.good, extendedChartData.clientSatisfaction.average, extendedChartData.clientSatisfaction.poor]}
              labels={['Excellent', 'Bon', 'Moyen', 'Mauvais']}
              colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444']}
              title="Satisfaction Client"
            />
          </Card>
        </div>

        {/* Graphiques avancés et widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Graphique en anneau - Répartition par secteur */}
          <Card>
            <DoughnutChart
              data={extendedChartData.revenueBySector.data}
              labels={extendedChartData.revenueBySector.labels}
              colors={extendedChartData.revenueBySector.colors}
              title="Répartition par Secteur"
            />
          </Card>

          {/* Graphique en barres - Tendances mensuelles */}
          <Card title="Tendances Mensuelles">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenus</span>
                <span className="text-sm font-medium text-blue-600">
                  {formatCurrency(extendedChartData.monthlyTrends.revenue[extendedChartData.monthlyTrends.revenue.length - 1] * 1000)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-blue-600 h-2 rounded-full transition-all duration-500 ${percentToWidth((extendedChartData.monthlyTrends.revenue[extendedChartData.monthlyTrends.revenue.length - 1] / 200) * 100)}`}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dépenses</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(extendedChartData.monthlyTrends.expenses[extendedChartData.monthlyTrends.expenses.length - 1] * 1000)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-red-600 h-2 rounded-full transition-all duration-500 ${percentToWidth((extendedChartData.monthlyTrends.expenses[extendedChartData.monthlyTrends.expenses.length - 1] / 150) * 100)}`}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bénéfices</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(extendedChartData.monthlyTrends.profit[extendedChartData.monthlyTrends.profit.length - 1] * 1000)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-green-600 h-2 rounded-full transition-all duration-500 ${percentToWidth((extendedChartData.monthlyTrends.profit[extendedChartData.monthlyTrends.profit.length - 1] / 60) * 100)}`}
                ></div>
              </div>
            </div>
          </Card>

          {/* Widgets interactifs */}
          <div className="space-y-6">
            {widgets.map((widget, index) => (
              <Card key={index} title={widget.title}>
                {widget.content}
              </Card>
            ))}
          </div>
        </div>

        {/* Graphique de satisfaction client */}
        <Card title="Satisfaction Client">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="mb-2"><span className="inline-block w-3 h-3 rounded-full bg-green-500"></span></div>
              <div className="text-xl font-bold text-green-600">{extendedChartData.clientSatisfaction.excellent}%</div>
              <div className="text-sm text-gray-600">Excellent</div>
            </div>
            <div className="text-center">
              <div className="mb-2"><span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span></div>
              <div className="text-xl font-bold text-blue-600">{extendedChartData.clientSatisfaction.good}%</div>
              <div className="text-sm text-gray-600">Bon</div>
            </div>
            <div className="text-center">
              <div className="mb-2"><span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span></div>
              <div className="text-xl font-bold text-yellow-600">{extendedChartData.clientSatisfaction.average}%</div>
              <div className="text-sm text-gray-600">Moyen</div>
            </div>
            <div className="text-center">
              <div className="mb-2"><span className="inline-block w-3 h-3 rounded-full bg-red-500"></span></div>
              <div className="text-xl font-bold text-red-600">{extendedChartData.clientSatisfaction.poor}%</div>
              <div className="text-sm text-gray-600">Mauvais</div>
            </div>
          </div>
        </Card>

        {/* Alertes et notifications enrichies */}
        <Card title="Alertes et Notifications">
          <div className="space-y-4">
            {loadingAlerts ? (
              <div className="text-center text-gray-500 py-6">Chargement des alertes...</div>
            ) : errorAlerts ? (
              <div className="text-center text-red-500 py-6">{errorAlerts}</div>
            ) : alerts.length ? (
              alerts.map((alert, index) => {
                const Icon = alert.icon || BellIcon;
                return (
                  <div key={index} className={`flex items-start space-x-3 p-4 rounded-lg border ${alert.priority === 'high' ? 'bg-red-50 border-red-200' :
                      alert.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                    }`}>
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 mt-0.5 ${alert.priority === 'high' ? 'text-red-600' :
                          alert.priority === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                        }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{alert.title || alert.message}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.description || ''}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAlertAction(alert)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        title="Voir le détail"
                      >
                        Voir
                      </button>
                      <button className="text-gray-400 hover:text-gray-600" aria-label="Voir le détail de l'alerte" title="Voir le détail de l'alerte">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-6">Aucune alerte</div>
            )}
          </div>
        </Card>

        {/* Statistiques avancées */}
        <Card title="Statistiques Avancées">
          {loadingSystemStats ? (
            <div className="text-center text-gray-500 py-6">Chargement des statistiques...</div>
          ) : systemStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                <div className="text-xl font-semibold text-gray-900">{systemStats.uptime}</div>
                <div className="text-sm text-gray-600">Taux de disponibilité</div>
              </div>
              <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                <div className="text-xl font-semibold text-gray-900">{systemStats.response_time}</div>
                <div className="text-sm text-gray-600">Temps de réponse</div>
              </div>
              <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                <div className="text-xl font-semibold text-gray-900">{systemStats.page_views}</div>
                <div className="text-sm text-gray-600">Pages vues</div>
              </div>
              <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                <div className="text-xl font-semibold text-gray-900">{systemStats.conversion_rate}</div>
                <div className="text-sm text-gray-600">Taux de conversion</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-6">Statistiques non disponibles</div>
          )}
        </Card>
      </div>

      {/* Modal pour les actions d'alertes */}
      {isAlertModalOpen && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Action Requise</h3>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fermer la fenêtre"
                title="Fermer la fenêtre"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${selectedAlert.type === 'warning' ? 'bg-yellow-100' :
                    selectedAlert.type === 'info' ? 'bg-blue-100' :
                      'bg-green-100'
                  }`}>
                  <selectedAlert.icon className={`h-5 w-5 ${selectedAlert.type === 'warning' ? 'text-yellow-600' :
                      selectedAlert.type === 'info' ? 'text-blue-600' :
                        'text-green-600'
                    }`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedAlert.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedAlert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{selectedAlert.time}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  switch (selectedAlert.action) {
                    case 'Commander':
                      handleCommander(selectedAlert);
                      break;
                    case 'Contacter':
                      handleContacter(selectedAlert);
                      break;
                    case 'Investiger':
                      handleInvestiger(selectedAlert);
                      break;
                    case 'Mettre à jour':
                      handleMettreAJour(selectedAlert);
                      break;
                    default:
                      alert(`Action "${selectedAlert.action}" exécutée !`);
                      setIsAlertModalOpen(false);
                  }
                }}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${selectedAlert.priority === 'high' ? 'bg-red-600 hover:bg-red-700' :
                    selectedAlert.priority === 'medium' ? 'bg-blue-600 hover:bg-blue-700' :
                      'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {selectedAlert.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
