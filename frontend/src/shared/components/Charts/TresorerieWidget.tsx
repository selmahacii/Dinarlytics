import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '@core/context/ThemeContext';
import { useApp } from '@core/context/AppContext';

interface TresorerieWidgetProps {
  data: {
    solde_initial: number;
    encaissements: {
      ventes: number;
      creances_recouvrees: number;
      autres_encaissements: number;
    };
    decaissements: {
      achats: number;
      charges_personnel: number;
      charges_exploitation: number;
      investissements: number;
      autres_decaissements: number;
    };
    solde_final: number;
  };
  period: string;
  previousData?: {
    solde_final: number;
    encaissements: number;
    decaissements: number;
  };
}

const TresorerieWidget: React.FC<TresorerieWidgetProps> = ({ data, period, previousData }) => {
  const { currentTheme } = useTheme();
  const { formatCurrency } = useApp();
  const [activeView, setActiveView] = useState<'flux' | 'previsions' | 'analyse'>('flux');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['encaissements', 'decaissements']));

  // Mise à jour de l'heure en temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculs des totaux
  const totalEncaissements = data.encaissements.ventes + data.encaissements.creances_recouvrees + data.encaissements.autres_encaissements;
  const totalDecaissements = data.decaissements.achats + data.decaissements.charges_personnel + data.decaissements.charges_exploitation + data.decaissements.investissements + data.decaissements.autres_decaissements;
  const fluxNet = totalEncaissements - totalDecaissements;

  // Calculs des variations
  const variationSolde = previousData ? 
    ((data.solde_final - previousData.solde_final) / Math.abs(previousData.solde_final)) * 100 : 0;
  const variationEncaissements = previousData ? 
    ((totalEncaissements - previousData.encaissements) / previousData.encaissements) * 100 : 0;
  const variationDecaissements = previousData ? 
    ((totalDecaissements - previousData.decaissements) / previousData.decaissements) * 100 : 0;

  // Calculs des ratios
  const ratioLiquidite = data.solde_final / (totalDecaissements / 30); // Jours de trésorerie
  const tauxCroissanceTresorerie = ((data.solde_final - data.solde_initial) / Math.abs(data.solde_initial)) * 100;

  // Données pour les graphiques
  const evolutionTresorerieData = {
    labels: ['Solde Initial', 'Encaissements', 'Décaissements', 'Solde Final'],
    datasets: [{
      data: [data.solde_initial, totalEncaissements, -totalDecaissements, data.solde_final],
      backgroundColor: [
        'rgba(51, 65, 85, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        'rgba(51, 65, 85, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)'
      ],
      borderWidth: 2
    }]
  };

  const repartitionEncaissementsData = {
    labels: ['Ventes', 'Créances Recouvrées', 'Autres Encaissements'],
    datasets: [{
      data: [data.encaissements.ventes, data.encaissements.creances_recouvrees, data.encaissements.autres_encaissements],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(6, 182, 212, 1)',
        'rgba(139, 92, 246, 1)'
      ],
      borderWidth: 2
    }]
  };

  const repartitionDecaissementsData = {
    labels: ['Achats', 'Personnel', 'Exploitation', 'Investissements', 'Autres'],
    datasets: [{
      data: [
        data.decaissements.achats,
        data.decaissements.charges_personnel,
        data.decaissements.charges_exploitation,
        data.decaissements.investissements,
        data.decaissements.autres_decaissements
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(51, 65, 85, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(51, 65, 85, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(156, 163, 175, 1)'
      ],
      borderWidth: 2
    }]
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getVariationColor = (variation: number) => {
    return variation >= 0 ? 'text-emerald-600' : 'text-red-600';
  };

  const getVariationIcon = (variation: number) => {
    return variation >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  };

  const getStatusColor = (value: number, threshold: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value >= threshold ? 'text-emerald-600' : 'text-amber-600';
    } else {
      return value <= threshold ? 'text-emerald-600' : 'text-red-600';
    }
  };

  const getStatusIcon = (value: number, threshold: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value >= threshold ? CheckCircleIcon : ExclamationTriangleIcon;
    } else {
      return value <= threshold ? CheckCircleIcon : ExclamationTriangleIcon;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* En-tête du widget */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Trésorerie</h3>
              <p className="text-sm text-blue-600">Période {period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-blue-600">
                {currentTime.toLocaleTimeString('fr-FR')}
              </div>
              <div className="text-xs text-blue-500">
                Mise à jour en temps réel
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'flux', label: 'FLUX', icon: ArrowPathIcon, color: 'blue' },
            { id: 'previsions', label: 'PRÉVISIONS', icon: CalendarIcon, color: 'emerald' },
            { id: 'analyse', label: 'ANALYSE', icon: ChartBarIcon, color: 'purple' }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600`
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="p-6">
        {activeView === 'flux' && (
          <div className="space-y-6">
            {/* Solde Final - Indicateur principal */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="text-xl font-bold text-blue-800">SOLDE FINAL</h4>
                    <p className="text-sm text-blue-600">Position de trésorerie actuelle</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-800">{formatCurrency(data.solde_final)}</p>
                  {previousData && (
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      {(() => {
                        const VariationIcon = getVariationIcon(variationSolde);
                        return <VariationIcon className={`h-4 w-4 ${getVariationColor(variationSolde)}`} />;
                      })()}
                      <span className={`text-sm font-medium ${getVariationColor(variationSolde)}`}>
                        {variationSolde >= 0 ? '+' : ''}{variationSolde.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Flux Net */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ArrowPathIcon className="h-6 w-6 text-slate-600" />
                  <div>
                    <h5 className="font-semibold text-slate-800">FLUX NET</h5>
                    <p className="text-sm text-slate-600">Encaissements - Décaissements</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(fluxNet)}</p>
                  <p className={`text-sm ${fluxNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {fluxNet >= 0 ? '✓ Positif' : '⚠ Négatif'}
                  </p>
                </div>
              </div>
            </div>

            {/* Encaissements */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('encaissements')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-slate-800">ENCAISSEMENTS</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">{formatCurrency(totalEncaissements)}</span>
                  <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedSections.has('encaissements') ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              {expandedSections.has('encaissements') && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Ventes:</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(data.encaissements.ventes)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Créances recouvrées:</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(data.encaissements.creances_recouvrees)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Autres encaissements:</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(data.encaissements.autres_encaissements)}</span>
                  </div>
                  {previousData && (
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-slate-600">Variation:</span>
                      <span className={`font-medium ${getVariationColor(variationEncaissements)}`}>
                        {variationEncaissements >= 0 ? '+' : ''}{variationEncaissements.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Décaissements */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('decaissements')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-slate-800">DÉCAISSEMENTS</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">{formatCurrency(totalDecaissements)}</span>
                  <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedSections.has('decaissements') ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              {expandedSections.has('decaissements') && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Achats:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.decaissements.achats)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Charges personnel:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.decaissements.charges_personnel)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Charges exploitation:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.decaissements.charges_exploitation)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Investissements:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.decaissements.investissements)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Autres décaissements:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.decaissements.autres_decaissements)}</span>
                  </div>
                  {previousData && (
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-slate-600">Variation:</span>
                      <span className={`font-medium ${getVariationColor(variationDecaissements)}`}>
                        {variationDecaissements >= 0 ? '+' : ''}{variationDecaissements.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'previsions' && (
          <div className="space-y-6">
            {/* Graphique d'évolution */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Évolution de la Trésorerie</h4>
              <div className="h-80">
                <Bar data={evolutionTresorerieData} options={barOptions} />
              </div>
            </div>

            {/* Répartition des encaissements */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Répartition des Encaissements</h4>
              <div className="h-64">
                <Doughnut data={repartitionEncaissementsData} options={chartOptions} />
              </div>
            </div>

            {/* Répartition des décaissements */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Répartition des Décaissements</h4>
              <div className="h-64">
                <Doughnut data={repartitionDecaissementsData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {activeView === 'analyse' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Analyse de la Trésorerie</h4>
            
            {/* Indicateurs clés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800">Jours de Trésorerie</h5>
                  {(() => {
                    const StatusIcon = getStatusIcon(ratioLiquidite, 30, true);
                    return <StatusIcon className={`h-5 w-5 ${getStatusColor(ratioLiquidite, 30, true)}`} />;
                  })()}
                </div>
                <p className="text-2xl font-bold text-slate-800">{ratioLiquidite.toFixed(0)} jours</p>
                <p className="text-sm text-slate-600">Autonomie financière</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800">Croissance Trésorerie</h5>
                  {(() => {
                    const StatusIcon = getStatusIcon(tauxCroissanceTresorerie, 0, true);
                    return <StatusIcon className={`h-5 w-5 ${getStatusColor(tauxCroissanceTresorerie, 0, true)}`} />;
                  })()}
                </div>
                <p className="text-2xl font-bold text-slate-800">{tauxCroissanceTresorerie.toFixed(1)}%</p>
                <p className="text-sm text-slate-600">Évolution du solde</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800">Ratio Flux</h5>
                  {(() => {
                    const StatusIcon = getStatusIcon(fluxNet, 0, true);
                    return <StatusIcon className={`h-5 w-5 ${getStatusColor(fluxNet, 0, true)}`} />;
                  })()}
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {fluxNet >= 0 ? '+' : ''}{formatCurrency(fluxNet)}
                </p>
                <p className="text-sm text-slate-600">Flux net mensuel</p>
              </div>
            </div>

            {/* Analyse détaillée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-slate-800 mb-3">Structure des Encaissements</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Ventes:</span>
                    <span className="font-medium">{((data.encaissements.ventes / totalEncaissements) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Créances:</span>
                    <span className="font-medium">{((data.encaissements.creances_recouvrees / totalEncaissements) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Autres:</span>
                    <span className="font-medium">{((data.encaissements.autres_encaissements / totalEncaissements) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-slate-800 mb-3">Structure des Décaissements</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Achats:</span>
                    <span className="font-medium">{((data.decaissements.achats / totalDecaissements) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Personnel:</span>
                    <span className="font-medium">{((data.decaissements.charges_personnel / totalDecaissements) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Exploitation:</span>
                    <span className="font-medium">{((data.decaissements.charges_exploitation / totalDecaissements) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Investissements:</span>
                    <span className="font-medium">{((data.decaissements.investissements / totalDecaissements) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="space-y-3">
              <h5 className="font-semibold text-slate-800">Recommandations</h5>
              {ratioLiquidite < 30 && (
                <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Trésorerie insuffisante</p>
                    <p className="text-sm text-amber-700">Moins de 30 jours de trésorerie. Considérez un financement court terme ou optimisez les encaissements.</p>
                  </div>
                </div>
              )}
              {fluxNet < 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Flux net négatif</p>
                    <p className="text-sm text-red-700">Les décaissements dépassent les encaissements. Surveillez la trésorerie et optimisez les flux.</p>
                  </div>
                </div>
              )}
              {ratioLiquidite > 60 && (
                <div className="flex items-start space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Trésorerie confortable</p>
                    <p className="text-sm text-emerald-700">Plus de 60 jours de trésorerie. Opportunité d'investissement ou de distribution.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TresorerieWidget;


