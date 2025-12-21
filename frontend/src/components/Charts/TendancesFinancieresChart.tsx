import React, { useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  CalendarIcon,
  FunnelIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  EvolutionIndicateursChart,
  ComparaisonTrimestrielleChart,
  PrevisionsRealisationChart,
  CorrelationIndicateursChart
} from './ComptableCharts';

interface TendancesFinancieresChartProps {
  period: string;
}

const TendancesFinancieresChart: React.FC<TendancesFinancieresChartProps> = ({ period }) => {
  const [activeView, setActiveView] = useState<'evolution' | 'comparaison' | 'previsions' | 'correlation'>('evolution');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const metrics = [
    { id: 'all', label: 'Tous les indicateurs', color: 'slate' },
    { id: 'ca', label: 'Chiffre d\'affaires', color: 'emerald' },
    { id: 'resultat', label: 'Résultat net', color: 'purple' },
    { id: 'tresorerie', label: 'Trésorerie', color: 'blue' }
  ];

  const views = [
    { id: 'evolution', label: 'ÉVOLUTION', icon: ArrowTrendingUpIcon },
    { id: 'comparaison', label: 'COMPARAISON', icon: ChartBarIcon },
    { id: 'previsions', label: 'PRÉVISIONS', icon: CalendarIcon },
    { id: 'correlation', label: 'CORRÉLATION', icon: InformationCircleIcon }
  ];

  const renderChart = () => {
    switch (activeView) {
      case 'evolution':
        return <EvolutionIndicateursChart />;
      case 'comparaison':
        return <ComparaisonTrimestrielleChart />;
      case 'previsions':
        return <PrevisionsRealisationChart />;
      case 'correlation':
        return <CorrelationIndicateursChart />;
      default:
        return <EvolutionIndicateursChart />;
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case 'evolution':
        return 'Évolution mensuelle des indicateurs financiers clés sur 12 mois';
      case 'comparaison':
        return 'Comparaison trimestrielle des performances sur 6 trimestres';
      case 'previsions':
        return 'Comparaison entre les prévisions et les réalisations trimestrielles';
      case 'correlation':
        return 'Analyse de corrélation entre le chiffre d\'affaires et la marge nette';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* En-tête du widget */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-800">Tendances Financières</h3>
              <p className="text-sm text-indigo-600">Période {period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-lg transition-colors">
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-lg transition-colors">
              <EyeIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-lg transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-lg transition-colors">
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
                    ? 'border-indigo-500 text-indigo-600'
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

      {/* Filtres de métriques */}
      <div className="bg-indigo-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-indigo-800">Filtrer par métrique:</span>
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
          <div className="text-sm text-indigo-600">
            {getViewDescription()}
          </div>
        </div>
      </div>

      {/* Contenu du graphique */}
      <div className="p-6">
        <div className="h-96">
          {renderChart()}
        </div>
      </div>

      {/* Indicateurs de performance */}
      <div className="bg-indigo-50 border-t border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">+12.5%</span>
            </div>
            <p className="text-xs text-indigo-600">Croissance CA</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">+8.3%</span>
            </div>
            <p className="text-xs text-indigo-600">Croissance Résultat</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">+15.2%</span>
            </div>
            <p className="text-xs text-indigo-600">Croissance Trésorerie</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">-2.1%</span>
            </div>
            <p className="text-xs text-indigo-600">Réduction Charges</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TendancesFinancieresChart;
