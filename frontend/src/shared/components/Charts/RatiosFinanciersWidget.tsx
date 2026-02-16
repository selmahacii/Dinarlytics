import React, { useState } from 'react';
import {
  CalculatorIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Line, Radar, Bar } from 'react-chartjs-2';
import { useTheme } from '@core/context/ThemeContext';
import { useApp } from '@core/context/AppContext';

interface RatiosFinanciersWidgetProps {
  data: {
    // Ratios de liquidité
    ratio_liquidite_generale: number;
    ratio_liquidite_reduite: number;
    ratio_liquidite_immediate: number;
    
    // Ratios de solvabilité
    ratio_endettement: number;
    ratio_autonomie: number;
    ratio_couverture_dettes: number;
    
    // Ratios de rentabilité
    marge_brute: number;
    marge_exploitation: number;
    marge_nette: number;
    roe: number;
    roa: number;
    
    // Ratios d'activité
    rotation_stocks: number;
    delai_paiement_clients: number;
    delai_paiement_fournisseurs: number;
    
    // Ratios de croissance
    croissance_ca: number;
    croissance_resultat: number;
    croissance_effectif: number;
  };
  period: string;
  previousData?: {
    ratio_liquidite_generale: number;
    ratio_endettement: number;
    marge_nette: number;
    roe: number;
  };
}

