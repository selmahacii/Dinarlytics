import React, { useState, useMemo } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  BellAlertIcon,
  CalendarIcon,
  SparklesIcon,
  TrophyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import { CompanyEvolutionTracker, RevenueDataPoint } from '../../utils/CompanyEvolutionTracker';

interface EvolutionTrackerWidgetProps {
  companyName: string;
  currentRevenue: number;
}

const EvolutionTrackerWidget: React.FC<EvolutionTrackerWidgetProps> = ({
  companyName,
  currentRevenue
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<6 | 12>(12);

  // Générer le rapport d'évolution
  const evolutionReport = useMemo(() => 
    CompanyEvolutionTracker.generateDemoEvolutionReport(currentRevenue, companyName),
    [currentRevenue, companyName]
  );

  const { history, metrics, alerts, comparativeStats } = evolutionReport;

  // Filtrer l'historique selon la période sélectionnée
  const filteredHistory = useMemo(() => 
    history.slice(-selectedPeriod),
    [history, selectedPeriod]
  );

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    const maxRevenue = Math.max(...filteredHistory.map(d => d.revenue));
    const minRevenue = Math.min(...filteredHistory.map(d => d.revenue));
    const range = maxRevenue - minRevenue || 1;

    return filteredHistory.map(point => ({
      ...point,
      normalizedHeight: ((point.revenue - minRevenue) / range) * 100
    }));
  }, [filteredHistory]);

  const getTrendIcon = () => {
    if (metrics.trend === 'growing') return ArrowTrendingUpIcon;
    if (metrics.trend === 'declining') return ArrowTrendingDownIcon;
    return ChartBarIcon;
  };

  const getTrendColor = () => {
    if (metrics.trend === 'growing') return 'text-green-600';
    if (metrics.trend === 'declining') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendBgColor = () => {
    if (metrics.trend === 'growing') return 'bg-green-50';
    if (metrics.trend === 'declining') return 'bg-red-50';
    return 'bg-gray-50';
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M DA`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K DA`;
    return `${value} DA`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  };

  const TrendIcon = getTrendIcon();

  return (
    <div className="space-y-6">
      {/* En-tête avec métriques principales */}
      <Card className={`p-6 ${getTrendBgColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="h-7 w-7 mr-2 text-blue-600" />
            Évolution du Chiffre d'Affaires
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod(6)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === 6
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              6 mois
            </button>
            <button
              onClick={() => setSelectedPeriod(12)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === 12
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              12 mois
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CA Actuel</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.currentRevenue)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${getTrendBgColor()}`}>
                <TrendIcon className={`h-6 w-6 ${getTrendColor()}`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div>
              <p className="text-sm text-gray-600">Croissance Mensuelle</p>
              <div className="flex items-center space-x-2">
                <p className={`text-2xl font-bold ${getTrendColor()}`}>
                  {metrics.growthRate > 0 ? '+' : ''}{metrics.growthRate.toFixed(1)}%
                </p>
                <TrendIcon className={`h-5 w-5 ${getTrendColor()}`} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.growthAmount > 0 ? '+' : ''}{formatCurrency(metrics.growthAmount)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div>
              <p className="text-sm text-gray-600">Segment Actuel</p>
              <p className="text-lg font-bold text-blue-600">
                {metrics.currentSegment.toUpperCase()}
              </p>
              {metrics.segmentChanged && (
                <p className="text-xs text-orange-600 font-semibold mt-1">
                  ↑ Changé depuis {metrics.previousSegment}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div>
              <p className="text-sm text-gray-600">Tendance Santé</p>
              <p className={`text-lg font-bold ${
                metrics.healthTrend === 'improving' ? 'text-green-600' :
                metrics.healthTrend === 'declining' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {metrics.healthTrend === 'improving' ? ' En amélioration' :
                 metrics.healthTrend === 'declining' ? 'En baisse' : '➡️ Stable'}
              </p>
            </div>
          </div>
        </div>

        {/* Graphique simplifié */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Évolution sur {selectedPeriod} mois</h3>
            <span className="text-sm text-gray-500">
              Max: {formatCurrency(Math.max(...filteredHistory.map(d => d.revenue)))}
            </span>
          </div>
          
          <div className="relative h-64">
            {/* Axes */}
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {chartData.map((point, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  {/* Barre */}
                  <div className="w-full px-1 flex items-end h-full">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-400 cursor-pointer relative"
                      style={{ height: `${Math.max(point.normalizedHeight, 5)}%` }}
                    >
                      {/* Tooltip au survol */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                          <div className="font-bold">{formatDate(point.date)}</div>
                          <div>{formatCurrency(point.revenue)}</div>
                          {point.profitMargin && (
                            <div className="text-green-300">
                              Marge: {point.profitMargin.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Label date */}
                  <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
                    {formatDate(point.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Alertes */}
      {alerts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BellAlertIcon className="h-6 w-6 mr-2 text-yellow-500" />
            Alertes et Notifications ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const severityColors = {
                info: 'bg-blue-50 border-blue-200 text-blue-800',
                warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                critical: 'bg-red-50 border-red-200 text-red-800'
              };

              const severityIcons = {
                info: SparklesIcon,
                warning: ExclamationTriangleIcon,
                critical: BellAlertIcon
              };

              const Icon = severityIcons[alert.severity];

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 ${severityColors[alert.severity]}`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="h-6 w-6 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1">{alert.title}</h4>
                      <p className="text-sm opacity-90">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <span className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {new Date(alert.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="font-semibold uppercase">
                          {alert.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Statistiques comparatives */}
      {comparativeStats && (
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
            Statistiques Comparatives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Comparaison temporelle */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h4 className="font-semibold text-gray-700 mb-3">Évolution Annuelle</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Il y a 12 mois</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(comparativeStats.oneYearAgo.revenue)}
                    </div>
                    <div className={`text-xs font-semibold ${
                      comparativeStats.oneYearAgo.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {comparativeStats.oneYearAgo.change >= 0 ? '+' : ''}
                      {comparativeStats.oneYearAgo.change.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Il y a 6 mois</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(comparativeStats.sixMonthsAgo.revenue)}
                    </div>
                    <div className={`text-xs font-semibold ${
                      comparativeStats.sixMonthsAgo.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {comparativeStats.sixMonthsAgo.change >= 0 ? '+' : ''}
                      {comparativeStats.sixMonthsAgo.change.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Croissance moyenne mensuelle</span>
                  <div className={`text-lg font-bold ${
                    comparativeStats.averageMonthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {comparativeStats.averageMonthlyGrowth >= 0 ? '+' : ''}
                    {comparativeStats.averageMonthlyGrowth.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Meilleur et pire mois */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h4 className="font-semibold text-gray-700 mb-3">Records</h4>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-green-800">🏆 Meilleur mois</span>
                    <span className="text-xs text-green-600">
                      {formatDate(comparativeStats.bestMonth.date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-900">
                      {formatCurrency(comparativeStats.bestMonth.revenue)}
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      +{comparativeStats.bestMonth.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-red-800">📉 Pire mois</span>
                    <span className="text-xs text-red-600">
                      {formatDate(comparativeStats.worstMonth.date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-red-900">
                      {formatCurrency(comparativeStats.worstMonth.revenue)}
                    </span>
                    <span className="text-sm font-bold text-red-600">
                      {comparativeStats.worstMonth.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projection */}
          {metrics.projectedRevenue12Months && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" />
                Projection à 12 mois
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">
                    Selon votre tendance actuelle, votre CA devrait atteindre:
                  </p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {formatCurrency(metrics.projectedRevenue12Months)}
                  </p>
                </div>
                {metrics.projectedSegment12Months !== metrics.currentSegment && (
                  <div className="text-right">
                    <p className="text-xs text-blue-700 mb-1">Nouveau segment</p>
                    <span className="inline-flex px-3 py-1 bg-blue-200 text-blue-900 rounded-full font-bold text-sm">
                      {metrics.projectedSegment12Months.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default EvolutionTrackerWidget;

