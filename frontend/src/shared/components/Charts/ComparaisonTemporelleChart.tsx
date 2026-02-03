import React, { useState } from 'react';
import {
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  FunnelIcon,
  InformationCircleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  ComparaisonTrimestrielleChart,
  FluxTresorerieChart,
  PrevisionsRealisationChart
} from './ComptableCharts';

interface ComparaisonTemporelleChartProps {
  period: string;
}

const ComparaisonTemporelleChart: React.FC<ComparaisonTemporelleChartProps> = ({ period }) => {
  const [activeView, setActiveView] = useState<'trimestrielle' | 'flux' | 'previsions'>('trimestrielle');
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const periods = [
    { id: '3m', label: '3 mois', color: 'blue' },
    { id: '6m', label: '6 mois', color: 'emerald' },
    { id: '12m', label: '12 mois', color: 'purple' },
    { id: '24m', label: '24 mois', color: 'amber' }
  ];

  const metrics = [
    { id: 'all', label: 'Toutes métriques', color: 'slate' },
    { id: 'ca', label: 'Chiffre d\'affaires', color: 'emerald' },
    { id: 'resultat', label: 'Résultat net', color: 'purple' },
    { id: 'tresorerie', label: 'Trésorerie', color: 'blue' }
  ];

  const views = [
    { id: 'trimestrielle', label: 'TRIMESTRIELLE', icon: CalendarIcon },
    { id: 'flux', label: 'FLUX', icon: ChartBarIcon },
    { id: 'previsions', label: 'PRÉVISIONS', icon: ClockIcon }
  ];

  const performanceData = {
    '3m': {
      ca: { current: 3200000, previous: 2800000, evolution: 14.3 },
      resultat: { current: 320000, previous: 280000, evolution: 14.3 },
      tresorerie: { current: 450000, previous: 380000, evolution: 18.4 }
    },
    '6m': {
      ca: { current: 6200000, previous: 5400000, evolution: 14.8 },
      resultat: { current: 620000, previous: 540000, evolution: 14.8 },
      tresorerie: { current: 850000, previous: 720000, evolution: 18.1 }
    },
    '12m': {
      ca: { current: 12500000, previous: 11000000, evolution: 13.6 },
      resultat: { current: 1250000, previous: 1100000, evolution: 13.6 },
      tresorerie: { current: 1850000, previous: 1600000, evolution: 15.6 }
    },
    '24m': {
      ca: { current: 24000000, previous: 20000000, evolution: 20.0 },
      resultat: { current: 2400000, previous: 2000000, evolution: 20.0 },
      tresorerie: { current: 3600000, previous: 3000000, evolution: 20.0 }
    }
  };

  const renderChart = () => {
    switch (activeView) {
      case 'trimestrielle':
        return <ComparaisonTrimestrielleChart />;
      case 'flux':
        return <FluxTresorerieChart />;
      case 'previsions':
        return <PrevisionsRealisationChart />;
      default:
        return <ComparaisonTrimestrielleChart />;
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case 'trimestrielle':
        return 'Comparaison trimestrielle des performances sur 6 trimestres';
      case 'flux':
        return 'Analyse des flux de trésorerie mensuels';
      case 'previsions':
        return 'Comparaison entre prévisions et réalisations';
      default:
        return '';
    }
  };

  const currentData = performanceData[selectedPeriod as keyof typeof performanceData];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* En-tête du widget */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Comparaison Temporelle</h3>
              <p className="text-sm text-blue-600">Période {period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-lg transition-colors">
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-lg transition-colors">
              <EyeIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-lg transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-lg transition-colors">
              <PrinterIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par vues */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === view.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{view.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filtres */}
      <div className="bg-blue-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-800">Période:</span>
              <div className="flex space-x-2">
                {periods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedPeriod === period.id
                        ? `bg-${period.color}-600 text-white`
                        : `bg-${period.color}-100 text-${period.color}-800 hover:bg-${period.color}-200`
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-800">Métrique:</span>
              <div className="flex space-x-2">
                {metrics.map((metric) => (
                  <button
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedMetric === metric.id
                        ? `bg-${metric.color}-600 text-white`
                        : `bg-${metric.color}-100 text-${metric.color}-800 hover:bg-${metric.color}-200`
                    }`}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="text-sm text-blue-600">
            {getViewDescription()}
          </div>
        </div>
      </div>

      {/* Indicateurs de performance */}
      <div className="bg-blue-50 border-b border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-blue-800">Chiffre d'Affaires</h5>
              <div className="flex items-center space-x-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">
                  +{currentData.ca.evolution.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-blue-600">
              <div className="flex justify-between">
                <span>Actuel:</span>
                <span className="font-medium">{(currentData.ca.current / 1000000).toFixed(1)}M DZD</span>
              </div>
              <div className="flex justify-between">
                <span>Précédent:</span>
                <span className="font-medium">{(currentData.ca.previous / 1000000).toFixed(1)}M DZD</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-blue-800">Résultat Net</h5>
              <div className="flex items-center space-x-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">
                  +{currentData.resultat.evolution.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-blue-600">
              <div className="flex justify-between">
                <span>Actuel:</span>
                <span className="font-medium">{(currentData.resultat.current / 1000000).toFixed(1)}M DZD</span>
              </div>
              <div className="flex justify-between">
                <span>Précédent:</span>
                <span className="font-medium">{(currentData.resultat.previous / 1000000).toFixed(1)}M DZD</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-blue-800">Trésorerie</h5>
              <div className="flex items-center space-x-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">
                  +{currentData.tresorerie.evolution.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-blue-600">
              <div className="flex justify-between">
                <span>Actuel:</span>
                <span className="font-medium">{(currentData.tresorerie.current / 1000000).toFixed(1)}M DZD</span>
              </div>
              <div className="flex justify-between">
                <span>Précédent:</span>
                <span className="font-medium">{(currentData.tresorerie.previous / 1000000).toFixed(1)}M DZD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu du graphique */}
      <div className="p-6">
        <div className="h-96">
          {renderChart()}
        </div>
      </div>

      {/* Analyse comparative */}
      <div className="bg-blue-50 border-t border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Analyse Comparative</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">Points Forts</h5>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Croissance soutenue du CA (+{currentData.ca.evolution.toFixed(1)}%)</li>
              <li>• Amélioration de la rentabilité (+{currentData.resultat.evolution.toFixed(1)}%)</li>
              <li>• Renforcement de la trésorerie (+{currentData.tresorerie.evolution.toFixed(1)}%)</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">Recommandations</h5>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Maintenir la dynamique de croissance</li>
              <li>• Optimiser la gestion des coûts</li>
              <li>• Investir dans les secteurs porteurs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparaisonTemporelleChart;