const RatiosFinanciersWidget: React.FC<RatiosFinanciersWidgetProps> = ({ data, period, previousData }) => {
  const { currentTheme } = useTheme();
  const { formatCurrency } = useApp();
  const [activeCategory, setActiveCategory] = useState<'liquidite' | 'solvabilite' | 'rentabilite' | 'activite' | 'croissance'>('liquidite');
  const [activeView, setActiveView] = useState<'ratios' | 'evolution' | 'radar'>('ratios');

  // Calculs des variations
  const variationLiquidite = previousData ? 
    ((data.ratio_liquidite_generale - previousData.ratio_liquidite_generale) / previousData.ratio_liquidite_generale) * 100 : 0;
  const variationEndettement = previousData ? 
    ((data.ratio_endettement - previousData.ratio_endettement) / previousData.ratio_endettement) * 100 : 0;
  const variationMarge = previousData ? 
    ((data.marge_nette - previousData.marge_nette) / Math.abs(previousData.marge_nette)) * 100 : 0;
  const variationROE = previousData ? 
    ((data.roe - previousData.roe) / Math.abs(previousData.roe)) * 100 : 0;

  // Données pour le graphique radar
  const radarData = {
    labels: [
      'Liquidité',
      'Solvabilité', 
      'Rentabilité',
      'Activité',
      'Croissance',
      'Efficacité'
    ],
    datasets: [{
      label: 'Performance Actuelle',
      data: [
        Math.min(data.ratio_liquidite_generale * 20, 100), // Normalisé sur 100
        Math.min((1 - data.ratio_endettement) * 100, 100), // Inversé car plus c'est bas, mieux c'est
        Math.min(data.roe * 2, 100), // Normalisé
        Math.min(data.rotation_stocks * 10, 100), // Normalisé
        Math.min(Math.abs(data.croissance_ca) * 2, 100), // Normalisé
        Math.min(data.marge_exploitation * 2, 100) // Normalisé
      ],
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 3,
      pointBackgroundColor: 'rgba(139, 92, 246, 1)',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }]
  };

  // Données pour l'évolution des ratios
  const evolutionData = {
    labels: ['Période Précédente', 'Période Actuelle'],
    datasets: [
      {
        label: 'Ratio de Liquidité',
        data: previousData ? [previousData.ratio_liquidite_generale, data.ratio_liquidite_generale] : [0, data.ratio_liquidite_generale],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Ratio d\'Endettement',
        data: previousData ? [previousData.ratio_endettement, data.ratio_endettement] : [0, data.ratio_endettement],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Marge Nette (%)',
        data: previousData ? [previousData.marge_nette, data.marge_nette] : [0, data.marge_nette],
        borderColor: 'rgba(51, 65, 85, 1)',
        backgroundColor: 'rgba(51, 65, 85, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'ROE (%)',
        data: previousData ? [previousData.roe, data.roe] : [0, data.roe],
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }, isPositive: boolean = true) => {
    if (isPositive) {
      if (value >= thresholds.good) return 'text-emerald-600';
      if (value >= thresholds.warning) return 'text-amber-600';
      return 'text-red-600';
    } else {
      if (value <= thresholds.good) return 'text-emerald-600';
      if (value <= thresholds.warning) return 'text-amber-600';
      return 'text-red-600';
    }
  };

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }, isPositive: boolean = true) => {
    if (isPositive) {
      if (value >= thresholds.good) return CheckCircleIcon;
      if (value >= thresholds.warning) return ExclamationTriangleIcon;
      return ExclamationTriangleIcon;
    } else {
      if (value <= thresholds.good) return CheckCircleIcon;
      if (value <= thresholds.warning) return ExclamationTriangleIcon;
      return ExclamationTriangleIcon;
    }
  };

  const getVariationColor = (variation: number) => {
    return variation >= 0 ? 'text-emerald-600' : 'text-red-600';
  };

  const getVariationIcon = (variation: number) => {
    return variation >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const categories = [
    { id: 'liquidite', label: 'LIQUIDITÉ', icon: BanknotesIcon, color: 'emerald' },
    { id: 'solvabilite', label: 'SOLVABILITÉ', icon: BuildingOfficeIcon, color: 'blue' },
    { id: 'rentabilite', label: 'RENTABILITÉ', icon: CurrencyDollarIcon, color: 'purple' },
    { id: 'activite', label: 'ACTIVITÉ', icon: ArrowTrendingUpIcon, color: 'amber' },
    { id: 'croissance', label: 'CROISSANCE', icon: ArrowTrendingUpIcon, color: 'green' }
  ];

  const renderRatios = () => {
    switch (activeCategory) {
      case 'liquidite':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Liquidité Générale</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.ratio_liquidite_generale, { good: 1.5, warning: 1.0 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.ratio_liquidite_generale, { good: 1.5, warning: 1.0 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.ratio_liquidite_generale.toFixed(2)}</p>
              <p className="text-sm text-slate-600">Actif circulant / Dettes CT</p>
              {previousData && (
                <div className="flex items-center space-x-1 mt-1">
                  {(() => {
                    const VariationIcon = getVariationIcon(variationLiquidite);
                    return <VariationIcon className={`h-3 w-3 ${getVariationColor(variationLiquidite)}`} />;
                  })()}
                  <span className={`text-xs ${getVariationColor(variationLiquidite)}`}>
                    {variationLiquidite >= 0 ? '+' : ''}{variationLiquidite.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Liquidité Réduite</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.ratio_liquidite_reduite, { good: 1.0, warning: 0.7 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.ratio_liquidite_reduite, { good: 1.0, warning: 0.7 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.ratio_liquidite_reduite.toFixed(2)}</p>
              <p className="text-sm text-slate-600">(Actif circulant - Stocks) / Dettes CT</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Liquidité Immédiate</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.ratio_liquidite_immediate, { good: 0.3, warning: 0.1 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.ratio_liquidite_immediate, { good: 0.3, warning: 0.1 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.ratio_liquidite_immediate.toFixed(2)}</p>
              <p className="text-sm text-slate-600">Disponibilités / Dettes CT</p>
            </div>
          </div>
        );

      case 'solvabilite':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Ratio d'Endettement</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.ratio_endettement, { good: 0.3, warning: 0.5 }, false);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.ratio_endettement, { good: 0.3, warning: 0.5 }, false)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{(data.ratio_endettement * 100).toFixed(1)}%</p>
              <p className="text-sm text-slate-600">Dettes / Capitaux propres</p>
              {previousData && (
                <div className="flex items-center space-x-1 mt-1">
                  {(() => {
                    const VariationIcon = getVariationIcon(variationEndettement);
                    return <VariationIcon className={`h-3 w-3 ${getVariationColor(variationEndettement)}`} />;
                  })()}
                  <span className={`text-xs ${getVariationColor(variationEndettement)}`}>
                    {variationEndettement >= 0 ? '+' : ''}{variationEndettement.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Ratio d'Autonomie</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.ratio_autonomie, { good: 0.6, warning: 0.4 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.ratio_autonomie, { good: 0.6, warning: 0.4 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{(data.ratio_autonomie * 100).toFixed(1)}%</p>
              <p className="text-sm text-slate-600">Capitaux propres / Total passif</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Couverture des Dettes</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.ratio_couverture_dettes, { good: 3.0, warning: 2.0 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.ratio_couverture_dettes, { good: 3.0, warning: 2.0 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.ratio_couverture_dettes.toFixed(2)}</p>
              <p className="text-sm text-slate-600">CAF / Charges financières</p>
            </div>
          </div>
        );

      case 'rentabilite':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Marge Brute</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.marge_brute, { good: 30, warning: 20 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.marge_brute, { good: 30, warning: 20 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.marge_brute.toFixed(1)}%</p>
              <p className="text-sm text-slate-600">Marge / Chiffre d'affaires</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Marge d'Exploitation</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.marge_exploitation, { good: 10, warning: 5 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.marge_exploitation, { good: 10, warning: 5 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.marge_exploitation.toFixed(1)}%</p>
              <p className="text-sm text-slate-600">Résultat exploitation / CA</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Marge Nette</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.marge_nette, { good: 5, warning: 2 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.marge_nette, { good: 5, warning: 2 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.marge_nette.toFixed(1)}%</p>
              <p className="text-sm text-slate-600">Résultat net / CA</p>
              {previousData && (
                <div className="flex items-center space-x-1 mt-1">
                  {(() => {
                    const VariationIcon = getVariationIcon(variationMarge);
                    return <VariationIcon className={`h-3 w-3 ${getVariationColor(variationMarge)}`} />;
                  })()}
                  <span className={`text-xs ${getVariationColor(variationMarge)}`}>
                    {variationMarge >= 0 ? '+' : ''}{variationMarge.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">ROE</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.roe, { good: 15, warning: 10 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.roe, { good: 15, warning: 10 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.roe.toFixed(1)}%</p>
              <p className="text-sm text-slate-600">Résultat net / Capitaux propres</p>
              {previousData && (
                <div className="flex items-center space-x-1 mt-1">
                  {(() => {
                    const VariationIcon = getVariationIcon(variationROE);
                    return <VariationIcon className={`h-3 w-3 ${getVariationColor(variationROE)}`} />;
                  })()}
                  <span className={`text-xs ${getVariationColor(variationROE)}`}>
                    {variationROE >= 0 ? '+' : ''}{variationROE.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">ROA</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.roa, { good: 8, warning: 5 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.roa, { good: 8, warning: 5 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.roa.toFixed(1)}%</p>
              <p className="text-sm text-slate-600">Résultat net / Total actif</p>
            </div>
          </div>
        );

      case 'activite':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Rotation des Stocks</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.rotation_stocks, { good: 6, warning: 4 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.rotation_stocks, { good: 6, warning: 4 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.rotation_stocks.toFixed(1)}</p>
              <p className="text-sm text-slate-600">CA / Stock moyen</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Délai Paiement Clients</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.delai_paiement_clients, { good: 30, warning: 45 }, false);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.delai_paiement_clients, { good: 30, warning: 45 }, false)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.delai_paiement_clients.toFixed(0)} jours</p>
              <p className="text-sm text-slate-600">Créances / CA × 365</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Délai Paiement Fournisseurs</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.delai_paiement_fournisseurs, { good: 60, warning: 30 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.delai_paiement_fournisseurs, { good: 60, warning: 30 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.delai_paiement_fournisseurs.toFixed(0)} jours</p>
              <p className="text-sm text-slate-600">Dettes / Achats × 365</p>
            </div>
          </div>
        );

      case 'croissance':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Croissance CA</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.croissance_ca, { good: 10, warning: 5 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.croissance_ca, { good: 10, warning: 5 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.croissance_ca.toFixed(1)}%</p>
              <p className="text-sm text-slate-600">Évolution du chiffre d'affaires</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Croissance Résultat</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.croissance_resultat, { good: 15, warning: 5 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.croissance_resultat, { good: 15, warning: 5 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.croissance_resultat.toFixed(1)}%</p>
              <p className="text-sm text-slate-600">Évolution du résultat net</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">Croissance Effectif</h5>
                {(() => {
                  const StatusIcon = getStatusIcon(data.croissance_effectif, { good: 5, warning: 0 }, true);
                  return <StatusIcon className={`h-5 w-5 ${getStatusColor(data.croissance_effectif, { good: 5, warning: 0 }, true)}`} />;
                })()}
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.croissance_effectif.toFixed(1)}%</p>
              <p className="text-sm text-slate-600">Évolution des effectifs</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* En-tête du widget */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <CalculatorIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Ratios Financiers</h3>
              <p className="text-sm text-purple-600">Période {period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-lg transition-colors">
              <EyeIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-lg transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-lg transition-colors">
              <PrinterIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par catégories */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeCategory === category.id
                    ? `border-${category.color}-500 text-${category.color}-600`
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Navigation par vues */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'ratios', label: 'RATIOS', icon: CalculatorIcon },
            { id: 'evolution', label: 'ÉVOLUTION', icon: ArrowTrendingUpIcon },
            { id: 'radar', label: 'RADAR', icon: ChartBarIcon }
          ].map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === view.id
                    ? 'border-purple-500 text-purple-600'
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

      {/* Contenu */}
      <div className="p-6">
        {activeView === 'ratios' && (
          <div className="space-y-6">
            {renderRatios()}
            
            {/* Recommandations */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h5 className="font-semibold text-slate-800 mb-3 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                Recommandations
              </h5>
              <div className="space-y-2 text-sm text-slate-600">
                {data.ratio_liquidite_generale < 1.5 && (
                  <p>• <strong>Liquidité :</strong> Améliorer la liquidité en optimisant la gestion des stocks et créances.</p>
                )}
                {data.ratio_endettement > 0.5 && (
                  <p>• <strong>Endettement :</strong> Réduire le niveau d'endettement pour améliorer la solvabilité.</p>
                )}
                {data.marge_nette < 5 && (
                  <p>• <strong>Rentabilité :</strong> Optimiser les coûts et améliorer la marge nette.</p>
                )}
                {data.roe < 10 && (
                  <p>• <strong>ROE :</strong> Améliorer la rentabilité des capitaux propres.</p>
                )}
                {data.delai_paiement_clients > 45 && (
                  <p>• <strong>Clients :</strong> Réduire les délais de paiement clients pour améliorer la trésorerie.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'evolution' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Évolution des Ratios Clés</h4>
              <div className="h-80">
                <Line data={evolutionData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {activeView === 'radar' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Analyse Radar de Performance</h4>
              <div className="h-80">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatiosFinanciersWidget;


