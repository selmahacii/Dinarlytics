import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ArrowPathIcon,
  SparklesIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { realisticMetrics, realisticChartData, realTimeData } from '../../data/realisticDemoData';
import DetailedMetric from '../Metrics/DetailedMetric';
import AnimatedChart from '../Charts/AnimatedChart';

interface RealisticDashboardProps {
  isVisible: boolean;
}

const RealisticDashboard: React.FC<RealisticDashboardProps> = ({ isVisible }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState<boolean[]>(new Array(realisticMetrics.length).fill(false));
  const [visibleCharts, setVisibleCharts] = useState<boolean[]>(new Array(realisticChartData.length).fill(false));
  
  // États pour l'analyse instantanée
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    period: 'today',
    category: 'all',
    region: 'all',
    status: 'all'
  });
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Animation des métriques
  useEffect(() => {
    if (isVisible) {
      realisticMetrics.forEach((_, index) => {
        setTimeout(() => {
          setVisibleMetrics(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 200);
      });
    }
  }, [isVisible]);

  // Animation des graphiques
  useEffect(() => {
    if (isVisible) {
      realisticChartData.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCharts(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 300 + 1000);
      });
    }
  }, [isVisible]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  // Fonction pour générer l'analyse instantanée
  const generateInstantAnalysis = () => {
    const mockAnalysisData = {
      totalTransactions: Math.floor(Math.random() * 1000) + 500,
      totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
      averageOrderValue: Math.floor(Math.random() * 500) + 100,
      topPerformingCategory: ['Électronique', 'Mode', 'Maison', 'Sport'][Math.floor(Math.random() * 4)],
      conversionRate: (Math.random() * 10 + 2).toFixed(1),
      customerSatisfaction: (Math.random() * 20 + 80).toFixed(1),
      trends: {
        revenue: Math.random() > 0.5 ? 'up' : 'down',
        orders: Math.random() > 0.5 ? 'up' : 'down',
        customers: Math.random() > 0.5 ? 'up' : 'down'
      },
      alerts: [
        { type: 'warning', message: 'Stock faible sur 3 produits populaires' },
        { type: 'info', message: 'Nouveau client premium détecté' },
        { type: 'success', message: 'Objectif mensuel atteint à 95%' }
      ].slice(0, Math.floor(Math.random() * 3) + 1)
    };
    
    setAnalysisResults(mockAnalysisData);
    setIsAnalysisOpen(true);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      period: 'today',
      category: 'all',
      region: 'all',
      status: 'all'
    });
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
    <div className="space-y-6">
      {/* En-tête du tableau de bord */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Tableau de Bord Temps Réel
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(currentTime)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>{formatTime(currentTime)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Données en direct</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={generateInstantAnalysis}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Analyse Instantanée</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                isRefreshing
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>{isRefreshing ? 'Actualisation...' : 'Actualiser'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
          Métriques Clés
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realisticMetrics.map((metric, index) => (
            <DetailedMetric
              key={metric.id}
              metric={metric}
              isVisible={visibleMetrics[index]}
              animationDelay={index * 200}
            />
          ))}
        </div>
      </div>

      {/* Graphiques animés */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
          Analyses Visuelles
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {realisticChartData.map((chart, index) => (
            <AnimatedChart
              key={chart.id}
              chartData={chart}
              isVisible={visibleCharts[index]}
              animationDelay={index * 300}
            />
          ))}
        </div>
      </div>

      {/* Résumé des performances */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
           Résumé des Performances
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {realTimeData.ventes.evolution > 0 ? '+' : ''}{realTimeData.ventes.evolution}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Croissance CA</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              vs objectif mensuel
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {realTimeData.clients.nouveaux}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Nouveaux clients</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              ce mois
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {realTimeData.marge.actuel}%
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Marge brute</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              objectif: {realTimeData.marge.objectif}%
            </div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {realTimeData.commandes.actuel}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Commandes actives</div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {realTimeData.commandes.enAttente} en attente
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs de statut */}
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Système opérationnel</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Données synchronisées</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>IA active</span>
        </div>
      </div>

      {/* Section Analyse Instantanée */}
      {isAnalysisOpen && (
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700 p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center">
              <FunnelIcon className="h-6 w-6 mr-2" />
              🔍 Analyse Instantanée
            </h3>
            <button
              type="button"
              onClick={() => setIsAnalysisOpen(false)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Fermer l'analyse"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Filtres */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                Filtres d'Analyse
              </h4>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Réinitialiser
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Période</label>
                <select
                  value={selectedFilters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  aria-label="Sélectionner la période"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="quarter">Ce trimestre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                <select
                  value={selectedFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  aria-label="Sélectionner la catégorie"
                >
                  <option value="all">Toutes</option>
                  <option value="electronics">Électronique</option>
                  <option value="fashion">Mode</option>
                  <option value="home">Maison</option>
                  <option value="sports">Sport</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Région</label>
                <select
                  value={selectedFilters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  aria-label="Sélectionner la région"
                >
                  <option value="all">Toutes</option>
                  <option value="north">Nord</option>
                  <option value="south">Sud</option>
                  <option value="east">Est</option>
                  <option value="west">Ouest</option>
                  <option value="center">Centre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                <select
                  value={selectedFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  aria-label="Sélectionner le statut"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actif</option>
                  <option value="pending">En attente</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Résultats de l'Analyse */}
          {analysisResults && (
            <div className="space-y-6">
              {/* Métriques Principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</span>
                    <ChartBarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysisResults.totalTransactions.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total aujourd'hui</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</span>
                    <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{(analysisResults.totalRevenue / 1000).toFixed(0)}k DZD</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chiffre d'affaires</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-orange-200 dark:border-orange-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Panier Moyen</span>
                    <UserGroupIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analysisResults.averageOrderValue} DZD</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valeur moyenne</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion</span>
                    <ChartPieIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analysisResults.conversionRate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Taux de conversion</p>
                </div>
              </div>

              {/* Tendances */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">📈 Tendances en Temps Réel</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenus</span>
                    <div className="flex items-center space-x-2">
                      {analysisResults.trends.revenue === 'up' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${analysisResults.trends.revenue === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {analysisResults.trends.revenue === 'up' ? '+12.5%' : '-3.2%'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Commandes</span>
                    <div className="flex items-center space-x-2">
                      {analysisResults.trends.orders === 'up' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${analysisResults.trends.orders === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {analysisResults.trends.orders === 'up' ? '+8.3%' : '-1.7%'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Clients</span>
                    <div className="flex items-center space-x-2">
                      {analysisResults.trends.customers === 'up' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${analysisResults.trends.customers === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {analysisResults.trends.customers === 'up' ? '+15.2%' : '-2.1%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertes */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">🚨 Alertes Intelligentes</h5>
                <div className="space-y-2">
                  {analysisResults.alerts.map((alert: any, index: number) => (
                    <div key={index} className={`flex items-start space-x-2 p-3 rounded-lg ${
                      alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700' :
                      alert.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' :
                      'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    }`}>
                      {alert.type === 'warning' ? (
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      ) : alert.type === 'info' ? (
                        <MagnifyingGlassIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        alert.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                        alert.type === 'info' ? 'text-blue-800 dark:text-blue-200' :
                        'text-green-800 dark:text-green-200'
                      }`}>
                        {alert.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommandations IA */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">🤖 Recommandations IA</h5>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Catégorie "{analysisResults.topPerformingCategory}" en forte croissance - Augmenter le stock</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Taux de satisfaction client: {analysisResults.customerSatisfaction}% - Maintenir le niveau</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Optimiser les campagnes marketing pour les heures de pointe</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-slate-600">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium">
                    <ChartBarIcon className="h-4 w-4" />
                    <span>Exporter Analyse</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <span>Détails Complets</span>
                  </button>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  📊 Analyse générée: {new Date().toLocaleTimeString('fr-FR')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealisticDashboard;
