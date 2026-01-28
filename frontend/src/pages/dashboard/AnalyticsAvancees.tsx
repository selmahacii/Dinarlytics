import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import BarChart from '../../components/Charts/BarChart';
import LineChart from '../../components/Charts/LineChart';
import DoughnutChart from '../../components/Charts/DoughnutChart';

import { analyticService, FinancialKPIs, RollingForecast } from '../../services/modules/analyticService';

const AnalyticsAvancees: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<FinancialKPIs | null>(null);
  const [forecast, setForecast] = useState<RollingForecast | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedKpis, fetchedForecast] = await Promise.all([
          analyticService.getHealthKPIs(),
          analyticService.getForecast()
        ]);
        setKpis(fetchedKpis);
        setForecast(fetchedForecast);
      } catch (err) {
        console.error('Erreur analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod]);

  if (loading) return <div className="p-10 text-center">Calcul des indicateurs avancés en cours...</div>;

  // Métriques avancées réelles
  const advancedMetrics = [
    {
      name: 'DSO (Délais Client)',
      value: `${kpis?.dso_days?.toFixed(0) || 0} jours`,
      change: -2.3,
      trend: 'down',
      description: 'Délai moyen d\'encaissement'
    },
    {
      name: 'BFR (Besoin en Fonds Roulement)',
      value: formatCurrency(kpis?.bfr_value || 0),
      change: 5.1,
      trend: 'up',
      description: 'Impact sur la liquidité'
    },
    {
      name: 'Seuil de Rentabilité',
      value: formatCurrency(kpis?.break_even_point || 0),
      change: 0,
      trend: 'up',
      description: 'CA minimum vital'
    },
    {
      name: 'Ratio Solvabilité',
      value: `${((kpis?.solvency_ratio || 0) * 100).toFixed(1)}%`,
      change: 1.5,
      trend: 'up',
      description: 'Autonomie financière'
    }
  ];


  // Analyse de performance par canal
  const channelPerformance = [
    {
      channel: 'Recherche organique',
      visitors: 4500,
      conversions: 180,
      revenue: 125000,
      roas: 3.2
    },
    {
      channel: 'Réseaux sociaux',
      visitors: 3200,
      conversions: 95,
      revenue: 68000,
      roas: 2.8
    },
    {
      channel: 'Email marketing',
      visitors: 1800,
      conversions: 120,
      revenue: 95000,
      roas: 4.1
    },
    {
      channel: 'Publicité payante',
      visitors: 2800,
      conversions: 85,
      revenue: 72000,
      roas: 2.5
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpIcon className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header avec contrôles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            📈 Analytics Avancées
          </h1>
          <p className="text-gray-600">Analyse approfondie et prédictive de vos données</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sélecteur de période */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 an</option>
          </select>

          {/* Mode comparaison */}
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${comparisonMode
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
          >
            <FunnelIcon className="h-4 w-4 inline mr-2" />
            Comparaison
          </button>

          {/* Export */}
          <div className="flex items-center space-x-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <DocumentArrowDownIcon className="h-4 w-4 inline mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Métriques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {advancedMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.change}%
                </span>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <div className="text-sm font-medium text-gray-700 mb-1">{metric.name}</div>
            <div className="text-xs text-gray-500">{metric.description}</div>
          </Card>
        ))}
      </div>

      {/* Analyse de funnel */}
      <Card title="🔄 Analyse de Funnel de Conversion">
        <div className="space-y-4">
          {analyticsData.funnelAnalysis.stages.map((stage, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                <span className="text-sm font-bold text-gray-900">
                  {stage.count.toLocaleString()} ({stage.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full transition-all duration-1000"
                  style={{
                    width: `${stage.percentage}%`,
                    backgroundColor: stage.color
                  }}
                ></div>
              </div>
              {index < analyticsData.funnelAnalysis.stages.length - 1 && (
                <div className="text-center mt-2">
                  <div className="text-xs text-gray-500">
                    Taux de conversion: {((analyticsData.funnelAnalysis.stages[index + 1].count / stage.count) * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Performance par canal */}
      <Card title="📊 Performance par Canal d'Acquisition">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Canal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visiteurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {channelPerformance.map((channel, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {channel.channel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {channel.visitors.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {channel.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(channel.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${channel.roas > 3 ? 'bg-green-50 text-green-700 border border-green-200' :
                      channel.roas > 2 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                      {channel.roas}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Graphiques d'analyse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analyse de cohorte */}
        <Card title="📈 Analyse de Cohortes">
          <div className="space-y-4">
            {analyticsData.cohortAnalysis.cohorts.map((cohort, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{cohort.name}</span>
                  <span className="text-xs text-gray-500">
                    Rétention finale: {cohort.data[cohort.data.length - 1]}%
                  </span>
                </div>
                <div className="flex space-x-1">
                  {cohort.data.map((value, weekIndex) => (
                    <div
                      key={weekIndex}
                      className="flex-1 h-8 rounded border border-gray-200 flex items-center justify-center"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${value / 100})`,
                        color: value > 50 ? 'white' : 'black'
                      }}
                    >
                      <span className="text-xs font-medium">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Analyse de corrélation */}
        <Card title="🔗 Analyse de Corrélation">
          <div className="space-y-4">
            {analyticsData.correlations.map((correlation, index) => (
              <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    {correlation.metric1} ↔ {correlation.metric2}
                  </div>
                  <div className={`text-sm font-bold ${Math.abs(correlation.correlation) > 0.7 ? 'text-green-600' :
                    Math.abs(correlation.correlation) > 0.5 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                    {correlation.correlation.toFixed(2)}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${Math.abs(correlation.correlation) > 0.7 ? 'bg-green-500' :
                      Math.abs(correlation.correlation) > 0.5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    style={{ width: `${Math.abs(correlation.correlation) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.abs(correlation.correlation) > 0.7 ? 'Forte corrélation' :
                    Math.abs(correlation.correlation) > 0.5 ? 'Corrélation modérée' :
                      'Faible corrélation'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Prédictions et recommandations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="🔮 Prévisions IA (Rolling Plan)">
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">Revenus M+1 (DYNAMIQUE)</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Confiance IA: {((forecast?.confidence_score || 0) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {formatCurrency(forecast?.predicted_revenue_next_month || 0)}
              </div>
              <div className="flex items-center space-x-1">
                {forecast?.trend_direction === 'up' ? <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" /> : <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />}
                <span className={`text-sm ${forecast?.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  Tendance {forecast?.trend_direction === 'up' ? 'Hausse' : 'Baisse'} détectée
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {forecast?.rolling_forecast?.map((f, i) => (
                <div key={i} className="p-3 bg-white border rounded-xl text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-black">{f.month}</p>
                  <p className="text-xs font-bold text-gray-700">{formatCurrency(f.predicted_value)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>


        <Card title="💡 Recommandations IA">
          <div className="space-y-4">
            {[
              {
                type: 'optimization',
                title: 'Optimiser le canal Email',
                description: 'Votre email marketing a un ROAS de 4.1x. Augmentez le budget de 20%.',
                impact: 'Élevé',
                effort: 'Faible'
              },
              {
                type: 'warning',
                title: 'Attention au taux de rebond',
                description: 'Le taux de rebond est corrélé négativement avec la satisfaction (-0.72).',
                impact: 'Moyen',
                effort: 'Moyen'
              },
              {
                type: 'opportunity',
                title: 'Segment 26-35 ans',
                description: 'Ce segment génère 35% des revenus. Créez des campagnes ciblées.',
                impact: 'Élevé',
                effort: 'Moyen'
              }
            ].map((recommendation, index) => (
              <div key={index} className={`p-4 rounded-lg border ${recommendation.type === 'optimization' ? 'bg-green-50 border-green-200' :
                recommendation.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-medium ${recommendation.type === 'optimization' ? 'text-green-900' :
                    recommendation.type === 'warning' ? 'text-yellow-900' :
                      'text-blue-900'
                    }`}>
                    {recommendation.title}
                  </h4>
                  <div className="flex space-x-1">
                    <span className={`text-xs px-2 py-1 rounded ${recommendation.impact === 'Élevé' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                      }`}>
                      {recommendation.impact}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${recommendation.effort === 'Faible' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                      }`}>
                      {recommendation.effort}
                    </span>
                  </div>
                </div>
                <p className={`text-sm ${recommendation.type === 'optimization' ? 'text-green-700' :
                  recommendation.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                  {recommendation.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsAvancees;
