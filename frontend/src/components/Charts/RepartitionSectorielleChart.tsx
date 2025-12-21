import React, { useState } from 'react';
import {
  ChartPieIcon,
  BuildingOfficeIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  FunnelIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import {
  RepartitionChargesChart,
  RepartitionGeographiqueChart,
  RatiosRadarChart
} from './ComptableCharts';

interface RepartitionSectorielleChartProps {
  period: string;
}

const RepartitionSectorielleChart: React.FC<RepartitionSectorielleChartProps> = ({ period }) => {
  const [activeView, setActiveView] = useState<'charges' | 'geographique' | 'ratios'>('charges');
  const [selectedSector, setSelectedSector] = useState('all');

  const sectors = [
    { id: 'all', label: 'Tous secteurs', color: 'slate' },
    { id: 'services', label: 'Services', color: 'blue' },
    { id: 'commerce', label: 'Commerce', color: 'emerald' },
    { id: 'industrie', label: 'Industrie', color: 'amber' },
    { id: 'technologie', label: 'Technologie', color: 'purple' }
  ];

  const views = [
    { id: 'charges', label: 'CHARGES', icon: ChartPieIcon },
    { id: 'geographique', label: 'GÉOGRAPHIQUE', icon: BuildingOfficeIcon },
    { id: 'ratios', label: 'RATIOS', icon: InformationCircleIcon }
  ];

  const sectorData = {
    services: {
      ca: 4500000,
      charges: 3200000,
      resultat: 1300000,
      evolution: 8.5
    },
    commerce: {
      ca: 3200000,
      charges: 2400000,
      resultat: 800000,
      evolution: 12.3
    },
    industrie: {
      ca: 2800000,
      charges: 2100000,
      resultat: 700000,
      evolution: 5.8
    },
    technologie: {
      ca: 2000000,
      charges: 1200000,
      resultat: 800000,
      evolution: 18.7
    }
  };

  const renderChart = () => {
    switch (activeView) {
      case 'charges':
        return <RepartitionChargesChart />;
      case 'geographique':
        return <RepartitionGeographiqueChart />;
      case 'ratios':
        return <RatiosRadarChart />;
      default:
        return <RepartitionChargesChart />;
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case 'charges':
        return 'Répartition des charges par catégorie d\'activité';
      case 'geographique':
        return 'Répartition géographique des revenus par région';
      case 'ratios':
        return 'Analyse radar des ratios de performance par secteur';
      default:
        return '';
    }
  };

  const getTotalData = () => {
    const totals = Object.values(sectorData).reduce(
      (acc, sector) => ({
        ca: acc.ca + sector.ca,
        charges: acc.charges + sector.charges,
        resultat: acc.resultat + sector.resultat,
        evolution: acc.evolution + sector.evolution
      }),
      { ca: 0, charges: 0, resultat: 0, evolution: 0 }
    );
    return {
      ...totals,
      evolution: totals.evolution / Object.keys(sectorData).length
    };
  };

  const totals = getTotalData();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* En-tête du widget */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <ChartPieIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-800">Répartition Sectorielle</h3>
              <p className="text-sm text-emerald-600">Période {period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 rounded-lg transition-colors">
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 rounded-lg transition-colors">
              <EyeIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 rounded-lg transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 rounded-lg transition-colors">
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
                    ? 'border-emerald-500 text-emerald-600'
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

      {/* Filtres de secteurs */}
      <div className="bg-emerald-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-emerald-800">Filtrer par secteur:</span>
            <div className="flex space-x-2">
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => setSelectedSector(sector.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedSector === sector.id
                      ? `bg-${sector.color}-600 text-white`
                      : `bg-${sector.color}-100 text-${sector.color}-800 hover:bg-${sector.color}-200`
                  }`}
                >
                  {sector.label}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-emerald-600">
            {getViewDescription()}
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="bg-emerald-50 border-b border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-800">{(totals.ca / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-emerald-600">CA Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-800">{(totals.charges / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-emerald-600">Charges Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-800">{(totals.resultat / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-emerald-600">Résultat Total</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-800">+{totals.evolution.toFixed(1)}%</span>
            </div>
            <p className="text-sm text-emerald-600">Évolution Moyenne</p>
          </div>
        </div>
      </div>

      {/* Contenu du graphique */}
      <div className="p-6">
        <div className="h-96">
          {renderChart()}
        </div>
      </div>

      {/* Détails par secteur */}
      <div className="bg-emerald-50 border-t border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-emerald-800 mb-3">Performance par Secteur</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(sectorData).map(([sector, data]) => (
            <div key={sector} className="bg-white rounded-lg p-3 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-emerald-800 capitalize">{sector}</h5>
                <div className="flex items-center space-x-1">
                  {data.evolution >= 0 ? (
                    <ArrowTrendingUpIcon className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs font-medium ${
                    data.evolution >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {data.evolution >= 0 ? '+' : ''}{data.evolution.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-xs text-emerald-600">
                <div className="flex justify-between">
                  <span>CA:</span>
                  <span className="font-medium">{(data.ca / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span>Charges:</span>
                  <span className="font-medium">{(data.charges / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span>Résultat:</span>
                  <span className="font-medium text-emerald-800">{(data.resultat / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepartitionSectorielleChart;
