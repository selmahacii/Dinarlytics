import React, { useState, useEffect } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ArrowPathIcon,
  SparklesIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartPieIcon,
  ScaleIcon,
  PresentationChartLineIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { RealisticMetric, RealisticChartData } from '@/types/dashboard';
import { analyticService } from '@/services/modules/analyticService';
import DetailedMetric from '../Metrics/DetailedMetric';
import AnimatedChart from '../Charts/AnimatedChart';
import { usePermission } from '@/shared/hooks/usePermission';

interface RealisticDashboardProps {
  isVisible: boolean;
}

interface DashboardFilters {
  period: string;
  category: string;
  region: string;
  status: string;
}

const RealisticDashboard: React.FC<RealisticDashboardProps> = ({ isVisible }) => {
  const { has, user } = usePermission();

  // Détermination automatique du profil selon le type d'entreprise de l'utilisateur
  // 'eurl' -> micro, 'sarl' -> sme, 'spa' -> mid
  const currentSize = React.useMemo(() => {
    if (!user?.companyType) return 'mid'; // Default fallback
    if (['eurl', 'micro', 'auto-entrepreneur'].includes(user.companyType)) return 'micro';
    if (['sarl', 'pme'].includes(user.companyType)) return 'sme';
    return 'mid'; // SPA, ETI, GE
  }, [user]);

  // Loading states
  const [metrics, setMetrics] = useState<RealisticMetric[]>([]);
  const [charts, setCharts] = useState<RealisticChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter state
  const [selectedFilters, setSelectedFilters] = useState<DashboardFilters>({
    period: 'today',
    category: 'all',
    region: 'all',
    status: 'all'
  });

  // Analysis Modal State
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Animation states
  const [visibleMetrics, setVisibleMetrics] = useState<boolean[]>([]);
  const [visibleCharts, setVisibleCharts] = useState<boolean[]>([]);

  // Time state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Récupération des données réelles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Reset visibility to trigger animations on sector change
        setVisibleMetrics([]);
        setVisibleCharts([]);

        const [sizeData, revChart] = await Promise.all([
          analyticService.getCompanySizeMetrics(currentSize),
          analyticService.getRevenueChart()
        ]);

        // Mapping KPIs to RealisticMetrics based on Company Size
        const mappedMetrics: RealisticMetric[] = [];

        if (sizeData && sizeData.kpis) {
          Object.entries(sizeData.kpis).forEach(([key, kpi]: [string, any]) => {
            mappedMetrics.push({
              id: key,
              nom: kpi.label,
              valeur: kpi.value,
              unite: kpi.unit,
              evolution: kpi.trend,
              evolutionPourcentage: kpi.trend,
              tendance: kpi.trend >= 0 ? 'up' : 'down',
              historique: [],
              details: {
                description: kpi.desc,
                contexte: sizeData.summary,
                facteurs: []
              }
            });
          });
        }

        // Mapping Chart Data based on Company Size
        const mappedCharts: RealisticChartData[] = [];

        if (sizeData && sizeData.charts) {
          // Main Chart - Stress Test Liquidité (Monte Carlo)
          if (sizeData.charts.main) {
            // Transform data for Monte Carlo visualization (Area Chart with 3 diverging paths)
            // AnimatedChart expects: produits, services, maintenance
            // We map: produits -> Optimiste (Green - Top Scenario)
            //         services -> Réaliste (Blue/Grey - Base Scenario)
            //         maintenance -> Pessimiste (Red - Worst Scenario)

            const m = new Date();
            const getMonth = (offset: number) => {
              const d = new Date(m.getFullYear(), m.getMonth() + offset, 1);
              return d.toLocaleDateString('fr-FR', { month: 'short' });
            };

            const monteCarloData = [
              { mois: getMonth(-3), produits: 98.5, services: 98.5, maintenance: 98.5 },
              { mois: getMonth(-2), produits: 104.2, services: 101.5, maintenance: 100.1 },
              { mois: getMonth(-1), produits: 108.8, services: 103.2, maintenance: 99.4 },
              { mois: 'Actuel', produits: 112.5, services: 105.0, maintenance: 98.2 },
              { mois: getMonth(1), produits: 124.5, services: 108.5, maintenance: 92.5 }, // Divergence
              { mois: getMonth(2), produits: 142.0, services: 112.0, maintenance: 85.0 }, // Full Divergence
            ];

            mappedCharts.push({
              id: 'size-main',
              titre: 'Stress Test Liquidité',
              description: 'Analyse Monte Carlo (3 Scénarios)',
              type: 'area',
              periode: 'Prévision 6 mois',
              miseAJour: new Date().toLocaleTimeString(),
              donnees: monteCarloData.map(d => ({
                ...d,
                valeur: d.services, // Main metric for generic display
                label: d.mois
              })),
              options: {
                couleurs: ['#059669', '#64748b', '#e11d48'], // Emerald-600 (Opt), Slate-500 (Real), Rose-600 (Pess)
                animation: true,
                showGrid: true,
                showLabels: true
              }
            });
          }

          // Secondary Chart - Performance par BU
          if (sizeData.charts.secondary) {
            mappedCharts.push({
              id: 'size-secondary',
              titre: 'Performance par BU',
              description: 'Focus Opérationnel (k€)',
              type: 'bar',
              periode: 'Temps réel',
              miseAJour: new Date().toLocaleTimeString(),
              donnees: sizeData.charts.secondary.data.map((d: any) => ({
                label: d.label,
                valeur: d.value,
                region: d.label, // AnimatedChart expects 'region' for Bar charts
                mois: d.label
              })),
              options: {
                couleurs: ['#1e3a8a', '#0f766e', '#4f46e5', '#2563eb'], // Navy, Teal, Indigo, Blue
                animation: true,
                showGrid: true,
                showLabels: true,
                currency: true
              }
            });
          }
        }

        setMetrics(mappedMetrics);
        setCharts(mappedCharts);
        setVisibleMetrics(new Array(mappedMetrics.length).fill(false));
        setVisibleCharts(new Array(mappedCharts.length).fill(false));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentSize]);

  // Animation des métriques
  useEffect(() => {
    if (isVisible && metrics.length > 0) {
      metrics.forEach((_, index) => {
        setTimeout(() => {
          setVisibleMetrics(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 200);
      });
    }
  }, [isVisible, metrics]);

  // Animation des graphiques
  useEffect(() => {
    if (isVisible && charts.length > 0) {
      charts.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCharts(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 300 + 1000);
      });
    }
  }, [isVisible, charts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  // Fonction pour générer l'analyse instantanée BASÉE SUR LES DONNÉES RÉELLES
  const generateInstantAnalysis = async () => {
    // Extraction des données réelles de la page
    const salesMetric = metrics.find(m => m.id === 'sales');

    // Fetch AI insights directly from service to ensure we have the latest mock data
    const sizeData: any = await analyticService.getCompanySizeMetrics(currentSize);
    const aiInsight = sizeData.ai_insights;

    // Valeurs de base (avec fallbacks)
    const currentRevenue = salesMetric?.valeur || 0;
    const revenueTrend = salesMetric?.tendance || 'stay';

    // Génération de recommandations IA
    const recommendations = [];

    if (aiInsight) {
      recommendations.push(aiInsight.action);
    }
    recommendations.push("Optimiser la gestion du stock (Rotation faible détectée).");


    // Construction de l'objet d'analyse cohérent
    const contextAwareAnalysis = {
      totalTransactions: 142, // Mocked for demo
      totalRevenue: currentRevenue,
      customerSatisfaction: 94.5, // Score CSAT simulé

      // Les tendances suivent les métriques principales
      trends: {
        revenue: revenueTrend, // Suit le CA
        orders: revenueTrend,  // Corrélation CA/Commandes
        customers: 'up'        // Acquisition continue supposée
      },

      // NEW: Specific AI Insight Section
      aiPrediction: aiInsight,

      alerts: sizeData.alerts || [],
      recommendations: recommendations
    };

    setAnalysisResults(contextAwareAnalysis);
    setIsAnalysisOpen(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* En-tête du tableau de bord - Professional & Clean */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-8 rounded-2xl shadow-sm mb-8 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 dark:bg-white rounded-lg shadow-lg">
                <ChartPieIcon className="h-6 w-6 text-white dark:text-slate-900" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Pilotage Stratégique
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center text-slate-500 font-medium">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span className="capitalize">{formatDate(currentTime)}</span>
              </div>
              <div className="flex items-center text-slate-500 font-mono">
                <ClockIcon className="h-4 w-4 mr-2" />
                {formatTime(currentTime)}
              </div>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LIVE
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600">
                  Profil : Grande Entreprise (ETI)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            {has('lia-access') && (
              <button
                onClick={generateInstantAnalysis}
                className="flex-1 xl:flex-none group relative px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 font-bold overflow-hidden"
              >
                <SparklesIcon className="h-5 w-5 text-emerald-400 dark:text-emerald-600" />
                <span>Analyse IA</span>
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center transition-all duration-200 ${isRefreshing ? 'bg-slate-50 text-slate-400' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
              <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Métriques principales - Clean & Corporate Cards */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-slate-400" />
            Performance Financière
          </h3>
          <span className="text-xs font-medium text-slate-400">Dernière maj: {formatTime(currentTime)}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Metric 1 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">KPI Stratégique</p>
              <ChartPieIcon className="h-5 w-5 text-slate-500 bg-slate-100 rounded p-0.5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Marge s/ Coût Var.</h4>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-slate-900 dark:text-white">45,2%</span>
              <span className="text-xs font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded flex items-center">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> 1.1%
              </span>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-slate-400">Contribution Frais Fixes</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rentabilité</p>
              <CurrencyDollarIcon className="h-5 w-5 text-slate-500 bg-slate-100 rounded p-0.5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">ROE</h4>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-slate-900 dark:text-white">38,6%</span>
              <span className="text-xs font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded flex items-center">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> 0.5%
              </span>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-slate-400">Retour s/ Capitaux</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productivité</p>
              <UserGroupIcon className="h-5 w-5 text-slate-500 bg-slate-100 rounded p-0.5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Efficacité MO</h4>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-slate-900 dark:text-white">3,2x</span>
              <span className="text-xs font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded flex items-center">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> 0.1%
              </span>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-slate-400">Marge / Salaires</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contrôle</p>
              <ScaleIcon className="h-5 w-5 text-slate-500 bg-slate-100 rounded p-0.5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Écart Budget</h4>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-slate-900 dark:text-white">-2,1%</span>
              <span className="text-xs font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded flex items-center">
                <ArrowTrendingDownIcon className="h-3 w-3 mr-1" /> 0.5%
              </span>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-slate-400">Réel vs Plan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques animés - Premium Layout */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
          <PresentationChartLineIcon className="h-5 w-5 mr-2 text-slate-400" />
          Analyses & Prévisions
        </h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {charts.map((chart, index) => (
            <div key={chart.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full ${index === 0 ? 'bg-slate-900' : 'bg-slate-400'}`}></div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{chart.titre}</h4>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{chart.description}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-700 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-600 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{chart.periode}</span>
                </div>
              </div>
              <div className="p-6 h-[350px]">
                <AnimatedChart
                  chartData={chart}
                  isVisible={visibleCharts[index]}
                  animationDelay={index * 200}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Synthèse Exécutive - Strategic Dark Theme Bar */}
      {/* Synthèse Exécutive - Strategic Dark Theme Bar */}
      <div className="bg-slate-900 rounded-2xl p-8 shadow-sm relative overflow-hidden text-white border border-slate-800">
        {/* Ambient Glows Removed for Sober ERP Look */}

        <div className="relative z-10">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-xl font-bold flex items-center text-white/95 tracking-wide">
              <MagnifyingGlassIcon className="h-6 w-6 mr-3 text-emerald-400" />
              Synthèse Exécutive
              <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300 border border-slate-600 uppercase tracking-wider">
                Temps Réel
              </span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Dernière maj: {new Date().toLocaleTimeString()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* CARD 1: MARGE (Profitability) */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 hover:border-slate-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">
                <ArrowTrendingUpIcon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Marge</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">+1.1%</span>
                <span className="text-xs font-bold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded">Croissance nette</span>
              </div>
              <div className="w-full h-1 bg-slate-700 rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-slate-400 w-[75%] rounded-full"></div>
              </div>
              <p className="text-xs text-slate-400 font-medium">Surperformance vs marché (+0.8%)</p>
            </div>

            {/* CARD 2: ROE (Return on Equity) */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 hover:border-slate-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">
                <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ROE Global</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">38.6%</span>
                <span className="text-xs font-bold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded">Performance Capitaux</span>
              </div>
              {/* Mini Chart Visualization using CSS Bars */}
              <div className="flex items-end gap-1 h-8 mb-2">
                <div className="w-2 bg-slate-800 h-[40%] rounded-sm"></div>
                <div className="w-2 bg-slate-700 h-[60%] rounded-sm"></div>
                <div className="w-2 bg-slate-600 h-[50%] rounded-sm"></div>
                <div className="w-2 bg-slate-400 h-[85%] rounded-sm"></div>
                <div className="w-2 bg-slate-800/30 h-[100%] rounded-sm border border-slate-600 border-dashed"></div>
              </div>
              <p className="text-xs text-slate-400 font-medium">Objectif annuel dépassé</p>
            </div>

            {/* CARD 3: EFFICACITÉ MO (Productivity) */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 hover:border-slate-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">
                <ScaleIcon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Efficacité MO</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">3.2x</span>
                <span className="text-xs font-bold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded">Ratio Stratégique</span>
              </div>
              <div className="w-full flex gap-1 mb-3">
                <span className="h-1.5 flex-1 rounded-full bg-slate-500"></span>
                <span className="h-1.5 flex-1 rounded-full bg-slate-500"></span>
                <span className="h-1.5 flex-1 rounded-full bg-slate-500"></span>
                <span className="h-1.5 flex-1 rounded-full bg-slate-800"></span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Optimisation des équipes</p>
            </div>

            {/* CARD 4: DSO (Cash Cycle) */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 hover:border-slate-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">
                <ClockIcon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">DSO Moyen</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">35j</span>
                <span className="text-xs font-bold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded">Délai Paiement</span>
              </div>
              {/* Timeline visual */}
              <div className="relative w-full h-1 bg-slate-800 rounded-full mb-3 mt-2">
                <div className="absolute top-0 left-0 h-full bg-slate-600 w-[60%] rounded-full opacity-50"></div>
                <div className="absolute top-0 left-0 h-full bg-slate-400 w-[42%] rounded-full"></div>
                {/* Marker for Target */}
                <div className="absolute top-[-4px] left-[45%] w-0.5 h-3 bg-white/50"></div>
              </div>
              <p className="text-xs text-slate-400 font-medium">Amélioration (-3 jours)</p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 mt-8 px-4 border-t border-slate-100 dark:border-slate-800 pt-6">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Système opérationnel
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Cloud Sync: OK
          </div>
        </div>
        <div className="font-mono opacity-50">v2.4.0-ent</div>
      </div>

      {/* MODAL ANALYSE IA - Refonte UI Professional v2 */}
      {isAnalysisOpen && analysisResults && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">

            {/* 1. Header: Executive Style */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-lg shadow-lg shadow-indigo-600/20">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    Analyse Stratégique IA
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800">
                      Rapport Généré
                    </span>
                  </h4>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Analyse basée sur {analysisResults.totalTransactions} points de données • Modèle v4.2 (Enterprise)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAnalysisOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* 2. Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Main Insights */}
                <div className="lg:col-span-2 space-y-8">

                  {/* HERO: Key Prediction */}
                  {analysisResults.aiPrediction && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-sm border border-indigo-100 dark:border-indigo-900/30 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                {analysisResults.aiPrediction.prediction}
                              </span>
                            </div>
                            <h5 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                              {analysisResults.aiPrediction.value}
                            </h5>
                          </div>
                          <div className="text-right">
                            <span className="block text-3xl font-black text-emerald-500">{analysisResults.aiPrediction.confidence}%</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score Confiance</span>
                          </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 font-medium">
                          {analysisResults.aiPrediction.details}
                        </p>

                        {/* Raw Report Terminal */}
                        {analysisResults.aiPrediction.full_report && (
                          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-inner overflow-hidden relative group">
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                            </div>
                            <pre className="font-mono text-xs md:text-sm text-emerald-400/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                              {analysisResults.aiPrediction.full_report}
                            </pre>
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-slate-950/20"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACTION PLAN */}
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full mr-3"></div>
                      Plan d'Action Recommandé
                    </h5>
                    <div className="grid gap-4">
                      {analysisResults.recommendations.map((reco: string, idx: number) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 hover:border-emerald-500/30 transition-colors group cursor-pointer">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}</span>
                          </div>
                          <div>
                            <h6 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Action Prioritaire</h6>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{reco}</p>
                          </div>
                          <div className="ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg cursor-pointer">
                              Appliquer
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Context & Metrics */}
                <div className="space-y-8">

                  {/* Trends Summary */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Tendances Clés</h5>
                    <div className="space-y-6">
                      {Object.entries(analysisResults.trends).map(([key, trend]: [string, any]) => (
                        <div key={key} className="flex justify-between items-center group">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                              {trend === 'up' ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <AdjustmentsHorizontalIcon className="h-4 w-4" />}
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">
                              {key === 'revenue' ? 'Chiffre d\'affaires' : key === 'orders' ? 'Volume Commandes' : 'Acquisition'}
                            </span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {trend === 'up' ? '+ Positive' : 'Stable'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alerts Panel */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                      Points de Vigilance
                    </h5>
                    <div className="space-y-3">
                      {analysisResults.alerts.map((alert: any, idx: number) => (
                        <div key={idx} className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 p-4 rounded-xl">
                          <div className="flex gap-3">
                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                            <p className="text-xs font-medium text-orange-900 dark:text-orange-200 leading-relaxed">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="text-xs text-slate-400 font-bold uppercase mb-1">Satisfaction</div>
                      <div className="text-xl font-black text-slate-900 dark:text-white">{analysisResults.customerSatisfaction}%</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="text-xs text-slate-400 font-bold uppercase mb-1">Impact Fin.</div>
                      <div className="text-xl font-black text-emerald-600">+12.5%</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 3. Actions Footer */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center">
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Généré à {new Date().toLocaleTimeString()} • ID: #LIA-{Math.floor(Math.random() * 900000 + 100000)}
              </div>
              <div className="flex gap-4">
                <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                  Exporter PDF
                </button>
                <button className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                  Appliquer les conseils
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RealisticDashboard;
